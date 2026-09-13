"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Plus, Upload, Loader2 } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({ subsets: ["latin"] });

const DEFECT_OPTIONS = ["Stain", "Warna Pudar", "Robek", "Lainnya"];

type Slide = {
  judulProduk: string;
  deskripsi: string;
  dimensiProduk: string;
  harga: string;
  fotoProduk: File | null;
  fotoProdukUrl: string;
  fotoDefect: File | null;
  catatanKondisi: string;
  defectTerpilih: string[];
  ukuranTiapStok: string;
  jumlahStok: string;
};

const emptySlide = (): Slide => ({
  judulProduk: "",
  deskripsi: "",
  dimensiProduk: "",
  harga: "",
  fotoProduk: null,
  fotoProdukUrl: "",
  fotoDefect: null,
  catatanKondisi: "",
  defectTerpilih: [],
  ukuranTiapStok: "",
  jumlahStok: "",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function TambahProduk() {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([emptySlide()]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const updateSlide = (index: number, patch: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, ...patch } : slide))
    );
  };

  const toggleDefect = (index: number, option: string) => {
    setSlides((prev) =>
      prev.map((slide, i) => {
        if (i !== index) return slide;
        const exists = slide.defectTerpilih.includes(option);
        return {
          ...slide,
          defectTerpilih: exists
            ? slide.defectTerpilih.filter((d) => d !== option)
            : [...slide.defectTerpilih, option],
        };
      })
    );
  };

  const addSlide = () => {
    if (slides.length >= 10) {
      alert("Maksimal 10 slide.");
      return;
    }
    setSlides((prev) => [...prev, emptySlide()]);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/produk/upload-foto`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload gagal: ${error}`);
    }

    const result = await response.json();
    return result.url;
  };

  const handlePublish = async () => {
    const token = localStorage.getItem("token");
    const tokoId = localStorage.getItem("tokoId");

    if (!token) {
      alert("Anda belum login. Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    if (!tokoId) {
      alert("Toko ID tidak ditemukan. Pastikan toko Anda sudah disetujui admin.");
      return;
    }

    // Validasi semua slide
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.judulProduk.trim()) {
        alert(`Slide ${i + 1}: Judul produk wajib diisi`);
        return;
      }
      if (!slide.fotoProduk && !slide.fotoProdukUrl) {
        alert(`Slide ${i + 1}: Foto produk wajib diupload`);
        return;
      }
      if (!slide.harga || Number(slide.harga) <= 0) {
        alert(`Slide ${i + 1}: Harga harus lebih dari 0`);
        return;
      }
      if (!slide.jumlahStok || Number(slide.jumlahStok) <= 0) {
        alert(`Slide ${i + 1}: Jumlah stok harus lebih dari 0`);
        return;
      }
    }

    setIsPublishing(true);

    try {
      // Upload semua foto produk dulu
      const slidesWithUrls = await Promise.all(
        slides.map(async (slide, index) => {
          let fotoUrl = slide.fotoProdukUrl;
          if (slide.fotoProduk && !slide.fotoProdukUrl) {
            setUploadProgress(`Mengupload foto produk ${index + 1}...`);
            fotoUrl = await uploadFile(slide.fotoProduk);
          }
          return { ...slide, fotoProdukUrl: fotoUrl };
        })
      );

      setUploadProgress("Menyimpan produk ke database...");

      // Kirim produk ke backend
      for (const slide of slidesWithUrls) {
        const payload = {
          tokoId: Number(tokoId),
          namaProduk: slide.judulProduk,
          deskripsi: slide.deskripsi,
          harga: Number(slide.harga) || 0,
          stok: Number(slide.jumlahStok) || 0,
          ukuranDimensi: slide.ukuranTiapStok || slide.dimensiProduk,
          fotoProduk: slide.fotoProdukUrl,
          defect: slide.defectTerpilih.length > 0,
        };

        console.log("Mengirim produk:", payload);

        const response = await fetch(`${API_BASE}/produk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response backend:", errorText);
          throw new Error(`Gagal menambahkan produk: ${response.status}`);
        }

        const result = await response.json();
        console.log("Produk berhasil masuk backend:", result);
      }

      alert(`${slides.length} produk berhasil dipublish!`);
      setSlides([emptySlide()]);
      router.push("/produk-seller");
    } catch (error) {
      console.error("Gagal publish produk:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Produk gagal dipublish. Pastikan backend NestJS sedang berjalan dan cek Console."
      );
    } finally {
      setIsPublishing(false);
      setUploadProgress("");
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>

        <h1
          className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}
        >
          TAMBAH PRODUK
        </h1>

        <button>
          <MessageCircle className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="flex-1 w-full px-4 sm:px-8 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl space-y-6">
          {slides.map((slide, index) => (
            <SlideCard
              key={index}
              index={index}
              slide={slide}
              onChange={(patch) => updateSlide(index, patch)}
              onToggleDefect={(option) => toggleDefect(index, option)}
            />
          ))}

          <button
            onClick={addSlide}
            disabled={isPublishing}
            className="w-full border-2 border-dashed border-gray-300 rounded-md py-5 flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-black hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1 text-sm font-medium">
              <Plus className="w-4 h-4" />
              ADD ANOTHER SLIDE
            </span>

            <span className="text-xs text-gray-400">(Max 10 Slide)</span>
          </button>

          {uploadProgress && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={isPublishing || slides.length === 0}
            className="w-full bg-black text-white rounded-md py-3.5 font-medium tracking-wide hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                MENYIMPAN...
              </>
            ) : (
              "PUBLISH PRODUK"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SlideCard({
  index,
  slide,
  onChange,
  onToggleDefect,
}: {
  index: number;
  slide: Slide;
  onChange: (patch: Partial<Slide>) => void;
  onToggleDefect: (option: string) => void;
}) {
  return (
    <div className="border-2 border-gray-300 rounded-md p-4 sm:p-5">
      <p className="text-center text-xs font-semibold tracking-widest text-gray-400 mb-4">
        SLIDE {index + 1}
      </p>

      <div className="space-y-4">
        <Field label="Judul Produk">
          <input
            type="text"
            value={slide.judulProduk}
            onChange={(e) => onChange({ judulProduk: e.target.value })}
            className={inputClass}
            placeholder="Masukkan judul produk"
          />
        </Field>

        <Field label="Deskripsi">
          <textarea
            value={slide.deskripsi}
            onChange={(e) => onChange({ deskripsi: e.target.value })}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Deskripsikan produk"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Dimensi Produk (PxL)">
            <input
              type="text"
              inputMode="numeric"
              value={slide.dimensiProduk ? `${slide.dimensiProduk} cm` : ""}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                onChange({ dimensiProduk: onlyNumbers });
              }}
              className={inputClass}
              placeholder="cm"
            />
          </Field>

          <Field label="Harga">
            <input
              type="text"
              inputMode="numeric"
              value={
                slide.harga ? Number(slide.harga).toLocaleString("id-ID") : ""
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                onChange({ harga: raw });
              }}
              className={inputClass}
              placeholder="Rp 0"
            />
          </Field>
        </div>

        <UploadBox
          label="Foto Produk"
          hint="(Max 5MB)"
          file={slide.fotoProduk}
          fileUrl={slide.fotoProdukUrl}
          onChange={(file) => onChange({ fotoProduk: file, fotoProdukUrl: "" })}
        />

        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-700 mb-2">
            CONDITION REPORT
          </p>

          <div className="flex gap-3">
            <label className="w-16 h-16 shrink-0 border border-gray-300 rounded-md overflow-hidden cursor-pointer hover:border-black transition relative">
              {slide.fotoDefect ? (
                <img
                  src={URL.createObjectURL(slide.fotoDefect)}
                  alt="Foto defect"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  onChange({
                    fotoDefect: e.target.files ? e.target.files[0] : null,
                  })
                }
              />
            </label>

            <textarea
              value={slide.catatanKondisi}
              onChange={(e) => onChange({ catatanKondisi: e.target.value })}
              rows={2}
              placeholder="Contoh: Small snag di lengan kiri. Hampir tidak terlihat saat dipakai."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-black resize-none"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-700 mb-2">
            CHECKLIST DEFECT
          </p>

          <div className="grid grid-cols-2 gap-2">
            {DEFECT_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={slide.defectTerpilih.includes(option)}
                  onChange={() => onToggleDefect(option)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                {option}
              </label>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-1.5">
            *Dicentang salah satu = produk ditandai memiliki defect
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ukuran Tiap Stok">
            <input
              type="text"
              value={slide.ukuranTiapStok}
              onChange={(e) => onChange({ ukuranTiapStok: e.target.value })}
              className={inputClass}
              placeholder="e.g. M, L, XL"
            />
          </Field>

          <Field label="Jumlah Stok">
            <input
              type="number"
              min={0}
              value={slide.jumlahStok}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value) || 0);
                onChange({ jumlahStok: String(value) });
              }}
              className={inputClass}
              placeholder="0"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border-b border-gray-300 px-1 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide mb-1.5 text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function UploadBox({
  label,
  hint,
  file,
  fileUrl,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  fileUrl?: string;
  onChange: (file: File | null) => void;
}) {
  const hasImage = file || fileUrl;
  const previewSrc = file ? URL.createObjectURL(file) : fileUrl;

  return (
    <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-1 py-8 px-2 text-center cursor-pointer hover:border-black transition relative group">
      {hasImage && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={previewSrc}
            alt="Preview"
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-black"
               onClick={(e) => {
                 e.stopPropagation();
                 onChange(null);
               }}>
            Hapus
          </div>
        </div>
      )}

      {!hasImage && (
        <>
          <Plus className="w-5 h-5 text-gray-400" />
          <span className="text-[11px] font-medium text-gray-600">{label}</span>
          <span className="text-[10px] text-gray-400">{hint}</span>
        </>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      />
    </label>
  );
}
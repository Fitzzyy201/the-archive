"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
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
  fotoDefect: null,
  catatanKondisi: "",
  defectTerpilih: [],
  ukuranTiapStok: "",
  jumlahStok: "",
});

// Helper untuk mengubah file gambar jadi Base64 String
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function TambahProduk() {
  const [slides, setSlides] = useState<Slide[]>([emptySlide()]);

  const updateSlide = (index: number, patch: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, ...patch } : slide
      )
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

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("token");

      const TOKO_ID = Number(localStorage.getItem("tokoId"));

      if (!token || !TOKO_ID) {
        alert("Sesi Anda telah berakhir. Silahkan login kembali.");
        return;
      }

      for (const slide of slides) {
        if (!slide.judulProduk || !slide.harga) {
          alert("Harap isi judul Produk dan harga terlebih dahulu brayy.");
          return;
        }

        let base64Foto = "";
        if (slide.fotoProduk) {
          base64Foto = await fileToBase64(slide.fotoProduk);
        }

        const payload = {
          tokoId: TOKO_ID,
          namaProduk: slide.judulProduk,
          deskripsi: slide.deskripsi,
          harga: Number(slide.harga) || 0,
          stok: Number(slide.jumlahStok) || 0,
          ukuranDimensi: slide.ukuranTiapStok || slide.dimensiProduk,
          fotoProduk: base64Foto,
          catatanKondisi: slide.catatanKondisi,
          defectTerpilih: slide.defectTerpilih,
          defect: slide.defectTerpilih.length > 0,
        };
        console.log("Mengirim produk:", payload);

        const response = await fetch("http://localhost:3001/produk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response backend error:", errorText);
          throw new Error(`Gagal menambahkan produk: ${response.status}`);
        }

        const result = await response.json();
        console.log("Produk berhasil masuk backend:", result);
      }
      alert(`${slides.length} produk berhasil dipublish!`);
      setSlides([emptySlide()]);
    } catch (error) {
      console.error("Gagal publish produk:", error);
      alert(
        "Produk gagal dipublish. Pastikan backend NestJS sedang berjalan dan cek Console."
      );
    }
  }; // sampe cini yaa

  return (
    <div
      className={`${inter.className} min-h-screen flex flex-col bg-white`}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b">
        <button>
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
              onChange={(patch) =>
                updateSlide(index, patch)
              }
              onToggleDefect={(option) =>
                toggleDefect(index, option)
              }
            />
          ))}

          <button
            onClick={addSlide}
            className="w-full border-2 border-dashed border-gray-300 rounded-md py-5 flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-black hover:text-black transition"
          >
            <span className="flex items-center gap-1 text-sm font-medium">
              <Plus className="w-4 h-4" />
              ADD ANOTHER SLIDE
            </span>

            <span className="text-xs text-gray-400">
              (Max 10 Slide)
            </span>
          </button>

          <button
            onClick={handlePublish}
            className="w-full bg-black text-white rounded-md py-3.5 font-medium tracking-wide hover:bg-gray-900 transition"
          >
            PUBLISH PRODUK
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
            onChange={(e) =>
              onChange({
                judulProduk: e.target.value,
              })
            }
            className={inputClass}
            placeholder="Masukkan judul produk"
          />
        </Field>

        <Field label="Deskripsi">
          <textarea
            value={slide.deskripsi}
            onChange={(e) =>
              onChange({
                deskripsi: e.target.value,
              })
            }
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Deskripsikan produk"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Dimensi Produk (PxL)">
            <input
              type="text"
              value={slide.dimensiProduk}
              onChange={(e) =>
                onChange({
                  dimensiProduk: e.target.value,
                })
              }
              className={inputClass}
              placeholder="cm"
            />
          </Field>

          <Field label="Harga">
            <input
              type="number"
              value={slide.harga}
              onChange={(e) =>
                onChange({
                  harga: e.target.value,
                })
              }
              className={inputClass}
              placeholder="Rp"
            />
          </Field>
        </div>

        <UploadBox
          label="Foto Produk"
          hint="(Max 5MB)"
          file={slide.fotoProduk}
          onChange={(file) =>
            onChange({
              fotoProduk: file,
            })
          }
        />

        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-700 mb-2">
            CONDITION REPORT
          </p>

          <div className="flex gap-3">
            <label className="w-16 h-16 shrink-0 border border-gray-300 rounded-md overflow-hidden cursor-pointer hover:border-black transition relative">
              {slide.fotoDefect ? (
                <img
                  src={URL.createObjectURL(
                    slide.fotoDefect
                  )}
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
                    fotoDefect: e.target.files
                      ? e.target.files[0]
                      : null,
                  })
                }
              />
            </label>

            <textarea
              value={slide.catatanKondisi}
              onChange={(e) =>
                onChange({
                  catatanKondisi: e.target.value,
                })
              }
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
                  checked={slide.defectTerpilih.includes(
                    option
                  )}
                  onChange={() =>
                    onToggleDefect(option)
                  }
                  className="w-4 h-4 accent-black cursor-pointer"
                />

                {option}
              </label>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-1.5">
            *Dicentang salah satu = produk ditandai
            memiliki defect
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ukuran Tiap Stok">
            <input
              type="text"
              value={slide.ukuranTiapStok}
              onChange={(e) =>
                onChange({
                  ukuranTiapStok: e.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. M, L, XL"
            />
          </Field>

          <Field label="Jumlah Stok">
            <input
              type="number"
              value={slide.jumlahStok}
              onChange={(e) =>
                onChange({
                  jumlahStok: e.target.value,
                })
              }
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
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-1 py-8 px-2 text-center cursor-pointer hover:border-black transition">
      <Plus className="w-5 h-5 text-gray-400" />

      <span className="text-[11px] font-medium text-gray-600">
        {file ? file.name : label}
      </span>

      <span className="text-[10px] text-gray-400">
        {hint}
      </span>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onChange(
            e.target.files
              ? e.target.files[0]
              : null
          )
        }
      />
    </label>
  );
}
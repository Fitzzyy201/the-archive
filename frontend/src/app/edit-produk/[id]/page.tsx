"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Helper untuk mengubah file gambar jadi Base64 String
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function EditProduk({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
    const router = useRouter();
  const { id } = resolvedParams;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk form edit
  const [formData, setFormData] = useState({
    namaProduk: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    ukuranDimensi: "",
    defect: false,
  });

  const [fotoPreview, setFotoPreview] = useState<string>(""); // Buat nampilin foto lama
  const [fotoBaru, setFotoBaru] = useState<File | null>(null); // Kalau user upload foto baru

  // Ambil data produk lama saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchProdukDetail = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Sesi Anda bermasalah. Harap login kembali.");
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/produk/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({
            namaProduk: data.namaProduk,
            deskripsi: data.deskripsi || "",
            harga: data.harga,
            stok: data.stok,
            ukuranDimensi: data.ukuranDimensi || "",
            defect: data.defect || false,
          });
          
          // Tampilkan preview gambar lama jika valid
          const isValidUrl =
            data.fotoProduk &&
            (data.fotoProduk.startsWith("http://") ||
             data.fotoProduk.startsWith("https://") ||
             data.fotoProduk.startsWith("data:image"));
             
          setFotoPreview(
            isValidUrl 
              ? data.fotoProduk 
              : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80"
          );
        } else {
          alert("Produk tidak ditemukan.");
          router.push("/produk-seller");
        }
      } catch (error) {
        console.error("Gagal mengambil detail produk:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdukDetail();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Kalau checkbox (defect)
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFotoBaru(file);
      setFotoPreview(URL.createObjectURL(file)); // Langsung preview foto baru
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("token");
      let finalFoto = fotoPreview;
      if (fotoBaru) {
        finalFoto = await fileToBase64(fotoBaru);
      }

      const payload = {
        namaProduk: formData.namaProduk,
        deskripsi: formData.deskripsi,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        ukuranDimensi: formData.ukuranDimensi,
        defect: formData.defect,
        fotoProduk: finalFoto, // Bawaan dari DB
      };

      // Kalau seller masukin foto baru, convert dulu ke Base64
      if (fotoBaru) {
        payload.fotoProduk = await fileToBase64(fotoBaru);
      }

      const res = await fetch(`http://localhost:3001/produk/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Produk berhasil diperbarui!");
        router.push("/produk-seller");
      } else {
        alert("Gagal memperbarui produk.");
      }
    } catch (error) {
      console.error("Error update produk:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className={`${mono.className} text-xs tracking-widest text-black/50 animate-pulse`}>
          MEMUAT DATA PRODUK...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF9F6] ${inter.className}`}>
      {/* Header */}
      <div className="bg-white border-b border-black/10 px-6 py-6 sticky top-0 z-20 flex items-center gap-4">
        <Link href="/produk-seller" className="p-2 border border-black/15 rounded-sm hover:bg-black/5 transition text-black">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold text-black`}>Edit Produk</h1>
          <p className={`${mono.className} text-[10px] text-black/40 mt-1 uppercase tracking-widest`}>
            ID: {id} • Update Information
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleUpdate} className="bg-white border border-black/10 rounded-sm p-6 sm:p-8 space-y-6">
          
          {/* FOTO PRODUK */}
          <div className="space-y-3">
            <label className="text-xs font-bold tracking-[0.1em] text-black uppercase">Foto Produk</label>
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-sm border border-black/10 overflow-hidden shrink-0">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/30">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-black/30 px-4 py-3 rounded-sm hover:bg-black/[0.02] transition">
                  <Upload className="w-4 h-4 text-black/50" />
                  <span className="text-xs text-black/60 font-medium">Ganti Foto Baru</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="text-[10px] text-black/40 mt-2">Biarkan kosong jika tidak ingin mengubah foto.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold tracking-[0.1em] text-black uppercase">Nama Produk</label>
              <input
                type="text"
                name="namaProduk"
                value={formData.namaProduk}
                onChange={handleChange}
                required
                className="w-full p-3 border border-black/20 rounded-sm text-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-black uppercase">Harga (Rp)</label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                required
                className="w-full p-3 border border-black/20 rounded-sm text-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.1em] text-black uppercase">Stok (Pcs)</label>
              <input
                type="number"
                name="stok"
                value={formData.stok}
                onChange={handleChange}
                required
                className="w-full p-3 border border-black/20 rounded-sm text-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold tracking-[0.1em] text-black uppercase">Ukuran / Dimensi</label>
              <input
                type="text"
                name="ukuranDimensi"
                value={formData.ukuranDimensi}
                onChange={handleChange}
                placeholder="Contoh: L (P 70 x L 55)"
                className="w-full p-3 border border-black/20 rounded-sm text-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold tracking-[0.1em] text-black uppercase">Deskripsi Produk</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-black/20 rounded-sm text-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3 p-4 border border-black/10 rounded-sm bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="defect"
                  checked={formData.defect}
                  onChange={handleChange}
                  className="w-4 h-4 accent-black"
                />
                <div>
                  <p className="text-sm font-semibold text-black">Tandai Memiliki Defect (Kekurangan)</p>
                  <p className="text-[10px] text-black/50 mt-0.5">Centang jika produk memiliki noda, robek, atau warna pudar.</p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-black text-white p-4 rounded-sm font-bold tracking-widest text-xs hover:bg-black/85 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "MENYIMPAN..." : (
              <>
                <Save className="w-4 h-4" /> SIMPAN PERUBAHAN
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const uploadProfilePhoto = async (file: File, token: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/produk/upload-foto`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload foto gagal: ${error}`);
  }

  const result = await response.json();
  return result.url;
};

export default function EditProfileSeller() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    namaToko: "",
    noToko: "",
    kota: "",
    email: "",
  });

  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [fotoBaru, setFotoBaru] = useState<File | null>(null);

  useEffect(() => {
    const loadTokoData = async () => {
      const token = localStorage.getItem("token");
      let tokoId = localStorage.getItem("tokoId");

      if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        if (!tokoId) {
          const statusRes = await fetch(`${API_BASE}/toko/status-my-shop`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.tokoId) {
              tokoId = String(statusData.tokoId);
              localStorage.setItem("tokoId", tokoId);
            }
          }
        }

        if (tokoId) {
          const res = await fetch(`${API_BASE}/toko/${tokoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setForm({
              namaToko: data.namaToko || "THE DIARIES STORE",
              noToko: data.noToko || "",
              kota: data.kota || "",
              email: data.email || "",
            });
            if (data.fotoToko) setFotoPreview(data.fotoToko);
          }
        }
      } catch (err) {
        console.error("Gagal ambil data toko:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokoData();
  }, [router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Sesi tidak valid. Silakan login ulang.");
        router.push("/login");
        return;
      }

      setFotoBaru(file);
      setFotoPreview(URL.createObjectURL(file));
      
      // Auto upload photo
      setUploadingPhoto(true);
      try {
        const url = await uploadProfilePhoto(file, token);
        setFotoPreview(url);
      } catch (err) {
        console.error("Upload foto gagal:", err);
        alert("Gagal upload foto. Silakan coba lagi.");
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      let tokoId = localStorage.getItem("tokoId");

      if (!token) {
        alert("Sesi tidak valid. Silakan login ulang.");
        router.push("/login");
        return;
      }

      if (!tokoId) {
        const statusRes = await fetch(`${API_BASE}/toko/status-my-shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.tokoId) {
            tokoId = String(statusData.tokoId);
            localStorage.setItem("tokoId", tokoId);
          }
        }
      }

      if (!tokoId) {
        alert("Toko ID tidak ditemukan.");
        return;
      }

      const payload = {
        namaToko: form.namaToko,
        noToko: form.noToko,
        kota: form.kota,
        email: form.email,
        fotoToko: fotoPreview,
      };

      const res = await fetch(`${API_BASE}/toko/${tokoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Informasi Toko berhasil diperbarui!");
        router.push("/berandaprofile-seller");
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        alert(`Gagal memperbarui: ${errorData.message || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("Error submit info toko:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className={`${mono.className} text-xs tracking-widest text-black/40 animate-pulse uppercase`}>
          Memuat Informasi Toko...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF9F6] flex flex-col ${inter.className}`}>
      {/* Top Header */}
      <div className="px-5 py-5 border-b border-black flex items-center relative bg-[#FAF9F6]">
        <Link href="/berandaprofile-seller" className="text-black hover:opacity-75 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-wider text-black text-center flex-1 uppercase pr-6`}>
          INFORMASI TOKO
        </h1>
      </div>

      {/* Main Form */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          
          {/* Circular Photo Profile Picker */}
          <label className="relative cursor-pointer group mb-4">
            <div className="w-36 h-36 rounded-full border border-black flex flex-col items-center justify-center bg-[#EAEAEA] overflow-hidden">
              {fotoPreview ? (
                <img 
                  src={getProductImageUrl(fotoPreview)} 
                  alt="Profile Toko" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex flex-col items-center text-black/40">
                  <Camera className="w-8 h-8 mb-1" strokeWidth={1.5} />
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <p className={`${mono.className} text-[10px] tracking-widest text-black/60 uppercase font-semibold mb-8`}>
            ADD PHOTO PROFILE
          </p>

          {/* Input Fields */}
          <div className="w-full space-y-5 text-left mb-10">
            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
                NAMA TOKO
              </label>
              <input
                type="text"
                value={form.namaToko}
                onChange={(e) => setForm({ ...form, namaToko: e.target.value })}
                className="w-full text-base font-bold text-black border-b border-black/20 bg-transparent py-1 focus:outline-none focus:border-black uppercase"
                required
              />
            </div>

            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
                NO TOKO
              </label>
              <input
                type="text"
                value={form.noToko}
                onChange={(e) => setForm({ ...form, noToko: e.target.value })}
                className="w-full text-base font-bold text-black border-b border-black/20 bg-transparent py-1 focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
                KOTA
              </label>
              <input
                type="text"
                value={form.kota}
                onChange={(e) => setForm({ ...form, kota: e.target.value })}
                className="w-full text-base font-bold text-black border-b border-black/20 bg-transparent py-1 focus:outline-none focus:border-black uppercase"
                required
              />
            </div>

            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
                EMAIL
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-base font-bold text-black border-b border-black/20 bg-transparent py-1 focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-64 bg-black text-white text-xs font-bold tracking-[0.2em] py-3.5 uppercase rounded-sm hover:bg-black/85 transition disabled:opacity-50"
          >
            {isSubmitting ? "MENYIMPAN..." : "SELESAI"}
          </button>
        </form>
      </div>
    </div>
  );
}
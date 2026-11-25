"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { getProductImageUrl } from "@/utils/image";
import { normalizePhoneInput, isValidPhone } from "@/utils/phone";

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

export default function EditProfileBuyer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    noTelp: "",
    email: "",
  });

  const [fotoPreview, setFotoPreview] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setForm({
            nama: data.nama || "",
            noTelp: normalizePhoneInput(data.noTelp || ""),
            email: data.email || "",
          });
          if (data.fotoProfil) setFotoPreview(data.fotoProfil);
        }
      } catch (err) {
        console.error("Gagal mengambil data profil pembeli:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
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

      setFotoPreview(URL.createObjectURL(file));
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

    if (!isValidPhone(form.noTelp)) {
      alert(
        "Nomor telepon harus diawali +62 dan berjumlah 10-14 digit angka. Contoh: +6281234567890"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Sesi tidak valid. Silakan login ulang.");
        router.push("/login");
        return;
      }

      const payload = {
        nama: form.nama,
        noTelp: form.noTelp,
        fotoProfil: fotoPreview,
      };

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Profil pembeli berhasil diperbarui!");
        router.push("/profile-buyer");
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        alert(`Gagal memperbarui profil: ${errorData.message || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("Error update profile:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className={`${mono.className} text-xs tracking-widest text-black/40 animate-pulse uppercase`}>
          Memuat Informasi Akun...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF9F6] flex flex-col ${inter.className}`}>
      {/* Top Header */}
      <div className="px-5 py-5 border-b border-black flex items-center relative bg-[#FAF9F6]">
        <Link href="/profile-buyer" className="text-black hover:opacity-75 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-wider text-black text-center flex-1 uppercase pr-6`}>
          UBAH PROFIL PEMBELI
        </h1>
      </div>

      {/* Main Form */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          
          {/* Circular Photo Profile Picker */}
          <label className="relative cursor-pointer group mb-4">
            <div className="w-32 h-32 rounded-full border border-black flex flex-col items-center justify-center bg-[#EAEAEA] overflow-hidden">
              {fotoPreview ? (
                <img 
                  src={getProductImageUrl(fotoPreview)} 
                  alt="Foto Profil" 
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
            GANTI FOTO PROFIL
          </p>

          {/* Input Fields */}
          <div className="w-full space-y-5 text-left mb-10">
            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
                NAMA LENGKAP
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full text-base font-bold text-black border-b border-black/20 bg-transparent py-1 focus:outline-none focus:border-black uppercase"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
          NO. TELEPON (+62)
        </label>
        <input
          type="tel"
          value={form.noTelp}
          onChange={(e) => setForm({ ...form, noTelp: normalizePhoneInput(e.target.value) })}
          placeholder="+6281234567890"
                className="w-full text-base font-bold text-black border-b border-black/20 bg-transparent py-1 focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className={`${mono.className} text-[10px] font-bold tracking-widest text-black/40 uppercase block mb-1`}>
                EMAIL (TIDAK DAPAT DIUBAH)
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full text-base font-bold text-black/40 border-b border-black/10 bg-transparent py-1 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || uploadingPhoto}
            className="w-full sm:w-64 bg-black text-white text-xs font-bold tracking-[0.2em] py-3.5 uppercase rounded-sm hover:bg-black/85 transition disabled:opacity-50"
          >
            {isSubmitting ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
          </button>
        </form>
      </div>
    </div>
  );
}

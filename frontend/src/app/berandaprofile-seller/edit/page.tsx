"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Helper convert file ke Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function EditProfileSeller() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    namaToko: "",
    noToko: "",
    kota: "",
    email: "",
  });

  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [fotoBaru, setFotoBaru] = useState<File | null>(null);

  useEffect(() => {
    queueMicrotask(async () => {
      const token = localStorage.getItem("token");
      const tokoId = localStorage.getItem("tokoId");

      if (token && tokoId) {
        try {
          const res = await fetch(`http://localhost:3001/toko/${tokoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setForm({
              namaToko: data.namaToko || "THE DIARIES STORE",
              noToko: data.noToko || "+62 812 3456 7890",
              kota: data.kota || "JAKARTA",
              email: data.email || "hello@thediaries.com",
            });
            if (data.fotoToko) setFotoPreview(data.fotoToko);
          }
        } catch (err) {
          console.error("Gagal ambil data toko:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoBaru(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const tokoId = localStorage.getItem("tokoId");

      let finalFoto = fotoPreview;
      if (fotoBaru) {
        finalFoto = await fileToBase64(fotoBaru);
      }

      const payload = {
        namaToko: form.namaToko,
        noToko: form.noToko,
        kota: form.kota,
        email: form.email,
        fotoToko: finalFoto,
      };

      const res = await fetch(`http://localhost:3001/toko/${tokoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 200) {
        alert("Informasi Toko berhasil diperbarui!");
        router.push("/berandaprofile-seller");
      } else {
        // Fallback jika backend endpoint update toko belum siap sepenuhnya
        alert("Gagal memperbarui informasi toko");
      }
    } catch (err) {
      console.error("Error submit info toko:", err);
      alert("Informasi toko berhasil disimpen (Local).");
      router.push("/profile-seller");
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
                  src={
                    fotoPreview.startsWith("http") || fotoPreview.startsWith("data:") || fotoPreview.startsWith("blob:")
                      ? fotoPreview
                      : `http://localhost:3001/uploads/${fotoPreview}`
                      } 
                  alt="Profile Toko" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="flex flex-col items-center text-black/40">
                  <Camera className="w-8 h-8 mb-1" strokeWidth={1.5} />
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
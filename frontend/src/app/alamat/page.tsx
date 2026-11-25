"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Loader2, Check } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import WilayahSelect from "@/components/WilayahSelect";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Alamat = {
  id: number;
  namaPenerima: string;
  kotaPenerima: string;
  alamatLengkap: string;
  catatanKurir?: string | null;
};

export default function AlamatPage() {
  const router = useRouter();
  const [alamat, setAlamat] = useState<Alamat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    namaPenerima: "",
    kotaPenerima: "",
    alamatLengkap: "",
    catatanKurir: "",
  });

  useEffect(() => {
    const fetchAlamat = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/alamat/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAlamat(data);
          setForm({
            namaPenerima: data.namaPenerima || "",
            kotaPenerima: data.kotaPenerima || "",
            alamatLengkap: data.alamatLengkap || "",
            catatanKurir: data.catatanKurir || "",
          });
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Gagal mengambil alamat:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlamat();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!form.namaPenerima.trim() || !form.kotaPenerima.trim() || !form.alamatLengkap.trim()) {
      alert("Nama penerima, kota, dan alamat lengkap wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        namaPenerima: form.namaPenerima,
        kotaPenerima: form.kotaPenerima,
        alamatLengkap: form.alamatLengkap,
        catatanKurir: form.catatanKurir || undefined,
      };

      const res = alamat
        ? await fetch(`${API_BASE}/alamat/${alamat.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          })
        : await fetch(`${API_BASE}/alamat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        const data = await res.json();
        setAlamat(data);
        setForm({
          namaPenerima: data.namaPenerima || "",
          kotaPenerima: data.kotaPenerima || "",
          alamatLengkap: data.alamatLengkap || "",
          catatanKurir: data.catatanKurir || "",
        });
        setIsEditing(false);
        alert("Alamat pengiriman tersimpan!");
      } else {
        const err = await res.json().catch(() => ({ message: "Gagal menyimpan alamat" }));
        alert(err.message || "Gagal menyimpan alamat");
      }
    } catch (err) {
      console.error("Error simpan alamat:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6]`}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-8 py-8 pb-28 md:pb-16">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-black hover:opacity-75 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-wide text-black`}>
            ALAMAT PENGIRIMAN
          </h1>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-black/40 animate-pulse font-mono tracking-widest uppercase">
            Memuat alamat...
          </div>
        ) : !isEditing && alamat ? (
          <div className="bg-white border border-black/10 rounded-sm p-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-black/40 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">{alamat.namaPenerima}</p>
                <p className="text-sm text-black/70 leading-relaxed mt-1">{alamat.alamatLengkap}</p>
                <p className={`${mono.className} text-[11px] text-black/50 mt-1 uppercase`}>
                  {alamat.kotaPenerima}
                </p>
                {alamat.catatanKurir && (
                  <p className="text-xs text-black/50 mt-2 italic">
                    Catatan: {alamat.catatanKurir}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 w-full border border-black text-black text-xs font-semibold tracking-widest uppercase py-3 rounded-sm hover:bg-black hover:text-white transition"
            >
              UBAH ALAMAT
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-black/10 rounded-sm p-5 space-y-4">
            <div>
              <label className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}>
                NAMA PENERIMA
              </label>
              <input
                type="text"
                required
                value={form.namaPenerima}
                onChange={(e) => setForm({ ...form, namaPenerima: e.target.value })}
                placeholder="Nama penerima paket"
                className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black bg-transparent"
              />
            </div>

            <div>
              <label className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}>
                KOTA
              </label>
              <WilayahSelect
                value={form.kotaPenerima}
                onChange={(kota) => setForm({ ...form, kotaPenerima: kota })}
                className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black bg-transparent"
                required
                placeholderKota="Contoh: Bandung"
              />
            </div>

            <div>
              <label className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}>
                ALAMAT LENGKAP
              </label>
              <textarea
                required
                rows={3}
                value={form.alamatLengkap}
                onChange={(e) => setForm({ ...form, alamatLengkap: e.target.value })}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black bg-transparent resize-none"
              />
            </div>

            <div>
              <label className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}>
                CATATAN UNTUK KURIR (OPSIONAL)
              </label>
              <input
                type="text"
                value={form.catatanKurir}
                onChange={(e) => setForm({ ...form, catatanKurir: e.target.value })}
                placeholder="Contoh: Titip di pos satpam"
                className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black bg-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {alamat && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-black/15 text-black text-xs font-semibold tracking-widest uppercase py-3 rounded-sm hover:border-black transition"
                >
                  BATAL
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold tracking-widest uppercase py-3 rounded-sm hover:bg-black/85 transition disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> MENYIMPAN...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> SIMPAN ALAMAT
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

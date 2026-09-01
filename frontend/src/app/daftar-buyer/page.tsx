"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const DAFTAR_KOTA = [
  "Bandung",
  "Bandung Barat",
  "Bekasi",
  "Bogor",
  "Ciamis",
  "Cianjur",
  "Cirebon",
  "Depok",
  "Garut",
  "Indramayu",
  "Jakarta Barat",
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Timur",
  "Jakarta Utara",
  "Karawang",
  "Kuningan",
  "Majalengka",
  "Pangandaran",
  "Purwakarta",
  "Subang",
  "Sukabumi",
  "Sumedang",
  "Surabaya",
  "Tangerang",
  "Tangerang Selatan",
  "Tasikmalaya",
  "Yogyakarta",
];

export default function DaftarBuyer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [kota, setKota] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const kotaTersaring = DAFTAR_KOTA.filter((item) =>
    item.toLowerCase().includes(kota.toLocaleLowerCase())
  );

  const router = useRouter();

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          noTelp: telepon,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pendaftaran Berhasil! Silakan Login.");
        router.push("/login-buyer");
      } else {
        alert(`Gagal Mendaftar: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke server backend! Pastikan backend sudah jalan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-black">
      {/* Top Navbar */}
      <Navbar />

      <main
        className={`${inter.className} flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-16 pb-28 md:pb-16 flex items-center justify-center`}
      >
        <div className="w-full max-w-md lg:max-w-lg mx-auto">
          {/* Header Card */}
          <div className="text-center mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs text-black/50 hover:text-black mb-4 transition font-mono"
            >
              <ArrowLeft className="w-4 h-4" /> KEMBALI
            </button>
            <h1
              className={`${playfair.className} text-3xl sm:text-4xl font-bold tracking-tight text-black mb-2`}
            >
              Join The Archive
            </h1>
            <p className="text-black/50 text-xs sm:text-sm leading-relaxed">
              Daftarkan diri Anda untuk menjelajahi dan mengoleksi pakaian arsip terkurasi.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-black/10 rounded-sm p-6 sm:p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleDaftar}>
              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  NAMA LENGKAP
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  NOMOR TELEPON
                </label>
                <input
                  type="tel"
                  required
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="081234567890"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div className="relative">
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  KOTA
                </label>
                <input
                  type="text"
                  value={kota}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setKota(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Ketik nama kota (misal: Bandung, Jakarta Selatan)"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />

                {/* Dropdown Floating Suggestions */}
                {isDropdownOpen &&
                  kota.length > 0 &&
                  kotaTersaring.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white border border-black/10 rounded-sm shadow-xl max-h-48 overflow-y-auto mt-1 left-0 divide-y divide-black/5">
                      {kotaTersaring.map((item) => (
                        <li
                          key={item}
                          onClick={() => {
                            setKota(item);
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-2.5 text-xs text-black/80 hover:bg-[#FAF9F6] hover:text-black cursor-pointer transition font-sans"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  ALAMAT LENGKAP
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  CATATAN PENGIRIMAN (OPSIONAL)
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Titip di pos satpam / Rumah pagar hitam"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`${mono.className} w-full bg-black text-white rounded-sm py-3.5 flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] hover:bg-black/85 transition mt-6 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "MENDAFTARKAN..." : "BUAT AKUN BARU"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-black/60 mt-6 font-sans">
            Sudah memiliki akun?{" "}
            <Link
              href="/login-buyer"
              className="font-semibold text-black underline underline-offset-4 hover:opacity-80 transition"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
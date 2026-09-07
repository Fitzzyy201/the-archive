"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Eye,
  EyeOff,
  Store,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const DAFTAR_KOTA = [
  "Bangkalan",
  "Banjar",
  "Banjarnegara",
  "Bantul",
  "Banyumas (Purwokerto)",
  "Banyuwangi",
  "Batang",
  "Batu",
  "Bekasi",
  "Blitar",
  "Blora",
  "Bogor",
  "Bojonegoro",
  "Bondowoso",
  "Boyolali",
  "Brebes",
  "Ciamis",
  "Cianjur",
  "Cilacap",
  "Cimahi",
  "Cirebon",
  "Demak",
  "Depok",
  "Garut",
  "Gresik",
  "Grobogan (Purwodadi)",
  "Gunungkidul",
  "Indramayu",
  "Jakarta Barat",
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Timur",
  "Jakarta Utara",
  "Jember",
  "Jepara",
  "Jombang",
  "Karanganyar",
  "Karawang",
  "Kebumen",
  "Kediri",
  "Kendal",
  "Kepulauan Seribu",
  "Klaten",
  "Kudus",
  "Kulon Progo",
  "Kuningan",
  "Lamongan",
  "Lebak (Rangkasbitung)",
  "Lumajang",
  "Madiun",
  "Magelang",
  "Magetan",
  "Majalengka",
  "Malang",
  "Mojokerto",
  "Nganjuk",
  "Ngawi",
  "Pacitan",
  "Pamekasan",
  "Pandeglang",
  "Pangandaran",
  "Pasuruan",
  "Pati",
  "Pekalongan",
  "Pemalang",
  "Ponorogo",
  "Probolinggo",
  "Purbalingga",
  "Purwakarta",
  "Purworejo",
  "Rembang",
  "Salatiga",
  "Sampang",
  "Semarang",
  "Serang",
  "Sidoarjo",
  "Situbondo",
  "Sleman",
  "Sragen",
  "Subang",
  "Sukabumi",
  "Sukoharjo",
  "Sumedang",
  "Sumenep",
  "Surakarta (Solo)",
  "Surabaya",
  "Tangerang",
  "Tangerang Selatan",
  "Tasikmalaya",
  "Tegal",
  "Temanggung",
  "Trenggalek",
  "Tuban",
  "Tulungagung",
  "Wonogiri",
  "Wonosobo",
  "Yogyakarta",
];

export default function RegistrasiSeller() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [nik, setNik] = useState("");
  const [npwp, setNpwp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [npwpFile, setNpwpFile] = useState<File | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const kotaTersaring = DAFTAR_KOTA.filter((item) =>
    item.toLowerCase().includes(city.toLowerCase())
  );

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "", text: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (pass.length < 6) {
      return { score: 1, label: "LEMAH", color: "bg-red-500", text: "text-red-500" };
    }
    if (score <= 2) {
      return { score: 1, label: "LEMAH", color: "bg-red-500", text: "text-red-500" };
    }
    if (score === 3) {
      return { score: 2, label: "SEDANG", color: "bg-amber-500", text: "text-amber-600" };
    }
    return { score: 3, label: "KUAT", color: "bg-emerald-600", text: "text-emerald-600" };
  };

  const passwordStrength = getPasswordStrength(password);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length < 10) {
      alert("Nomor telepon minimal 10 digit angka.");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/toko/register-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          namaToko: shopName,
          kota: city,
          noRekening: bankAccount,
          deskripsi: `Toko berlokasi di ${city}. NIK: ${nik}`,
          alamat: `${city} (No. Rek: ${bankAccount})`,
          noTelp: phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.tokoId) {
          localStorage.setItem("pendingTokoId", String(data.tokoId));
        }
        alert("Pendaftaran Toko Berhasil! Menunggu verifikasi admin.");
        router.push("/kontrak-seller");
      } else {
        alert(`Gagal Mendaftar Toko: ${data.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke backend! Pastikan server NestJS aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-black">
      <Navbar />

      <main
        className={`${inter.className} flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-16 pb-28 md:pb-16 flex items-center justify-center`}
      >
        <div className="w-full max-w-lg lg:max-w-xl mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs text-black/50 hover:text-black mb-4 transition font-mono"
            >
              <ArrowLeft className="w-4 h-4" /> KEMBALI
            </button>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black/5 border border-black/10 rounded-full mb-3 text-black">
              <Store className="w-6 h-6" />
            </div>
            <h1
              className={`${playfair.className} text-3xl sm:text-4xl font-bold tracking-tight text-black mb-2`}
            >
              Buka Toko Seller
            </h1>
            <p className="text-black/50 text-xs sm:text-sm leading-relaxed">
              Mulai etalase digital Anda dan jangkau para kolektor arsip vintage terkurasi di seluruh Indonesia.
            </p>
          </div>

          <div className="bg-white border border-black/10 rounded-sm p-6 sm:p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  NAMA TOKO
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Contoh: Atelier Archive"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  EMAIL TOKO / AKUN
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@domain.com"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div className="relative">
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  KOTA ASAL TOKO (PULAU JAWA)
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Ketik nama kota (misal: Bandung, Jakarta, Surabaya)"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />

                {isDropdownOpen && city.length > 0 && kotaTersaring.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-black/10 rounded-sm shadow-xl max-h-48 overflow-y-auto mt-1 left-0 divide-y divide-black/5">
                    {kotaTersaring.map((item) => (
                      <li
                        key={item}
                        onClick={() => {
                          setCity(item);
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                  >
                    NOMOR TELEPON (ANGKA)
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="081234567890"
                    className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                  />
                </div>
                <div>
                  <label
                    className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                  >
                    NOMOR REKENING (ANGKA)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 1234567890"
                    className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                  >
                    NIK / KTP (16 DIGIT)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    required
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                    placeholder="16 digit angka NIK"
                    className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                  />
                </div>
                <div>
                  <label
                    className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                  >
                    NPWP (ANGKA)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Nomor pokok wajib pajak"
                    className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border-b border-black/20 px-1 py-2 pr-8 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 text-black/40 hover:text-black transition focus:outline-none"
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className={`${mono.className} tracking-wider text-black/50 uppercase`}>
                        KEKUATAN: <span className={`font-semibold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                      </span>
                      <span className={`${mono.className} text-black/40`}>
                        {password.length >= 8 ? "✓ Min. 8 Karakter" : "Min. 8 Karakter"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 h-1">
                      <div className={`rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-black/10"}`} />
                      <div className={`rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-black/10"}`} />
                      <div className={`rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-black/10"}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  DOKUMEN VERIFIKASI IDENTITAS
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <UploadBox label="Upload Foto KTP" file={ktpFile} onChange={setKtpFile} />
                  <UploadBox label="Upload Foto NPWP" file={npwpFile} onChange={setNpwpFile} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-sm hover:bg-black/85 transition disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  "MEMPROSES..."
                ) : (
                  <>
                    DAFTAR & AJUKAN VERIFIKASI <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-black/10 text-center">
              <p className="text-xs text-black/60">
                Sudah memiliki akun toko?{" "}
                <Link
                  href="/login"
                  className="text-black font-semibold underline underline-offset-4 hover:text-black/70 transition"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function UploadBox({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="border border-dashed border-black/20 rounded-sm flex flex-col items-center justify-center gap-1.5 py-4 px-2 text-center cursor-pointer hover:border-black transition bg-[#FAF9F6]/50">
      <Upload className="w-4 h-4 text-black/40" />
      <span className="text-[11px] text-black/60 truncate max-w-[180px]">
        {file ? file.name : label}
      </span>
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      />
    </label>
  );
}
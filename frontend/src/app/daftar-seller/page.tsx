"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Home, Package, ShoppingBag, User, Upload, } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
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


export default function RegistrasiSeller() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [nik, setNik] = useState("");
  const [npwp, setNpwp] = useState("");
  const [password, setPassword] = useState("");
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [npwpFile, setNpwpFile] = useState<File | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login terlebih dahulu sebelum membuka toko!");
      router.push("/login-buyer");
      return;
    }

    try {
      // 2. Nembak API backend register toko
      const response = await fetch("http://localhost:3001/toko/register-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Kirim JWT Token
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
        alert("Pendaftaran Toko Berhasil! 🎉 Menunggu verifikasi admin.");
        router.push("/kontrak-seller");
      } else {
        alert(`Gagal Mendaftar Toko: ${data.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke backend! Pastikan server NestJS aktif.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/pesanan" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/profile" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
          <button className="absolute left-4 sm:left-8" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-black">BUKA TOKO</h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 pt-6 pb-6 md:flex md:items-center md:justify-center">
          <div className="w-full md:max-w-lg lg:max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-black">Join The Archive</h2>
            <p className="text-gray-500 text-xs sm:text-sm tracking-wide mb-6">
              ESTABLISH YOUR DIGITAL STORE
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  SHOP NAME
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Atelier Nàl"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@shop.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  CITY
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jakarta, Bekasi..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                    PHONE
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                    BANK ACCOUNT
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Digits only"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                    IDENTITY NUMBER (NIK)
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="16 digits"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                    TAX ID (NPWP)
                  </label>
                  <input
                    type="text"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="Digits only"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  IDENTITY VERIFICATION DOCUMENTS
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <UploadBox label="Upload KTP/SIM/Paspor" file={ktpFile} onChange={setKtpFile} />
                  <UploadBox label="Upload NPWP" file={npwpFile} onChange={setNpwpFile} />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white rounded-md py-3.5 font-medium mt-4 hover:bg-gray-900 transition"
              >
                DAFTAR & AJUKAN VERIFIKASI
              </button>
            </form>

            <p className="text-center text-sm text-gray-700 mt-6">
              Sudah punya akun?{" "}
              <Link href="/login-seller" className="font-semibold text-black">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
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
    <label className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-1 py-6 px-2 text-center cursor-pointer hover:border-black transition">
      <Upload className="w-5 h-5 text-gray-400" />
      <span className="text-[11px] text-gray-500">{file ? file.name : label}</span>
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      />
    </label>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3 md:rounded-md ${
        isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </Link>
  );
}
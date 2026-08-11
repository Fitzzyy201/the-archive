"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Bell, User } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function DaftarBuyer() {
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [kota, setKota] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");

  const handleDaftar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ nama, telepon, kota, alamat, catatan });
    alert(`Daftar dengan nama: ${nama}`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem icon={<Bell className="w-5 h-5" />} label="NOTIFICATION" />
        <NavItem icon={<User className="w-5 h-5" />} label="PROFILE" active />
      </div>

      {/* Main content */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
          <button className="absolute left-4 sm:left-8">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black`}>
            DAFTAR
          </h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 pt-8 pb-4 md:flex md:items-center md:justify-center">
          <div className="w-full md:max-w-md lg:max-w-lg mx-auto">
            <form className="space-y-5" onSubmit={handleDaftar}>
              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  NAMA LENGKAP
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  NOMOR TELEPON
                </label>
                <input
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="+62 800 0000 0000"
                  className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  KOTA
                </label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  placeholder="Cari kota atau kecamatan"
                  className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  ALAMAT LENGKAP
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, gedung, nomor rumah"
                  className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  CATATAN (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Warna pagar, patokan"
                  className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white rounded-md py-3.5 flex items-center justify-center font-medium mt-6 hover:bg-gray-900 transition"
              >
                DAFTAR
              </button>
            </form>

            <p className="text-center text-sm text-gray-700 mt-6">
              Sudah punya akun?{" "}
              <Link href="/login-seller" className="text-black-600 font-bodl">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer hover:opacity-80 transition md:px-6 md:py-3 md:rounded-md ${
        active ? "text-white" : "text-gray-400"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </div>
  );
}
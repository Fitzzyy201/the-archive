"use client";

import Link from "next/link";
import { ArrowLeft, Hourglass } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function VerifikasiSeller() {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
        <Link href="/registrasi-seller" className="absolute left-4 sm:left-8">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          STATUS TOKO
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-12 text-center">
        <div className="w-full md:max-w-md mx-auto flex flex-col items-center">
          <Hourglass className="w-10 h-10 text-black mb-6" strokeWidth={1.5} />

          <h2 className={`${playfair.className} text-2xl sm:text-3xl font-bold text-black mb-3`}>
            Verifikasi Diproses
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
            Terima kasih telah mendaftar. Tim Admin kami sedang meninjau dokumen
            identitas dan informasi toko Anda. Proses ini memakan waktu maksimal 1x24 jam.
          </p>

          <div className="w-full border-2 border-black rounded-md py-5 px-6 mb-6">
  <p className="text-[11px] font-bold tracking-wider text-gray-500 mb-3">
    STATUS SAAT INI
  </p>
  <div className="bg-grey rounded-md py-3 text-sm font-bold text-black tracking-wide">
    MENUNGGU KONFIRMASI
  </div>
</div>
          <p className="text-xs text-gray-400 tracking-wide mb-8">{today}</p>

          <Link
            href="/"
            className="w-full bg-black text-white rounded-md py-3.5 font-medium tracking-wide hover:bg-gray-900 transition"
          >
            KEMBALI
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function KontrakSeller() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (!agreed) {
      alert("Kamu harus menyetujui kontrak terlebih dahulu.");
      return;
    }

    localStorage.setItem("agreedToSellerRules", "true");

    alert("Persetujuan diterima! Status pendaftaran toko Anda sekarang PENDING.");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white md:pl-56">
      <Navbar variant="seller" />

      {/* Main Content */}
      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
          <button onClick={() => router.back()} className="absolute left-4 sm:left-8">
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h2 className={`${playfair.className} text-xl sm:text-2xl font-bold text-black text-center`}>
            DIGITAL CONTRACT
          </h2>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-8 md:flex md:items-center md:justify-center">
          <div className="w-full md:max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-black text-center">
              SYARAT DAN KETENTUAN MEMBUKA TOKO
            </h2>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Sebelum memulai berjualan, mohon baca dan pahami ketentuan berikut. Dengan
              membuka toko, Anda dianggap telah menyetujui seluruh poin di bawah ini.
            </p>

            <div className="border border-gray-300 rounded-md p-5 sm:p-6 max-h-80 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-1">1. HAK DAN KEWAJIBAN PENJUAL</h3>
                <p>
                  Anda wajib memberikan data diri, identitas (KTP), dan informasi rekening
                  bank yang valid serta akurat saat mendaftar. Anda juga menjamin bahwa
                  seluruh barang yang dijual adalah asli dan bukan hasil tindak kejahatan,
                  serta wajib menjaga kualitas produk dan layanan yang dijual sesuai standar
                  waktu sesuai batas yang ditentukan sistem.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">2. KEBIJAKAN PRODUK DAN BIAYA</h3>
                <p>
                  Dilarang keras menjual produk terlarang seperti obat-obatan ilegal,
                  senjata, dan barang berbahaya lainnya. Platform akan mengenakan biaya
                  layanan sebesar 10% dari setiap transaksi yang berhasil
                  sesuai kebijakan platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">3. PENYELESAIAN MASALAH DAN SANKSI</h3>
                <p>
                  Pelanggaran terhadap ketentuan penggunaan dapat mengakibatkan
                  pemblokiran akun tanpa pemberitahuan terlebih dahulu. Segala perselisihan
                  antara penjual dan pembeli akan diproses melalui mekanisme resolusi
                  yang disediakan oleh pihak platform.
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-5 leading-relaxed">
              Dengan menekan tombol &quot;Setujui Kontrak&quot;, Anda menyatakan telah membaca,
              memahami, dan menyetujui seluruh syarat dan ketentuan di atas.
            </p>

            <label className="flex items-start gap-3 mt-4 cursor-pointer select-none justify-center">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-black cursor-pointer"
              />
              <span className="text-sm text-gray-700">Saya menyetujui kontrak ini</span>
            </label>

            <button
              onClick={handleContinue}
              className={`w-full rounded-md py-3.5 font-medium mt-5 transition ${
                agreed
                  ? "bg-black text-white hover:bg-gray-900 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              SETUJUI KONTRAK
            </button>

            <Link
              href="/daftar-seller"
              className="block text-center w-full rounded-md py-3.5 font-medium mt-3 border border-gray-300 text-black hover:bg-gray-50 transition"
            >
              KEMBALI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

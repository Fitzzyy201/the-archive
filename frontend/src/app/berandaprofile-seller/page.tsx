"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const NAMA_TOKO_FALLBACK = "Nama Toko Belum Diatur";

type TokoInfo = {
  namaToko: string;
  fotoToko?: string;
};

type StatusTokoResponse = {
  tokoId?: number | null;
  namaToko?: string | null;
  statusVerif?: string | null;
};

type DetailTokoResponse = {
  namaToko?: string | null;
  fotoToko?: string | null;
};

function namaTokoValid(nama?: string | null) {
  return typeof nama === "string" ? nama.trim() : "";
}

export default function ProfileSeller() {
  const [toko, setToko] = useState<TokoInfo>({
    namaToko: NAMA_TOKO_FALLBACK,
    fotoToko: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Backend membaca JWT dan mencari toko milik user yang sedang login.
        const statusRes = await fetch("http://localhost:3001/toko/status-my-shop", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statusRes.ok) {
          setIsLoading(false);
          return;
        }

        const statusData: StatusTokoResponse = await statusRes.json();
        const tokoId = Number(statusData?.tokoId);

        if (!tokoId) {
          // Jangan pakai tokoId lama yang mungkin milik seller lain.
          localStorage.removeItem("tokoId");
          setToko({ namaToko: NAMA_TOKO_FALLBACK, fotoToko: "" });
          setIsLoading(false);
          return;
        }

        // Simpan tokoId hasil verifikasi token agar konsisten dengan halaman seller lain.
        localStorage.setItem("tokoId", String(tokoId));

        const namaDariStatus = namaTokoValid(statusData?.namaToko);

        // 2. Ambil detail toko (termasuk foto) dari toko milik seller ini.
        const detailRes = await fetch(`http://localhost:3001/toko/${tokoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (detailRes.ok) {
          const detailData: DetailTokoResponse = await detailRes.json();
          const namaDariDetail = namaTokoValid(detailData?.namaToko);

          setToko({
            namaToko: namaDariDetail || namaDariStatus || NAMA_TOKO_FALLBACK,
            fotoToko: typeof detailData?.fotoToko === "string" ? detailData.fotoToko : "",
          });
        } else {
          setToko({
            namaToko: namaDariStatus || NAMA_TOKO_FALLBACK,
            fotoToko: "",
          });
        }
      } catch (err) {
        console.error("Gagal mengambil info toko:", err);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const handleDisabledFeature = (featureName: string) => {
    alert(`Fitur ${featureName} akan tersedia setelah Payment Gateway terintegrasi!`);
  };

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#FAF9F6] text-black md:pl-56`}>
      <Navbar variant="seller" />

      <div className="flex min-h-screen flex-col pb-24 md:pb-0">
        {/* Header Title */}
        <div className="border-b border-black/10 bg-white px-5 py-6 text-center sm:px-10 md:text-left">
          <h1
            className={`${playfair.className} text-xl font-bold tracking-wider text-black sm:text-2xl`}
          >
            {isLoading ? "Memuat Toko..." : toko.namaToko}
          </h1>
        </div>

        {/* Content Container */}
        <div className="flex w-full flex-1 flex-col items-center justify-start px-5 py-10 sm:px-10">
          <div className="flex w-full max-w-md flex-col items-center">
            {/* Avatar Circle */}
            <div className="mb-6 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-black bg-gray-50 shadow-sm sm:h-44 sm:w-44">
              {toko.fotoToko ? (
                <img
                  src={
                    toko.fotoToko.startsWith("http") || toko.fotoToko.startsWith("data:")
                      ? toko.fotoToko
                      : `http://localhost:3001/uploads/${toko.fotoToko}`
                  }
                  alt={isLoading ? "Foto Toko" : toko.namaToko}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Store className="h-16 w-16 text-black/30" strokeWidth={1} />
              )}
            </div>

            {/* Nama Toko */}
            <h2
              className={`${playfair.className} mb-6 text-center text-xl font-bold tracking-wide text-black sm:text-2xl`}
            >
              {isLoading ? "Memuat..." : toko.namaToko}
            </h2>

            {/* Tombol UBAH */}
            <Link
              href="/berandaprofile-seller/edit"
              className="mb-10 w-full rounded-sm bg-black py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/85 sm:w-52"
            >
              UBAH
            </Link>

            {/* List Option Cards (Keuangan & Grafik) */}
            <div className="w-full space-y-4">
              <button
                onClick={() => handleDisabledFeature("Keuangan")}
                className="group flex w-full items-center justify-between rounded-sm border border-black bg-white p-4 text-left transition hover:bg-black/[0.02]"
              >
                <span
                  className={`${jakarta.className} text-xs font-bold uppercase tracking-widest text-black sm:text-sm`}
                >
                  KEUANGAN
                </span>
                <ChevronRight className="h-4 w-4 text-black transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => handleDisabledFeature("Grafik Produk Terjual")}
                className="group flex w-full items-center justify-between rounded-sm border border-black bg-white p-4 text-left transition hover:bg-black/[0.02]"
              >
                <span
                  className={`${jakarta.className} text-xs font-bold uppercase tracking-widest text-black sm:text-sm`}
                >
                  GRAFIK PRODUK TERJUAL
                </span>
                <ChevronRight className="h-4 w-4 text-black transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

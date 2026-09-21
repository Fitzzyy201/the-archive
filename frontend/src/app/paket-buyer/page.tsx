"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Struktur disamain sama model Transaksi + Produk di Prisma
type PaketItem = {
  id: number;
  tokoNama: string;
  namaProduk: string;
  ukuranDimensi: string;
  qty: number;
  harga: number;
  fotoProduk: string;
  statusPesanan: "BelumBayar" | "Diproses" | "Dikirim" | "Selesai" | "Dikomplain" | "Batal";
  tanggalOrder: string;
  estimasiTiba?: string;
  tanggalDiterima?: string;
};

function formatRupiah(angka: number) {
  return `IDR ${angka.toLocaleString("id-ID")}`;
}

const statusLabel: Record<PaketItem["statusPesanan"], string> = {
  BelumBayar: "BELUM BAYAR",
  Diproses: "DIPROSES",
  Dikirim: "DIKIRIM",
  Selesai: "SELESAI",
  Dikomplain: "DIKOMPLAIN",
  Batal: "DIBATALKAN",
};

export default function MyPacket() {
  const [paket, setPaket] = useState<PaketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaket = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/transaksi/buyer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPaket(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data paket:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaket();
  }, []);

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <Navbar />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <Link href="/profile-seller">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          MY PACKET
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-10">
          {isLoading ? (
            <p className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}>
              Memuat paket...
            </p>
          ) : paket.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-4">{paket.length} ORDERS</p>
              <div className="space-y-5">
                {paket.map((item) => (
                  <PaketCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm mt-4">
      <PackageSearch className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
        Belum ada paket
      </p>
      <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
        Pesanan yang kamu buat akan muncul di sini setelah kamu checkout.
      </p>
      <Link
        href="/"
        className="mt-5 bg-black text-white text-xs font-semibold tracking-wide rounded-md px-6 py-2.5 hover:bg-gray-900 transition"
      >
        JELAJAHI KATALOG
      </Link>
    </div>
  );
}

function PaketCard({ item }: { item: PaketItem }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-gray-400 mb-2">
        {item.tokoNama.toUpperCase()}
      </p>

      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 bg-gray-100 rounded-sm overflow-hidden shrink-0">
          <img
            src={item.fotoProduk}
            alt={item.namaProduk}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-black leading-snug">
            {item.namaProduk}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            ORDER: {item.tanggalOrder}
          </p>
          <p className="text-xs text-gray-400">
            QTY: {item.qty} · SIZE: {item.ukuranDimensi}
          </p>
          <p className="text-sm font-semibold text-black mt-1">
            {formatRupiah(item.harga)}
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md px-4 py-3">
        <p className="text-xs text-gray-500 mb-2">
          {item.statusPesanan === "Selesai" && item.tanggalDiterima
            ? `DITERIMA PADA ${item.tanggalDiterima}`
            : item.estimasiTiba
              ? `ESTIMASI TIBA ${item.estimasiTiba}`
              : statusLabel[item.statusPesanan]}
        </p>

        {item.statusPesanan === "Selesai" ? (
          <div className="grid grid-cols-2 gap-2">
            <button className="border border-gray-300 rounded-md py-2 text-xs font-semibold tracking-wide hover:bg-gray-50 transition">
              AJUKAN COMPLAIN
            </button>
            <button className="bg-black text-white rounded-md py-2 text-xs font-semibold tracking-wide hover:bg-gray-900 transition">
              PESANAN SELESAI
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-md py-2 text-center text-xs font-semibold tracking-wide text-gray-600">
            {statusLabel[item.statusPesanan]}
          </div>
        )}
      </div>
    </div>
  );
}
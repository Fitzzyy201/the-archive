"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  History,
} from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type StatusPesanan =
  | "BelumBayar"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dikomplain"
  | "Batal";

// Struktur disamain sama model Transaksi (+ produknya) di Prisma
type RiwayatItem = {
  id: number;
  totalHarga: number;
  statusPesanan: StatusPesanan;
  waktuTransaksi: string;
  produk?: {
    namaProduk: string;
    ukuranDimensi: string;
    fotoProduk: string;
  } | null;
};

const STATUS_LABEL: Partial<Record<StatusPesanan, string>> = {
  Selesai: "SELESAI",
  Dikomplain: "DIKOMPLAIN",
  Batal: "DIBATALKAN",
};

// Riwayat = pesanan yang udah berakhir (selesai, dikomplain, atau dibatalkan)
const STATUS_RIWAYAT: StatusPesanan[] = ["Selesai", "Dikomplain", "Batal"];

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatTanggal(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

function kodePesanan(p: RiwayatItem) {
  const tahun = new Date(p.waktuTransaksi).getFullYear();
  return `#VT-${tahun}-${String(p.id).padStart(3, "0")}`;
}

function isRenderable(src?: string) {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:image"))
  );
}

export default function RiwayatPesanan() {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");

      if (!tokoId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/transaksi/toko/${tokoId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data: RiwayatItem[] = await res.json();
          setRiwayat(
            Array.isArray(data)
              ? data.filter((t) => STATUS_RIWAYAT.includes(t.statusPesanan))
              : []
          );
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Riwayat pesanan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] md:pl-56">
      <Navbar variant="seller" />

      {/* Main content */}
      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        {/* Header */}
        <div className="flex items-center gap-4 px-5 sm:px-8 py-5 bg-white border-b border-black">
          <Link href="/pesanan-seller">
            <ArrowLeft className="w-6 h-6 text-black" />
          </Link>
          <h1 className={`${playfair.className} text-2xl font-bold tracking-wide text-black`}>
            RIWAYAT PESANAN
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-8 py-6">
          <div className="w-full md:max-w-xl md:mx-auto pb-8">
            <p className="text-[11px] tracking-[0.2em] text-black/60 mb-1">SELLER PORTAL</p>
            <h2 className="text-base font-semibold tracking-wide text-black pb-3 mb-6 border-b border-black">
              HISTORY PESANAN
            </h2>

            {isLoading ? (
              <p
                className={`${jakarta.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
              >
                Memuat riwayat...
              </p>
            ) : riwayat.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div>
                  {riwayat.map((item) => (
                    <RiwayatCard key={item.id} item={item} />
                  ))}
                </div>
                <p
                  className={`${jakarta.className} text-center text-[11px] tracking-[0.25em] text-black/25 mt-12`}
                >
                  END OF HISTORY
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15">
      <History className="w-6 h-6 text-black/25 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
        Belum ada riwayat transaksi
      </p>
      <p className="text-xs text-black/40 max-w-[240px] leading-relaxed">
        Pesanan yang sudah selesai, dikomplain, atau dibatalkan akan tercatat di sini.
      </p>
    </div>
  );
}

function RiwayatCard({ item }: { item: RiwayatItem }) {
  return (
    <div className="py-6 border-b border-black/10 first:pt-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`${jakarta.className} text-sm font-semibold tracking-wide text-black`}>
            {kodePesanan(item)}
          </p>
          <p className="text-[11px] tracking-wide text-black/55 mt-1">
            {formatTanggal(item.waktuTransaksi)}
          </p>
        </div>
        <span className="border border-black px-2 py-0.5 text-[9px] font-semibold tracking-wide text-black">
          {STATUS_LABEL[item.statusPesanan] ?? item.statusPesanan.toUpperCase()}
        </span>
      </div>

      <div className="flex gap-4 mb-5">
        <div className="w-24 h-24 bg-black/5 overflow-hidden shrink-0 flex items-center justify-center">
          {isRenderable(item.produk?.fotoProduk) ? (
            <img
              src={item.produk?.fotoProduk}
              alt={item.produk?.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`${playfair.className} text-base font-bold uppercase tracking-wide text-black leading-snug`}
          >
            {item.produk?.namaProduk ?? "Produk"}
          </h3>
          <p className="text-[11px] tracking-wide text-black/50 mt-2">
            SIZE: {item.produk?.ukuranDimensi ?? "-"}
          </p>
          <p className="text-base font-bold text-black mt-4">{formatRupiah(item.totalHarga)}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={`/komplain/${item.id}`}
          className="border border-black px-5 py-3 text-[11px] font-semibold tracking-[0.12em] text-black hover:bg-black/[0.03] transition"
        >
          LIHAT KOMPLAIN
        </Link>
        <Link
          href={`/detail-pesanan?id=${item.id}`}
          className="bg-black text-white px-6 py-3 text-[11px] font-semibold tracking-[0.12em] hover:bg-black/85 transition"
        >
          DETAIL
        </Link>
      </div>
    </div>
  );
}

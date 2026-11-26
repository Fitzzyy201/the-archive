"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  History,
  Package,
  PackageSearch,
} from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type StatusPesanan =
  | "BelumBayar"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dikomplain"
  | "Batal";

type Pesanan = {
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

const TABS = ["SEMUA", "PERLU DIKIRIM", "DIKIRIM", "SELESAI"] as const;
type Tab = (typeof TABS)[number];

const STATUS_LABEL: Record<StatusPesanan, string> = {
  BelumBayar: "BELUM BAYAR",
  Diproses: "PERLU DIKIRIM",
  Dikirim: "DIKIRIM",
  Selesai: "SELESAI",
  Dikomplain: "DIKOMPLAIN",
  Batal: "DIBATALKAN",
};

function matchTab(status: StatusPesanan, tab: Tab) {
  if (tab === "SEMUA") return status !== "BelumBayar";
  if (tab === "PERLU DIKIRIM") return status === "Diproses";
  if (tab === "DIKIRIM") return status === "Dikirim";
  return status === "Selesai";
}

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatTanggal(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function kodePesanan(p: Pesanan) {
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

export default function PesananSeller() {
  const [activeTab, setActiveTab] = useState<Tab>("SEMUA");
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPesanan = async () => {
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");

      if (!tokoId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3001/transaksi/toko/${tokoId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (res.ok) {
          const data = await res.json();
          setPesanan(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Data pesanan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPesanan();
  }, []);

  const filtered = pesanan.filter((p) =>
    matchTab(p.statusPesanan, activeTab)
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] md:pl-56">
      <Navbar variant="seller" />

      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        <div className="w-full md:max-w-2xl md:mx-auto px-5 sm:px-8 pb-10">
          {/* Header */}
          <h1
            className={`${playfair.className} text-2xl sm:text-3xl font-semibold tracking-tight text-black text-center pt-8 pb-5 border-b border-black`}
          >
            PESANAN
          </h1>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-black/15 mt-5 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-black/45 hover:text-black/75"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Navigasi Pesanan Masuk */}
          <Link
            href="/pesanan-masuk"
            className="group flex items-center justify-between gap-4 bg-black text-white px-5 sm:px-6 py-5 sm:py-6 mb-4 border border-black transition-all duration-200 hover:bg-[#244C3A] hover:border-[#244C3A]"
          >
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold tracking-wide text-white">
                PESANAN MASUK
              </p>

              <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.12em] text-white/75 mt-2">
                KELOLA PESANAN BARU DARI PEMBELI
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-center w-10 h-10 border border-white/40 group-hover:border-white/70 transition-colors">
              <ChevronRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Navigasi Riwayat Pesanan */}
          <Link
            href="/riwayat-pesanan"
            className="group flex items-center justify-between gap-4 bg-white border border-black px-5 sm:px-6 py-5 sm:py-6 mb-10 transition-all duration-200 hover:bg-[#F2EDE3]"
          >
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold tracking-wide text-black">
                RIWAYAT PESANAN
              </p>

              <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.12em] text-black/60 mt-2">
                LIHAT TRANSAKSI PESANAN SEBELUMNYA
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-center w-10 h-10 border border-black/30 group-hover:border-black transition-colors">
              <History className="w-5 h-5 text-black" strokeWidth={1.7} />
            </div>
          </Link>

          {/* Daftar Pesanan */}
          {isLoading ? (
            <p className="text-center text-xs text-black/45 py-16 tracking-widest uppercase">
              Memuat pesanan...
            </p>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-black/10">
              {filtered.map((p) => (
                <PesananCard key={p.id} pesanan={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15">
      <PackageSearch
        className="w-6 h-6 text-black/25 mb-4"
        strokeWidth={1.5}
      />

      <p className="text-sm font-semibold text-black/75 tracking-wide mb-1.5">
        Belum ada pesanan
      </p>

      <p className="text-xs text-black/50 max-w-[220px] leading-relaxed">
        Pesanan dari pembeli akan muncul di sini setelah ada transaksi.
      </p>
    </div>
  );
}

function PesananCard({ pesanan }: { pesanan: Pesanan }) {
  return (
    <div className="py-8 first:pt-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-[10px] tracking-wide text-black/50">
          {kodePesanan(pesanan)} • {formatTanggal(pesanan.waktuTransaksi)}
        </p>

        <p className="text-[10px] font-semibold tracking-wide text-black shrink-0">
          {STATUS_LABEL[pesanan.statusPesanan]}
        </p>
      </div>

      <div className="flex gap-4 mb-5">
        <div className="w-20 h-24 bg-black/5 overflow-hidden shrink-0 flex items-center justify-center">
          {isRenderable(pesanan.produk?.fotoProduk) ? (
            <img
              src={pesanan.produk?.fotoProduk}
              alt={pesanan.produk?.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package
              className="w-5 h-5 text-black/20"
              strokeWidth={1.5}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3
              className={`${playfair.className} text-sm font-bold uppercase tracking-wide text-black leading-snug`}
            >
              {pesanan.produk?.namaProduk ?? "Produk"}
            </h3>

            <p className="text-xs text-black/50 mt-1">
              Size {pesanan.produk?.ukuranDimensi ?? "-"}
            </p>
          </div>

          <p className="text-sm font-bold text-black">
            {formatRupiah(pesanan.totalHarga)}
          </p>
        </div>
      </div>

      <Link
        href={`/detail-pesanan?id=${pesanan.id}`}
        className="block text-center w-full border border-black bg-transparent py-3 text-xs font-semibold tracking-[0.15em] text-black transition-colors hover:bg-black hover:text-white"
      >
        DETAIL
      </Link>
    </div>
  );
}

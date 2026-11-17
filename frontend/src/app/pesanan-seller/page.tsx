"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingBag,
  User,
  ChevronRight,
  History,
  PackageSearch,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type StatusPesanan =
  | "PENDING"
  | "DIPROSES"
  | "DIKIRIM"
  | "SELESAI"
  | "DITOLAK"
  | "DIBATALKAN";

type Pesanan = {
  id: number;
  totalHarga: number;
  statusPesanan: StatusPesanan;
  waktuTransaksi: string;
  produk?: {
    namaProduk: string;
    ukuranDimensi?: string;
    fotoProduk: string;
  } | null;
};

type OrderRow = {
  id: number;
  totalHarga: number;
  statusPesanan: StatusPesanan;
  waktuTransaksi: string;
  detail?: Array<{
    produk?: {
      namaProduk: string;
      ukuranDimensi?: string;
      fotoProduk: string;
    } | null;
  }>;
};

const TABS = ["SEMUA", "PERLU DIKIRIM", "DIKIRIM", "SELESAI"] as const;
type Tab = (typeof TABS)[number];

const STATUS_LABEL: Record<StatusPesanan, string> = {
  PENDING: "MENUNGGU",
  DIPROSES: "PERLU DIKIRIM",
  DIKIRIM: "DIKIRIM",
  SELESAI: "SELESAI",
  DITOLAK: "DITOLAK",
  DIBATALKAN: "DIBATALKAN",
};

function matchTab(status: StatusPesanan, tab: Tab) {
  if (tab === "SEMUA") return status !== "PENDING"; // pesanan masuk punya halaman sendiri
  if (tab === "PERLU DIKIRIM") return status === "DIPROSES";
  if (tab === "DIKIRIM") return status === "DIKIRIM";
  return status === "SELESAI";
}

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatTanggal(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
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
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role") || localStorage.getItem("userRole");

      if (!token || role !== "Seller") {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/seller/orders?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const rows: OrderRow[] = Array.isArray(data)
            ? (data as OrderRow[])
            : ((data.data ?? []) as OrderRow[]);
          setPesanan(
            rows.map((p) => ({
              id: p.id,
              totalHarga: p.totalHarga,
              statusPesanan: p.statusPesanan,
              waktuTransaksi: p.waktuTransaksi,
              produk: p.detail?.[0]?.produk ?? null,
            }))
          );
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Data pesanan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPesanan();
  }, []);

  const filtered = pesanan.filter((p) => matchTab(p.statusPesanan, activeTab));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
     
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/seller/pesanan" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="w-full md:max-w-2xl md:mx-auto px-5 sm:px-8 pb-10">
          <h1
            className={`${playfair.className} text-3xl font-bold tracking-wide text-black text-center pt-8 pb-5 border-b border-black`}
          >
            PESANAN
          </h1>

          <div className="flex gap-6 border-b border-black/15 mt-5 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[11px] tracking-[0.15em] whitespace-nowrap border-b-2 -mb-px transition ${
                  activeTab === tab
                    ? "border-black text-black font-semibold"
                    : "border-transparent text-black/45 hover:text-black/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            href="/seller/pesanan/masuk"
            className="flex items-center justify-between bg-black text-white px-5 py-6 mb-6 hover:bg-black/90 transition"
          >
            <div>
              <p className={`${playfair.className} text-lg font-bold tracking-wide`}>
                PESANAN MASUK
              </p>
              <p className="text-[9px] tracking-[0.15em] text-white/60 mt-1.5">
                KELOLA PESANAN BARU
              </p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Link>

          <Link
            href="/seller/pesanan/riwayat"
            className="flex items-center justify-between border border-black px-5 py-6 mb-10 hover:bg-black/[0.02] transition"
          >
            <div>
              <p className={`${playfair.className} text-lg font-bold tracking-wide text-black`}>
                RIWAYAT PESANAN
              </p>
              <p className="text-[9px] tracking-[0.15em] text-black/50 mt-1.5">
                LIHAT SEMUA TRANSAKSI YANG TELAH SELESAI
              </p>
            </div>
            <History className="w-5 h-5 text-black" />
          </Link>

          {isLoading ? (
            <p
              className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
            >
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
      <PackageSearch className="w-6 h-6 text-black/25 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
        Belum ada pesanan
      </p>
      <p className="text-xs text-black/40 max-w-[220px] leading-relaxed">
        Pesanan dari pembeli akan muncul di sini setelah ada transaksi.
      </p>
    </div>
  );
}

function PesananCard({ pesanan }: { pesanan: Pesanan }) {
  return (
    <div className="py-8 first:pt-0">
      <div className="flex items-center justify-between mb-4">
        <p className={`${mono.className} text-[10px] tracking-wide text-black/45`}>
          {kodePesanan(pesanan)} • {formatTanggal(pesanan.waktuTransaksi)}
        </p>
        <p className="text-[10px] tracking-wide text-black">
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
            <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3
              className={`${playfair.className} text-sm font-bold uppercase tracking-wide text-black leading-snug`}
            >
              {pesanan.produk?.namaProduk ?? "Produk"}
            </h3>
            <p className="text-xs text-black/45 mt-1">
              Size {pesanan.produk?.ukuranDimensi ?? "-"}
            </p>
          </div>
          <p className="text-sm font-bold text-black">{formatRupiah(pesanan.totalHarga)}</p>
        </div>
      </div>

      <Link
        href={`/seller/pesanan/${pesanan.id}`}
        className="block text-center w-full border border-black py-3 text-xs font-semibold tracking-[0.15em] text-black hover:bg-black/[0.03] transition"
      >
        DETAIL
      </Link>
    </div>
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
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 transition md:px-6 md:py-3 md:rounded-md ${
        isActive ? "text-white font-semibold" : "text-white/40 hover:text-white/70"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm tracking-wide">{label}</span>
    </Link>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, User, ChevronRight, History } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const TABS = ["SEMUA", "PERLU DIKIRIM", "DIKIRIM", "SELESAI"] as const;
type Tab = (typeof TABS)[number];

type ItemPesanan = {
  id: number;
  namaProduk: string;
  ukuranDimensi: string;
  warna?: string;
  harga: number;
  fotoProduk: string;
  statusPesanan: "BelumBayar" | "Diproses" | "Dikirim" | "Selesai" | "Dikomplain" | "Batal";
  kodePesanan: string;
  tanggal: string;
};

const pesananMasukCount = 0;
const daftarPesanan: ItemPesanan[] = [];

function formatRupiah(angka: number) {
  return `Rp${angka.toLocaleString("id-ID")}`;
}

function mapStatusToTab(status: ItemPesanan["statusPesanan"]): Tab {
  if (status === "Diproses" || status === "BelumBayar") return "PERLU DIKIRIM";
  if (status === "Dikirim") return "DIKIRIM";
  if (status === "Selesai") return "SELESAI";
  return "SEMUA";
}

export default function PesananSeller() {
  const [activeTab, setActiveTab] = useState<Tab>("SEMUA");

  const filtered =
    activeTab === "SEMUA"
      ? daftarPesanan
      : daftarPesanan.filter((p) => mapStatusToTab(p.statusPesanan) === activeTab);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/pesanan-seller" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/profile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="px-5 sm:px-10 py-6 border-b border-black/10 bg-white">
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-semibold tracking-tight text-black`}>
            PESANAN
          </h1>
        </div>

        <div className="flex border-b border-black/10 bg-white px-5 sm:px-10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[11px] font-semibold tracking-wide whitespace-nowrap border-b-2 transition ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-black/35 hover:text-black/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-6">
          <div className="w-full md:max-w-2xl mx-auto space-y-3">
            <Link
              href="/pesanan-masuk"
              className="bg-black text-white rounded-sm px-4 py-4 flex items-center justify-between hover:bg-black/90 transition"
            >
              <div>
                <p className="text-sm font-semibold">PESANAN MASUK</p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {pesananMasukCount === 0
                    ? "Belum ada pesanan baru"
                    : `${pesananMasukCount} pesanan menunggu diproses`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50" />
            </Link>

            <Link
              href="/riwayat-pesanan"
              className="border border-black/10 bg-white rounded-sm px-4 py-4 flex items-center justify-between hover:border-black/30 transition"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-black/40" />
                <div>
                  <p className="text-sm font-semibold text-black">RIWAYAT PESANAN</p>
                  <p className="text-[11px] text-black/40 mt-0.5">Lihat semua transaksi sebelumnya</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/30" />
            </Link>

            <div className="pt-4">
              {filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {filtered.map((item) => (
                    <PesananCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15 rounded-sm">
      <ShoppingBag className="w-6 h-6 text-black/25 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
        Belum ada pesanan
      </p>
      <p className="text-xs text-black/40 max-w-[220px] leading-relaxed">
        Pesanan dari pembeli akan muncul di sini setelah ada transaksi masuk.
      </p>
    </div>
  );
}

function PesananCard({ item }: { item: ItemPesanan }) {
  return (
    <div className="bg-white border border-black/10 rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className={`${mono.className} text-[10px] text-black/40`}>
          #{item.kodePesanan} · {item.tanggal}
        </p>
        <span className="text-[10px] font-semibold tracking-wide text-black/60">
          {item.statusPesanan.toUpperCase()}
        </span>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/5 rounded-sm overflow-hidden shrink-0">
          <img src={item.fotoProduk} alt={item.namaProduk} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-black truncate">{item.namaProduk}</h3>
          <p className="text-xs text-black/40 mt-0.5">
            Size {item.ukuranDimensi}
            {item.warna ? ` | ${item.warna}` : ""}
          </p>
          <p className="text-sm font-semibold text-black mt-1.5">{formatRupiah(item.harga)}</p>
        </div>
      </div>

      <Link
        href={`/pesanan-seller/${item.id}`}
        className="block text-center w-full border border-black/15 rounded-sm py-2.5 text-xs font-semibold tracking-wide hover:bg-black/[0.02] transition"
      >
        DETAIL
      </Link>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3 md:rounded-md ${
        isActive ? "text-white font-semibold opacity-100" : "text-white/40 hover:text-white/70"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm tracking-wide">{label}</span>
    </Link>
  );
}
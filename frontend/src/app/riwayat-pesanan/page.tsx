"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, Package, ShoppingBag, User, History } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type RiwayatItem = {
  id: number;
  kodeTransaksi: string;
  tanggal: string;
  namaProduk: string;
  ukuranDimensi: string;
  warna?: string;
  harga: number;
  fotoProduk: string;
  statusPesanan: "Selesai" | "Dikomplain" | "Batal";
};

const riwayat: RiwayatItem[] = [];

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function RiwayatPesanan() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/pesanan-seller" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/profile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
          <Link href="/pesanan-seller">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
            RIWAYAT PESANAN
          </h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
          <div className="w-full md:max-w-xl">
            <p className={`${mono.className} text-[10px] tracking-[0.2em] text-gray-400 mb-1`}>
              SELLER PORTAL
            </p>
            <h2 className="text-sm font-bold tracking-wide text-black mb-5 pb-3 border-b border-gray-200">
              HISTORY PESANAN
            </h2>

            {riwayat.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm">
                <History className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
                <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                  Belum ada riwayat transaksi
                </p>
                <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                  Semua pesanan yang sudah selesai atau dibatalkan akan tercatat di sini.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {riwayat.map((item) => (
                    <RiwayatCard key={item.id} item={item} />
                  ))}
                </div>
                <p className={`${mono.className} text-center text-[10px] tracking-[0.25em] text-gray-300 mt-8`}>
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

const statusBadgeStyle: Record<RiwayatItem["statusPesanan"], string> = {
  Selesai: "bg-black text-white",
  Dikomplain: "bg-red-50 text-red-600",
  Batal: "bg-gray-100 text-gray-400",
};

function RiwayatCard({ item }: { item: RiwayatItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className="text-xs font-semibold text-black">#{item.kodeTransaksi}</p>
          <p className={`${mono.className} text-[10px] text-gray-400 mt-0.5`}>{item.tanggal}</p>
        </div>
        <span
          className={`text-[9px] font-semibold tracking-wide px-2.5 py-1 rounded-full ${
            statusBadgeStyle[item.statusPesanan]
          }`}
        >
          {item.statusPesanan.toUpperCase()}
        </span>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 bg-gray-100 rounded-sm overflow-hidden shrink-0">
          <img src={item.fotoProduk} alt={item.namaProduk} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-black leading-snug">{item.namaProduk}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            SIZE: {item.ukuranDimensi}
            {item.warna ? ` | ${item.warna}` : ""}
          </p>
          <p className="text-sm font-semibold text-black mt-1.5">{formatRupiah(item.harga)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/komplain/${item.id}`}
          className="text-center border border-gray-300 rounded-md py-2.5 text-xs font-semibold tracking-wide hover:bg-gray-50 transition"
        >
          LIHAT KOMPLAIN
        </Link>
        <Link
          href={`/pesanan-seller/${item.id}`}
          className="text-center bg-black text-white rounded-md py-2.5 text-xs font-semibold tracking-wide hover:bg-gray-900 transition"
        >
          DETAIL
        </Link>
      </div>
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
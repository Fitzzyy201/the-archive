"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  MessageCircle,
  ShoppingBag,
  Home,
  Bell,
  User,
  PackageOpen,
  Clock,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Produk = {
  id: string;
  nama: string;
  harga: number;
  size: string;
  toko: string;
  kota: string;
  stok: number;
  kondisi: string;
  foto: string;
};

const produkList: Produk[] = [];

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "BERANDA" },
  { href: "/notifikasi", icon: Bell, label: "NOTIFICATION" },
  { href: "/profile", icon: User, label: "PROFILE" },
];

export default function Beranda() {
  const [role, setRole] = useState<string | null>(null);
  const [isSellerPending, setIsSellerPending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
      
      const userRole = localStorage.getItem("role");
      const agreedRules = localStorage.getItem("agreedToSellerRules");

      if (userRole) {
        setRole(userRole);
      }

      if (agreedRules === "true") {
        setIsSellerPending(true);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} href={item.href} icon={<item.icon className="w-5 h-5" />} label={item.label} />
        ))}
      </div>

     
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        

        {isMounted && isSellerPending && (
          <div className="m-5 sm:mx-10 sm:mt-6 bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-3 text-amber-900 shadow-sm">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-amber-950">
                Pengajuan Toko Anda Sedang Dalam Peninjauan Admin (PENDING)
              </p>
              <p className="text-amber-800/80 mt-0.5">
                Akun Anda telah terdaftar dan sedang diverifikasi oleh staf kami. Selama masa peninjauan, Anda tetap dapat menjelajah produk sebagai pembeli. Fitur jualan akan aktif secara otomatis setelah di-approve oleh Admin.
              </p>
            </div>
          </div>
        )}

      
        <div className="px-5 sm:px-10 py-6 bg-white border-b border-black/10">
          <p className={`${mono.className} text-[10px] tracking-[0.25em] text-black/40 mb-4`}>
            THE ARCHIVE
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 border border-black/15 rounded-sm px-4 py-2.5 bg-white">
              <Search className="w-4 h-4 text-black/30 shrink-0" />
              <input
                type="text"
                placeholder="Search Catalogue"
                className={`${mono.className} flex-1 min-w-0 text-[11px] tracking-[0.1em] uppercase placeholder:text-black/30 outline-none bg-transparent text-black`}
              />
            </div>

            <Link
              href="/daftar-seller"
              className={`${mono.className} hidden sm:inline-block text-[10px] font-medium tracking-[0.15em] border border-black/15 rounded-sm px-4 py-2.5 hover:bg-black hover:text-white transition whitespace-nowrap text-black`}
            >
              BUKA TOKO
            </Link>

            <Link
              href="/login-buyer"
              className={`${mono.className} text-[10px] font-medium tracking-[0.15em] bg-black text-white rounded-sm px-4 py-2.5 hover:bg-black/85 transition whitespace-nowrap`}
            >
              LOGIN
            </Link>

            <Link
              href="/pesan"
              className="hidden sm:flex items-center justify-center w-9 h-9 border border-black/15 rounded-sm hover:bg-black/[0.03] transition shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-black/60" />
            </Link>

            <Link
              href="/keranjang"
              className="hidden sm:flex items-center justify-center w-9 h-9 border border-black/15 rounded-sm hover:bg-black/[0.03] transition shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-black/60" />
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full px-5 sm:px-10 md:px-14 py-10">
          <div className="text-center mb-10">
            <p className={`${mono.className} text-[10px] tracking-[0.3em] text-black/40 mb-2`}>
              CURATED SELECTION
            </p>
            <h1 className={`${playfair.className} text-4xl sm:text-5xl font-semibold tracking-tight text-black`}>
              The Archive
            </h1>
          </div>

          {produkList.length === 0 ? (
            <EmptyState />
          ) : (
             <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {produkList.map((produk) => (
                <ProdukCard key={produk.id} produk={produk} />
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
    <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-black/15 rounded-sm">
      <PackageOpen className="w-8 h-8 text-black/20 mb-4" strokeWidth={1.5} />
      <p className={`${playfair.className} text-lg text-black/70 mb-1`}>
        Belum Ada Produk
      </p>
      <p className="text-xs text-black/40 max-w-xs px-4">
        Belum ada toko yang publish produk. Coba cek lagi nanti ya.
      </p>
    </div>
  );
}

function ProdukCard({ produk }: { produk: Produk }) {
  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group bg-white border border-black/10 rounded-sm overflow-hidden hover:shadow-md transition"
    >
      <div className="relative aspect-square bg-black/5 overflow-hidden">
        {produk.foto ? (
          <img
            src={produk.foto}
            alt={produk.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageOpen className="w-6 h-6 text-black/15" strokeWidth={1.5} />
          </div>
        )}
        <span
          className={`${mono.className} absolute top-2 left-2 bg-black text-white text-[9px] tracking-[0.1em] px-2 py-1 rounded-sm`}
        >
          STOCK: {produk.stok}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <p className={`${playfair.className} text-sm font-semibold text-black leading-snug mb-1 line-clamp-1`}>
          {produk.nama.toUpperCase()}
        </p>
        <p className={`${mono.className} text-[11px] text-black/60 mb-2`}>
          IDR {produk.harga.toLocaleString("id-ID")}{" "}
          <span className="text-black/30">· SIZE: {produk.size}</span>
        </p>
        <p className="text-[11px] text-black/50 mb-1">
          {produk.toko} · <span className="italic">{produk.kota}</span>
        </p>
        <p className="text-[10px] text-red-500/80">
          {produk.kondisi}
        </p>
      </div>
    </Link>
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
        isActive
          ? "text-white font-semibold opacity-100"
          : "text-white/40 hover:text-white/70"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm tracking-wide">{label}</span>
    </Link>
  );
}
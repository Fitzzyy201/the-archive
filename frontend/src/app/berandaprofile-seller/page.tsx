"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, User, ChevronRight, Camera } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Data toko yang lagi login — nanti diganti fetch dari backend (sesuai TokoSeller)
// Masih kosong karena belum ada koneksi DB, jadi pakai fallback text
const toko = {
  namaToko: "", 
  kota: "",    
  fotoProfil: "",
};

const NAV_ITEMS = [
  { href: "/beranda-seller", icon: Home, label: "BERANDA" },
  { href: "/produk-seller", icon: Package, label: "PRODUK" },
  { href: "/pesanan-seller", icon: ShoppingBag, label: "PESANAN" },
  { href: "/berandaprofile-seller", icon: User, label: "PROFILE" },
];

export default function ProfileSeller() {
  const namaToko = toko.namaToko || "Nama Toko Belum Diatur";
  const kota = toko.kota || "Kota Belum Diatur";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} href={item.href} icon={<item.icon className="w-5 h-5" />} label={item.label} />
        ))}
      </div>

      {/* Main content */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        {/* Header */}
        <div className="px-5 sm:px-10 py-6 border-b border-black/10 bg-white">
          <p className={`${mono.className} text-[10px] tracking-[0.25em] text-black/40 mb-2`}>
            THE ARCHIVE · SELLER PANEL
          </p>
          <h1 className={`${playfair.className} text-3xl sm:text-4xl font-semibold tracking-tight text-black`}>
            Profile
          </h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-10">
          <div className="w-full md:max-w-md mx-auto">
            {/* Foto profil + nama toko + tombol ubah */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 rounded-full border border-black/15 overflow-hidden flex items-center justify-center bg-white mb-5 shadow-sm">
                {toko.fotoProfil ? (
                  <img
                    src={toko.fotoProfil}
                    alt={namaToko}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-black/20" strokeWidth={1.5} />
                )}
              </div>

              <h2 className={`${playfair.className} text-lg font-semibold text-black mb-1`}>
                {namaToko}
              </h2>
              <p className={`${mono.className} text-[10px] tracking-[0.2em] text-black/35 mb-5`}>
                {kota.toUpperCase()}
              </p>

              <Link
                href="/ubah-profil-seller"
                className="bg-black text-white text-xs font-semibold tracking-[0.15em] rounded-sm px-8 py-2.5 hover:bg-black/85 transition"
              >
                UBAH
              </Link>
            </div>

            {/* Menu list */}
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-black/40 mb-3 px-1">
                ACCOUNT
              </p>
              <div className="border border-black/10 rounded-sm bg-white overflow-hidden">
                <MenuItem href="/keuangan-seller" label="Keuangan" />
                <div className="border-t border-black/10" />
                <MenuItem href="/grafik-produk-seller" label="Grafik Produk Terjual" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-4 text-sm font-medium text-black hover:bg-black/[0.02] transition"
    >
      {label}
      <ChevronRight className="w-4 h-4 text-black/30" />
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
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingBag, User, ChevronRight, Store, AlertCircle } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type TokoInfo = {
  tokoId: number;
  namaToko: string;
  fotoToko?: string;
  noToko?: string;
  kota?: string;
  email?: string;
  statusVerif?: string;
};

export default function ProfileSeller() {
  const router = useRouter();
  const [toko, setToko] = useState<TokoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokoInfo = async () => {
      const token = localStorage.getItem("token");
      let tokoId = localStorage.getItem("tokoId");

      // Verify token exists
      if (!token) {
        setError("Sesi tidak valid. Silakan login ulang.");
        setIsLoading(false);
        return;
      }

      try {
        // Verify toko status first
        const statusRes = await fetch(`${API_BASE}/toko/status-my-shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statusRes.ok) {
          throw new Error("Gagal memverifikasi status toko");
        }

        const statusData = await statusRes.json();

        if (!statusData.tokoId) {
          setError("Toko belum terdaftar. Silakan daftar toko terlebih dahulu.");
          setIsLoading(false);
          return;
        }

        if (statusData.statusVerif !== "Approved") {
          setError("Toko belum disetujui. Akses ditolak.");
          setIsLoading(false);
          router.push("/");
          return;
        }

        tokoId = String(statusData.tokoId);
        localStorage.setItem("tokoId", tokoId);

        // Fetch full toko detail
        const res = await fetch(`${API_BASE}/toko/${tokoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil data toko");
        }

        const data = await res.json();
        setToko({
          tokoId: data.tokoId || data.id || Number(tokoId),
          namaToko: data.namaToko || "THE DIARIES STORE",
          fotoToko: data.fotoToko || "",
          noToko: data.noToko || "",
          kota: data.kota || "",
          email: data.email || "",
          statusVerif: data.statusVerif || "Approved",
        });
      } catch (err) {
        console.error("Gagal mengambil info toko:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data toko");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokoInfo();
  }, [router]);

  const handleDisabledFeature = (featureName: string) => {
    alert(`Fitur ${featureName} akan tersedia setelah Payment Gateway terintegrasi!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
        <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
          <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
          <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
          <NavItem href="/seller/pesanan" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
          <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
        </div>
        <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
          <div className="flex-1 w-full flex items-center justify-center">
            <p className={`${mono.className} text-xs tracking-widest text-black/40 animate-pulse uppercase`}>
              Memuat Informasi Toko...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !toko) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
        <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
          <NavItem href="/" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        </div>
        <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
          <div className="flex-1 w-full px-5 sm:px-10 py-16 flex items-center justify-center">
            <div className="w-full max-w-md text-center bg-red-50 border border-red-200 p-6 rounded-sm">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
              <p className="text-red-800">{error || "Data toko tidak ditemukan"}</p>
              <Link
                href="/beranda-seller"
                className="mt-4 inline-block bg-black text-white text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-sm hover:bg-black/85 transition"
              >
                KEMBALI KE DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar Navigation */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/seller/pesanan" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      {/* Main Content Area */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        {/* Header Title */}
        <div className="px-5 sm:px-10 py-6 border-b border-black/10 bg-white text-center md:text-left">
          <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-wider text-black uppercase`}>
            {toko.namaToko}
          </h1>
        </div>

        {/* Content Container */}
        <div className="flex-1 w-full px-5 sm:px-10 py-10 flex flex-col items-center justify-start">
          <div className="w-full max-w-md flex flex-col items-center">
            
            {/* Avatar Circle */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-black flex items-center justify-center bg-gray-50 overflow-hidden mb-6 shadow-sm">
              {toko.fotoToko ? (
                <img
                  src={getProductImageUrl(toko.fotoToko)}
                  alt={toko?.namaToko || "Foto Toko"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Store className="w-16 h-16 text-black/30" strokeWidth={1} />
              )}
            </div>

            {/* Nama Toko */}
            <h2 className={`${playfair.className} text-xl sm:text-2xl font-bold text-black tracking-wide text-center uppercase mb-2`}>
              {toko.namaToko}
            </h2>

            {/* Status Verifikasi */}
            <span className={`${mono.className} text-[10px] tracking-widest text-emerald-600 uppercase font-semibold mb-6 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-sm`}>
              STATUS: APPROVED
            </span>

            {/* Tombol UBAH */}
            <Link
              href="/berandaprofile-seller/edit"
              className="w-full sm:w-52 bg-black text-white text-xs font-bold tracking-[0.2em] py-3 text-center uppercase rounded-sm hover:bg-black/85 transition mb-10"
            >
              UBAH INFORMASI TOKO
            </Link>

            {/* Info Detail Toko */}
            <div className="w-full space-y-3 mb-8 border-t border-b border-black/10 py-6">
              <div className="bg-white/50 p-4 rounded-sm">
                <p className={`${mono.className} text-[10px] tracking-widest text-black/40 uppercase mb-1`}>NO. TELEPON</p>
                <p className="text-sm font-medium text-black">{toko.noToko || "-"}</p>
              </div>
              <div className="bg-white/50 p-4 rounded-sm">
                <p className={`${mono.className} text-[10px] tracking-widest text-black/40 uppercase mb-1`}>KOTA</p>
                <p className="text-sm font-medium text-black uppercase">{toko.kota || "-"}</p>
              </div>
              <div className="bg-white/50 p-4 rounded-sm">
                <p className={`${mono.className} text-[10px] tracking-widest text-black/40 uppercase mb-1`}>EMAIL</p>
                <p className="text-sm font-medium text-black">{toko.email || "-"}</p>
              </div>
            </div>

            {/* List Option Cards (Keuangan & Grafik) */}
            <div className="w-full space-y-4">
              <button
                onClick={() => handleDisabledFeature("Keuangan")}
                className="w-full border border-black p-4 flex items-center justify-between bg-white rounded-sm hover:bg-black/[0.02] transition text-left group"
              >
                <span className={`${mono.className} text-xs sm:text-sm font-bold tracking-widest text-black uppercase`}>
                  KEUANGAN
                </span>
                <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleDisabledFeature("Grafik Produk Terjual")}
                className="w-full border border-black p-4 flex items-center justify-between bg-white rounded-sm hover:bg-black/[0.02] transition text-left group"
              >
                <span className={`${mono.className} text-xs sm:text-sm font-bold tracking-widest text-black uppercase`}>
                  GRAFIK PRODUK TERJUAL
                </span>
                <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
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
        isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </Link>
  );
}
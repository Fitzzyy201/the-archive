"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  MessageCircle,
  Home,
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
  Check,
  X,
  Store,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type PendingSeller = {
  id: number;
  namaToko: string;
  kota: string;
  user: {
    id: number;
    email: string;
    noTelp: string;
  };
};

const ADMIN_NAV = [
  { href: "/admin-dashboard", icon: Home, label: "OVERVIEW" },
  { href: "/admin-verifikasi", icon: ShieldCheck, label: "VERIFIKASI" },
  { href: "/admin-users", icon: Users, label: "USERS" },
  { href: "/admin-laporan", icon: FileText, label: "LAPORAN" },
  { href: "/admin-komplain", icon: AlertTriangle, label: "KOMPLAIN" },
];

export default function AdminVerifikasiPage() {
  const [sellers, setSellers] = useState<PendingSeller[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data toko pending dari Backend
  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/admin/pending-sellers"); // Sesuaikan port backend jika beda
      if (res.ok) {
        const data = await res.json();
        setSellers(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data seller pending:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchPendingSellers();
    });
  }, []);

  const handleVerify = async (tokoId: number, namaToko: string, status: "APPROVED" | "REJECTED") => {
    const aksiText = status === "APPROVED" ? "menyetujui" : "menolak";
    
    if (!confirm(`Apakah Anda yakin ingin ${aksiText} verifikasi toko "${namaToko}"?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/admin/verify-seller/${tokoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        alert(`Toko "${namaToko}" berhasil di-${status}!`);
        // Refresh daftar seller
        setSellers((prev) => prev.filter((s) => s.id !== tokoId));
      } else {
        alert("Gagal memproses verifikasi seller.");
      }
    } catch (err) {
      console.error("Error verifikasi:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]`}>
      
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-64 md:py-8 md:gap-2 py-3 shrink-0">
        <div className="hidden md:block px-6 mb-6">
          <p className={`${mono.className} text-[10px] tracking-[0.25em] text-white/40`}>
            MANAGEMENT
          </p>
          <h2 className={`${playfair.className} text-lg font-bold text-white tracking-wider`}>
            ADMIN PORTAL
          </h2>
        </div>

        {ADMIN_NAV.map((item) => (
          <AdminNavItem
            key={item.href}
            href={item.href}
            icon={<item.icon className="w-5 h-5" />}
            label={item.label}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="order-1 md:order-2 flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 bg-white border-b border-black/10">
          <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
            VERIFIKASI TOKO SELLER
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 rounded-sm transition">
              <MessageCircle className="w-5 h-5 text-black" />
            </button>
            <Link
              href="/admin-portal"
              className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition border border-red-200 px-3 py-1.5 rounded-sm bg-red-50/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">LOGOUT</span>
            </Link>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 w-full px-6 sm:px-10 md:px-14 py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-black">Antrean Pengajuan</h2>
              <p className="text-xs text-black/50 mt-0.5">
                Tinjau berkas pendaftaran seller sebelum mengaktifkan toko.
              </p>
            </div>
            <span className={`${mono.className} text-xs bg-black text-white px-3 py-1 rounded-sm font-semibold`}>
              PENDING: {sellers.length}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-black/40">Memuat data pengajuan dari database...</div>
          ) : sellers.length === 0 ? (
            <div className="bg-white border border-dashed border-black/15 rounded-sm p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-black/20 mx-auto mb-3" />
              <p className={`${playfair.className} text-lg font-semibold text-black/70 mb-1`}>
                Tidak Ada Antrean Verifikasi
              </p>
              <p className="text-xs text-black/40">
                Semua pengajuan pendaftaran toko saat ini sudah diproses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white border border-black/10 rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black/5 border border-black/10 rounded-sm flex items-center justify-center shrink-0">
                      <Store className="w-6 h-6 text-black/70" />
                    </div>
                    <div>
                      <h3 className={`${playfair.className} text-base font-bold text-black mb-1`}>
                        {seller.namaToko}
                      </h3>
                      <p className="text-xs text-black/70 font-medium">
                        Email: <span className="text-black">{seller.user?.email || "-"}</span> | No. Telp: {seller.user?.noTelp || "-"}
                      </p>
                      <p className={`${mono.className} text-[10px] text-black/40 mt-1 uppercase`}>
                        KOTA: {seller.kota}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5">
                    <button
                      onClick={() => handleVerify(seller.id, seller.namaToko, "REJECTED")}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-sm transition"
                    >
                      <X className="w-4 h-4" /> TOLAK
                    </button>
                    <button
                      onClick={() => handleVerify(seller.id, seller.namaToko, "APPROVED")}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2.5 bg-black text-white hover:bg-black/85 text-xs font-semibold rounded-sm transition"
                    >
                      <Check className="w-4 h-4" /> SETUJUI (APPROVE)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function AdminNavItem({
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
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3.5 ${
        isActive
          ? "text-white font-semibold bg-white/10 md:border-r-2 md:border-white"
          : "text-white/40 hover:text-white/70 hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-xs tracking-wider">{label}</span>
    </Link>
  );
}
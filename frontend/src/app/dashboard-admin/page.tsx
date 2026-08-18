"use client";

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
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Data ringkasan — nanti fetch dari backend (agregasi dari Transaksi, User, dsb)
const overview = {
  systemStatus: "ACTIVE" as "ACTIVE" | "MAINTENANCE",
  platformRevenue: 0,
  totalBuyers: 0,
  totalSellers: 0,
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function AdminDashboard() {
  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b">
        <Link href="/login-admin">
          <LogOut className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          ADMIN DASHBOARD
        </h1>
        <button>
          <MessageCircle className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-8 md:flex md:justify-center">
        <div className="w-full md:max-w-xl">
          <h2 className="text-base font-bold italic text-black mb-2">Overview</h2>
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`w-2 h-2 rounded-full ${
                overview.systemStatus === "ACTIVE" ? "bg-green-600" : "bg-yellow-500"
              }`}
            />
            <span className="text-xs font-medium tracking-wide text-gray-600">
              SYSTEM STATUS: {overview.systemStatus}
            </span>
          </div>

          {/* Revenue card */}
          <div className="border border-gray-300 rounded-md p-5 mb-4">
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 mb-2">
              PLATFORM REVENUE (10% FEE)
            </p>
            <p className={`${playfair.className} text-2xl sm:text-3xl font-bold text-black`}>
              {formatRupiah(overview.platformRevenue)}
            </p>
          </div>

          {/* Buyers & Sellers */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black text-white rounded-md p-5">
              <p className="text-[11px] font-semibold tracking-wide text-white/60 mb-2">
                TOTAL BUYERS
              </p>
              <p className={`${playfair.className} text-2xl sm:text-3xl font-bold`}>
                {overview.totalBuyers.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="border border-gray-300 rounded-md p-5">
              <p className="text-[11px] font-semibold tracking-wide text-gray-500 mb-2">
                TOTAL SELLERS
              </p>
              <p className={`${playfair.className} text-2xl sm:text-3xl font-bold text-black`}>
                {overview.totalSellers.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <p className={`${mono.className} text-center text-[10px] tracking-[0.2em] text-gray-300 mb-8`}>
            THE ARCHIVE FINANCIAL PROTOCOL V.1.02
          </p>

          <button className="w-full bg-black text-white rounded-md py-3.5 font-medium tracking-wide hover:bg-gray-900 transition">
            GENERATE MONTHLY REPORT
          </button>
        </div>
      </div>

      {/* Bottom Nav khusus admin */}
      <div className="bg-black flex items-center justify-around py-3">
        <AdminNavItem href="/admin-dashboard" icon={<Home className="w-5 h-5" />} />
        <AdminNavItem href="/admin-verifikasi" icon={<ShieldCheck className="w-5 h-5" />} />
        <AdminNavItem href="/admin-users" icon={<Users className="w-5 h-5" />} />
        <AdminNavItem href="/admin-laporan" icon={<FileText className="w-5 h-5" />} />
        <AdminNavItem href="/admin-komplain" icon={<AlertTriangle className="w-5 h-5" />} />
      </div>
    </div>
  );
}

function AdminNavItem({ href, icon }: { href: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`p-2 rounded-md transition ${
        isActive ? "text-white" : "text-white/35 hover:text-white/60"
      }`}
    >
      {icon}
    </Link>
  );
}
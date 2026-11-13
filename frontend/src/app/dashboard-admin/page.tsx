"use client";

import Link from "next/link";
import { LogOut, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Data ringkasan: nanti dipasang fetch ke backend
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
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6] pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pl-64 lg:pb-0`}>
      <Navbar variant="admin" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 bg-white border-b border-black/10">
          <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
            DASHBOARD OVERVIEW
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

        {/* Dashboard Body */}
        <div className="flex-1 w-full px-6 sm:px-10 md:px-14 py-8 max-w-5xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black mb-1">System Status & Revenue</h2>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  overview.systemStatus === "ACTIVE" ? "bg-green-600" : "bg-amber-500"
                }`}
              />
              <span className={`${mono.className} text-xs font-medium tracking-wide text-black/60`}>
                SYSTEM STATUS: {overview.systemStatus}
              </span>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white border border-black/10 rounded-sm p-6 mb-6 shadow-sm">
            <p className={`${mono.className} text-[11px] font-semibold tracking-wider text-black/40 mb-2 uppercase`}>
              Platform Revenue (10% Service Fee)
            </p>
            <p className={`${playfair.className} text-3xl sm:text-4xl font-bold text-black`}>
              {formatRupiah(overview.platformRevenue)}
            </p>
          </div>

          {/* Users Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-black text-white rounded-sm p-6 shadow-sm">
              <p className={`${mono.className} text-[11px] font-semibold tracking-wider text-white/50 mb-2 uppercase`}>
                Total Registered Buyers
              </p>
              <p className={`${playfair.className} text-3xl sm:text-4xl font-bold`}>
                {overview.totalBuyers.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white border border-black/10 rounded-sm p-6 shadow-sm">
              <p className={`${mono.className} text-[11px] font-semibold tracking-wider text-black/40 mb-2 uppercase`}>
                Total Active Sellers
              </p>
              <p className={`${playfair.className} text-3xl sm:text-4xl font-bold text-black`}>
                {overview.totalSellers.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6">
            <p className={`${mono.className} text-center text-[10px] tracking-[0.2em] text-black/30 mb-6`}>
              THE ARCHIVE FINANCIAL PROTOCOL V.1.02
            </p>

            <button className={`${mono.className} w-full bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm py-4 hover:bg-black/85 transition`}>
              Generate Monthly Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

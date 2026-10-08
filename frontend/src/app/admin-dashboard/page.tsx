"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  MessageCircle,
  Home,
  ShieldCheck,
  Users,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Overview = {
  systemStatus: "ACTIVE" | "MAINTENANCE";
  platformRevenue: number;
  totalBuyers: number;
  totalSellers: number;
};

const defaultOverview: Overview = {
  systemStatus: "ACTIVE",
  platformRevenue: 0,
  totalBuyers: 0,
  totalSellers: 0,
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview>(defaultOverview);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("http://localhost:3001/admin/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setOverview({
            systemStatus: data.systemStatus ?? "ACTIVE",
            platformRevenue: data.platformRevenue ?? 0,
            totalBuyers: data.totalBuyers ?? 0,
            totalSellers: data.totalSellers ?? 0,
          });
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap pakai nilai default (0)
        console.warn("Dashboard stats belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleGenerateReport = () => {
    alert("Fitur generate laporan bulanan akan segera tersedia.");
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b">
        <Link href="/login-admin">
          <LogOut className="w-5 h-5 text-black" />
        </Link>
        <h1
          className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}
        >
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
              className={`w-2 h-2 ${
                overview.systemStatus === "ACTIVE" ? "bg-black" : "bg-yellow-500"
              }`}
            />
            <span className="text-xs font-medium tracking-wide text-gray-600">
              SYSTEM STATUS:{" "}
              <span className="font-bold text-black">{overview.systemStatus}</span>
            </span>
          </div>

          {isLoading ? (
            <p
              className={`${mono.className} text-center text-xs text-black/40 py-12 tracking-widest uppercase`}
            >
              Memuat data...
            </p>
          ) : (
            <>
              <div className="border-2 border-black rounded-sm p-5 mb-6">
                <p className="text-[10px] font-semibold tracking-wide text-gray-500 mb-3">
                  PLATFORM REVENUE (10% FEE)
                </p>
                <p className="text-lg font-bold text-black">
                  {formatRupiah(overview.platformRevenue)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-black text-white rounded-sm p-5">
                  <p className="text-[10px] font-semibold tracking-wide text-white/60 mb-3">
                    TOTAL BUYERS
                  </p>
                  <p className={`${playfair.className} text-3xl font-bold`}>
                    {overview.totalBuyers.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="border border-black rounded-sm p-5">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-500 mb-3">
                    TOTAL SELLERS
                  </p>
                  <p className={`${playfair.className} text-3xl font-bold text-black`}>
                    {overview.totalSellers.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-b border-black/10 py-4 mb-8">
            <p
              className={`${mono.className} text-center text-[9px] tracking-[0.2em] text-gray-300`}
            >
              THE ARCHIVE FINANCIAL PROTOCOL V.1.02
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            className="w-full bg-black text-white rounded-sm py-4 text-xs font-semibold tracking-[0.2em] hover:bg-gray-900 transition"
          >
            GENERATE MONTHLY REPORT
          </button>
        </div>
      </div>

      <div className="bg-black flex items-center justify-around py-3">
        <AdminNavItem href="/admin-dashboard" icon={<Home className="w-5 h-5" />} />
        <AdminNavItem href="/admin-verifikasi" icon={<ShieldCheck className="w-5 h-5" />} />
        <AdminNavItem href="/admin-users" icon={<Users className="w-5 h-5" />} />
        <AdminNavItem href="/admin-laporan" icon={<Wallet className="w-5 h-5" />} />
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
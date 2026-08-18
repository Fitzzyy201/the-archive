"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, Package, ShoppingBag, User, Bell } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });


type LogKeuangan = {
  id: number;
  jenisTransaksi: "PencairanSeller" | "FeeAdmin" | "RefundBuyer" | "WithdrawAdmin";
  nominal: number;
  waktuLog: string;
  keterangan: string; 
};


const saldoToko = 0;
const riwayat: LogKeuangan[] = [];
const notifPenarikanPending: number | null = null;

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function KeuanganSeller() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/pesanan-seller" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/profile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>

        <div className="flex items-center gap-3 px-5 sm:px-10 py-6 border-b border-black/10 bg-white">
          <Link href="/profile-seller">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <div>
            <p className={`${mono.className} text-[10px] tracking-[0.25em] text-black/40 mb-1`}>
              THE ARCHIVE · SELLER PANEL
            </p>
            <h1 className={`${playfair.className} text-xl sm:text-2xl font-semibold tracking-tight text-black`}>
              Keuangan
            </h1>
          </div>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-8">
          <div className="w-full md:max-w-lg mx-auto">
            {/* Saldo card */}
            <div className="bg-black text-white rounded-sm p-6 sm:p-8 text-center mb-6">
              <p className={`${mono.className} text-[10px] tracking-[0.25em] text-white/50 mb-3`}>
                JUMLAH SALDO
              </p>
              <p className={`${playfair.className} text-3xl sm:text-4xl font-semibold mb-6`}>
                {formatRupiah(saldoToko)}
              </p>
              <button className="w-full bg-white text-black rounded-sm py-3 text-sm font-semibold tracking-wide hover:bg-white/90 transition">
                TARIK DANA
              </button>
            </div>

            {notifPenarikanPending !== null && (
              <div className="flex items-center gap-3 border border-black/10 bg-white rounded-sm px-4 py-3 mb-8">
                <Bell className="w-4 h-4 text-black/50 shrink-0" />
                <p className="text-xs text-black/60">
                  Notif penarikan dana:{" "}
                  <span className="font-semibold text-black">
                    {formatRupiah(notifPenarikanPending)}
                  </span>{" "}
                  sedang diproses
                </p>
              </div>
            )}

          
            <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-black/10">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-black/70">
                HISTORY PEMBAYARAN
              </h2>
              <button className="text-[11px] font-medium text-black/40 hover:text-black transition">
                LIHAT SEMUA
              </button>
            </div>

            {riwayat.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15 rounded-sm">
                <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
                  Belum ada riwayat transaksi
                </p>
                <p className="text-xs text-black/40 max-w-[220px] leading-relaxed">
                  Riwayat pembayaran dan penarikan dana akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {riwayat.map((log) => (
                  <RiwayatRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiwayatRow({ log }: { log: LogKeuangan }) {
  const isKeluar = log.jenisTransaksi === "PencairanSeller" || log.jenisTransaksi === "WithdrawAdmin";

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-black/5">
      <div>
        <p className="text-sm font-medium text-black">{log.keterangan}</p>
        <p className={`${mono.className} text-[10px] text-black/35 mt-0.5`}>{log.waktuLog}</p>
      </div>
      <p className={`text-sm font-semibold ${isKeluar ? "text-red-600" : "text-black"}`}>
        {isKeluar ? "-" : "+"}
        {formatRupiah(log.nominal)}
      </p>
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
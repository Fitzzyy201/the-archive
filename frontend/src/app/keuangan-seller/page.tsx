"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Home,
  Package,
  ShoppingBag,
  User,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { Geist, Instrument_Serif } from "next/font/google";

const sans = Geist({ subsets: ["latin"] });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

type JenisTransaksi = "PencairanSeller" | "FeeAdmin" | "RefundBuyer" | "WithdrawAdmin";

// Struktur disamain sama model LogKeuangan di Prisma
type LogKeuangan = {
  id: number;
  transaksiId: number | null;
  jenisTransaksi: JenisTransaksi;
  nominal: number;
  waktuLog: string;
};

const PREVIEW_COUNT = 4;

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatWaktu(dateStr: string) {
  const d = new Date(dateStr);
  const tanggal = d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  return `${tanggal}, ${jam}`;
}

// Pencairan dana seller = uang keluar dari saldo toko
function isKeluar(log: LogKeuangan) {
  return log.jenisTransaksi === "PencairanSeller";
}

function judulLog(log: LogKeuangan) {
  return isKeluar(log)
    ? "Penarikan Dana"
    : `Penjualan #DS-${log.transaksiId ?? log.id}`;
}

export default function KeuanganSeller() {
  const [saldo, setSaldo] = useState(0);
  const [penarikanPending, setPenarikanPending] = useState<number | null>(null);
  const [riwayat, setRiwayat] = useState<LogKeuangan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchKeuangan = async () => {
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");

      if (!tokoId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/keuangan/toko/${tokoId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setSaldo(data.saldoToko ?? 0);
          setPenarikanPending(data.penarikanPending ?? null);
          setRiwayat(Array.isArray(data.riwayat) ? data.riwayat : []);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Data keuangan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeuangan();
  }, []);

  const tampil = showAll ? riwayat : riwayat.slice(0, PREVIEW_COUNT);

  return (
    <div className={`${sans.className} min-h-screen flex flex-col md:flex-row bg-[#F7F5F0] text-[#141414]`}>
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0D0D0D] px-3 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] md:sticky md:top-0 md:order-1 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-t-0 md:border-r md:border-white/10 md:px-4 md:pt-10 md:pb-8 lg:w-64 lg:px-5">
        <div className="flex items-center justify-around md:flex-1 md:flex-col md:items-stretch md:justify-start md:gap-1.5">
          <NavItem href="/beranda-seller" icon={<Home className="h-[18px] w-[18px] md:h-[19px] md:w-[19px]" strokeWidth={1.6} />} label="BERANDA" />
          <NavItem href="/produk-seller" icon={<Package className="h-[18px] w-[18px] md:h-[19px] md:w-[19px]" strokeWidth={1.6} />} label="PRODUK" />
          <NavItem href="/seller/pesanan" icon={<ShoppingBag className="h-[18px] w-[18px] md:h-[19px] md:w-[19px]" strokeWidth={1.6} />} label="PESANAN" />
          <NavItem
            href="/berandaprofile-seller"
            icon={<User className="h-[18px] w-[18px] md:h-[19px] md:w-[19px]" strokeWidth={1.6} />}
            label="PROFILE"
            active
          />
        </div>
      </div>

      {/* Main content */}
      <div className="order-1 md:order-2 flex w-full min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-black/10 bg-[#F7F5F0]">
          <div className="mx-auto flex w-full max-w-[1200px] items-center gap-4 px-5 py-5 sm:px-8 sm:py-6 lg:px-12 xl:px-16">
            <Link
              href="/berandaprofile-seller"
              aria-label="Kembali ke profil"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white/70 text-black transition-colors duration-200 hover:border-black/30 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <h1
              className={`${serif.className} text-[1.9rem] leading-none tracking-[0.04em] text-black sm:text-[2.25rem]`}
            >
              KEUANGAN
            </h1>
          </div>
        </header>

        <main className="flex-1 w-full px-5 pt-8 pb-28 sm:px-8 sm:pt-10 md:pb-14 lg:px-12 lg:pt-12 xl:px-16">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
              {/* Saldo */}
              <section aria-label="Jumlah saldo" className="lg:col-span-5">
                <div className="lg:sticky lg:top-8">
                  <div className="relative overflow-hidden rounded-sm bg-[#111111] px-6 py-7 text-white sm:px-8 sm:py-9">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full border border-white/[0.08]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-8 -right-4 h-24 w-24 rounded-full border border-white/[0.06]"
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-white/55">
                          JUMLAH SALDO
                        </p>
                        <Wallet className="h-4 w-4 text-white/35" strokeWidth={1.5} />
                      </div>

                      <p
                        className={`${serif.className} mt-7 min-w-0 text-[2rem] leading-[1.08] tracking-[0.01em] break-words text-white tabular-nums sm:text-[2.4rem] lg:text-[1.9rem] xl:text-[2.75rem]`}
                      >
                        {formatRupiah(saldo)}
                      </p>

                      <div aria-hidden className="my-7 flex items-center gap-3">
                        <span className="h-px flex-1 bg-white/15" />
                        <span className="h-1 w-1 rounded-full bg-white/25" />
                      </div>

                      <Link
                        href="/tarik-dana"
                        className="group flex w-full items-center justify-between gap-3 bg-white px-5 py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-black transition-colors duration-200 hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        TARIK DANA
                        <ArrowUpRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Riwayat */}
              <section aria-label="Riwayat pembayaran" className="min-w-0 lg:col-span-7">
                {/* Notif penarikan dana (muncul kalau ada penarikan diproses) */}
                {penarikanPending !== null && (
                  <div className="mb-7 flex items-start gap-3.5 border border-black/10 bg-white px-4 py-4 sm:items-center sm:px-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1EEE7] text-black">
                      <RefreshCw
                        className="h-4 w-4 animate-spin [animation-duration:6s]"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/50">
                        NOTIF PENARIKAN DANA
                      </p>
                      <p className="mt-1.5 text-sm leading-snug text-black/65">
                        Penarikan{" "}
                        <span className="font-medium tabular-nums text-black">
                          {formatRupiah(penarikanPending)}
                        </span>{" "}
                        sedang diproses
                      </p>
                    </div>
                    <ChevronRight
                      className="mt-1 h-4 w-4 shrink-0 text-black/25 sm:mt-0"
                      strokeWidth={1.75}
                    />
                  </div>
                )}

                {/* History pembayaran */}
                <div className="mb-1 flex flex-col items-start gap-2.5 border-b border-black/15 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <h2
                    className={`${serif.className} text-[1.5rem] leading-none tracking-[0.05em] text-black sm:text-[1.75rem]`}
                  >
                    HISTORY PEMBAYARAN
                  </h2>
                  {riwayat.length > PREVIEW_COUNT && (
                    <button
                      onClick={() => setShowAll((s) => !s)}
                      className="group inline-flex shrink-0 items-center gap-1.5 self-end pb-0.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-black/65 transition-colors duration-200 hover:text-black hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:self-auto"
                    >
                      {showAll ? "RINGKAS" : "LIHAT SEMUA"}
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          showAll ? "-rotate-90" : "group-hover:translate-x-0.5"
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <span
                      aria-hidden
                      className="h-5 w-5 animate-spin rounded-full border-2 border-black/15 border-t-black/60"
                    />
                    <p className="mt-4 text-xs tracking-[0.08em] text-black/45">
                      Memuat data...
                    </p>
                  </div>
                ) : tampil.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div>
                    {tampil.map((log) => (
                      <LogRow key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-2 flex flex-col items-center justify-center border border-dashed border-black/15 bg-white/60 px-6 py-16 text-center">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white">
        <ReceiptText className="h-5 w-5 text-black/40" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-black/75">
        Belum ada riwayat pembayaran
      </p>
      <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-black/45">
        Penjualan dan penarikan dana akan tercatat di sini.
      </p>
    </div>
  );
}

function LogRow({ log }: { log: LogKeuangan }) {
  const keluar = isKeluar(log);

  return (
    <div className="flex items-start justify-between gap-3 border-b border-black/[0.08] py-4 transition-colors duration-200 hover:bg-black/[0.02] sm:items-center sm:gap-5 sm:py-5">
      <div className="min-w-0">
        <p className="truncate text-[15px] leading-snug font-medium text-black sm:text-base">
          {judulLog(log)}
        </p>
        <p className="mt-1.5 text-xs leading-none tracking-[0.05em] text-black/45">
          {formatWaktu(log.waktuLog)}
        </p>
      </div>
      <p
        className={`shrink-0 text-right text-[15px] leading-none font-medium whitespace-nowrap tabular-nums sm:text-[17px] ${
          keluar ? "text-red-600" : "text-black"
        }`}
      >
        {keluar ? "-" : "+"}
        {formatRupiah(log.nominal)}
      </p>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const pathname = usePathname();
  const isActive = active || pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-medium tracking-[0.14em] uppercase transition-colors duration-200 md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3.5 md:py-3 md:text-[11px] md:tracking-[0.16em] ${
        isActive
          ? "text-white md:bg-white md:text-black"
          : "text-white/50 hover:text-white/85 md:hover:bg-white/[0.06]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

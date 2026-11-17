"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ReceiptText, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type JenisTransaksi = "PencairanSeller" | "FeeAdmin" | "RefundBuyer" | "WithdrawAdmin";

// Struktur disamain sama model LogKeuangan + Transaksi di Prisma
type FinanceLog = {
  id: number;
  transaksiId: number | null;
  jenisTransaksi: JenisTransaksi;
  waktuLog: string;
  totalIn: number; // Transaksi.totalHarga
  toSeller?: number; // 90% dari totalIn
  adminFee?: number; // 10% dari totalIn
};

type RekeningAdmin = {
  id?: number | string;
  bank?: string;
  namaBank?: string;
  nomorRekening?: string;
  noRekening?: string;
  atasNama?: string;
  namaPemilik?: string;
};

type RekeningItem = RekeningAdmin | string | number;

type Filter = "ALL INCOMING" | "PAYOUTS" | "ADMIN FEE";
const FILTERS: Filter[] = ["ALL INCOMING", "PAYOUTS", "ADMIN FEE"];

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatTanggal(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function matchFilter(log: FinanceLog, filter: Filter) {
  if (filter === "PAYOUTS") return log.jenisTransaksi === "PencairanSeller";
  if (filter === "ADMIN FEE") return log.jenisTransaksi === "FeeAdmin";
  return true;
}

function rekeningValue(rek: RekeningItem, index: number) {
  if (typeof rek === "string" || typeof rek === "number") return String(rek);
  return String(rek.id ?? rek.nomorRekening ?? rek.noRekening ?? index + 1);
}

function rekeningLabel(rek: RekeningItem, index: number) {
  if (typeof rek === "string" || typeof rek === "number") return String(rek);

  const bank = rek.namaBank ?? rek.bank ?? "REKENING";
  const nomor = rek.nomorRekening ?? rek.noRekening ?? `#${rek.id ?? index + 1}`;
  const pemilik = rek.namaPemilik ?? rek.atasNama;

  return [bank, nomor, pemilik].filter(Boolean).join(" · ");
}

export default function AdminFinance() {
  const [balance, setBalance] = useState(0);
  const [logs, setLogs] = useState<FinanceLog[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL INCOMING");
  const [isLoading, setIsLoading] = useState(true);
  const [rekeningList, setRekeningList] = useState<RekeningItem[]>([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchFinance = async () => {
    try {
      const res = await fetch("http://localhost:3001/admin/finance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.escrowBalance ?? 0);
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setRekeningList(
          Array.isArray(data.rekeningAdmin)
            ? data.rekeningAdmin.filter(
                (item: unknown) =>
                  typeof item === "string" ||
                  typeof item === "number" ||
                  (item !== null && typeof item === "object")
              )
            : []
        );
      }
    } catch (err) {
      // Backend belum nyala / endpoint belum ada: tetap kosong
      console.warn("Data finance belum bisa diambil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const openWithdraw = () => {
    setWithdrawAmount(balance > 0 ? String(balance) : "");
    setTransferTo(rekeningList.length > 0 ? rekeningValue(rekeningList[0], 0) : "");
    setShowWithdraw(true);
  };

  const closeWithdraw = () => {
    if (isWithdrawing) return;
    setShowWithdraw(false);
  };

  const handleConfirmWithdraw = async () => {
    if (balance <= 0) {
      alert("Saldo escrow masih kosong.");
      return;
    }

    const nominal = Number(withdrawAmount);
    if (!withdrawAmount || Number.isNaN(nominal) || nominal <= 0) {
      alert("Nominal penarikan harus lebih dari 0.");
      return;
    }
    if (nominal > balance) {
      alert("Nominal penarikan tidak boleh melebihi saldo escrow.");
      return;
    }
    if (!transferTo) {
      alert("Pilih rekening tujuan terlebih dahulu.");
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch("http://localhost:3001/admin/finance/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominal, rekeningTujuan: transferTo }),
      });
      if (res.ok) {
        alert("Penarikan dana berhasil diajukan.");
        setShowWithdraw(false);
        fetchFinance();
      } else {
        alert("Gagal menarik dana.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filtered = logs.filter((l) => matchFilter(l, filter));

  const filterIndex = FILTERS.indexOf(filter);

  return (
    <div
      className={`${inter.className} flex min-h-screen flex-col bg-[#FAF9F6] pb-[calc(4rem+env(safe-area-inset-bottom))] text-black lg:pb-0 lg:pl-64`}
    >
      <Navbar variant="admin" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:min-h-[72px] lg:px-10 xl:px-12">
          <Link
            href="/admin-dashboard"
            aria-label="Kembali ke dashboard admin"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/15 bg-white text-black transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="min-w-0 text-center">
            <p
              className={`${mono.className} text-[8px] uppercase tracking-[0.32em] text-black/40`}
            >
              The Archive
            </p>
            <h1
              className={`${playfair.className} mt-0.5 text-xl font-bold leading-none tracking-[0.08em] text-black sm:text-2xl`}
            >
              FINANCE
            </h1>
          </div>

          <span
            aria-hidden="true"
            className={`${mono.className} flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 text-[8px] font-medium uppercase tracking-[0.12em] text-black/35`}
          >
            ADM
          </span>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
          <div className="mx-auto grid w-full max-w-4xl gap-8 sm:gap-10 xl:max-w-none xl:grid-cols-12 xl:gap-12">
            {/* Escrow balance */}
            <div className="xl:col-span-5">
              <section
                aria-labelledby="escrow-heading"
                className="border-2 border-black bg-white xl:sticky xl:top-24"
              >
                <div className="p-6 sm:p-7 xl:p-8">
                  <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
                    <p
                      id="escrow-heading"
                      className={`${mono.className} flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.22em] text-black/50 sm:text-[10px]`}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 bg-black" aria-hidden="true" />
                      ADMIN ESCROW BALANCE
                    </p>
                    <span
                      className={`${mono.className} shrink-0 border border-black/15 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.18em] text-black/40`}
                    >
                      IDR
                    </span>
                  </div>

                  <p
                    className={`${playfair.className} break-words text-[clamp(1.75rem,2.6vw,2.75rem)] font-bold leading-[1.05] tracking-tight tabular-nums text-black`}
                  >
                    {formatRupiah(balance)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openWithdraw}
                  className="w-full border-t-2 border-black bg-black py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:py-5 sm:text-[11px]"
                >
                  WITHDRAW MONTHLY FUNDS
                </button>
              </section>
            </div>

            {/* Transaction logs */}
            <div className="xl:col-span-7">
              <section aria-labelledby="logs-heading">
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-black pb-3">
                  <h2
                    id="logs-heading"
                    className={`${playfair.className} text-xl font-bold leading-none tracking-tight text-black sm:text-2xl`}
                  >
                    TRANSACTION LOGS
                  </h2>
                  {!isLoading && (
                    <span
                      className={`${mono.className} shrink-0 pb-0.5 text-[9px] uppercase tracking-[0.18em] text-black/40`}
                    >
                      {filtered.length} RECORDS
                    </span>
                  )}
                </div>

                {/* Filters */}
                <div
                  role="group"
                  aria-label="Filter log transaksi"
                  className="relative mb-5 grid grid-cols-3 border border-black sm:mb-6"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-black transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
                      filterIndex === 2
                        ? "translate-x-[200%]"
                        : filterIndex === 1
                          ? "translate-x-full"
                          : "translate-x-0"
                    }`}
                  />
                  {FILTERS.map((f, index) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      aria-pressed={filter === f}
                      className={`relative z-10 whitespace-nowrap px-1 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black motion-reduce:transition-none sm:py-3.5 sm:text-[10px] sm:tracking-[0.16em] ${
                        index > 0 ? "border-l border-black/15" : ""
                      } ${filter === f ? "text-white" : "text-black/50 hover:text-black"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {isLoading ? (
                  <div
                    aria-live="polite"
                    className="flex flex-col items-center justify-center gap-3 border border-black/10 bg-white py-20"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-12 animate-pulse bg-black/30"
                    />
                    <p
                      className={`${mono.className} text-center text-[10px] uppercase tracking-[0.28em] text-black/40`}
                    >
                      Memuat data...
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filtered.map((log) => (
                      <LogCard key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Withdraw popup */}
      {showWithdraw && (
        <div
          role="presentation"
          onClick={closeWithdraw}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto overscroll-contain border-2 border-black bg-white pb-[env(safe-area-inset-bottom)] sm:max-w-md sm:pb-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-5 sm:px-6">
              <div>
                <p
                  className={`${mono.className} text-[8px] uppercase tracking-[0.3em] text-black/40`}
                >
                  The Archive / Admin
                </p>
                <h2
                  id="withdraw-title"
                  className={`${playfair.className} mt-1.5 text-xl font-bold leading-none tracking-tight text-black sm:text-2xl`}
                >
                  WITHDRAW FUNDS
                </h2>
              </div>
              <button
                type="button"
                onClick={closeWithdraw}
                disabled={isWithdrawing}
                aria-label="Tutup popup penarikan"
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-black/15 text-black transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleConfirmWithdraw();
              }}
              className="px-5 py-5 sm:px-6 sm:py-6"
            >
              <div className="mb-5">
                <label
                  htmlFor="withdraw-amount"
                  className={`${mono.className} block text-[9px] font-medium uppercase tracking-[0.2em] text-black/55`}
                >
                  WITHDRAWAL AMOUNT
                </label>
                <div className="mt-2 flex items-stretch border border-black/20 bg-white transition-colors focus-within:border-black">
                  <span
                    className={`${mono.className} flex items-center border-r border-black/10 bg-[#FAF9F6] px-3 text-[11px] text-black/50`}
                    aria-hidden="true"
                  >
                    Rp
                  </span>
                  <input
                    id="withdraw-amount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={withdrawAmount}
                    onChange={(event) =>
                      setWithdrawAmount(event.target.value.replace(/\D/g, ""))
                    }
                    disabled={isWithdrawing}
                    aria-describedby="withdraw-available"
                    placeholder="0"
                    className={`${mono.className} w-full min-w-0 bg-transparent px-3 py-3 text-sm tabular-nums text-black outline-none placeholder:text-black/30 disabled:opacity-50`}
                  />
                </div>
                <p
                  id="withdraw-available"
                  className={`${mono.className} mt-2 text-[9px] uppercase tracking-[0.1em] text-black/45`}
                >
                  Saldo tersedia: {formatRupiah(balance)}
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="withdraw-account"
                  className={`${mono.className} block text-[9px] font-medium uppercase tracking-[0.2em] text-black/55`}
                >
                  TRANSFER TO
                </label>
                <select
                  id="withdraw-account"
                  value={transferTo}
                  onChange={(event) => setTransferTo(event.target.value)}
                  disabled={rekeningList.length === 0 || isWithdrawing}
                  className={`${mono.className} mt-2 w-full border border-black/20 bg-white px-3 py-3 text-[11px] text-black outline-none transition-colors focus:border-black disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/40`}
                >
                  {rekeningList.length === 0 ? (
                    <option value="">Tidak ada rekening admin tersedia</option>
                  ) : (
                    rekeningList.map((rek, index) => (
                      <option key={`${rekeningValue(rek, index)}-${index}`} value={rekeningValue(rek, index)}>
                        {rekeningLabel(rek, index)}
                      </option>
                    ))
                  )}
                </select>
                {rekeningList.length === 0 && (
                  <p className="mt-2 text-[10px] leading-relaxed text-black/45">
                    Rekening admin belum tersedia. Penarikan tidak dapat diproses.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeWithdraw}
                  disabled={isWithdrawing}
                  className="border border-black bg-white py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="bg-black py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isWithdrawing ? "PROCESSING..." : "CONFIRM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-black/20 bg-white px-6 py-16 text-center sm:py-20">
      <span className="flex h-14 w-14 items-center justify-center border border-black/15 bg-[#FAF9F6]">
        <ReceiptText
          className="h-6 w-6 text-black/35"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
      <p
        className={`${playfair.className} mt-6 text-lg font-semibold tracking-tight text-black`}
      >
        Belum ada riwayat transaksi
      </p>
      <span className="mt-4 h-px w-10 bg-black/15" aria-hidden="true" />
      <p className="mt-4 max-w-[28ch] text-xs leading-relaxed text-black/45">
        Log keuangan akan muncul di sini setelah ada transaksi yang selesai.
      </p>
    </div>
  );
}

function LogCard({ log }: { log: FinanceLog }) {
  const toSeller = log.toSeller ?? Math.round(log.totalIn * 0.9);
  const adminFee = log.adminFee ?? Math.round(log.totalIn * 0.1);

  return (
    <article className="border border-black/15 bg-white transition-colors duration-200 hover:border-black">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-black" aria-hidden="true" />
          <p
            className={`${mono.className} truncate text-[11px] font-medium tracking-[0.06em] text-black`}
          >
            TX-{log.transaksiId ?? log.id}
          </p>
        </div>
        <p
          className={`${mono.className} shrink-0 whitespace-nowrap text-[9px] uppercase tracking-[0.12em] text-black/45`}
        >
          {formatTanggal(log.waktuLog)}
        </p>
      </div>

      <div className="px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5">
        <dl className="space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[11px] text-black/55">Total In:</dt>
            <dd
              className={`${mono.className} shrink-0 whitespace-nowrap text-[13px] tabular-nums text-black`}
            >
              {formatRupiah(log.totalIn)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[11px] text-black/45">To Seller (90%):</dt>
            <dd
              className={`${mono.className} shrink-0 whitespace-nowrap text-[13px] tabular-nums text-black/60`}
            >
              {formatRupiah(toSeller)}
            </dd>
          </div>
        </dl>

        <div className="-mx-4 -mb-4 mt-3 flex items-center justify-between gap-4 border-t border-black/10 bg-[#FAF9F6] px-4 py-3 sm:-mx-5 sm:-mb-5 sm:px-5">
          <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-black">
            <span className="h-1 w-1 bg-black" aria-hidden="true" />
            Admin Fee (10%):
          </span>
          <span
            className={`${mono.className} shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-black`}
          >
            {formatRupiah(adminFee)}
          </span>
        </div>
      </div>
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type MonthlyReport = {
  grossRevenue: number;
  completedTx: number;
  refunds: number;
  newUsers: number;
  newStores: number;
  dailyTrend: { tanggal: number; jumlah: number }[];
};

const emptyReport: MonthlyReport = {
  grossRevenue: 0,
  completedTx: 0,
  refunds: 0,
  newUsers: 0,
  newStores: 0,
  dailyTrend: [],
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function MonthlyReportPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [report, setReport] = useState<MonthlyReport>(emptyReport);
  const [isLoading, setIsLoading] = useState(true);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const periodLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(
          `http://localhost:3001/admin/monthly-report?year=${year}&month=${month + 1}`
        );

        if (res.ok) {
          const data = await res.json();

          setReport({
            grossRevenue: data.grossRevenue ?? 0,
            completedTx: data.completedTx ?? 0,
            refunds: data.refunds ?? 0,
            newUsers: data.newUsers ?? 0,
            newStores: data.newStores ?? 0,
            dailyTrend: data.dailyTrend ?? [],
          });
        } else {
          setReport(emptyReport);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap pakai nilai kosong
        console.warn("Monthly report belum bisa diambil:", err);
        setReport(emptyReport);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (isCurrentMonth) return;

    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleExport = () => {
    window.print();
  };

  const peak =
    report.dailyTrend.length > 0
      ? report.dailyTrend.reduce((a, b) => (b.jumlah > a.jumlah ? b : a))
      : null;

  const peakLabel = peak
    ? `DAILY PEAK: ${peak.tanggal} ${new Date(year, month, 1)
        .toLocaleDateString("en-US", { month: "long" })
        .toUpperCase()}`
    : "DAILY PEAK: -";

  return (
    <div
      className={`${jakarta.className} flex min-h-screen flex-col bg-white pb-[calc(4rem+env(safe-area-inset-bottom))] text-black selection:bg-black selection:text-white lg:pl-64 lg:pb-0`}
    >
      <Navbar variant="admin" />

      <header className="sticky top-0 z-30 border-b border-black/15 bg-white">
        <div className="mx-auto grid h-16 w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:h-[72px] sm:px-8 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[84rem]">
          <Link
            href="/admin-dashboard"
            className="group inline-flex items-center gap-2.5 justify-self-start rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-black/15 transition-colors duration-200 group-hover:border-black group-hover:bg-black group-hover:text-white group-focus-visible:border-black group-focus-visible:bg-black group-focus-visible:text-white">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </span>

            <span className="hidden text-[9px] font-medium uppercase tracking-[0.22em] text-black/50 transition-colors duration-200 group-hover:text-black sm:inline">
              Back
            </span>
          </Link>

          <div className="justify-self-center text-center">
            <p className="text-[7px] font-medium uppercase tracking-[0.32em] text-black/35 sm:text-[8px]">
              The Archive
            </p>

            <h1
              className={`${playfair.className} mt-0.5 text-[15px] font-bold uppercase leading-none tracking-[0.12em] text-black sm:text-base`}
            >
              Monthly Report
            </h1>
          </div>

          <button
            onClick={handleExport}
            title="Export PDF"
            aria-label="Export monthly report to PDF"
            className="group inline-flex items-center gap-2.5 justify-self-end rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            <span className="hidden text-[9px] font-medium uppercase tracking-[0.22em] text-black/50 transition-colors duration-200 group-hover:text-black sm:inline">
              Export
            </span>

            <span className="flex h-9 w-9 items-center justify-center border border-black bg-black text-white transition-colors duration-200 group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black">
              <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </button>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[84rem]">
          <section className="pt-2 sm:pt-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-medium text-black/30">
                  01
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/55">
                  Period
                </span>
              </div>

              {isCurrentMonth && (
                <span className="inline-flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-black/40">
                  <span className="h-1.5 w-1.5 bg-black" aria-hidden="true" />
                  Current
                </span>
              )}
            </div>

            <div className="flex items-end justify-between gap-3 border-b border-black pb-5 sm:gap-4">
              <h2 className="text-2xl font-semibold leading-none tracking-tight text-black sm:text-4xl lg:text-5xl">
                {periodLabel}
              </h2>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="flex h-9 w-9 items-center justify-center border border-black/15 text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <ChevronLeft
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>

                <button
                  onClick={nextMonth}
                  disabled={isCurrentMonth}
                  aria-label="Next month"
                  className="flex h-9 w-9 items-center justify-center border border-black/15 text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/20 disabled:hover:border-black/10 disabled:hover:bg-transparent disabled:hover:text-black/20"
                >
                  <ChevronRight
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </section>

          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-24"
              aria-live="polite"
            >
              <span className="h-px w-14 animate-pulse bg-black/30" />

              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-black/40">
                Memuat data...
              </p>

              <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/20">
                Preparing monthly ledger
              </p>
            </div>
          ) : (
            <>
              <section className="pt-10 sm:pt-14">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-medium text-black/30">
                      02
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/55">
                      Total Gross Revenue
                    </span>
                  </div>

                  <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/30">
                    IDR
                  </span>
                </div>

                <p className="break-words text-[clamp(2rem,9vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-black">
                  {formatRupiah(report.grossRevenue)}
                </p>

                <div className="mt-5 flex items-start justify-between gap-8 border-t border-black/10 pt-3">
                  <p className="max-w-sm text-[11px] leading-relaxed text-black/45">
                    Gross value of completed transactions recorded during the
                    selected period.
                  </p>

                  <span className="hidden shrink-0 text-right text-[8px] font-medium uppercase leading-relaxed tracking-[0.18em] text-black/30 sm:block">
                    Source
                    <br />
                    Admin Ledger
                  </span>
                </div>
              </section>

              <section className="mt-10 border-y border-black sm:mt-12">
                <div className="grid grid-cols-2">
                  <div className="py-6 pr-5 sm:py-7 sm:pr-10">
                    <div className="mb-3 flex items-baseline justify-between gap-2">
                      <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/45">
                        Completed TX
                      </p>

                      <span className="hidden text-[8px] font-medium text-black/25 sm:inline">
                        02A
                      </span>
                    </div>

                    <p className="text-3xl font-semibold leading-none tracking-tight text-black sm:text-4xl">
                      {report.completedTx.toLocaleString("id-ID")}
                    </p>

                    <p className="mt-2 text-[10px] text-black/40">
                      Successful transactions
                    </p>
                  </div>

                  <div className="border-l border-black py-6 pl-5 sm:py-7 sm:pl-10">
                    <div className="mb-3 flex items-baseline justify-between gap-2">
                      <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/45">
                        Refunds
                      </p>

                      <span className="hidden text-[8px] font-medium text-black/25 sm:inline">
                        02B
                      </span>
                    </div>

                    <p className="text-3xl font-semibold leading-none tracking-tight text-black sm:text-4xl">
                      {report.refunds.toLocaleString("id-ID")}
                    </p>

                    <p className="mt-2 text-[10px] text-black/40">
                      Refunded transactions
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-10 sm:mt-12">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-medium text-black/30">
                      03
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/55">
                      Growth
                    </span>
                  </div>

                  <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/30">
                    Acquisition
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <div className="bg-black p-5 text-white sm:p-7">
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/50">
                      New Users
                    </p>

                    <p className="mt-6 text-4xl font-semibold leading-none tracking-tight sm:mt-8 sm:text-5xl">
                      {report.newUsers.toLocaleString("id-ID")}
                    </p>

                    <p className="mt-3 text-[8px] font-medium uppercase tracking-[0.18em] text-white/30">
                      Registered
                    </p>
                  </div>

                  <div className="border-y border-r border-black p-5 sm:p-7">
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/45">
                      New Stores
                    </p>

                    <p className="mt-6 text-4xl font-semibold leading-none tracking-tight text-black sm:mt-8 sm:text-5xl">
                      {report.newStores.toLocaleString("id-ID")}
                    </p>

                    <p className="mt-3 text-[8px] font-medium uppercase tracking-[0.18em] text-black/30">
                      Onboarded
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-10 sm:mt-12">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-medium text-black/30">
                      04
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/55">
                      Transaction Trend
                    </span>
                  </div>

                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/35">
                    {peakLabel}
                  </p>
                </div>

                <TrendChart data={report.dailyTrend} />
              </section>
            </>
          )}

          <section className="mt-10 sm:mt-14">
            <button
              onClick={handleExport}
              className="group mx-auto block w-full max-w-sm bg-black py-4 text-white transition-colors duration-200 hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.28em]">
                  Export to PDF
                </span>

                <Download
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
            </button>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-4">
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/30">
                The Archive Financial Protocol V.1.02
              </p>

              <p className="hidden text-[8px] font-medium uppercase tracking-[0.2em] text-black/30 sm:block">
                Admin Copy
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function TrendChart({
  data,
}: {
  data: { tanggal: number; jumlah: number }[];
}) {
  const W = 300;
  const H = 90;

  if (data.length < 2) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 border border-black/15">
        <span className="h-px w-10 bg-black/15" />

        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/30">
          Belum ada data transaksi
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.jumlah), 1);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.jumlah / max) * (H - 20) - 10;

    return `${x},${y}`;
  });

  return (
    <div className="border border-black">
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-2 sm:px-4">
        <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/40">
          Daily Volume
        </span>

        <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/30">
          {data.length} Days
        </span>
      </div>

      <div className="px-3 pb-2 pt-5 sm:px-5 sm:pt-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-28 w-full sm:h-36"
          role="img"
          aria-label="Transaction trend chart"
        >
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={W}
              y1={H * ratio}
              y2={H * ratio}
              stroke="black"
              strokeOpacity="0.07"
              strokeWidth="0.5"
            />
          ))}

          <polyline
            points={`0,${H} ${points.join(" ")} ${W},${H}`}
            fill="black"
            fillOpacity="0.04"
            stroke="none"
          />

          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="black"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 px-3 py-2 sm:px-4">
        <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/30">
          Day {String(data[0].tanggal).padStart(2, "0")}
        </span>

        <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/30">
          Day {String(data[data.length - 1].tanggal).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  MessageSquareWarning,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Struktur disamain sama model Komplain + Transaksi + User + TokoSeller di Prisma
type KomplainItem = {
  id: number;
  transaksiId: number;
  alasanKomplain: string;
  statusKomplain: "Menunggu" | "DalamProses" | "Disetujui" | "Ditolak";
  transaksi?: {
    waktuTransaksi?: string;
    buyer?: { username?: string | null; email: string };
    toko?: { namaToko: string };
  };
};

function formatTanggal(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminKomplain() {
  const [items, setItems] = useState<KomplainItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    const fetchKomplain = async () => {
      try {
        const res = await fetch("http://localhost:3001/admin/komplain?status=pending");
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Data komplain belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKomplain();
  }, []);

  const sorted = [...items].sort((a, b) =>
    newestFirst ? b.id - a.id : a.id - b.id
  );

  return (
    <div
      className={`${jakarta.className} flex min-h-screen flex-col bg-[#FAF9F6] pb-[calc(4rem+env(safe-area-inset-bottom))] text-black lg:pb-0 lg:pl-64`}
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
            <p className="text-[8px] font-medium uppercase tracking-[0.32em] text-black/40">
              The Archive
            </p>
            <h1
              className={`${playfair.className} mt-0.5 text-xl font-bold leading-none tracking-[0.08em] text-black sm:text-2xl`}
            >
              COMPLAINTS
            </h1>
          </div>

          {/* Spacer agar judul tetap berada di tengah */}
          <span aria-hidden="true" className="h-10 w-10 shrink-0" />
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">

          {/* Sorting */}
          <div className="mb-6 flex items-center justify-end border-b border-black/15 pb-5 sm:mb-7">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
                SORT BY
              </span>

              <button
                type="button"
                onClick={() => setNewestFirst((n) => !n)}
                aria-label={`Urutkan komplain: ${newestFirst ? "terbaru" : "terlama"}`}
                className="group inline-flex min-h-10 items-center gap-3 border border-black bg-white px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black transition-all duration-200 hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:scale-[0.98]"
              >
                <span>
                  {newestFirst ? "Newest First" : "Oldest First"}
                </span>

                <span className="flex h-5 w-5 items-center justify-center border border-black/15 transition-colors group-hover:border-white/30">
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-300 ${
                      newestFirst ? "" : "rotate-180"
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>
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
              <p className="text-center text-[10px] font-medium uppercase tracking-[0.28em] text-black/40">
                Memuat data...
              </p>
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
              {sorted.map((k) => (
                <KomplainCard key={k.id} komplain={k} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-black/20 bg-white px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center border border-black/15 bg-[#FAF9F6]">
        <MessageSquareWarning
          className="h-6 w-6 text-black/35"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>

      <p className="mt-6 text-lg font-semibold tracking-tight text-black">
        Belum ada komplain
      </p>

      <span className="mt-4 h-px w-10 bg-black/15" aria-hidden="true" />

      <p className="mt-4 max-w-[28ch] text-xs leading-relaxed text-black/45">
        Komplain dari buyer yang menunggu keputusan akan muncul di sini.
      </p>
    </div>
  );
}

function KomplainCard({ komplain }: { komplain: KomplainItem }) {
  const buyerName =
    komplain.transaksi?.buyer?.username
      ? `@${komplain.transaksi.buyer.username}`
      : komplain.transaksi?.buyer?.email ?? "-";

  return (
    <article className="flex h-full flex-col border border-black/15 bg-white transition-colors duration-200 hover:border-black">
      <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-[#FAF9F6] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/40">
            ORDER ID
          </p>

          <p className="mt-1 truncate text-base font-bold tracking-tight text-black sm:text-lg">
            #ORD-{komplain.transaksiId}
          </p>
        </div>

        <p className="shrink-0 whitespace-nowrap pt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-black/45">
          {formatTanggal(komplain.transaksi?.waktuTransaksi)}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-[8px] font-semibold uppercase tracking-[0.18em] text-black/40">
              Buyer
            </dt>
            <dd className="mt-1 break-words text-[13px] font-medium leading-snug text-black">
              {buyerName}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-[8px] font-semibold uppercase tracking-[0.18em] text-black/40">
              Seller
            </dt>
            <dd className="mt-1 break-words text-[13px] font-medium leading-snug text-black">
              {komplain.transaksi?.toko?.namaToko ?? "-"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-l-2 border-black bg-[#FAF9F6] px-4 py-3.5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-black/40">
            Issue
          </p>

          <p className="mt-1.5 whitespace-pre-line break-words text-[13px] leading-relaxed text-black/80">
            {komplain.alasanKomplain}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <Link
            href={`/admin-komplain/${komplain.id}`}
            className="flex w-full items-center justify-center bg-black px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black"
          >
            REVIEW COMPLAINT
          </Link>
        </div>
      </div>
    </article>
  );
}

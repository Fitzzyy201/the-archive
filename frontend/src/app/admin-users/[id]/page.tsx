"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Struktur disamain sama model User + AlamatPengiriman di Prisma
type Alamat = {
  kotaPenerima: string;
  alamatLengkap: string;
  catatanKurir: string | null;
};

type BuyerDetail = {
  id: number;
  nama: string | null;
  email: string;
  noTelp: string;
  statusAkun: "Aktif" | "Suspend";
  alamat?: Alamat | null;
  alamatPengiriman?: Alamat[]; // kalau backend ngembaliin relasi sebagai array
  createdAt?: string; // belum ada di schema User
};

function formatJoined(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr)
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
}

export default function BuyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buyerId = params.id as string;

  const [buyer, setBuyer] = useState<BuyerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/admin/users/${buyerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setBuyer(await res.json());
        }
      } catch (err) {
        console.warn("Detail buyer belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyer();
  }, [buyerId]);

  const handleSuspend = async () => {
    if (!buyer) return;
    if (!confirm("Suspend akun ini?")) return;

    setIsSuspending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/admin/users/${buyerId}/suspend`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setBuyer({ ...buyer, statusAkun: "Suspend" });
      } else {
        alert("Gagal suspend akun.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsSuspending(false);
    }
  };

  const alamat = buyer?.alamat ?? buyer?.alamatPengiriman?.[0] ?? null;

  return (
    <div
      className={`${inter.className} min-h-screen flex flex-col bg-white pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pl-64 lg:pb-0`}
    >
      <Navbar variant="admin" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali"
            className="flex h-9 w-9 items-center justify-center border border-black/15 text-black transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <p
            className={`${mono.className} text-[9px] uppercase tracking-[0.32em] text-black/45`}
          >
            THE ARCHIVE
          </p>

          <span className="h-9 w-9" aria-hidden="true" />
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-10">
          <section className="border-b border-black pb-6 sm:pb-8">
            <h1
              className={`${playfair.className} text-3xl font-bold leading-none tracking-tight text-black sm:text-4xl lg:text-5xl`}
            >
              BUYER DETAILS
            </h1>
          </section>

          <div className="pt-6 sm:pt-8">
            {isLoading ? (
              <div
                className="flex flex-col items-center justify-center gap-3 border border-black/10 py-20"
                aria-live="polite"
              >
                <span
                  className="h-px w-12 animate-pulse bg-black/30"
                  aria-hidden="true"
                />
                <p
                  className={`${mono.className} text-center text-[10px] uppercase tracking-[0.28em] text-black/40`}
                >
                  Memuat data...
                </p>
              </div>
            ) : !buyer ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-black/20 bg-[#FAF9F6] px-6 py-20 text-center">
                <span className="flex h-14 w-14 items-center justify-center border border-black/15 bg-white">
                  <UserX
                    className="h-6 w-6 text-black/35"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <p
                  className={`${playfair.className} mt-6 text-lg font-semibold tracking-tight text-black`}
                >
                  Data buyer tidak ditemukan
                </p>
                <span className="mt-4 h-px w-10 bg-black/15" aria-hidden="true" />
                <p className="mt-4 max-w-[26ch] text-xs leading-relaxed text-black/45">
                  Buyer dengan ID {buyerId} belum tersedia.
                </p>
              </div>
            ) : (
              <>
                <div className="border border-black/15 bg-white">
                  <DetailRow label="NAME" value={buyer.nama || "-"} bold />
                  <DetailRow label="EMAIL" value={buyer.email} />
                  <DetailRow label="PHONE" value={buyer.noTelp || "-"} />
                  <DetailRow label="CITY" value={alamat?.kotaPenerima || "-"} />
                  <DetailRow
                    label="FULL ADDRESS"
                    value={alamat?.alamatLengkap || "-"}
                  />
                  <DetailRow label="NOTES" value={alamat?.catatanKurir || "-"} />
                  <DetailRow
                    label="JOINED"
                    value={formatJoined(buyer.createdAt)}
                    last
                  />
                </div>

                <div className="mt-6 flex sm:justify-end">
                  <button
                    type="button"
                    onClick={handleSuspend}
                    disabled={buyer.statusAkun === "Suspend" || isSuspending}
                    className="w-full bg-black px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[11rem]"
                  >
                    {buyer.statusAkun === "Suspend"
                      ? "ACCOUNT SUSPENDED"
                      : isSuspending
                        ? "PROCESSING..."
                        : "SUSPEND ACCOUNT"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold = false,
  last = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-1.5 px-5 py-4 sm:grid-cols-[8.5rem_1fr] sm:items-baseline sm:gap-6 sm:px-7 ${
        last ? "" : "border-b border-black/10"
      }`}
    >
      <p
        className={`${mono.className} pt-0.5 text-[9px] uppercase tracking-[0.18em] text-black/40`}
      >
        {label}
      </p>
      <p
        className={`break-words text-sm leading-relaxed text-black [overflow-wrap:anywhere] ${
          bold ? "text-base font-semibold tracking-tight" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
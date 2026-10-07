"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type BuyerDetail = {
  id: number;
  nama: string | null;
  email: string;
  noTelp: string;
  statusAkun: "Aktif" | "Suspend";
  alamat?: {
    kotaPenerima: string;
    alamatLengkap: string;
    catatanKurir: string | null;
  };
  createdAt?: string;
};

function formatJoined(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d
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
        const res = await fetch(`http://localhost:3001/admin/users/${buyerId}`);
        if (res.ok) {
          const data = await res.json();
          setBuyer(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data buyer:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyer();
  }, [buyerId]);

  const handleSuspend = async () => {
    if (!buyer) return;
    setIsSuspending(true);

    try {
      const res = await fetch(
        `http://localhost:3001/admin/users/${buyerId}/suspend`,
        { method: "PATCH" }
      );
      if (res.ok) {
        setBuyer({ ...buyer, statusAkun: "Suspend" });
      } else {
        alert("Gagal suspend akun.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server.");
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          THE ARCHIVE
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-6">
          <h2 className="text-center text-sm font-bold tracking-wide text-black mb-6">
            BUYER DETAILS
          </h2>

          {isLoading ? (
            <p className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}>
              Memuat data...
            </p>
          ) : !buyer ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm">
              <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                Data buyer tidak ditemukan
              </p>
              <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                Buyer dengan ID {buyerId} belum tersedia.
              </p>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
                <DetailRow label="NAME" value={buyer.nama || "-"} />
                <DetailRow label="EMAIL" value={buyer.email} />
                <DetailRow label="PHONE" value={buyer.noTelp || "-"} />
                <DetailRow label="CITY" value={buyer.alamat?.kotaPenerima || "-"} />
                <DetailRow label="FULL ADDRESS" value={buyer.alamat?.alamatLengkap || "-"} />
                <DetailRow label="NOTES" value={buyer.alamat?.catatanKurir || "-"} />
                <DetailRow label="JOINED" value={formatJoined(buyer.createdAt)} />
              </div>

              <button
                onClick={handleSuspend}
                disabled={buyer.statusAkun === "Suspend" || isSuspending}
                className="w-full bg-black text-white rounded-md py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-900 transition disabled:opacity-40 mt-6"
              >
                {buyer.statusAkun === "Suspend"
                  ? "AKUN SUDAH DI-SUSPEND"
                  : isSuspending
                    ? "MEMPROSES..."
                    : "SUSPEND ACCOUNT"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[10px] font-semibold tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-black leading-relaxed">{value}</p>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, IdCard, FileUser } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Struktur disamain sama model User + TokoSeller di Prisma
type SellerDetail = {
  id: number; // id user
  nama: string | null;
  email: string;
  noTelp: string;
  statusAkun: "Aktif" | "Suspend";
  toko?: {
    namaToko: string;
    kota: string;
    noTelp: string | null;
    noRekening: string;
    fotoKtp: string | null;
    fotoSkck: string | null;
  } | null;
};

function isImageSrc(src: string | null | undefined) {
  return (
    !!src &&
    (src.startsWith("data:image") ||
      src.startsWith("http://") ||
      src.startsWith("https://"))
  );
}

export default function StoreDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alasan, setAlasan] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch(`http://localhost:3001/admin/users/${sellerId}`);
        if (res.ok) {
          setSeller(await res.json());
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Detail toko belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeller();
  }, [sellerId]);

  const handleSuspend = async () => {
    if (!seller) return;
    if (!confirm("Suspend akun seller ini?")) return;

    setIsSuspending(true);
    try {
      const res = await fetch(
        `http://localhost:3001/admin/users/${sellerId}/suspend`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alasan }),
        }
      );
      if (res.ok) {
        setSeller({ ...seller, statusAkun: "Suspend" });
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

  const sudahSuspend = seller?.statusAkun === "Suspend";

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#F9F9F9]`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 sm:px-8 py-5 border-b border-black">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>
        <h1
          className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-wide text-black`}
        >
          STORE DETAILS
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-8">
          {isLoading ? (
            <p
              className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
            >
              Memuat data...
            </p>
          ) : !seller ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                Data toko tidak ditemukan
              </p>
              <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">
                Seller dengan ID {sellerId} belum tersedia.
              </p>
            </div>
          ) : (
            <>
              {/* Info toko */}
              <div className="border border-black px-5 py-2 mb-8">
                <InfoRow label="SHOP NAME" value={seller.toko?.namaToko || "-"} />
                <InfoRow label="EMAIL" value={seller.email} />
                <InfoRow label="CITY" value={seller.toko?.kota || "-"} />
                <InfoRow label="PHONE" value={seller.toko?.noTelp || seller.noTelp || "-"} />
                <InfoRow label="BANK ACCOUNT" value={seller.toko?.noRekening || "-"} />
                {/* NIK & NPWP belum ada di schema TokoSeller, jadi tampil "-" */}
                <InfoRow label="NIK" value="-" />
                <InfoRow label="NPWP ID" value="-" last />
              </div>

              {/* Dokumen */}
              <p className="text-[11px] tracking-[0.15em] text-black mb-4">
                UPLOADED DOCUMENTS
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <DocBox
                  label="KTP IMAGE"
                  src={seller.toko?.fotoKtp}
                  icon={<IdCard className="w-7 h-7 text-gray-500" strokeWidth={1.5} />}
                />
                <DocBox
                  label="SKCK IMAGE"
                  src={seller.toko?.fotoSkck}
                  icon={<FileUser className="w-7 h-7 text-gray-500" strokeWidth={1.5} />}
                />
              </div>

              {/* Alasan */}
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={4}
                disabled={sudahSuspend}
                placeholder="Rejection reason (Required if rejecting)..."
                className="w-full border border-black bg-transparent px-4 py-4 text-sm text-black placeholder:text-gray-500 focus:outline-none resize-none mb-6 disabled:opacity-50"
              />

              <button
                onClick={handleSuspend}
                disabled={sudahSuspend || isSuspending}
                className="w-full bg-black text-white py-4 text-sm font-semibold tracking-[0.2em] hover:bg-gray-900 transition disabled:opacity-40"
              >
                {sudahSuspend
                  ? "ACCOUNT SUSPENDED"
                  : isSuspending
                    ? "PROCESSING..."
                    : "SUSPEND ACCOUNT"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        last ? "" : "border-b border-black/10"
      }`}
    >
      <span className="text-[11px] tracking-[0.12em] text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-black text-right break-all">{value}</span>
    </div>
  );
}

function DocBox({
  label,
  src,
  icon,
}: {
  label: string;
  src?: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-black aspect-[3/4] flex flex-col items-center justify-center overflow-hidden bg-[#F3F3F3]">
      {isImageSrc(src) ? (
        <img src={src as string} alt={label} className="w-full h-full object-cover" />
      ) : (
        <>
          {icon}
          <p className="text-[11px] tracking-[0.15em] text-gray-600 mt-4">{label}</p>
        </>
      )}
    </div>
  );
}
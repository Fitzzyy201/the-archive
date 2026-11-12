"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, IdCard, FileUser } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type StoreDetail = {
  id: number;
  namaToko: string;
  kota: string;
  noTelp: string | null;
  noRekening: string;
  fotoKtp: string | null;
  fotoSkck: string | null;
  statusVerif: "Pending" | "Approved" | "Rejected";
  user?: { email: string };
  email?: string;
};

function isImageSrc(src: string | null) {
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
  const tokoId = params.id as string;

  const [store, setStore] = useState<StoreDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alasan, setAlasan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch("http://localhost:3001/admin/pending-sellers");
        if (res.ok) {
          const data: StoreDetail[] = await res.json();
          const found = Array.isArray(data)
            ? data.find((s) => String(s.id) === tokoId)
            : null;
          setStore(found ?? null);
        }
      } catch (err) {
        console.warn("Detail toko belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [tokoId]);

  const submitVerifikasi = async (status: "Approved" | "Rejected") => {
    if (status === "Rejected" && !alasan.trim()) {
      alert("Alasan penolakan wajib diisi kalau menolak toko.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/toko/verifikasi/${tokoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "Rejected" ? { alasanPenolakan: alasan } : {}),
        }),
      });

      if (res.ok) {
        router.push("/admin-verifikasi");
      } else {
        alert("Gagal memproses verifikasi toko.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const email = store?.user?.email ?? store?.email ?? "-";

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1
          className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-wide text-black`}
        >
          STORE DETAILS
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-6">
          {isLoading ? (
            <p
              className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
            >
              Memuat data...
            </p>
          ) : !store ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                Data toko tidak ditemukan
              </p>
              <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">
                Toko dengan ID {tokoId} belum tersedia atau sudah diverifikasi.
              </p>
            </div>
          ) : (
            <>
              <div className="border border-black mb-6">
                <InfoRow label="SHOP NAME" value={store.namaToko} />
                <InfoRow label="EMAIL" value={email} />
                <InfoRow label="CITY" value={store.kota} />
                <InfoRow label="PHONE" value={store.noTelp || "-"} />
                <InfoRow label="BANK ACCOUNT" value={store.noRekening || "-"} />
                <InfoRow label="NIK" value="-" />
                <InfoRow label="NPWP ID" value="-" last />
              </div>

              <p className="text-[10px] font-semibold tracking-wide text-black mb-3">
                UPLOADED DOCUMENTS
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <DocBox
                  label="KTP IMAGE"
                  src={store.fotoKtp}
                  icon={<IdCard className="w-6 h-6 text-gray-500" strokeWidth={1.5} />}
                />
                <DocBox
                  label="SKCK IMAGE"
                  src={store.fotoSkck}
                  icon={<FileUser className="w-6 h-6 text-gray-500" strokeWidth={1.5} />}
                />
              </div>

              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={3}
                placeholder="Rejection reason (Required if rejecting)..."
                className="w-full border border-black px-3 py-3 text-xs text-black placeholder:text-gray-400 focus:outline-none resize-none mb-4"
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => submitVerifikasi("Rejected")}
                  disabled={isSubmitting}
                  className="border border-black py-4 text-[11px] font-semibold tracking-[0.2em] text-black hover:bg-gray-50 transition disabled:opacity-40"
                >
                  REJECT
                </button>
                <button
                  onClick={() => submitVerifikasi("Approved")}
                  disabled={isSubmitting}
                  className="bg-black text-white py-4 text-[11px] font-semibold tracking-[0.2em] hover:bg-gray-900 transition disabled:opacity-40"
                >
                  APPROVE
                </button>
              </div>
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
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
        last ? "" : "border-b border-black/10"
      }`}
    >
      <span className="text-[10px] tracking-wide text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-black text-right break-all">
        {value}
      </span>
    </div>
  );
}

function DocBox({
  label,
  src,
  icon,
}: {
  label: string;
  src: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-black aspect-[3/4] flex flex-col items-center justify-center overflow-hidden bg-gray-50">
      {isImageSrc(src) ? (
        <img src={src as string} alt={label} className="w-full h-full object-cover" />
      ) : (
        <>
          {icon}
          <p className="text-[10px] tracking-wide text-gray-500 mt-3">{label}</p>
        </>
      )}
    </div>
  );
}
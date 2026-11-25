"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Video,
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

// Struktur disamain sama model Komplain + Transaksi + User + AlamatPengiriman di Prisma
type KomplainDetail = {
  id: number;
  transaksiId: number;
  alasanKomplain: string;
  fotoVideoBukti: string;
  statusKomplain: "Menunggu" | "DalamProses" | "Disetujui" | "Ditolak";
  keputusanAdmin: string | null;
  transaksi?: {
    buyer?: {
      username?: string | null;
      email: string;
      noTelp?: string;
      alamatPengiriman?: {
        namaPenerima: string;
        kotaPenerima: string;
        alamatLengkap: string;
      }[];
    };
    toko?: { namaToko: string };
  };
};

function isVideo(src: string) {
  return src.startsWith("data:video") || /\.(mp4|mov|webm)$/i.test(src);
}

function isRenderable(src: string) {
  return (
    src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")
  );
}

export default function ComplaintResolution() {
  const params = useParams();
  const router = useRouter();
  const komplainId = params.id as string;

  const [komplain, setKomplain] = useState<KomplainDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/admin/komplain/${komplainId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setKomplain(await res.json());
        }
      } catch (err) {
        console.warn("Detail komplain belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [komplainId]);

  const submitKeputusan = async (status: "Disetujui" | "Ditolak") => {
    const pesan =
      status === "Disetujui"
        ? "Setujui komplain dan refund dana ke buyer?"
        : "Tolak komplain dan teruskan pembayaran ke seller?";
    if (!confirm(pesan)) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/admin/komplain/${komplainId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          statusKomplain: status,
          keputusanAdmin:
            status === "Disetujui"
              ? "Komplain disetujui, dana di-refund ke buyer."
              : "Komplain ditolak, pembayaran diteruskan ke seller.",
        }),
      });

      if (res.ok) {
        router.push("/admin-komplain");
      } else {
        alert("Gagal memproses keputusan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buyer = komplain?.transaksi?.buyer;
  const alamat = buyer?.alamatPengiriman?.[0];
  const buyerName = buyer?.username ? `@${buyer.username}` : buyer?.email ?? "-";
  const sudahDiputuskan =
    komplain?.statusKomplain === "Disetujui" || komplain?.statusKomplain === "Ditolak";

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <Link href="/admin-komplain">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1
          className={`${playfair.className} flex-1 text-center text-xl font-bold tracking-wide text-black leading-tight pr-5`}
        >
          COMPLAINT
          <br />
          RESOLUTION
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
          ) : !komplain ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                Data komplain tidak ditemukan
              </p>
              <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                Komplain dengan ID {komplainId} belum tersedia.
              </p>
            </div>
          ) : (
            <>
              {/* Order info */}
              <div className="border border-black p-4 mb-6">
                <p className={`${playfair.className} text-base font-bold text-black mb-3`}>
                  ORDER ID: #ORD-{komplain.transaksiId}
                </p>
                <p className="text-xs text-gray-500 mb-1">BUYER: {buyerName}</p>
                <p className="text-xs text-gray-500">
                  SELLER: {komplain.transaksi?.toko?.namaToko ?? "-"}
                </p>
              </div>

              {/* Delivery address */}
              <h2 className={`${playfair.className} text-sm font-bold text-black mb-3`}>
                DELIVERY ADDRESS
              </h2>
              <div className="bg-gray-100 border border-black/10 p-4 text-xs text-gray-600 leading-relaxed mb-6">
                {alamat ? (
                  <>
                    <p>
                      {alamat.namaPenerima}
                      {buyer?.noTelp ? ` (${buyer.noTelp})` : ""}
                    </p>
                    <p>{alamat.alamatLengkap}</p>
                    <p>{alamat.kotaPenerima}</p>
                  </>
                ) : (
                  <p>Alamat pengiriman tidak tersedia.</p>
                )}
              </div>

              {/* Complaint & evidence */}
              <h2 className={`${playfair.className} text-sm font-bold text-black mb-3`}>
                BUYER COMPLAINT &amp; EVIDENCE
              </h2>
              <p className="border-l-4 border-black border border-black/20 px-4 py-4 text-xs italic text-black leading-relaxed mb-4">
                &ldquo;Reason: {komplain.alasanKomplain}&rdquo;
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <EvidenceBox label="PHOTO BUKTI 1" src={komplain.fotoVideoBukti} type="photo" />
                <EvidenceBox label="VIDEO BUKTI 2" src={komplain.fotoVideoBukti} type="video" />
              </div>

              <p
                className={`${mono.className} border border-dashed border-gray-300 px-3 py-3 text-[9px] text-gray-500 leading-relaxed mb-6`}
              >
                SYSTEM NOTE: APPROVING THIS COMPLAINT WILL REFUND THE BUYER (MINUS 10%
                SYSTEM FEE). REJECTING WILL FORWARD FULL PAYMENT TO THE SELLER.
              </p>

              {sudahDiputuskan ? (
                <p className="text-center border border-black py-4 text-[11px] font-semibold tracking-[0.2em] text-black">
                  SUDAH DIPUTUSKAN: {komplain.statusKomplain.toUpperCase()}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => submitKeputusan("Ditolak")}
                    disabled={isSubmitting}
                    className="border border-black px-2 py-3.5 text-[10px] font-semibold tracking-wide text-black leading-snug hover:bg-gray-50 transition disabled:opacity-40"
                  >
                    REJECT (PAY
                    <br />
                    SELLER)
                  </button>
                  <button
                    onClick={() => submitKeputusan("Disetujui")}
                    disabled={isSubmitting}
                    className="bg-black text-white px-2 py-3.5 text-[10px] font-semibold tracking-wide leading-snug hover:bg-gray-900 transition disabled:opacity-40"
                  >
                    APPROVE
                    <br />
                    (REFUND)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav khusus admin */}
      <div className="bg-black flex items-center justify-around py-3">
        <AdminNavItem href="/admin-dashboard" icon={<Home className="w-5 h-5" />} />
        <AdminNavItem href="/admin-verifikasi" icon={<ShieldCheck className="w-5 h-5" />} />
        <AdminNavItem href="/admin-users" icon={<Users className="w-5 h-5" />} />
        <AdminNavItem href="/admin-finance" icon={<Wallet className="w-5 h-5" />} />
        <AdminNavItem href="/admin-komplain" icon={<AlertTriangle className="w-5 h-5" />} />
      </div>
    </div>
  );
}

function EvidenceBox({
  label,
  src,
  type,
}: {
  label: string;
  src: string;
  type: "photo" | "video";
}) {
  const matches = src && isRenderable(src) && (type === "video" ? isVideo(src) : !isVideo(src));

  return (
    <div>
      <div className="border border-black aspect-square flex items-center justify-center overflow-hidden bg-gray-50 mb-2">
        {matches ? (
          type === "video" ? (
            <video src={src} controls className="w-full h-full object-cover" />
          ) : (
            <img src={src} alt={label} className="w-full h-full object-cover" />
          )
        ) : (
          <Video className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        )}
      </div>
      <p className="text-[9px] tracking-wide text-black text-center">{label}</p>
    </div>
  );
}

function AdminNavItem({ href, icon }: { href: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

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
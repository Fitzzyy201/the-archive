"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type StatusPesanan =
  | "BelumBayar"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dikomplain"
  | "Batal";

// Struktur disamain sama model Transaksi + User + AlamatPengiriman di Prisma
type ItemProduk = {
  namaProduk: string;
  ukuranDimensi: string;
  qty: number;
  harga: number;
  fotoProduk: string;
};

type DetailPesanan = {
  id: number;
  statusPesanan: StatusPesanan;
  waktuTransaksi: string;
  sisaWaktuProses?: string; // dihitung backend dari batasWaktuTransaksi
  totalHarga: number;
  subtotal?: number;
  ongkir?: number;
  adminFeePercent?: number;
  buyer?: { nama?: string | null; username?: string | null; email?: string };
  alamat?: { namaPenerima: string; kotaPenerima: string; alamatLengkap: string };
  items?: ItemProduk[];
};

const STATUS_LABEL: Record<StatusPesanan, string> = {
  BelumBayar: "BELUM BAYAR",
  Diproses: "PERLU DIKIRIM",
  Dikirim: "DIKIRIM",
  Selesai: "SELESAI",
  Dikomplain: "DIKOMPLAIN",
  Batal: "DIBATALKAN",
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function isRenderable(src?: string) {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:image"))
  );
}

function formatTanggal(dateStr: string) {
  const d = new Date(dateStr);
  const tanggal = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  return { tanggal, jam: `${jam} WIB` };
}

function DetailPesananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pesananId = searchParams.get("id");

  const [data, setData] = useState<DetailPesanan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!pesananId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/transaksi/${pesananId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Detail pesanan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [pesananId]);

  const handleAksi = async (aksi: "terima" | "tolak") => {
    const pesan =
      aksi === "terima" ? "Terima pesanan ini?" : "Tolak pesanan ini?";
    if (!confirm(pesan)) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/transaksi/${pesananId}/${aksi}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        // Pesanan diterima lanjut ke input resi, ditolak balik ke daftar pesanan
        router.push(aksi === "terima" ? `/resi-pesanan?id=${pesananId}` : "/pesanan-seller");
      } else {
        alert("Gagal memproses pesanan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsProcessing(false);
    }
  };

  const buyerName = data?.buyer?.nama || data?.buyer?.username || data?.buyer?.email?.split("@")[0] || "-";
  const waktu = data ? formatTanggal(data.waktuTransaksi) : null;
  const bisaDiputuskan = data?.statusPesanan === "Diproses";

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6]`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 sm:px-8 py-5 border-b border-black">
        <Link href="/pesanan-seller">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-2xl font-bold tracking-wide text-black`}>
          DETAIL PESANAN
        </h1>
      </div>

      <div className="flex-1 w-full px-5 sm:px-8 py-5">
        <div className="w-full md:max-w-xl md:mx-auto pb-8">
          {isLoading ? (
            <p
              className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
            >
              Memuat detail pesanan...
            </p>
          ) : !data ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15 mt-4">
              <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
                Data pesanan tidak ditemukan
              </p>
              <p className="text-xs text-black/40 max-w-[240px] leading-relaxed">
                {pesananId
                  ? `Pesanan dengan ID ${pesananId} belum tersedia.`
                  : "Buka halaman ini lewat tombol DETAIL di daftar pesanan."}
              </p>
            </div>
          ) : (
            <>
              {/* Status */}
              <div className="flex items-center justify-between pb-2 border-b border-black">
                <p className="text-[11px] tracking-[0.15em] text-black/60">CURRENT STATUS</p>
                <p className="text-[11px] font-bold tracking-[0.15em] text-black">
                  {STATUS_LABEL[data.statusPesanan]}
                </p>
              </div>
              <p className="text-[11px] italic text-black/35 pt-2 pb-5">
                Estimated processing time remaining: {data.sisaWaktuProses ?? "-"}
              </p>

              {/* Buyer & ordered on */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[11px] tracking-[0.15em] text-black/60 pb-2 mb-3 border-b border-black/10">
                    BUYER
                  </p>
                  <p className="text-base font-bold text-black">{buyerName}</p>
                  {data.buyer?.username && (
                    <p className="text-sm text-black/50 mt-3">@{data.buyer.username}</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.15em] text-black/60 pb-2 mb-3 border-b border-black/10">
                    ORDERED ON
                  </p>
                  <p className="text-sm text-black">{waktu?.tanggal}</p>
                  <p className="text-sm text-black mt-2">{waktu?.jam}</p>
                </div>
              </div>

              {/* Product list */}
              <p className="text-[11px] tracking-[0.15em] text-black/60 pb-2 border-b border-black mb-4">
                PRODUCT LIST
              </p>
              <div className="mb-6">
                {(data.items ?? []).length === 0 ? (
                  <p className="text-xs text-black/40 py-4">Detail produk belum tersedia.</p>
                ) : (
                  (data.items ?? []).map((item, i) => (
                    <div key={i} className="flex gap-4 py-4 border-b border-black/10 last:border-b-0">
                      <div className="w-20 h-24 border border-black bg-white overflow-hidden shrink-0 flex items-center justify-center">
                        {isRenderable(item.fotoProduk) ? (
                          <img
                            src={item.fotoProduk}
                            alt={item.namaProduk}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3
                            className={`${playfair.className} text-base font-bold uppercase text-black leading-tight`}
                          >
                            {item.namaProduk}
                          </h3>
                          <p className="text-[10px] tracking-wide text-black/45 mt-1.5">
                            SIZE: {item.ukuranDimensi}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-black">
                          <span>Qty: {item.qty}</span>
                          <span className="font-bold">{formatRupiah(item.harga)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Shipping address */}
              <p className="text-[11px] tracking-[0.15em] text-black/60 pb-2 border-b border-black/10 mb-4">
                SHIPPING ADDRESS
              </p>
              <p className="text-sm text-black leading-relaxed mb-6">
                {data.alamat
                  ? `${data.alamat.namaPenerima}, ${data.alamat.alamatLengkap}, ${data.alamat.kotaPenerima}`
                  : "Alamat pengiriman belum tersedia."}
              </p>

              {/* Breakdown biaya */}
              <div className="border border-black p-5 mb-6">
                <div className="space-y-3 text-sm text-black/80 pb-4 border-b border-black">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatRupiah(data.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{formatRupiah(data.ongkir ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Fee</span>
                    <span>{data.adminFeePercent ?? 10}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-[11px] font-bold tracking-[0.15em] text-black">
                    TOTAL PAYMENT
                  </span>
                  <span className="text-xl font-bold tracking-wide text-black">
                    {formatRupiah(data.totalHarga).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Aksi */}
              {bisaDiputuskan && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAksi("terima")}
                    disabled={isProcessing}
                    className="w-full bg-black text-white py-4 text-xs font-semibold tracking-[0.2em] hover:bg-black/85 transition disabled:opacity-40"
                  >
                    TERIMA PESANAN
                  </button>
                  <button
                    onClick={() => handleAksi("tolak")}
                    disabled={isProcessing}
                    className="w-full border border-black py-4 text-xs font-semibold tracking-[0.2em] text-black hover:bg-black/[0.03] transition disabled:opacity-40"
                  >
                    TOLAK PESANAN
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DetailPesananPage() {
  return (
    <Suspense fallback={null}>
      <DetailPesananContent />
    </Suspense>
  );
}
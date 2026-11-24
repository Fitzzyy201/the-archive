"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type StatusPesanan =
  | "BelumBayar"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dikomplain"
  | "Batal";

type ProdukItem = {
  namaProduk: string;
  fotoProduk: string;
  harga?: number;
};

type DetailKirim = {
  id: number;
  statusPesanan: StatusPesanan;
  totalHarga: number;
  buyer?: {
    nama?: string | null;
    username?: string | null;
    email?: string;
    noTelp?: string;
  };
  alamat?: { namaPenerima: string; kotaPenerima: string; alamatLengkap: string };
  produk?: ProdukItem | null;
  items?: ProdukItem[];
};

const STATUS_LABEL: Record<StatusPesanan, string> = {
  BelumBayar: "Belum Bayar",
  Diproses: "Sedang Diproses",
  Dikirim: "Sudah Dikirim",
  Selesai: "Selesai",
  Dikomplain: "Dikomplain",
  Batal: "Dibatalkan",
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

function namaBuyer(d: DetailKirim) {
  const b = d.buyer;
  const nama = b?.nama?.trim();
  if (nama) {
    const kata = nama.split(/\s+/);
    return kata.length > 1 ? `${kata[0]} ${kata[kata.length - 1].charAt(0)}.` : nama;
  }
  return b?.username || b?.email?.split("@")[0] || "-";
}

function KirimDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pesananId = searchParams.get("id");

  const [data, setData] = useState<DetailKirim | null>(null);
  const [namaToko, setNamaToko] = useState("THE ARCHIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!pesananId) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const tokoId = localStorage.getItem("tokoId");

      try {
        const res = await fetch(`http://localhost:3001/transaksi/${pesananId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          setData(await res.json());
        }

        if (tokoId) {
          const resToko = await fetch(`http://localhost:3001/toko/${tokoId}`);
          if (resToko.ok) {
            const toko = await resToko.json();
            if (toko.namaToko) setNamaToko(toko.namaToko);
          }
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Detail kirim pesanan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pesananId]);

  const handleBatalkan = async () => {
    if (!confirm("Batalkan pesanan ini?")) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/transaksi/${pesananId}/tolak`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        router.push("/kirim-pesanan");
      } else {
        alert("Gagal membatalkan pesanan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsProcessing(false);
    }
  };

  const produk = data?.items?.[0] ?? data?.produk ?? null;
  const bisaDiproses = data?.statusPesanan === "Diproses";

  return (
    <div className="min-h-screen bg-white md:pl-56">
      <Navbar variant="seller" />

      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        <div className="flex items-center gap-4 px-5 sm:px-8 py-4 bg-white border-b border-black">
          <Link href="/kirim-pesanan">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <h1
            className={`${playfair.className} flex-1 text-center text-2xl font-bold tracking-tight text-black uppercase pr-5`}
          >
            {namaToko}
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-8 py-6">
          <div className="w-full md:max-w-xl md:mx-auto pb-8">
            <p className={`${jakarta.className} text-[10px] tracking-[0.2em] text-black/55 mb-3`}>
              MANAGEMENT PORTAL
            </p>
            <h2
              className={`${playfair.className} text-4xl font-bold text-black pb-5 mb-6 border-b border-black`}
            >
              Kirim Pesanan
            </h2>

            {isLoading ? (
              <p
                className={`${jakarta.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
              >
                Memuat detail pesanan...
              </p>
            ) : !data ? (
              <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15">
                <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
                  Data pesanan tidak ditemukan
                </p>
                <p className="text-xs text-black/40 max-w-[240px] leading-relaxed mb-5">
                  {pesananId
                    ? `Pesanan dengan ID ${pesananId} belum tersedia.`
                    : "Buka halaman ini lewat tombol PROSES KIRIM."}
                </p>
                <Link
                  href="/kirim-pesanan"
                  className="border border-black px-6 py-2.5 text-[11px] font-semibold tracking-[0.15em] text-black hover:bg-black/[0.03] transition"
                >
                  KEMBALI KE DAFTAR
                </Link>
              </div>
            ) : (
              <>
                <p className={`${jakarta.className} text-[11px] tracking-[0.15em] text-black/55 mb-2`}>
                  #ORDER-{data.id}
                </p>
                <p className="text-lg font-bold text-black mb-6">
                  Status:{" "}
                  <span className="text-black/55">{STATUS_LABEL[data.statusPesanan]}</span>
                </p>

                <div className="flex gap-4 mb-5">
                  <div className="w-28 h-28 border border-black bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {isRenderable(produk?.fotoProduk) ? (
                      <img
                        src={produk?.fotoProduk}
                        alt={produk?.namaProduk}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-black leading-snug">
                      {produk?.namaProduk ?? "Produk"}
                    </h3>
                    <p className="text-sm text-black/55 mt-1">Customer: {namaBuyer(data)}</p>
                    <p className="text-base font-bold text-black mt-3">
                      {formatRupiah(data.totalHarga)}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] font-bold tracking-[0.25em] text-black mb-5">
                  DELIVERY DETAILS
                </p>

                <div className="space-y-5 mb-8">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] text-black/50 mb-1.5">
                      RECIPIENT NAME
                    </p>
                    <p className="text-base text-black">
                      {data.alamat?.namaPenerima ?? namaBuyer(data)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] text-black/50 mb-1.5">
                      PHONE NUMBER
                    </p>
                    <p className="text-base text-black">{data.buyer?.noTelp ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] text-black/50 mb-1.5">
                      SHIPPING ADDRESS
                    </p>
                    <p className="text-base text-black leading-relaxed">
                      {data.alamat
                        ? `${data.alamat.alamatLengkap}, ${data.alamat.kotaPenerima}`
                        : "Alamat pengiriman belum tersedia."}
                    </p>
                  </div>
                </div>

                {bisaDiproses && (
                  <div className="space-y-3">
                    <Link
                      href={`/resi-pesanan?id=${data.id}`}
                      className="block text-center w-full bg-black text-white py-5 text-sm font-semibold tracking-[0.25em] hover:bg-black/85 transition"
                    >
                      KIRIM PESANAN
                    </Link>
                    <button
                      onClick={handleBatalkan}
                      disabled={isProcessing}
                      className="w-full border border-black py-5 text-sm font-semibold tracking-[0.15em] text-black hover:bg-black/[0.03] transition disabled:opacity-40"
                    >
                      {isProcessing ? "MEMPROSES..." : "BATALKAN PESANAN"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KirimPesananDetailPage() {
  return (
    <Suspense fallback={null}>
      <KirimDetailContent />
    </Suspense>
  );
}
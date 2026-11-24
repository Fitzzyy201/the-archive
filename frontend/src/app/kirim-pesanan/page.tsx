"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Truck, Package } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type PesananKirim = {
  id: number;
  totalHarga: number;
  statusPesanan: string;
  buyer?: { nama?: string | null; username?: string | null; email?: string };
  produk?: { namaProduk: string; fotoProduk: string } | null;
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

function namaBuyer(p: PesananKirim) {
  const b = p.buyer;
  const nama = b?.nama?.trim();
  if (nama) {
    const kata = nama.split(/\s+/);
    return kata.length > 1 ? `${kata[0]} ${kata[kata.length - 1].charAt(0)}.` : nama;
  }
  return b?.username || b?.email?.split("@")[0] || "-";
}

export default function KirimPesanan() {
  const [pesanan, setPesanan] = useState<PesananKirim[]>([]);
  const [namaToko, setNamaToko] = useState("THE ARCHIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");

      if (!tokoId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/transaksi/toko/${tokoId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data: PesananKirim[] = await res.json();
          // Pesanan yang udah diterima seller dan nunggu dikirim
          setPesanan(Array.isArray(data) ? data.filter((t) => t.statusPesanan === "Diproses") : []);
        }

        const resToko = await fetch(`http://localhost:3001/toko/${tokoId}`);
        if (resToko.ok) {
          const toko = await resToko.json();
          if (toko.namaToko) setNamaToko(toko.namaToko);
        }
      } catch (err) {
        console.warn("Pesanan kirim belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBatalkan = async (id: number) => {
    if (!confirm(`Batalkan pesanan #ORDER-${id}?`)) return;

    setProcessingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/transaksi/${id}/tolak`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setPesanan((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Gagal membatalkan pesanan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white md:pl-56">
      <Navbar variant="seller" />

      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        <div className="flex items-center gap-4 px-5 sm:px-8 py-4 bg-[#FAF9F6] border-b border-black">
          <Link href="/pesanan-seller">
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
                Memuat pesanan...
              </p>
            ) : pesanan.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                {pesanan.map((p) => (
                  <KirimCard
                    key={p.id}
                    item={p}
                    disabled={processingId === p.id}
                    onBatalkan={() => handleBatalkan(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15">
      <Truck className="w-6 h-6 text-black/25 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
        Belum ada pesanan yang perlu dikirim
      </p>
      <p className="text-xs text-black/40 max-w-[240px] leading-relaxed">
        Pesanan yang sudah kamu terima dan siap dikirim akan muncul di sini.
      </p>
      <Link
        href="/pesanan-masuk"
        className="mt-5 border border-black px-6 py-2.5 text-[11px] font-semibold tracking-[0.15em] text-black hover:bg-black/[0.03] transition"
      >
        LIHAT PESANAN MASUK
      </Link>
    </div>
  );
}

function KirimCard({
  item,
  disabled,
  onBatalkan,
}: {
  item: PesananKirim;
  disabled: boolean;
  onBatalkan: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between pb-2 mb-4 border-b border-black/10">
        <Link
          href={`/detail-pesanan?id=${item.id}`}
          className={`${jakarta.className} text-[11px] tracking-[0.15em] text-black/70 hover:text-black`}
        >
          #ORDER-{item.id}
        </Link>
        <span className="text-sm italic text-black/50">Baru</span>
      </div>

      <div className="flex gap-4 mb-5">
        <Link
          href={`/detail-pesanan?id=${item.id}`}
          className="w-24 h-24 bg-black/5 overflow-hidden shrink-0 flex items-center justify-center"
        >
          {isRenderable(item.produk?.fotoProduk) ? (
            <img
              src={item.produk?.fotoProduk}
              alt={item.produk?.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <h3
            className={`${playfair.className} text-base font-bold uppercase text-black leading-snug`}
          >
            {item.produk?.namaProduk ?? "Produk"}
          </h3>
          <p className="text-sm text-black/55 mt-1">Customer: {namaBuyer(item)}</p>
          <p className={`${playfair.className} text-base font-bold text-black mt-3`}>
            {formatRupiah(item.totalHarga)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBatalkan}
          disabled={disabled}
          className="border border-black py-4 text-xs font-semibold tracking-[0.2em] text-black hover:bg-black/[0.03] transition disabled:opacity-40"
        >
          BATALKAN
        </button>
        <Link
          href={`/resi-pesanan?id=${item.id}`}
          className="block text-center bg-black text-white py-4 text-xs font-semibold tracking-[0.2em] hover:bg-black/85 transition"
        >
          PROSES KIRIM
        </Link>
      </div>
    </div>
  );
}

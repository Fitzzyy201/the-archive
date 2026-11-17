"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, PackageSearch, MapPin } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Order = {
  id: number;
  totalHarga: number;
  statusPesanan: string;
  waktuTransaksi: string;
  resi?: string | null;
  toko?: { namaToko: string; kota: string };
  detail: Array<{
    qty: number;
    produk: { namaProduk: string; fotoProduk: string };
  }>;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  DIPROSES: "bg-blue-100 text-blue-800 border-blue-200",
  DIKIRIM: "bg-purple-100 text-purple-800 border-purple-200",
  SELESAI: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DITOLAK: "bg-red-100 text-red-800 border-red-200",
  DIBATALKAN: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyPacketPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/buyer/orders?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data ?? []);
        } else if (res.status === 401) {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Gagal mengambil pesanan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6]`}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-8 py-8 pb-28 md:pb-16">
        <div className="mb-6">
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black`}>
            PESANAN SAYA
          </h1>
          <p className={`${mono.className} text-[10px] tracking-[0.2em] text-black/40 uppercase mt-1.5`}>
            MY PACKETS & ORDER HISTORY
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-black/40 animate-pulse font-mono tracking-widest uppercase">
            Memuat pesanan...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-dashed border-black/15 rounded-sm p-10 text-center">
            <PackageSearch className="w-10 h-10 text-black/20 mx-auto mb-4" strokeWidth={1.25} />
            <p className={`${playfair.className} text-lg font-semibold text-black/70 mb-2`}>
              Belum Ada Pesanan
            </p>
            <p className="text-xs text-black/40 max-w-xs mx-auto leading-relaxed mb-5">
              Pesanan yang kamu buat akan muncul di sini beserta status pembayaran dan pengirimannya.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-sm hover:bg-black/85 transition"
            >
              JELAJAHI KATALOG
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const firstProduct = order.detail[0]?.produk;
  const totalQty = order.detail.reduce((sum, d) => sum + d.qty, 0);

  return (
    <div className="bg-white border border-black/10 rounded-sm p-4">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
        <p className={`${mono.className} text-[10px] tracking-wider text-black/45`}>
          PESANAN #VT-{new Date(order.waktuTransaksi).getFullYear()}-
          {String(order.id).padStart(3, "0")}
        </p>
        <span
          className={`text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full border ${
            STATUS_STYLE[order.statusPesanan] || "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {order.statusPesanan}
        </span>
      </div>

      <div className="flex gap-3">
        <div className="w-16 h-16 bg-black/5 rounded-sm overflow-hidden shrink-0">
          {firstProduct ? (
            <img
              src={getProductImageUrl(firstProduct.fotoProduk)}
              alt={firstProduct.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-black/20" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-black truncate">
            {firstProduct?.namaProduk || "Produk"}
            {order.detail.length > 1 && (
              <span className="ml-1 text-xs font-normal text-black/50">
                +{order.detail.length - 1} lainnya
              </span>
            )}
          </h3>
          <p className={`${mono.className} text-[10px] text-black/45 mt-1`}>
            {totalQty} item · {formatRupiah(order.totalHarga)}
          </p>
          <p className="text-[11px] text-black/50 mt-1">{formatDate(order.waktuTransaksi)}</p>
          {order.toko && (
            <p className="text-[11px] text-black/50 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {order.toko.namaToko} · {order.toko.kota}
            </p>
          )}
        </div>
      </div>

      {order.resi && (
        <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
          <p className={`${mono.className} text-[10px] text-black/50 uppercase`}>
            RESI: {order.resi}
          </p>
        </div>
      )}
    </div>
  );
}

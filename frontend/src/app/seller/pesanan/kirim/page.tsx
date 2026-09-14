"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, User, LogOut, Truck, AlertCircle, X } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Order = {
  id: number;
  totalHarga: number;
  statusPesanan: string;
  waktuTransaksi: string;
  buyer: {
    id: number;
    nama: string | null;
    email: string;
    noTelp: string;
  };
  detail: Array<{
    id: number;
    qty: number;
    hargaSatuan: number;
    produk: {
      id: number;
      namaProduk: string;
      fotoProduk: string;
      harga: number;
    };
  }>;
  shippingResi?: {
    nomorResi: string;
    ekspedisi: string;
    buktiResi: string | null;
  } | null;
};

type OrderResponse = {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    DIPROSES: "bg-blue-100 text-blue-800 border-blue-200",
    DIKIRIM: "bg-purple-100 text-purple-800 border-purple-200",
    SELESAI: "bg-green-100 text-green-800 border-green-200",
    DITOLAK: "bg-red-100 text-red-800 border-red-200",
    DIBATALKAN: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

export default function PesananKirim() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");
    const tokoId = localStorage.getItem("tokoId");

    if (role !== "Seller") {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/seller/orders/to-ship", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: OrderResponse = await res.json();
        setOrders(data.data);
      } else {
        setError("Gagal memuat pesanan untuk dikirim");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShip = (orderId: number) => {
    router.push(`/seller/pesanan/resi/${orderId}`);
  };

  const handleOpenCancelModal = (orderId: number) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelOrderId) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/seller/orders/${cancelOrderId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Pesanan berhasil dibatalkan, stok produk dikembalikan");
        setShowCancelModal(false);
        setCancelOrderId(null);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal membatalkan pesanan");
      }
    } catch (err) {
      console.error("Error canceling order:", err);
      alert("Terjadi kesalahan");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 py-3">
        <div className="flex md:flex-col items-center justify-around md:justify-start md:items-stretch w-full md:gap-2">
          <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
          <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
          <NavItem href="/seller/pesanan" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
          <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
        </div>

        <button
          onClick={() => {
            if (confirm("Apakah Anda yakin ingin keluar?")) {
              localStorage.removeItem("token");
              localStorage.removeItem("tokoId");
              localStorage.removeItem("userId");
              localStorage.removeItem("role");
              window.location.href = "/";
            }
          }}
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3 md:w-full text-red-500 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] md:text-sm font-medium">LOGOUT</span>
        </button>
      </div>

      {/* Main Area */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col relative`}>
        <div className="px-5 sm:px-10 py-6 border-b border-black/10 bg-white">
          <p className={`${mono.className} text-[10px] tracking-[0.25em] text-black/40 mb-2`}>
            THE ARCHIVE · SELLER PANEL
          </p>
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-semibold tracking-tight text-black`}>
            Kirim Pesanan
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-8">
          <div className="w-full md:max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-5 pb-2 border-b border-black/10">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-black/70">
                KIRIM PESANAN
              </h2>
              <p className={`${mono.className} text-[11px] text-black/40`}>
                {orders.length} Pesanan Siap Dikirim
              </p>
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-xs text-black/40 animate-pulse">
                Memuat pesanan...
              </div>
            ) : error ? (
              <div className="bg-white border border-red-200 rounded-sm p-5 text-center text-red-600">
                {error}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onShip={handleShip}
                    onCancel={handleOpenCancelModal}
                    onViewDetail={() => router.push(`/seller/pesanan/${order.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-black/10 rounded-sm p-5 text-center py-12">
      <Package className="w-12 h-12 mx-auto text-black/20 mb-4" />
      <p className="text-sm font-medium text-black/70 mb-1">Belum ada pesanan untuk dikirim</p>
      <p className="text-xs text-black/40 max-w-[280px] mx-auto leading-relaxed">
        Pesanan yang sudah dikonfirmasi (status DIPROSES) akan muncul di sini untuk diproses pengirimannya.
      </p>
    </div>
  );
}

function OrderCard({
  order,
  onShip,
  onCancel,
  onViewDetail,
}: {
  order: Order;
  onShip: (id: number) => void;
  onCancel: (id: number) => void;
  onViewDetail: () => void;
}) {
  const firstProduct = order.detail[0]?.produk;
  const totalItems = order.detail.reduce((sum, d) => sum + d.qty, 0);

  return (
    <div
      onClick={onViewDetail}
      className="bg-white border border-black/10 rounded-sm p-4 cursor-pointer hover:border-black/30 hover:bg-black/[0.01] transition"
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-black/5 rounded-sm overflow-hidden shrink-0">
          <img
            src={getProductImageUrl(firstProduct?.fotoProduk)}
            alt={firstProduct?.namaProduk || "Produk"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-semibold tracking-widest text-black/40 uppercase">Siap Dikirim</p>
              <h3 className="text-sm font-semibold text-black truncate">
                {firstProduct?.namaProduk || "Produk"}
                {order.detail.length > 1 && <span className="ml-1 text-xs text-black/50">+{order.detail.length - 1} lainnya</span>}
              </h3>
            </div>
            <span className={`shrink-0 text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full border ${getStatusBadge(order.statusPesanan)}`}>
              {order.statusPesanan}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-black/60 mb-2">
            <span>{formatDate(order.waktuTransaksi)}</span>
            <span className="font-medium">{formatRupiah(order.totalHarga)}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-black/40 mb-2">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {totalItems} Item
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.buyer.nama || order.buyer.email}
            </span>
          </div>

          {order.shippingResi && (
            <div className="bg-blue-50 border border-blue-100 rounded-sm p-2 text-xs text-blue-800">
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-medium">Resi Sudah Diinput</span>
              </div>
              <div className="text-[10px]">
                {order.shippingResi.ekspedisi} • {order.shippingResi.nomorResi}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/10">
        {order.shippingResi ? (
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-black/15 text-black text-xs font-medium rounded-sm hover:border-black hover:bg-black/[0.02] transition"
          >
            <Truck className="w-3.5 h-3.5" />
            Lihat Detail
          </button>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(order.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-sm hover:bg-red-50 hover:border-red-400 transition"
            >
              <X className="w-3.5 h-3.5" />
              Batalkan
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onShip(order.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-medium rounded-sm hover:bg-black/85 transition"
            >
              <Truck className="w-3.5 h-3.5" />
              Proses Kirim
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-black/15 text-black text-xs font-medium rounded-sm hover:border-black hover:bg-black/[0.02] transition"
            >
              <Truck className="w-3.5 h-3.5" />
              Detail
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CancelModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className={`${playfair.className} text-lg font-bold text-black`}>Batalkan Pesanan</h2>
          <button onClick={onClose} className="text-black/50 hover:text-black transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-orange-500" />
          <p className="text-center text-sm text-black/70">
            Apakah Anda yakin ingin membatalkan pesanan ini? Stok produk akan dikembalikan.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-black/15 text-black text-sm font-medium rounded-sm hover:border-black hover:bg-black/[0.02] transition"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-sm hover:bg-red-700 transition"
            >
              Ya, Batalkan Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3 md:rounded-md ${
        isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </Link>
  );
}
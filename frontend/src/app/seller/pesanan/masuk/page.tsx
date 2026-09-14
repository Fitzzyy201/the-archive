"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, User, Check, X, LogOut, Truck, Clock, AlertCircle } from "lucide-react";
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
  alasanReject?: string | null;
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

export default function PesananMasuk() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");
    const tokoId = localStorage.getItem("tokoId");

    if (role !== "Seller") {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/seller/orders/incoming", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: OrderResponse = await res.json();
        setOrders(data.data);
      } else {
        setError("Gagal memuat pesanan masuk");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    if (!confirm("Terima semua pesanan masuk?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/seller/orders/accept-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Semua pesanan berhasil diterima");
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menerima semua pesanan");
      }
    } catch (err) {
      console.error("Error accepting all:", err);
      alert("Terjadi kesalahan");
    }
  };

  const handleAccept = async (orderId: number) => {
    if (!confirm("Terima pesanan ini?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/seller/orders/${orderId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Pesanan berhasil diterima");
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menerima pesanan");
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      alert("Terjadi kesalahan");
    }
  };

  const handleOpenRejectModal = (orderId: number) => {
    setRejectOrderId(orderId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }
    if (!rejectOrderId) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/seller/orders/${rejectOrderId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alasanPenolakan: rejectReason }),
      });

      if (res.ok) {
        alert("Pesanan berhasil ditolak");
        setShowRejectModal(false);
        setRejectOrderId(null);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menolak pesanan");
      }
    } catch (err) {
      console.error("Error rejecting order:", err);
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
            Pesanan Masuk
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-8">
          <div className="w-full md:max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-5 pb-2 border-b border-black/10">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-black/70">
                PESANAN MASUK
              </h2>
              <p className={`${mono.className} text-[11px] text-black/40`}>
                {orders.length} Pesanan
              </p>
            </div>

            {orders.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAcceptAll}
                  className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-medium rounded-sm hover:bg-black/85 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Terima Semua
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="py-10 text-center text-xs text-black/40 animate-pulse">
                Memuat pesanan masuk...
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
                    onAccept={handleAccept}
                    onReject={handleOpenRejectModal}
                    onViewDetail={() => router.push(`/seller/pesanan/${order.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          reason={rejectReason}
          setReason={setRejectReason}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-black/10 rounded-sm p-5 text-center py-12">
      <ShoppingBag className="w-12 h-12 mx-auto text-black/20 mb-4" />
      <p className="text-sm font-medium text-black/70 mb-1">Belum ada pesanan masuk</p>
      <p className="text-xs text-black/40 max-w-[280px] mx-auto leading-relaxed">
        Pesanan baru dari pembeli akan muncul di sini dan memerlukan konfirmasi Anda.
      </p>
    </div>
  );
}

function OrderCard({
  order,
  onAccept,
  onReject,
  onViewDetail,
}: {
  order: Order;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
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
              <p className="text-xs font-semibold tracking-widest text-black/40 uppercase">Pesanan Masuk</p>
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

          <div className="flex items-center gap-2 text-[10px] text-black/40">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalItems} Item
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.buyer.nama || order.buyer.email}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/10">
        <button
          onClick={(e) => { e.stopPropagation(); onReject(order.id); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-sm hover:bg-red-50 hover:border-red-400 transition"
        >
          <X className="w-3.5 h-3.5" />
          Tolak
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAccept(order.id); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-medium rounded-sm hover:bg-black/85 transition"
        >
          <Check className="w-3.5 h-3.5" />
          Terima
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-black/15 text-black text-xs font-medium rounded-sm hover:border-black hover:bg-black/[0.02] transition"
        >
          <Truck className="w-3.5 h-3.5" />
          Detail
        </button>
      </div>
    </div>
  );
}

function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  reason,
  setReason,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (v: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className={`${playfair.className} text-lg font-bold text-black`}>Tolak Pesanan</h2>
          <button onClick={onClose} className="text-black/50 hover:text-black transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-black/70">
            Masukkan alasan penolakan pesanan ini. Alasan akan dikirim ke pembeli.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Stok habis, produk rusak, tidak bisa dikirim ke lokasi tujuan, dll."
            className="w-full h-24 px-3 py-2 border border-black/15 rounded-sm text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            maxLength={500}
          />
          <p className={`${mono.className} text-[10px] text-black/40 text-right`}>
            {reason.length}/500
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
              Tolak Pesanan
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
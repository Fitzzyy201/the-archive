"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Package, ShoppingBag, User, LogOut, Truck, Check, X, Send, AlertCircle, MapPin, Phone, Mail, Package as PackageIcon, Clock, Image as ImageIcon } from "lucide-react";
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
  alasanReject: string | null;
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
      ukuranDimensi: string;
    };
  }>;
  shippingResi?: {
    nomorResi: string;
    ekspedisi: string;
    buktiResi: string | null;
    waktuKirim: string;
  } | null;
  komplain?: {
    id: number;
    alasanKomplain: string;
    fotoVideoBukti: string;
    statusKomplain: string;
    keputusanAdmin: string | null;
  } | null;
  history: Array<{
    statusSebelum: string;
    statusSesudah: string;
    catatan: string | null;
    waktuUbah: string;
  }>;
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

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Menunggu Konfirmasi",
    DIPROSES: "Diproses",
    DIKIRIM: "Dikirim",
    SELESAI: "Selesai",
    DITOLAK: "Ditolak",
    DIBATALKAN: "Dibatalkan",
  };
  return labels[status] || status;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<"accept" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");

    if (role !== "Seller") {
      router.push("/");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/seller/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrder(await res.json());
      } else {
        setError("Pesanan tidak ditemukan");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/seller/orders/${orderId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Pesanan berhasil diterima");
        setShowActionModal(null);
        fetchOrder();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menerima pesanan");
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      alert("Terjadi kesalahan");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/seller/orders/${orderId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alasanPenolakan: rejectReason }),
      });

      if (res.ok) {
        alert("Pesanan berhasil ditolak");
        setShowActionModal(null);
        setRejectReason("");
        fetchOrder();
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
    fetchOrder();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
        <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 py-3" />
        <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col relative flex-1 items-center justify-center`}>
          <div className="animate-spin text-black/40">
            <svg className="w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
        <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 py-3" />
        <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col relative flex-1 items-center justify-center`}>
          <div className="bg-white border border-red-200 rounded-sm p-5 text-center text-red-600 max-w-md">
            {error || "Pesanan tidak ditemukan"}
            <Link href="/seller/pesanan" className="mt-4 inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-sm hover:bg-black/85 transition">
              Kembali ke Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canAccept = order.statusPesanan === "PENDING";
  const canReject = order.statusPesanan === "PENDING";
  const canShip = order.statusPesanan === "DIPROSES";

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
          <div className="flex items-center justify-between">
            <div>
              <p className={`${mono.className} text-[10px] tracking-[0.25em] text-black/40 mb-2`}>
                THE ARCHIVE · SELLER PANEL
              </p>
              <h1 className={`${playfair.className} text-2xl sm:text-3xl font-semibold tracking-tight text-black`}>
                Detail Pesanan #{order.id}
              </h1>
            </div>
            <span className={`shrink-0 text-[10px] md:text-sm font-semibold tracking-wide px-3 py-1.5 rounded-full border ${getStatusBadge(order.statusPesanan)}`}>
              {getStatusLabel(order.statusPesanan)}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-8">
          <div className="w-full md:max-w-3xl mx-auto space-y-6">
            {/* Action Buttons for PENDING orders */}
            {(canAccept || canReject) && (
              <div className="bg-white border border-black/10 rounded-sm p-4">
                <div className="flex gap-2">
                  {canAccept && (
                    <button
                      onClick={() => setShowActionModal("accept")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white text-sm font-medium rounded-sm hover:bg-black/85 transition"
                    >
                      <Check className="w-4 h-4" />
                      Terima Pesanan
                    </button>
                  )}
                  {canReject && (
                    <button
                      onClick={() => setShowActionModal("reject")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 text-sm font-medium rounded-sm hover:bg-red-50 hover:border-red-400 transition"
                    >
                      <X className="w-4 h-4" />
                      Tolak Pesanan
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Ship Button for DIPROSES orders */}
            {canShip && !order.shippingResi && (
              <Link
                href={`/seller/pesanan/resi/${order.id}`}
                className="block bg-white border border-black/10 rounded-sm p-4 text-center hover:border-black/30 hover:bg-black/[0.01] transition"
              >
                <div className="flex items-center justify-center gap-2 text-black">
                  <Send className="w-5 h-5" />
                  <span className="text-sm font-medium">Proses Pengiriman & Input Resi</span>
                </div>
              </Link>
            )}

            {/* Order Info */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-4 pb-2 border-b border-black/10">
                INFORMASI PESANAN
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={`${mono.className} text-[10px] text-black/40 uppercase mb-1`}>ID Pesanan</p>
                  <p className="font-medium text-black">#{order.id}</p>
                </div>
                <div>
                  <p className={`${mono.className} text-[10px] text-black/40 uppercase mb-1`}>Tanggal Pesanan</p>
                  <p className="font-medium text-black">{formatDate(order.waktuTransaksi)}</p>
                </div>
                <div>
                  <p className={`${mono.className} text-[10px] text-black/40 uppercase mb-1`}>Total Harga</p>
                  <p className="font-medium text-black">{formatRupiah(order.totalHarga)}</p>
                </div>
                <div>
                  <p className={`${mono.className} text-[10px] text-black/40 uppercase mb-1`}>Status</p>
                  <p className="font-medium text-black">{getStatusLabel(order.statusPesanan)}</p>
                </div>
              </div>

              {order.alasanReject && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-sm">
                  <p className={`${mono.className} text-[10px] text-red-600 uppercase mb-1`}>Alasan Penolakan</p>
                  <p className="text-sm text-red-800">{order.alasanReject}</p>
                </div>
              )}

              {order.shippingResi && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-sm">
                  <p className={`${mono.className} text-[10px] text-blue-600 uppercase mb-1`}>Informasi Pengiriman</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Ekspedisi</span>
                      <span className="font-medium text-blue-900">{order.shippingResi.ekspedisi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Nomor Resi</span>
                      <span className="font-medium text-blue-900 font-mono">{order.shippingResi.nomorResi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Tanggal Kirim</span>
                      <span className="font-medium text-blue-900">{formatDate(order.shippingResi.waktuKirim)}</span>
                    </div>
                    {order.shippingResi.buktiResi && (
                      <a
                        href={order.shippingResi.buktiResi.startsWith("http") ? order.shippingResi.buktiResi : `http://localhost:3001${order.shippingResi.buktiResi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        <PackageIcon className="w-3.5 h-3.5" />
                        Lihat Bukti Resi
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Info */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-4 pb-2 border-b border-black/10 flex items-center gap-2">
                <User className="w-4 h-4" />
                DATA PEMBELI
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-black/40 shrink-0" />
                  <div>
                    <p className={`${mono.className} text-[10px] text-black/40 uppercase`}>Nama</p>
                    <p className="font-medium text-black">{order.buyer.nama || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-black/40 shrink-0" />
                  <div>
                    <p className={`${mono.className} text-[10px] text-black/40 uppercase`}>Email</p>
                    <p className="font-medium text-black">{order.buyer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-black/40 shrink-0" />
                  <div>
                    <p className={`${mono.className} text-[10px] text-black/40 uppercase`}>No. Telepon</p>
                    <p className="font-medium text-black">{order.buyer.noTelp}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-4 pb-2 border-b border-black/10 flex items-center gap-2">
                <PackageIcon className="w-4 h-4" />
                DAFTAR PRODUK
              </h3>
              <div className="space-y-3">
                {order.detail.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-black/5 rounded-sm">
                    <div className="w-12 h-12 bg-white rounded-sm overflow-hidden shrink-0">
                      <img
                        src={getProductImageUrl(item.produk.fotoProduk)}
                        alt={item.produk.namaProduk}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black truncate">{item.produk.namaProduk}</h4>
                      <p className={`${mono.className} text-[10px] text-black/40 mt-0.5`}>
                        {item.produk.ukuranDimensi || "-"}
                      </p>
                      <p className="text-xs text-black/60 mt-0.5">
                        {formatRupiah(item.hargaSatuan)} × {item.qty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-black">{formatRupiah(item.hargaSatuan * item.qty)}</p>
                      <p className={`${mono.className} text-[10px] text-black/40`}>Subtotal</p>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-black/10 flex justify-between">
                  <span className="text-sm font-medium text-black">Total</span>
                  <span className="text-sm font-semibold text-black">{formatRupiah(order.totalHarga)}</span>
                </div>
              </div>
            </div>

            {/* Komplain */}
            {order.komplain && (
              <div className="bg-white border border-orange-200 rounded-sm p-4">
                <h3 className="text-xs font-semibold tracking-[0.15em] text-orange-700 mb-4 pb-2 border-b border-orange-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  KOMPLAIN DARI PEMBELI
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className={`${mono.className} text-[10px] text-orange-600 uppercase mb-1`}>Alasan Komplain</p>
                    <p className="text-orange-900">{order.komplain.alasanKomplain}</p>
                  </div>
                  <div>
                    <p className={`${mono.className} text-[10px] text-orange-600 uppercase mb-1`}>Status</p>
                    <p className="font-medium text-orange-900">{order.komplain.statusKomplain}</p>
                  </div>
                  {order.komplain.keputusanAdmin && (
                    <div>
                      <p className={`${mono.className} text-[10px] text-orange-600 uppercase mb-1`}>Keputusan Admin</p>
                      <p className="text-orange-900">{order.komplain.keputusanAdmin}</p>
                    </div>
                  )}
                  {order.komplain.fotoVideoBukti && (
                    <a
                      href={order.komplain.fotoVideoBukti.startsWith("http") ? order.komplain.fotoVideoBukti : `http://localhost:3001${order.komplain.fotoVideoBukti}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm mt-2"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Lihat Bukti
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* History */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-4 pb-2 border-b border-black/10 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                RIWAYAT STATUS
              </h3>
              <div className="space-y-3">
                {order.history.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="relative flex flex-col items-center">
                      <div className="w-2 h-2 bg-black rounded-full border-2 border-white z-10" />
                      {idx < order.history.length - 1 && (
                        <div className="w-0.5 h-full bg-black/10 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full border ${getStatusBadge(h.statusSesudah)}`}>
                          {getStatusLabel(h.statusSesudah)}
                        </span>
                        <span className={`${mono.className} text-[10px] text-black/40`}>{formatDate(h.waktuUbah)}</span>
                      </div>
                      {h.catatan && <p className="text-xs text-black/60">{h.catatan}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {showActionModal === "accept" && (
        <ConfirmModal
          title="Terima Pesanan"
          message="Apakah Anda yakin ingin menerima pesanan ini? Status akan berubah menjadi DIPROSES."
          onConfirm={handleAccept}
          onCancel={() => setShowActionModal(null)}
          confirmText="Terima"
          confirmColor="bg-black hover:bg-black/85"
        />
      )}

      {showActionModal === "reject" && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => {
            setShowActionModal(null);
            setRejectReason("");
          }}
          reason={rejectReason}
          setReason={setRejectReason}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  confirmColor,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  confirmColor: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className={`${playfair.className} text-lg font-bold text-black`}>{title}</h2>
          <button onClick={onCancel} className="text-black/50 hover:text-black transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-black/70">{message}</p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-black/15 text-black text-sm font-medium rounded-sm hover:border-black hover:bg-black/[0.02] transition"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded-sm ${confirmColor} transition`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  onConfirm,
  onCancel,
  reason,
  setReason,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  reason: string;
  setReason: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className={`${playfair.className} text-lg font-bold text-black`}>Tolak Pesanan</h2>
          <button onClick={onCancel} className="text-black/50 hover:text-black transition p-1">
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
              onClick={onCancel}
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
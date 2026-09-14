"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, User, LogOut, Truck, Send, X, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
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

export default function ResiPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nomorResi, setNomorResi] = useState("");
  const [ekspedisi, setEkspedisi] = useState("");
  const [buktiResi, setBuktiResi] = useState<File | null>(null);
  const [buktiResiPreview, setBuktiResiPreview] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/image\/.*|application\/pdf/)) {
        alert("File harus berupa gambar (jpg, png, webp) atau PDF");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setBuktiResi(file);
      setBuktiResiPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!nomorResi.trim() || !ekspedisi.trim() || !buktiResi) {
      alert("Semua field wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload bukti resi first
      const formData = new FormData();
      formData.append("file", buktiResi);

      const token = localStorage.getItem("token");
      const uploadRes = await fetch("http://localhost:3001/produk/upload-foto", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal upload bukti resi");
      }

      const uploadData = await uploadRes.json();
      const buktiResiUrl = uploadData.url;

      // Submit ship order
      const shipRes = await fetch(`http://localhost:3001/seller/orders/${orderId}/ship`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomorResi,
          ekspedisi,
          buktiResi: buktiResiUrl,
        }),
      });

      if (shipRes.ok) {
        alert("Pengiriman berhasil dikonfirmasi! Status berubah menjadi DIKIRIM");
        router.push("/seller/pesanan/kirim");
      } else {
        const err = await shipRes.json();
        alert(err.message || "Gagal konfirmasi pengiriman");
      }
    } catch (err) {
      console.error("Error submitting resi:", err);
      alert("Terjadi kesalahan saat mengirim data");
    } finally {
      setIsSubmitting(false);
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
          <Loader2 className="w-8 h-8 animate-spin text-black/40" />
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
            <button
              onClick={() => router.push("/seller/pesanan/kirim")}
              className="mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-sm hover:bg-black/85 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  const firstProduct = order.detail[0]?.produk;
  const totalItems = order.detail.reduce((sum, d) => sum + d.qty, 0);

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
            Input Resi & Bukti Pengiriman
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-8">
          <div className="w-full md:max-w-2xl mx-auto space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-3 pb-2 border-b border-black/10">
                RINGKASAN PESANAN
              </h3>
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-black/5 rounded-sm overflow-hidden shrink-0">
                  <img
                    src={getProductImageUrl(firstProduct?.fotoProduk)}
                    alt={firstProduct?.namaProduk || "Produk"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-black truncate">
                    {firstProduct?.namaProduk || "Produk"}
                    {order.detail.length > 1 && <span className="ml-1 text-xs text-black/50">+{order.detail.length - 1} lainnya</span>}
                  </h4>
                  <p className="text-xs text-black/60 mt-1">{totalItems} Item • {formatRupiah(order.totalHarga)}</p>
                  <p className={`${mono.className} text-[10px] text-black/40 mt-1`}>
                    {formatDate(order.waktuTransaksi)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-3 pb-2 border-b border-black/10">
                DATA PENERIMA
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/50">Nama</span>
                  <span className="font-medium text-black">{order.buyer.nama || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Email</span>
                  <span className="font-medium text-black">{order.buyer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">No. Telepon</span>
                  <span className="font-medium text-black">{order.buyer.noTelp}</span>
                </div>
              </div>
            </div>

            {/* Resi Form */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-black/70 mb-4 pb-2 border-b border-black/10">
                INPUT RESI & BUKTI PENGIRIMAN
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">
                    Nama Ekspedisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ekspedisi}
                    onChange={(e) => setEkspedisi(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-sm text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="">Pilih Ekspedisi</option>
                    <option value="JNE">JNE</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="AnterAja">AnterAja</option>
                    <option value="Ninja Xpress">Ninja Xpress</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">
                    Nomor Resi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nomorResi}
                    onChange={(e) => setNomorResi(e.target.value)}
                    placeholder="Masukkan nomor resi"
                    className="w-full px-3 py-2 border border-black/15 rounded-sm text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">
                    Bukti Resi (Gambar/PDF) <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-black/15 rounded-sm p-4">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="bukti-resi-upload"
                    />
                    <label
                      htmlFor="bukti-resi-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {buktiResiPreview ? (
                        <div className="relative w-full max-w-xs">
                          {buktiResiPreview.endsWith(".pdf") && buktiResi ? (
                            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-sm">
                              <FileText className="w-8 h-8 text-red-600" />
                              <span className="text-sm text-red-800 truncate">{buktiResi.name}</span>
                            </div>
                          ) : (
                            <img
                              src={buktiResiPreview}
                              alt="Bukti Resi"
                              className="w-full h-40 object-cover rounded-sm"
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setBuktiResi(null);
                              setBuktiResiPreview(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-3 bg-black/5 rounded-full">
                              <ImageIcon className="w-6 h-6 text-black/40" />
                            </div>
                            <p className="text-sm text-black/70">Klik atau drag & drop untuk upload</p>
                            <p className={`${mono.className} text-[10px] text-black/40`}>
                              Gambar (JPG, PNG, WebP) atau PDF • Max 5MB
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-black/10">
                <button
                  onClick={() => router.push("/seller/pesanan/kirim")}
                  className="flex-1 px-4 py-3 border border-black/15 text-black text-sm font-medium rounded-sm hover:border-black hover:bg-black/[0.02] transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white text-sm font-medium rounded-sm hover:bg-black/85 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Konfirmasi Pengiriman
                </button>
              </div>
            </div>
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
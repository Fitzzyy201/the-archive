"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type CartItem = {
  id: number;
  produkId: number;
  namaProduk: string;
  harga: number;
  fotoProduk: string;
  qty: number;
};

type Alamat = {
  id: number;
  namaPenerima: string;
  kotaPenerima: string;
  alamatLengkap: string;
  catatanKurir?: string | null;
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [alamat, setAlamat] = useState<Alamat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) {
        router.replace("/login");
        return;
      }

      try {
        const [resCart, resAlamat] = await Promise.all([
          fetch(`${API_BASE}/cart`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/alamat/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (resCart.ok) {
          const data = await resCart.json();
          const items: CartItem[] = (data.items ?? []).map(
            (item: {
              id: number;
              produkId: number;
              qty: number;
              produk: { namaProduk: string; harga: number; fotoProduk: string };
            }) => ({
              id: item.id,
              produkId: item.produkId,
              namaProduk: item.produk.namaProduk,
              harga: item.produk.harga,
              fotoProduk: item.produk.fotoProduk,
              qty: item.qty,
            })
          );
          setCartItems(items);
        }

        if (resAlamat.ok) {
          const data = await resAlamat.json();
          setAlamat(data);
        }
      } catch (err) {
        console.error("Gagal memuat data checkout:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const totalHarga = cartItems.reduce((sum, item) => sum + item.harga * item.qty, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleBayar = async () => {
    if (!alamat) {
      alert("Pilih atau tambahkan alamat pengiriman terlebih dahulu.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Keranjang kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alamatId: alamat.id,
          paymentMethod: "MIDTRANS",
          catatan: catatan || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const transaksi = data.transaksi?.[0];
        if (transaksi?.redirectUrl) {
          window.location.href = transaksi.redirectUrl;
        } else {
          alert("Checkout berhasil, namun link pembayaran tidak tersedia.");
        }
      } else {
        const errors = data?.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          alert("Validasi gagal:\n" + errors.join("\n"));
        } else {
          alert(data?.message || "Checkout gagal. Silakan coba lagi.");
        }
      }
    } catch (err) {
      console.error("Error checkout:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6]`}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-8 py-8 pb-32">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-black hover:opacity-75 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-wide text-black`}>
            CHECKOUT
          </h1>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-black/40 animate-pulse font-mono tracking-widest uppercase">
            Memuat data checkout...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white border border-dashed border-black/15 rounded-sm p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-black/20 mx-auto mb-4" strokeWidth={1.25} />
            <p className={`${playfair.className} text-lg font-semibold text-black/70 mb-2`}>
              Keranjang Kosong
            </p>
            <p className="text-xs text-black/40 mb-5">Tambahkan produk sebelum melakukan checkout.</p>
            <Link
              href="/"
              className="inline-block bg-black text-white text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-sm hover:bg-black/85 transition"
            >
              JELAJAHI KATALOG
            </Link>
          </div>
        ) : (
          <>
            {/* Alamat Pengiriman */}
            <div className="bg-white border border-black/10 rounded-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className={`${mono.className} text-[10px] font-semibold tracking-widest text-black/50 uppercase`}>
                  ALAMAT PENGIRIMAN
                </p>
                <Link href="/alamat" className="text-[11px] font-semibold text-black underline">
                  {alamat ? "UBAH" : "TAMBAH"}
                </Link>
              </div>
              {alamat ? (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-black/40 shrink-0 mt-0.5" />
                  <div className="text-sm text-black leading-relaxed">
                    <span className="font-semibold">{alamat.namaPenerima}</span>
                    <br />
                    {alamat.alamatLengkap}
                    <br />
                    <span className="text-black/50">{alamat.kotaPenerima}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Belum ada alamat pengiriman. Tambahkan alamat dulu untuk melanjutkan checkout.
                  </p>
                </div>
              )}
            </div>

            {/* Item Keranjang */}
            <div className="bg-white border border-black/10 rounded-sm divide-y divide-black/5 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 bg-black/5 rounded-sm overflow-hidden shrink-0">
                    <img
                      src={getProductImageUrl(item.fotoProduk)}
                      alt={item.namaProduk}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-black truncate">{item.namaProduk.toUpperCase()}</p>
                    <p className={`${mono.className} text-[10px] text-black/45 mt-0.5`}>
                      {item.qty} x {formatRupiah(item.harga)}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-black shrink-0">
                    {formatRupiah(item.harga * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            {/* Catatan */}
            <div className="bg-white border border-black/10 rounded-sm p-4 mb-4">
              <p className={`${mono.className} text-[10px] font-semibold tracking-widest text-black/50 uppercase mb-2`}>
                CATATAN PESANAN (OPSIONAL)
              </p>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Kirim setelah jam 5 sore"
                className="w-full border-b border-black/15 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black bg-transparent resize-none"
              />
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white border border-black/10 rounded-sm p-4 mb-4">
              <p className={`${mono.className} text-[10px] font-semibold tracking-widest text-black/50 uppercase mb-3`}>
                METODE PEMBAYARAN
              </p>
              <div className="flex items-center gap-3 border border-black rounded-sm p-3">
                <ShieldCheck className="w-5 h-5 text-black shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black">Midtrans Payment Gateway</p>
                  <p className="text-[11px] text-black/50">
                    VA, e-wallet, QRIS, kartu - konfirmasi otomatis
                  </p>
                </div>
                <span className={`${mono.className} text-[9px] tracking-widest bg-black text-white px-2 py-1 rounded-sm`}>
                  DIPILIH
                </span>
              </div>
              <p className={`${mono.className} text-[10px] text-black/40 mt-2 uppercase`}>
                Bayar dalam 15 menit atau pesanan otomatis dibatalkan
              </p>
            </div>

            {/* Total */}
            <div className="bg-white border border-black/10 rounded-sm p-4">
              <div className="flex items-center justify-between text-sm text-black/60 mb-1">
                <span>Total Item</span>
                <span>{totalItems} item</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-black/10">
                <span className="text-sm font-semibold text-black">Total Bayar</span>
                <span className={`${playfair.className} text-lg font-bold text-black`}>
                  {formatRupiah(totalHarga)}
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {!isLoading && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-4 sm:px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
          <div className="w-full max-w-2xl mx-auto">
            <button
              onClick={handleBayar}
              disabled={isSubmitting || !alamat}
              className="w-full flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold tracking-widest uppercase py-4 rounded-sm hover:bg-black/85 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> MEMPROSES PEMBAYARAN...
                </>
              ) : (
                <>BAYAR SEKARANG - {formatRupiah(totalHarga)}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

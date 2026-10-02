"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Trash2, ShoppingBag, Plus, Minus, Loader2 } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type CartItem = {
  id: number;
  produkId: number;
  namaProduk: string;
  ukuranDimensi: string;
  defect: boolean;
  harga: number;
  fotoProduk: string;
  qty: number;
  stok: number;
};

type Alamat = {
  namaPenerima: string;
  kotaPenerima: string;
  alamatLengkap: string;
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [alamat, setAlamat] = useState<Alamat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const items: CartItem[] = (data.items || []).map((it: any) => ({
          id: it.id,
          produkId: it.produkId,
          namaProduk: it.produk?.namaProduk || "Produk",
          ukuranDimensi: it.produk?.ukuranDimensi || "-",
          defect: it.produk?.defect || false,
          harga: it.produk?.harga || 0,
          fotoProduk: it.produk?.fotoProduk || "",
          qty: it.qty,
          stok: it.produk?.stok || 1,
        }));
        setCartItems(items);
        setSelected(items.map((item) => item.id));
      }
    } catch (err) {
      console.error("Gagal mengambil data keranjang:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleUpdateQty = async (produkId: number, currentQty: number, delta: number, maxStock: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      alert(`Stok maksimal tersedia: ${maxStock}`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setUpdatingId(produkId);
    try {
      const res = await fetch(`${API_BASE}/cart/${produkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qty: newQty }),
      });

      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.produkId === produkId ? { ...item, qty: newQty } : item
          )
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Gagal mengubah jumlah.");
      }
    } catch (err) {
      console.error("Gagal update kuantitas:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (produkId: number, id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/cart/${produkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        setSelected((prev) => prev.filter((s) => s !== id));
      } else {
        alert("Gagal menghapus produk dari keranjang.");
      }
    } catch (err) {
      console.error("Gagal menghapus item:", err);
    }
  };

  const selectedItems = cartItems.filter((item) => selected.includes(item.id));
  const totalEstimate = selectedItems.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Pilih minimal 1 produk untuk checkout.");
      return;
    }
    console.log("Checkout items:", selectedItems);
    alert("Fitur checkout sedang dipersiapkan.");
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          BLUELIES
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center pb-32">
        <div className="w-full md:max-w-xl">
          {isLoading ? (
            <p className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}>
              Memuat keranjang...
            </p>
          ) : cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Chart section */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-black">CHART</h2>
                <p className="text-xs text-gray-400">
                  {selected.length} ITEMS SELECTED
                </p>
              </div>

              <div className="border border-gray-200 rounded-md divide-y divide-gray-100 mb-5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 mt-1 accent-black cursor-pointer shrink-0"
                    />
                    <div className="w-16 h-16 bg-gray-100 rounded-sm overflow-hidden shrink-0">
                      <img
                        src={getProductImageUrl(item.fotoProduk)}
                        alt={item.namaProduk}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black leading-snug">
                        {item.namaProduk.toUpperCase()}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        SIZE: {item.ukuranDimensi} · {item.defect ? "MINOR DEFECT" : "NO DEFECT"}
                      </p>
                      <p className="text-sm font-semibold text-black mt-1">
                        {formatRupiah(item.harga)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-sm">
                          <button
                            onClick={() => handleUpdateQty(item.produkId, item.qty, -1, item.stok)}
                            disabled={item.qty <= 1 || updatingId === item.produkId}
                            className="px-2 py-0.5 text-gray-500 hover:text-black hover:bg-gray-50 transition disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-black font-mono">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.produkId, item.qty, 1, item.stok)}
                            disabled={item.qty >= item.stok || updatingId === item.produkId}
                            className="px-2 py-0.5 text-gray-500 hover:text-black hover:bg-gray-50 transition disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          (Stok: {item.stok})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.produkId, item.id)}
                      className="text-gray-300 hover:text-red-500 transition shrink-0 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200 rounded-md p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500">
                    DELIVERY ADDRESS
                  </p>
                  <Link href="/alamat" className="text-[11px] font-semibold text-black underline">
                    CHANGE
                  </Link>
                </div>
                {alamat ? (
                  <p className="text-sm text-black leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold">
                        {alamat.namaPenerima} — {alamat.alamatLengkap}
                      </span>
                      <br />
                      <span className="text-gray-500">{alamat.kotaPenerima}</span>
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Belum ada alamat pengiriman.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!isLoading && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 sm:px-12 py-4">
          <div className="w-full md:max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500">TOTAL ESTIMATE</p>
              <p className={`${playfair.className} text-lg font-bold text-black`}>
                {formatRupiah(totalEstimate)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white rounded-md py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-900 transition"
            >
              CHECK OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm">
      <ShoppingBag className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
        Keranjang kosong!!
      </p>
      <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
        Yuk mulai jelajahi katalog dan tambahkan produk favoritmu.
      </p>
      <Link
        href="/"
        className="mt-5 bg-black text-white text-xs font-semibold tracking-wide rounded-md px-6 py-2.5 hover:bg-gray-900 transition"
      >
        JELAJAHI KATALOG
      </Link>
    </div>
  );
}
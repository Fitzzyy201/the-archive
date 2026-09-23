"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Trash2, ShoppingBag } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type CartItem = {
  id: number;
  produkId: number;
  namaProduk: string;
  ukuranDimensi: string;
  defect: boolean;
  harga: number;
  fotoProduk: string;
  qty: number;
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

  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/cart/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
          setSelected(data.map((item: CartItem) => item.id));
        }

        const resAlamat = await fetch(`http://localhost:3001/alamat/user/${userId}`);
        if (resAlamat.ok) {
          const dataAlamat = await resAlamat.json();
          setAlamat(dataAlamat);
        }
      } catch (err) {
        console.error("Gagal mengambil data keranjang:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleRemove = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => prev.filter((s) => s !== id));
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
    router.push("/checkout");
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
                        src={item.fotoProduk}
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
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-gray-300 hover:text-red-500 transition shrink-0"
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
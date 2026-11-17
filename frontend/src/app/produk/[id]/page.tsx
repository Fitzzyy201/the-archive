"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProdukDetail = {
  id: number;
  namaProduk: string;
  deskripsi: string;
  harga: number;
  stok: number;
  ukuranDimensi: string;
  fotoProduk: string;
  defect: boolean;
  statusProduk: string;
  toko?: { namaToko: string; kota: string };
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function ProdukDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [produk, setProduk] = useState<ProdukDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const res = await fetch(`${API_BASE}/produk/${id}`);
        if (!res.ok) {
          setError("Produk tidak ditemukan atau sudah tidak tersedia.");
          return;
        }
        const data = await res.json();
        setProduk(data);
      } catch (err) {
        console.error("Gagal memuat detail produk:", err);
        setError("Gagal memuat produk. Pastikan backend sedang berjalan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduk();
  }, [id]);

  const handleAddToCart = async (beliLangsung = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.");
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ produkId: Number(id), qty }),
      });

      const data = await res.json();

      if (res.ok) {
        if (beliLangsung) {
          router.push("/cart-buyer");
        } else {
          alert("Produk berhasil ditambahkan ke keranjang!");
        }
      } else {
        alert(data?.message || "Gagal menambahkan produk ke keranjang.");
      }
    } catch (err) {
      console.error("Error tambah keranjang:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6]`}>
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 pb-32">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-black hover:opacity-75 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className={`${mono.className} text-[10px] tracking-[0.2em] text-black/40 uppercase`}>
            KATALOG DETAIL
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-black/40 animate-pulse font-mono tracking-widest uppercase">
            Memuat produk...
          </div>
        ) : error || !produk ? (
          <div className="bg-white border border-red-200 rounded-sm p-8 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-700 mb-5">{error || "Produk tidak ditemukan."}</p>
            <Link
              href="/"
              className="inline-block bg-black text-white text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-sm hover:bg-black/85 transition"
            >
              KEMBALI KE KATALOG
            </Link>
          </div>
        ) : (
          <div className="md:flex md:gap-8">
            {/* Foto Produk */}
            <div className="md:w-1/2 mb-6 md:mb-0">
              <div className="relative aspect-square bg-black/5 border border-black/10 rounded-sm overflow-hidden">
                <img
                  src={getProductImageUrl(produk.fotoProduk)}
                  alt={produk.namaProduk}
                  className="w-full h-full object-cover"
                />
                {produk.defect && (
                  <span className={`${mono.className} absolute top-3 right-3 bg-amber-600/90 text-white text-[9px] tracking-[0.1em] px-2 py-1 rounded-sm`}>
                    MINOR DEFECT
                  </span>
                )}
                {produk.statusProduk !== "Aktif" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className={`${mono.className} text-white text-sm tracking-[0.3em] uppercase`}>
                      Tidak Tersedia
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Produk */}
            <div className="md:w-1/2 flex flex-col">
              {produk.toko && (
                <p className={`${mono.className} text-[10px] tracking-[0.2em] text-black/45 uppercase mb-2`}>
                  {produk.toko.namaToko} · {produk.toko.kota}
                </p>
              )}

              <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black leading-tight`}>
                {produk.namaProduk.toUpperCase()}
              </h1>

              <p className={`${playfair.className} text-xl font-semibold text-black mt-3`}>
                {formatRupiah(produk.harga)}
              </p>

              <div className="flex items-center gap-3 mt-3 pb-4 border-b border-black/10">
                <span className={`${mono.className} text-[10px] tracking-wider text-black/50 uppercase`}>
                  SIZE: {produk.ukuranDimensi || "-"}
                </span>
                <span
                  className={`${mono.className} text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                    produk.stok > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {produk.stok > 0 ? `STOK: ${produk.stok}` : "HABIS"}
                </span>
              </div>

              <div className="mt-5">
                <p className={`${mono.className} text-[10px] font-semibold tracking-widest text-black/50 uppercase mb-2`}>
                  DESKRIPSI
                </p>
                <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
                  {produk.deskripsi}
                </p>
              </div>

              {produk.toko && (
                <p className="flex items-center gap-1.5 text-xs text-black/50 mt-4">
                  <MapPin className="w-3.5 h-3.5" />
                  Dikirim dari {produk.toko.kota}
                </p>
              )}

              {/* Qty & Aksi */}
              {produk.statusProduk === "Aktif" && produk.stok > 0 && (
                <div className="mt-6">
                  <p className={`${mono.className} text-[10px] font-semibold tracking-widest text-black/50 uppercase mb-2`}>
                    JUMLAH
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-black/15 rounded-sm">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-black hover:bg-black/5 transition"
                        aria-label="Kurangi"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`${mono.className} w-10 text-center text-sm font-semibold text-black`}>
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(produk.stok, q + 1))}
                        className="px-3 py-2 text-black hover:bg-black/5 transition"
                        aria-label="Tambah"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className={`${mono.className} text-[10px] text-black/40 uppercase`}>
                      Maks {produk.stok} item
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {produk && produk.statusProduk === "Aktif" && produk.stok > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-4 sm:px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
          <div className="w-full max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={isAdding}
              className="flex-1 flex items-center justify-center gap-2 border border-black text-black text-xs font-semibold tracking-widest uppercase py-3.5 rounded-sm hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              KERANJANG
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={isAdding}
              className="flex-1 bg-black text-white text-xs font-semibold tracking-widest uppercase py-3.5 rounded-sm hover:bg-black/85 transition disabled:opacity-50"
            >
              BELI LANGSUNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

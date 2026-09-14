"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageOpen,
  Clock,
  CheckCircle2,
  Store,
  Sparkles,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type BackendProduk = {
  id: number;
  namaProduk: string;
  harga: number;
  stok: number;
  ukuranDimensi?: string;
  fotoProduk?: string;
  defect?: boolean;
  toko?: {
    namaToko: string;
    kota: string;
  };
};

export default function Beranda() {
  const router = useRouter();
  const [isSellerPending, setIsSellerPending] = useState(false);
  const [isSellerApproved, setIsSellerApproved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<BackendProduk[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tokoStatus, setTokoStatus] = useState< string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");

    // 1. Jika role lokal sudah Seller, langsung lempar ke Beranda Seller
    if (token && role === "Seller") {
      router.push("/beranda-seller");
      return;
    }

    setIsMounted(true);

    // 2. Fetch Katalog Produk untuk Tampilan Buyer
    const fetchCatalog = async () => {
      try {
        const res = await fetch("http://localhost:3001/produk");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Gagal mengambil katalog produk:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();

    // 3. Cek Status Toko secara Real-time (Token atau pendingTokoId)
    const checkTokoStatus = async () => {
      const currentToken = localStorage.getItem("token");
      const pendingTokoId = localStorage.getItem("pendingTokoId");
      const agreed = localStorage.getItem("agreedToSellerRules") === "true";

      if (currentToken) {
        try {
          const res = await fetch("http://localhost:3001/toko/status-my-shop", {
            headers: { Authorization: `Bearer ${currentToken}` },
          });

          if (res.ok) {
            const data = await res.json();

            if (data.statusVerif === "Approved") {
              localStorage.setItem("role", "Seller");
              localStorage.setItem("tokoId", data.id);
              localStorage.removeItem("agreedToSellerRules");
              localStorage.removeItem("pendingTokoId");
              
              setIsSellerApproved(true);
              setIsSellerPending(false);
            } else if (data.statusVerif === "Pending") {
              setIsSellerPending(true);
              setIsSellerApproved(false);
            } else {
              setIsSellerPending(false);
              setIsSellerApproved(false);
            }
          }
        } catch (err) {
          console.error("Gagal cek status toko via token:", err);
        }
      } else if (pendingTokoId) {
        try {
          const res = await fetch(`http://localhost:3001/toko/${pendingTokoId}`);

          if (res.ok) {
            const data = await res.json();

            if (data.statusVerif === "Approved") {
              localStorage.removeItem("pendingTokoId");
              localStorage.removeItem("agreedToSellerRules");
              
              setIsSellerApproved(true);
              setIsSellerPending(false);
            } else if (data.statusVerif === "Pending") {
              setIsSellerPending(true);
              setIsSellerApproved(false);
            } else {
              setIsSellerPending(false);
              setIsSellerApproved(false);
            }
          }
        } catch (err) {
          console.error("Gagal cek status pending toko:", err);
        }
      } else if (agreed) {
        setIsSellerPending(true);
        setIsSellerApproved(false);
      } else {
        setIsSellerPending(false);
        setIsSellerApproved(false);
      }
    };

    checkTokoStatus();

    // Polling setiap 3 detik agar status berubah otomatis tanpa refresh
    const interval = setInterval(() => {
      const pendingTokoId = localStorage.getItem("pendingTokoId");
      const currentToken = localStorage.getItem("token");
      const agreed = localStorage.getItem("agreedToSellerRules") === "true";

      if (pendingTokoId || (currentToken && agreed)) {
        checkTokoStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const handleMasukDashboard = () => {
    localStorage.removeItem("agreedToSellerRules");
    localStorage.removeItem("pendingTokoId");
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.setItem("role", "Seller");
      router.push("/beranda-seller");
    } else {
      router.push("/login");
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.namaProduk?.toLowerCase().includes(q) ||
      p.toko?.namaToko?.toLowerCase().includes(q) ||
      p.toko?.kota?.toLowerCase().includes(q)
    );
  });



  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-black selection:bg-black selection:text-white">
      {/* TOP DESKTOP HORIZONTAL NAVBAR + MOBILE HEADER & BOTTOM NAV */}
      <Navbar onSearch={(query) => setSearchQuery(query)} />

      {/* MODAL NOTIFIKASI TOKO APPROVED */}
      {isMounted && isSellerApproved && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/20 p-6 sm:p-8 rounded-md max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-black mb-2">
              Selamat! Toko Anda Disetujui
            </h3>

            <p className="text-xs sm:text-sm text-black/60 mb-6 leading-relaxed">
              Pengajuan toko Anda telah diverifikasi oleh Admin. Sekarang akun Anda resmi beralih menjadi akun Seller dan siap untuk mengunggah katalog produk.
            </p>

            <button
              onClick={handleMasukDashboard}
              className="w-full flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-sm hover:bg-black/85 transition"
            >
              <Store className="w-4 h-4" /> Login sebagai Seller
            </button>
          </div>
        </div>
      )}

      {/* BANNER INFORMASI STATUS UNTUK CALON SELLER */}
      {isMounted && isSellerPending && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-4">
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-sm flex items-start gap-3 text-amber-900 shadow-sm">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-amber-950">
                Pengajuan Toko Anda Sedang Dalam Peninjauan Admin (PENDING)
              </p>
              <p className="text-amber-800/80 mt-0.5 leading-relaxed">
                Akun Anda telah terdaftar dan sedang diverifikasi oleh tim kurasi kami. Selama masa peninjauan, Anda tetap dapat menjelajah produk sebagai pembeli.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`${inter.className} flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 md:py-14 pb-28 md:pb-16`}>
        
        {/* HERO EDITORIAL SECTION */}
        <div className="text-center mb-12 md:mb-16">
          
          <h2
            className={`${playfair.className} text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-black`}
          >
            The Archive
          </h2>
          <p className={`${mono.className} text-[11px] sm:text-xs text-black/50 tracking-[0.2em] uppercase mt-3`}>
            DISCOVER TIMELESS & AUTHENTIC VINTAGE GARMENTS
          </p>
          <div className="w-16 h-[1px] bg-black/20 mx-auto mt-6" />
        </div>

        {/* CATALOGUE GRID / EMPTY STATE */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-black/40 animate-pulse font-mono tracking-widest uppercase">
            Loading Archive Catalogue...
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((produk) => (
              <ProdukCard key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER EDITORIAL (Vintage Aesthetic) */}
      <footer className="w-full border-t border-black/10 bg-white py-8 px-6 sm:px-12 pb-24 md:pb-8 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-black/40 uppercase tracking-[0.15em] font-mono">
          <span>THE ARCHIVE © 2024 · ALL RIGHTS RESERVED</span>
          <span>CURATED THRIFT & ARCHIVE MARKETPLACE</span>
          <span>INDONESIA</span>
        </div>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-black/15 rounded-sm bg-white/40">
      <PackageOpen className="w-10 h-10 text-black/20 mb-4" strokeWidth={1.25} />
      <p className={`${playfair.className} text-xl text-black/70 mb-1.5 font-semibold`}>
        Belum Ada Produk yang Dipublikasikan
      </p>
      <p className="text-xs text-black/40 max-w-sm px-4 leading-relaxed font-sans">
        Saat ini katalog produk sedang dalam kurasi. Toko-toko terverifikasi akan segera memperbarui koleksi terbaru mereka.
      </p>
    </div>
  );
}

function ProdukCard({ produk }: { produk: BackendProduk }) {
  const displayImage = getProductImageUrl(produk.fotoProduk);

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group bg-white border border-black/10 rounded-sm overflow-hidden hover:border-black/30 hover:shadow-md transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-black/5 overflow-hidden">
        <img
          src={displayImage}
          alt={produk.namaProduk}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className={`${mono.className} absolute top-2.5 left-2.5 bg-black/90 text-white text-[9px] tracking-[0.1em] px-2 py-1 rounded-sm`}
        >
          STOCK: {produk.stok}
        </span>
        {produk.defect && (
          <span
            className={`${mono.className} absolute top-2.5 right-2.5 bg-amber-600/90 text-white text-[8px] tracking-[0.1em] px-1.5 py-0.5 rounded-sm`}
          >
            DEFECT
          </span>
        )}
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <p
            className={`${playfair.className} text-sm font-semibold text-black leading-snug mb-1 line-clamp-1 group-hover:text-black/80`}
          >
            {produk.namaProduk.toUpperCase()}
          </p>
          <p className={`${mono.className} text-[11px] text-black/70 mb-2 font-medium`}>
            IDR {produk.harga.toLocaleString("id-ID")}{" "}
            {produk.ukuranDimensi && (
              <span className="text-black/40 font-normal">
                · {produk.ukuranDimensi}
              </span>
            )}
          </p>
        </div>

        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-black/50">
          <span className="truncate">{produk.toko?.namaToko || "The Archive"}</span>
          <span className="italic shrink-0 ml-1">{produk.toko?.kota || "ID"}</span>
        </div>
      </div>
    </Link>
  );
}
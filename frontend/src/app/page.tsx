"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageOpen,
  CheckCircle2,
  Store,
  Clock,
} from "lucide-react";
import {
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");

    if (token && role === "Seller") {
      router.push("/beranda-seller");
      return;
    }

    setIsMounted(true);

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
    <div className={`${jakarta.className} min-h-screen flex flex-col bg-[#FAF9F6] text-black selection:bg-black selection:text-white`}>
      <div className="[&>header>div:first-child]:hidden">
        <Navbar onSearch={(query) => setSearchQuery(query)} />
      </div>

      {isMounted && isSellerApproved && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/20 p-8 rounded-sm max-w-sm w-full shadow-xl text-center">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className={`${playfair.className} text-xl font-bold text-black mb-3`}>
              Toko Disetujui
            </h3>

            <p className="text-xs text-black/60 mb-6 leading-relaxed">
              Pengajuan toko Anda telah diverifikasi. Sekarang akun Anda resmi menjadi Seller.
            </p>

            <button
              onClick={handleMasukDashboard}
              className="w-full flex items-center justify-center gap-2 bg-black text-white text-[10px] font-semibold tracking-widest uppercase py-3 rounded-sm hover:bg-gray-900 transition"
            >
              <Store className="w-3.5 h-3.5" /> Akses Dashboard
            </button>
          </div>
        </div>
      )}

      {isMounted && isSellerPending && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-6">
          <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-sm flex items-start gap-3 shadow-sm">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-semibold">Toko Anda Sedang Dalam Peninjauan</p>
              <p className="mt-1 opacity-80">Akun Anda sedang diverifikasi. Anda tetap dapat menjelajah produk.</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-14">
        <div className="text-center mb-12">
          <h2 className={`${playfair.className} text-3xl md:text-4xl font-medium text-black`}>
            The Archive
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 mt-3 font-medium">
            DISCOVER AUTHENTIC VINTAGE GARMENTS
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-black/40 animate-pulse tracking-widest uppercase font-medium">
            Loading Archive...
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((produk) => (
              <ProdukCard key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-black/10 bg-white/30 rounded-sm">
      <PackageOpen className="w-8 h-8 text-black/20 mb-4" strokeWidth={1} />
      <p className="text-base text-black/75 mb-2 font-medium">Belum Ada Produk</p>
      <p className="text-xs text-black/40 max-w-xs leading-relaxed">
        Katalog produk sedang dalam kurasi.
      </p>
    </div>
  );
}

function ProdukCard({ produk }: { produk: BackendProduk }) {
  const isValidUrl = produk.fotoProduk && (produk.fotoProduk.startsWith("http") || produk.fotoProduk.startsWith("data:"));
  const displayImage = isValidUrl ? produk.fotoProduk : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80";

  return (
    <Link href={`/produk/${produk.id}`} className="group flex flex-col bg-white border border-black/5 rounded-sm overflow-hidden hover:border-black/20 transition-all">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img src={displayImage} alt={produk.namaProduk} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-2 left-2 bg-white/90 text-black text-[9px] font-bold tracking-widest px-2 py-1 uppercase rounded-sm">
          {produk.stok > 0 ? `${produk.stok} IN STOCK` : "SOLD"}
        </span>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-semibold text-black mb-1 truncate">{produk.namaProduk.toUpperCase()}</p>
        <p className="text-[10px] text-black/60 font-medium">IDR {produk.harga.toLocaleString("id-ID")}</p>
      </div>
    </Link>
  );
}

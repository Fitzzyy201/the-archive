"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageOpen,
  Search,
  Clock,
  CheckCircle2,
  Store,
  Sparkles,
} from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
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
  const [tokoStatus, setTokoStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");

    // 1. Jika role lokal sudah Seller, langsung lempar ke Beranda Seller
    if (token && role === "Seller") {
      router.push("/beranda-seller");
      return;
    }

    queueMicrotask(() => setIsMounted(true));

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

  const trimmedQuery = searchQuery.trim();

  return (
    <div className={`${jakarta.className} flex min-h-screen flex-col bg-[#FAF9F6] text-black selection:bg-black selection:text-white`}>
      {/* NAVBAR UTAMA */}
      <Navbar onSearch={(query) => setSearchQuery(query)} />

      {/* MODAL NOTIFIKASI TOKO APPROVED */}
      {isMounted && isSellerApproved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in rounded-sm border border-black/10 bg-[#FAF9F6] p-7 text-center shadow-2xl fade-in zoom-in duration-200 sm:p-9">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
            </div>

            <h3
              className={`${playfair.className} text-2xl font-semibold leading-tight text-black`}
            >
              Selamat! Toko Anda Disetujui
            </h3>

            <p className="mt-2.5 text-[13px] leading-relaxed text-black/55">
              Pengajuan toko Anda telah diverifikasi oleh Admin. Akun Anda
              sekarang resmi menjadi akun Seller dan siap mengunggah katalog
              produk.
            </p>

            <button
              onClick={handleMasukDashboard}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-black py-3 text-[12px] font-medium text-white transition hover:bg-black/85"
            >
              <Store className="h-4 w-4" /> Masuk sebagai Seller
            </button>
          </div>
        </div>
      )}

      {/* BANNER INFORMASI STATUS UNTUK CALON SELLER */}
      {isMounted && isSellerPending && (
        <div className="mx-auto w-full max-w-[1440px] px-5 pt-5 sm:px-8 lg:px-10 xl:px-12">
          <div className="flex items-start gap-3 rounded-sm border border-amber-900/10 bg-amber-50/70 px-4 py-3.5 text-amber-950">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
              strokeWidth={1.75}
            />
            <div className="text-[12px] sm:text-[13px]">
              <p className="font-medium">
                Pengajuan toko Anda sedang ditinjau admin
              </p>
              <p className="mt-0.5 leading-relaxed text-amber-900/70">
                Akun Anda telah terdaftar dan sedang diverifikasi oleh tim
                kurasi kami. Selama masa peninjauan, Anda tetap dapat
                menjelajah produk sebagai pembeli.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`${jakarta.className} w-full flex-1 pb-28 md:pb-20`}>
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-12">
          {/* HERO EDITORIAL SECTION */}
          <section className="pt-12 text-center sm:pt-16 lg:pt-20">
            <span
              className={`${jakarta.className} inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-black/40`}
            >
              <Sparkles className="h-3 w-3" strokeWidth={1.5} />
              Curated Vintage
            </span>

            <h1
              className={`${playfair.className} mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-6xl`}
            >
              The Archive
            </h1>

            <p
              className={`${jakarta.className} mx-auto mt-4 max-w-xl text-[10px] uppercase leading-relaxed tracking-[0.22em] text-black/50 sm:text-[11px]`}
            >
              DISCOVER TIMELESS &amp; AUTHENTIC VINTAGE GARMENTS
            </p>

            <span className="mx-auto mt-7 block h-px w-14 bg-black/20" />
          </section>

          {/* PRODUCT AREA */}
          <section
            aria-label="Katalog produk"
            className="pb-6 pt-10 sm:pt-12 lg:pt-14"
          >
            {/* CATALOGUE GRID / LOADING / EMPTY STATE */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[4/5] rounded-sm bg-black/[0.06]" />
                    <div className="mt-3 h-3 w-3/4 rounded bg-black/[0.06]" />
                    <div className="mt-2 h-2.5 w-1/3 rounded bg-black/[0.05]" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              trimmedQuery ? (
                <SearchEmptyState query={trimmedQuery} />
              ) : (
                <EmptyState />
              )
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((produk) => (
                  <ProdukCard key={produk.id} produk={produk} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER EDITORIAL */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-8 pb-24 text-[11px] text-black/45 sm:px-8 md:flex-row md:pb-8 lg:px-10 xl:px-12">
          <span>© 2024 The Archive. All rights reserved.</span>
          <span className="hidden sm:block">
            Curated thrift &amp; archive marketplace
          </span>
          <span>Indonesia</span>
        </div>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center sm:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white">
        <PackageOpen
          className="h-7 w-7 text-black/30"
          strokeWidth={1.25}
          aria-hidden="true"
        />
      </span>
      <p
        className={`${playfair.className} mt-6 text-xl font-semibold text-black sm:text-2xl`}
      >
        Belum Ada Produk yang Dipublikasikan
      </p>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-black/45">
        Saat ini katalog produk sedang dalam kurasi. Toko-toko terverifikasi
        akan segera memperbarui koleksi terbaru mereka.
      </p>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center sm:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white">
        <Search
          className="h-6 w-6 text-black/30"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
      <p
        className={`${playfair.className} mt-6 text-xl font-semibold text-black sm:text-2xl`}
      >
        Produk tidak ditemukan
      </p>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-black/45">
        Tidak ada hasil untuk &ldquo;{query}&rdquo;. Coba kata kunci lain seperti
        nama produk, nama toko, atau kota.
      </p>
    </div>
  );
}

function ProdukCard({ produk }: { produk: BackendProduk }) {
  const hasImage = Boolean(
    produk.fotoProduk &&
      (produk.fotoProduk.startsWith("http://") ||
        produk.fotoProduk.startsWith("https://") ||
        produk.fotoProduk.startsWith("data:image"))
  );

  const harga = `IDR ${produk.harga.toLocaleString("id-ID")}`;
  const meta = [produk.ukuranDimensi, `Stok ${produk.stok}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-black/[0.04]">
        {hasImage ? (
          <img
            src={produk.fotoProduk}
            alt={produk.namaProduk}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-black/25">
            <Store className="h-7 w-7" strokeWidth={1.25} aria-hidden="true" />
            <span
              className={`${jakarta.className} text-[9px] uppercase tracking-[0.18em]`}
            >
              The Archive
            </span>
          </div>
        )}

        {produk.defect && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F6]/95 px-2.5 py-1 text-[10px] font-medium text-amber-800 shadow-sm backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
              aria-hidden="true"
            />
            Defect
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3
          className={`${playfair.className} line-clamp-2 text-[15px] font-semibold leading-snug text-black`}
        >
          {produk.namaProduk}
        </h3>

        <p
          className={`${jakarta.className} mt-1 text-[12px] font-medium text-black/75`}
        >
          {harga}
        </p>

        <p className="mt-1 text-[11px] text-black/40">{meta}</p>

        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-black/[0.07] pt-2.5 text-[11px] text-black/45">
          <span className="truncate">
            {produk.toko?.namaToko || "The Archive"}
          </span>
          <span className="shrink-0">{produk.toko?.kota || "ID"}</span>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Home,
  Bell,
  User,
  Star,
  PackageX,
} from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type ProdukDetail = {
  id: number;
  namaProduk: string;
  deskripsi: string;
  harga: number;
  stok: number;
  ukuranDimensi: string;
  fotoProduk: string;
  defect: boolean;
  statusProduk: "Aktif" | "Nonaktif";
  toko?: { namaToko: string; kota: string };
};

type Ulasan = {
  id: number;
  rating: number;
  komentar: string | null;
  createdAt?: string;
  buyer?: { nama?: string | null; username?: string | null; email?: string };
};

const BUYER_NAV = [
  { href: "/", icon: Home },
  { href: "/notifikasi", icon: Bell },
  { href: "/profile-buyer", icon: User },
];

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function isRenderable(src: string) {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:image"))
  );
}

function namaReviewer(u: Ulasan) {
  const b = u.buyer;
  if (!b) return "Pembeli";
  return b.nama || b.username || b.email?.split("@")[0] || "Pembeli";
}

export default function DetailProduk() {
  const params = useParams();
  const router = useRouter();
  const produkId = params.id as string;

  const [produk, setProduk] = useState<ProdukDetail | null>(null);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Endpoint ini udah ada di backend (ProdukController @Get(':id'))
        const res = await fetch(`http://localhost:3001/produk/${produkId}`);
        if (res.ok) {
          setProduk(await res.json());
        }
      } catch (err) {
        console.warn("Detail produk belum bisa diambil:", err);
      }

      try {
        const resUlasan = await fetch(`http://localhost:3001/ulasan/produk/${produkId}`);
        if (resUlasan.ok) {
          const data = await resUlasan.json();
          setUlasan(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Ulasan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [produkId]);

  const handleCheckout = async () => {
    if (!produk) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("Silakan login terlebih dahulu untuk checkout.");
      router.push("/login");
      return;
    }

    if (produk.stok <= 0) {
      alert("Stok produk habis.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("http://localhost:3001/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produkId: produk.id,
          userId: Number(userId),
          qty: 1,
        }),
      });

      if (res.ok) {
        router.push("/cart-buyer");
      } else {
        alert("Gagal menambahkan produk ke keranjang.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsAdding(false);
    }
  };

  const rataRata =
    ulasan.length > 0
      ? ulasan.reduce((sum, u) => sum + u.rating, 0) / ulasan.length
      : 0;

  return (
    <div className={`${jakarta.className} min-h-screen flex flex-col bg-[#FAF9F6] text-black`}>
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-black bg-white">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1
          className={`${playfair.className} text-lg sm:text-2xl font-bold tracking-tight text-black uppercase truncate px-3`}
        >
          {produk?.toko?.namaToko || "The Archive"}
        </h1>
        <Link href="/cart-buyer">
          <ShoppingBag className="w-5 h-5 text-black" />
        </Link>
      </div>

      <div className="flex-1 w-full md:max-w-xl md:mx-auto pb-44">
        {isLoading ? (
          <p
            className={`${jakarta.className} text-center text-xs text-black/40 py-24 tracking-widest uppercase`}
          >
            Memuat produk...
          </p>
        ) : !produk ? (
          <div className="flex flex-col items-center text-center py-24 px-6">
            <PackageX className="w-8 h-8 text-black/20 mb-4" strokeWidth={1.25} />
            <p className={`${playfair.className} text-lg text-black/70 mb-1.5 font-semibold`}>
              Produk tidak ditemukan
            </p>
            <p className="text-xs text-black/40 max-w-[240px] leading-relaxed mb-5">
              Produk dengan ID {produkId} belum tersedia atau sudah tidak dijual.
            </p>
            <Link
              href="/"
              className="bg-black text-white text-xs font-semibold tracking-wide px-6 py-2.5 hover:bg-black/85 transition"
            >
              KEMBALI KE KATALOG
            </Link>
          </div>
        ) : (
          <>
            {/* Foto produk */}
            <div className="w-full aspect-[3/4] bg-black/5 overflow-hidden">
              {isRenderable(produk.fotoProduk) ? (
                <img
                  src={produk.fotoProduk}
                  alt={produk.namaProduk}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PackageX className="w-10 h-10 text-black/15" strokeWidth={1.25} />
                </div>
              )}
            </div>

            <div className="px-6 py-6 border-b border-black/10">
              <h2
                className={`${playfair.className} text-2xl sm:text-3xl font-medium uppercase leading-tight mb-3`}
              >
                {produk.namaProduk}
              </h2>
              <p className="text-base text-black">{formatRupiah(produk.harga)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 px-6 py-5 border-b border-black/10">
              <div>
                <p className={`${jakarta.className} text-[10px] tracking-[0.2em] text-black/60 mb-3`}>
                  SIZE
                </p>
                <span className="inline-block border border-black px-3 py-2 text-sm">
                  {produk.ukuranDimensi || "-"}
                </span>
              </div>
              <div>
                <p className={`${jakarta.className} text-[10px] tracking-[0.2em] text-black/60 mb-3`}>
                  STOCK
                </p>
                <p className="text-sm">{produk.stok > 0 ? `${produk.stok} tersedia` : "Habis"}</p>
              </div>
            </div>

            <div className="px-6 py-5 border-b border-black/10">
              <p className={`${jakarta.className} text-[10px] tracking-[0.2em] text-black/60 mb-4`}>
                CONDITION REPORT
              </p>
              <p className="text-sm font-semibold mb-2">
                {produk.defect ? "Produk memiliki defect" : "Tidak ada defect"}
              </p>
              {produk.deskripsi && (
                <p className="text-sm text-black/70 leading-relaxed">{produk.deskripsi}</p>
              )}
            </div>

            <div className="px-6 py-6">
              <h3
                className={`${playfair.className} text-2xl font-medium text-center uppercase mb-5`}
              >
                Ulasan Pembeli
              </h3>

              {ulasan.length === 0 ? (
                <div className="flex flex-col items-center text-center py-10 px-6 border border-dashed border-black/15">
                  <Star className="w-6 h-6 text-black/20 mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-black/70 mb-1">Belum ada ulasan</p>
                  <p className="text-xs text-black/40 max-w-[220px] leading-relaxed">
                    Ulasan dari pembeli akan muncul di sini setelah ada yang menilai produk ini.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className={`${playfair.className} text-5xl font-medium`}>
                      {rataRata.toFixed(1)}
                      <span className="text-4xl">/5</span>
                    </p>
                    <Stars value={Math.round(rataRata)} size="lg" />
                  </div>

                  <div className="divide-y divide-black/10">
                    {ulasan.map((u) => (
                      <div key={u.id} className="py-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-bold">{namaReviewer(u)}</p>
                          <Stars value={u.rating} size="sm" />
                        </div>
                        {u.komentar && (
                          <p className="text-sm text-black/80 leading-relaxed">
                            &ldquo;{u.komentar}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {produk && (
        <div className="fixed bottom-[60px] inset-x-0 z-40 bg-[#FAF9F6] px-4 py-3">
          <div className="md:max-w-xl md:mx-auto">
            <button
              onClick={handleCheckout}
              disabled={isAdding || produk.stok <= 0}
              className="w-full bg-black text-white py-4 text-sm font-medium tracking-[0.15em] hover:bg-black/85 transition disabled:opacity-40"
            >
              {produk.stok <= 0 ? "STOK HABIS" : isAdding ? "MEMPROSES..." : "CHECK OUT"}
            </button>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-black flex items-center justify-around py-4">
        {BUYER_NAV.map((item) => (
          <BuyerNavItem key={item.href} href={item.href} icon={<item.icon className="w-5 h-5" />} />
        ))}
      </div>
    </div>
  );
}

function Stars({ value, size }: { value: number; size: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className={`flex items-center gap-0.5 ${size === "lg" ? "justify-center mt-2" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${dim} ${n <= value ? "fill-black text-black" : "text-black/20"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function BuyerNavItem({ href, icon }: { href: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`p-2 transition ${isActive ? "text-white" : "text-white/40 hover:text-white/70"}`}
    >
      {icon}
    </Link>
  );
}
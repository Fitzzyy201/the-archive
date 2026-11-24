"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  PackageX,
  MessageSquareText,
  MessageCircle,
  Store,
} from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type ProdukInfo = {
  id: number;
  namaProduk: string;
  fotoProduk: string;
  toko?: { namaToko: string };
};

type Ulasan = {
  id: number;
  rating: number;
  komentar: string | null;
  createdAt: string;
  buyer?: { nama?: string | null; username?: string | null; email?: string };
};

type DistribusiBintang = {
  bintang: number;
  jumlah: number;
  persen: number;
};

function isRenderable(src?: string) {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:image"))
  );
}

function namaReviewer(u: Ulasan) {
  const b = u.buyer;
  const nama = b?.nama?.trim();

  const rapi = (teks: string) =>
    teks
      .toLowerCase()
      .split(/\s+/)
      .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
      .join(" ");

  if (nama) {
    const kata = nama.split(/\s+/);
    if (kata.length > 1) {
      return `${rapi(kata[0])} ${kata[kata.length - 1].charAt(0).toUpperCase()}.`;
    }
    return rapi(nama);
  }
  return rapi(b?.username || b?.email?.split("@")[0] || "Pembeli");
}

function formatTanggal(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRating(nilai: number) {
  return nilai.toFixed(1).replace(".", ",");
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const produkId = searchParams.get("id");

  const [produk, setProduk] = useState<ProdukInfo | null>(null);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!produkId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/produk/${produkId}`);
        if (res.ok) {
          setProduk(await res.json());
        }
      } catch (err) {
        console.warn("Info produk belum bisa diambil:", err);
      }

      try {
        const resUlasan = await fetch(`http://localhost:3001/produk/${produkId}/ulasan`);
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

  const rataRata =
    ulasan.length > 0 ? ulasan.reduce((sum, u) => sum + u.rating, 0) / ulasan.length : 0;

  const distribusi: DistribusiBintang[] = [5, 4, 3, 2, 1].map((bintang) => {
    const jumlah = ulasan.filter((u) => Math.round(u.rating) === bintang).length;
    return {
      bintang,
      jumlah,
      persen: ulasan.length > 0 ? (jumlah / ulasan.length) * 100 : 0,
    };
  });

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#FAF9F6] text-black md:pl-56`}>
      <Navbar variant="seller" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pb-16 lg:px-10">
        {/* Top utilities */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 rounded-sm border border-black/10 bg-white px-3.5 py-2 text-[13px] font-medium text-black/70 transition hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6]"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={1.75}
            />
            Kembali
          </button>

          <div className="flex min-w-0 items-center gap-2 text-[13px] text-black/55">
            <Store className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="min-w-0 truncate">
              {produk?.toko?.namaToko || "The Archive"}
            </span>
          </div>
        </div>

        {/* Page header */}
        <header className="mt-6 border-b border-black/10 pb-6 sm:mt-8 sm:pb-7">
          <p
            className={`${jakarta.className} text-[10px] uppercase tracking-[0.18em] text-black/40`}
          >
            Seller · Reputasi Produk
          </p>
          <h1
            className={`${playfair.className} mt-2 text-[30px] font-semibold leading-[1.1] tracking-tight text-black sm:text-4xl`}
          >
            Ulasan Produk
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-black/60 sm:text-[15px]">
            Pantau penilaian dan komentar pembeli terhadap produk yang Anda jual. Ulasan di
            sini membantu Anda menjaga kualitas produk dan kepercayaan toko.
          </p>
        </header>

        <div className="mt-7 sm:mt-8">
          {isLoading ? (
            <LoadingState />
          ) : !produk ? (
            <NotFound produkId={produkId} />
          ) : (
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:gap-10">
              <ProductPanel
                produk={produk}
                rataRata={rataRata}
                totalUlasan={ulasan.length}
                distribusi={distribusi}
              />
              <ReviewsSection ulasan={ulasan} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductPanel({
  produk,
  rataRata,
  totalUlasan,
  distribusi,
}: {
  produk: ProdukInfo;
  rataRata: number;
  totalUlasan: number;
  distribusi: DistribusiBintang[];
}) {
  return (
    <aside className="min-w-0">
      <div className="overflow-hidden rounded-sm border border-black/10 bg-white">
        <div className="flex gap-4 p-4 sm:p-5 lg:block lg:p-0">
          <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#F5F2EB] sm:h-32 sm:w-28 lg:h-auto lg:w-full lg:aspect-[4/3] lg:rounded-none">
            {isRenderable(produk.fotoProduk) ? (
              <img
                src={produk.fotoProduk}
                alt={produk.namaProduk}
                className="h-full w-full object-cover"
              />
            ) : (
              <PackageX className="h-7 w-7 text-black/20" strokeWidth={1.25} />
            )}
          </div>

          <div className="min-w-0 flex-1 lg:p-5">
            <p
              className={`${jakarta.className} text-[9px] uppercase tracking-[0.16em] text-black/40`}
            >
              Produk Anda
            </p>
            <h2
              className={`${playfair.className} mt-1.5 break-words text-xl font-semibold leading-snug tracking-tight text-black sm:text-[22px]`}
            >
              {produk.namaProduk}
            </h2>
            <p className="mt-2 text-[12px] text-black/45">
              {totalUlasan > 0 ? "Rekap penilaian pembeli" : "Menunggu penilaian pertama"}
            </p>
          </div>
        </div>

        <div className="border-t border-black/10 bg-[#FBFAF7] p-4 sm:p-5">
          <div className="flex items-end gap-4">
            <p
              className={`${playfair.className} text-[42px] leading-none tracking-tight text-black`}
            >
              {totalUlasan > 0 ? formatRating(rataRata) : "—"}
            </p>
            <div className="pb-1">
              <Stars value={rataRata} size="md" />
              <p className="mt-1.5 text-[12px] text-black/50">
                {totalUlasan > 0 ? `${totalUlasan} ulasan` : "Belum ada ulasan"}
              </p>
            </div>
          </div>

          {totalUlasan > 0 && (
            <div className="mt-5 space-y-2">
              {distribusi.map(({ bintang, jumlah, persen }) => (
                <div
                  key={bintang}
                  role="img"
                  aria-label={`${bintang} bintang: ${jumlah} ulasan`}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className={`${jakarta.className} w-2.5 text-right text-[10px] text-black/40`}
                  >
                    {bintang}
                  </span>
                  <Star
                    className="h-3 w-3 shrink-0 fill-black/15 text-black/15"
                    strokeWidth={1}
                    aria-hidden="true"
                  />
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                    <div
                      className="h-full rounded-full bg-black/75 transition-[width] duration-500"
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                  <span
                    className={`${jakarta.className} w-5 text-right text-[10px] text-black/40`}
                  >
                    {jumlah}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ReviewsSection({ ulasan }: { ulasan: Ulasan[] }) {
  return (
    <section aria-labelledby="ulasan-heading" className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
        <div>
          <p
            className={`${jakarta.className} text-[9px] uppercase tracking-[0.16em] text-black/40`}
          >
            Umpan Balik Pembeli
          </p>
          <h2
            id="ulasan-heading"
            className={`${playfair.className} mt-1.5 text-2xl font-semibold tracking-tight text-black sm:text-[28px]`}
          >
            Ulasan Pembeli
          </h2>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] font-medium text-black/60">
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          {ulasan.length} ulasan
        </span>
      </div>

      {ulasan.length === 0 ? (
        <EmptyReviews />
      ) : (
        <div className="mt-5 divide-y divide-black/10 overflow-hidden rounded-sm border border-black/10 bg-white">
          {ulasan.map((u) => (
            <ReviewRow key={u.id} ulasan={u} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewRow({ ulasan: u }: { ulasan: Ulasan }) {
  const nama = namaReviewer(u);
  const inisial = nama.charAt(0).toUpperCase();

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1EEE7] text-[13px] font-semibold text-black/55"
          >
            {inisial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium leading-tight text-black">{nama}</p>
            <p className="mt-1 text-[12px] text-black/45">{formatTanggal(u.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stars value={u.rating} size="sm" />
          <span
            className={`${jakarta.className} text-[11px] tabular-nums text-black/45`}
          >
            {formatRating(u.rating)}
          </span>
        </div>
      </div>

      {u.komentar ? (
        <p className="mt-4 break-words text-[15px] leading-7 text-black/80 sm:text-base sm:leading-7">
          {u.komentar}
        </p>
      ) : (
        <p className="mt-4 text-sm italic leading-relaxed text-black/40">
          Pembeli tidak menuliskan komentar.
        </p>
      )}
    </article>
  );
}

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const px = size === "md" ? 18 : 15;

  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => {
        const penuh = value >= n - 0.25;
        const setengah = !penuh && value >= n - 0.75;

        return (
          <span
            key={n}
            className="relative inline-block"
            style={{ width: px, height: px }}
          >
            <Star size={px} className="text-black/25" strokeWidth={1.25} />
            {(penuh || setengah) && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: penuh ? "100%" : "50%" }}
              >
                <Star size={px} className="fill-black text-black" strokeWidth={1.25} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Memuat ulasan...</span>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:gap-10">
        <div className="overflow-hidden rounded-sm border border-black/10 bg-white">
          <div className="flex gap-4 p-4 sm:p-5">
            <div className="h-28 w-24 shrink-0 animate-pulse rounded-sm bg-black/[0.06] sm:h-32 sm:w-28" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-black/[0.06]" />
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-black/[0.06]" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-black/[0.06]" />
              <div className="h-2.5 w-24 animate-pulse rounded-full bg-black/[0.06]" />
            </div>
          </div>
          <div className="border-t border-black/10 p-4 sm:p-5">
            <div className="flex items-end gap-4">
              <div className="h-10 w-16 animate-pulse rounded-sm bg-black/[0.06]" />
              <div className="space-y-2 pb-1">
                <div className="h-3 w-24 animate-pulse rounded-full bg-black/[0.06]" />
                <div className="h-2.5 w-16 animate-pulse rounded-full bg-black/[0.06]" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between gap-3 border-b border-black/10 pb-4">
            <div className="space-y-2">
              <div className="h-2.5 w-24 animate-pulse rounded-full bg-black/[0.06]" />
              <div className="h-5 w-40 animate-pulse rounded-full bg-black/[0.06]" />
            </div>
            <div className="h-7 w-24 animate-pulse rounded-full bg-black/[0.06]" />
          </div>

          <div className="mt-5 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-sm border border-black/10 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-black/[0.06]" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 animate-pulse rounded-full bg-black/[0.06]" />
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-black/[0.06]" />
                  </div>
                </div>
                <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-black/[0.06]" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-black/[0.06]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound({ produkId }: { produkId: string | null }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-sm border border-black/10 bg-white px-6 py-16 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04]">
        <PackageX className="h-5 w-5 text-black/35" strokeWidth={1.5} />
      </div>
      <h2
        className={`${playfair.className} text-xl font-semibold tracking-tight text-black`}
      >
        Produk tidak ditemukan
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/55">
        {produkId
          ? `Produk dengan ID ${produkId} belum tersedia.`
          : "Buka halaman ini lewat daftar produk Anda."}
      </p>
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="mt-5 flex flex-col items-center rounded-sm border border-dashed border-black/15 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04]">
        <MessageSquareText className="h-5 w-5 text-black/35" strokeWidth={1.5} />
      </div>
      <h3 className={`${playfair.className} text-lg font-semibold tracking-tight text-black`}>
        Belum ada ulasan
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/55">
        Ulasan dari pembeli akan muncul di sini setelah ada yang menilai produk ini. Kualitas
        produk dan pelayanan toko Anda akan tercermin di halaman ini.
      </p>
    </div>
  );
}

export default function ReviewProdukPage() {
  return (
    <Suspense fallback={null}>
      <ReviewContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Package, Truck, UploadCloud, Check } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type ProdukItem = {
  namaProduk: string;
  ukuranDimensi?: string;
  fotoProduk: string;
  harga?: number;
};

type DetailResi = {
  id: number;
  statusPesanan: string;
  totalHarga: number;
  buyer?: {
    nama?: string | null;
    username?: string | null;
    email?: string;
    noTelp?: string;
  };
  alamat?: { namaPenerima: string; kotaPenerima: string; alamatLengkap: string };
  produk?: ProdukItem | null;
  items?: ProdukItem[];
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function isRenderable(src?: string) {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:image"))
  );
}

function namaBuyer(d: DetailResi) {
  const b = d.buyer;
  const nama = b?.nama?.trim();
  if (nama) {
    const kata = nama.split(/\s+/);
    return kata.length > 1 ? `${kata[0]} ${kata[kata.length - 1].charAt(0)}.` : nama;
  }
  return b?.username || b?.email?.split("@")[0] || "-";
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function ResiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pesananId = searchParams.get("id");

  const [data, setData] = useState<DetailResi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nomorResi, setNomorResi] = useState("");
  const [buktiResi, setBuktiResi] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!pesananId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/transaksi/${pesananId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Data pesanan belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pesananId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("Ukuran file maksimal 5MB.");
      e.target.value = "";
      return;
    }
    setBuktiResi(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomorResi.trim()) {
      alert("Masukkan nomor resi ekspedisi terlebih dahulu.");
      return;
    }
    if (!buktiResi) {
      alert("Upload bukti resi terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const buktiBase64 = await fileToBase64(buktiResi);

      const res = await fetch(`http://localhost:3001/transaksi/${pesananId}/kirim`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nomorResi: nomorResi.trim(),
          buktiResi: buktiBase64,
        }),
      });

      if (res.ok) {
        alert("Pengiriman berhasil dikonfirmasi!");
        router.push("/pesanan-seller");
      } else {
        alert("Gagal mengonfirmasi pengiriman.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const produk = data?.items?.[0] ?? data?.produk ?? null;
  const backHref = pesananId ? `/kirim-pesanan/detail?id=${pesananId}` : "/kirim-pesanan";

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#FAF9F6] md:pl-56`}>
      <Navbar variant="seller" />

      <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-4 px-5 sm:px-8 py-4 bg-white border-b border-black">
        <Link href={backHref}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1
          className={`${playfair.className} flex-1 text-center text-2xl font-bold tracking-tight text-black pr-5`}
        >
          KIRIM PESANAN
        </h1>
      </div>

      <div className="flex-1 w-full px-5 sm:px-8 py-6">
        <div className="w-full md:max-w-xl md:mx-auto pb-8">
          {isLoading ? (
            <p
              className={`${jakarta.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
            >
              Memuat data pesanan...
            </p>
          ) : !data ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15">
              <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
                Data pesanan tidak ditemukan
              </p>
              <p className="text-xs text-black/40 max-w-[240px] leading-relaxed mb-5">
                {pesananId
                  ? `Pesanan dengan ID ${pesananId} belum tersedia.`
                  : "Buka halaman ini lewat tombol KIRIM PESANAN."}
              </p>
              <Link
                href="/kirim-pesanan"
                className="border border-black px-6 py-2.5 text-[11px] font-semibold tracking-[0.15em] text-black hover:bg-black/[0.03] transition"
              >
                KEMBALI KE DAFTAR
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="border border-black bg-white p-5 mb-6">
                <div className="flex items-start justify-between pb-4 mb-4 border-b border-black/10">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-black/55 mb-1.5">
                      ORDER NUMBER
                    </p>
                    <p className="text-xl font-bold tracking-wide text-black">
                      #ORDER-{data.id}
                    </p>
                  </div>
                  <span className="bg-black text-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em]">
                    SEDANG DIPROSES
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="w-20 h-24 border border-black bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {isRenderable(produk?.fotoProduk) ? (
                      <img
                        src={produk?.fotoProduk}
                        alt={produk?.namaProduk}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold uppercase tracking-wide text-black">
                      {produk?.namaProduk ?? "Produk"}
                    </h3>
                    <p className="text-sm text-black/55 mt-1.5">
                      Size: {produk?.ukuranDimensi ?? "-"}
                    </p>
                    <p className="text-lg text-black mt-2">
                      {formatRupiah(produk?.harga ?? data.totalHarga)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-black bg-white p-5 mb-8">
                <div className="flex items-start justify-between mb-5">
                  <p className="text-[11px] tracking-[0.2em] text-black pb-1.5 border-b border-black">
                    DELIVERY DETAILS
                  </p>
                  <Truck className="w-5 h-5 text-black" />
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-black/50 mb-1.5">
                      RECIPIENT NAME
                    </p>
                    <p className="text-base text-black">
                      {data.alamat?.namaPenerima ?? namaBuyer(data)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-black/50 mb-1.5">
                      PHONE NUMBER
                    </p>
                    <p className="text-base text-black">{data.buyer?.noTelp ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-black/50 mb-1.5">
                      SHIPPING ADDRESS
                    </p>
                    <p className="text-base text-black leading-relaxed">
                      {data.alamat
                        ? `${data.alamat.alamatLengkap}, ${data.alamat.kotaPenerima}`
                        : "Alamat pengiriman belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>

              <h2
                className={`${playfair.className} text-3xl font-bold tracking-tight text-black mb-6`}
              >
                BUKTI PENGIRIMAN
              </h2>

              <label className="block text-[11px] tracking-[0.2em] text-black mb-3">
                NOMOR RESI
              </label>
              <input
                type="text"
                value={nomorResi}
                onChange={(e) => setNomorResi(e.target.value)}
                placeholder="Masukkan nomor resi ekspedisi"
                className="w-full bg-transparent border-b border-black py-3 text-base text-black placeholder:text-black/40 focus:outline-none mb-8"
              />

              <label className="block text-[11px] tracking-[0.2em] text-black mb-3">
                UPLOAD BUKTI RESI
              </label>
              <label className="border border-dashed border-black flex flex-col items-center justify-center gap-2 py-9 px-4 text-center cursor-pointer hover:bg-black/[0.02] transition mb-8">
                {buktiResi ? (
                  <Check className="w-7 h-7 text-black" strokeWidth={1.75} />
                ) : (
                  <UploadCloud className="w-7 h-7 text-black" strokeWidth={1.75} />
                )}
                <span className="text-sm font-bold tracking-[0.15em] text-black break-all">
                  {buktiResi ? buktiResi.name : "PILIH FILE"}
                </span>
                <span className="text-[11px] text-black/55">
                  (Max. 5MB, format: JPG, PNG, PDF)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>

              <div className="border-t border-black pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-5 text-sm font-semibold tracking-[0.2em] hover:bg-black/85 transition disabled:opacity-40"
                >
                  {isSubmitting ? (
                    "MEMPROSES..."
                  ) : (
                    <>
                      KONFIRMASI PENGIRIMAN <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default function ResiPesananPage() {
  return (
    <Suspense fallback={null}>
      <ResiContent />
    </Suspense>
  );
}
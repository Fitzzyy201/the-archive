"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

type ItemProduk = {
  namaProduk: string;
  ukuranDimensi: string;
  warna?: string;
  qty: number;
  harga: number;
  fotoProduk: string;
};

type DetailPesanan = {
  statusPesanan: "BelumBayar" | "Diproses" | "Dikirim" | "Selesai" | "Dikomplain" | "Batal";
  batasWaktuProses: string;
  buyerNama: string;
  buyerUsername: string;
  waktuTransaksi: string;
  items: ItemProduk[];
  alamatLengkap: string;
  subtotal: number;
  shipping: number;
  adminFeePercent: number;
};

const data: DetailPesanan | null = null;

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

const statusLabel: Record<DetailPesanan["statusPesanan"], string> = {
  BelumBayar: "BELUM BAYAR",
  Diproses: "PERLU DIKIRIM",
  Dikirim: "DIKIRIM",
  Selesai: "SELESAI",
  Dikomplain: "DIKOMPLAIN",
  Batal: "DIBATALKAN",
};

export default function DetailPesananPage() {
  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <Link href="/pesanan-seller">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          DETAIL PESANAN
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-6">
          {!data ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm mt-4">
              <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                Data pesanan tidak ditemukan
              </p>
              <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                Belum ada data pesanan yang tersedia.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500">CURRENT STATUS</p>
                <p className="text-xs font-bold text-black">{statusLabel[data.statusPesanan]}</p>
              </div>
              <p className="text-[11px] text-gray-400 pt-2 pb-4 border-b border-gray-100">
                Estimated processing time remaining: {data.batasWaktuProses}
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">BUYER</p>
                  <p className="text-sm font-semibold text-black">{data.buyerNama}</p>
                  <p className="text-xs text-gray-400">@{data.buyerUsername}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">ORDERED ON</p>
                  <p className="text-sm font-semibold text-black">{data.waktuTransaksi}</p>
                </div>
              </div>

              <div className="py-4 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 mb-3">PRODUCT LIST</p>
                <div className="space-y-4">
                  {data.items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-sm overflow-hidden shrink-0">
                        <img src={item.fotoProduk} alt={item.namaProduk} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-black leading-snug">{item.namaProduk}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.ukuranDimensi}
                          {item.warna ? ` / ${item.warna.toUpperCase()}` : ""}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                          <p className="text-sm font-semibold text-black">{formatRupiah(item.harga)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-4 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 mb-2">SHIPPING ADDRESS</p>
                <p className="text-sm text-black leading-relaxed">{data.alamatLengkap}</p>
              </div>

              <div className="border border-gray-200 rounded-md p-4 my-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatRupiah(data.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatRupiah(data.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Admin Fee</span>
                  <span>{data.adminFeePercent}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-black">TOTAL PAYMENT</span>
                  <span className={`${playfair.className} text-lg font-bold text-black`}>
                    {formatRupiah(data.subtotal + data.shipping + (data.subtotal * data.adminFeePercent) / 100)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <button className="w-full bg-black text-white rounded-md py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-900 transition">
                  TERIMA PESANAN
                </button>
                <button className="w-full border border-gray-300 rounded-md py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-50 transition">
                  TOLAK PESANAN
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
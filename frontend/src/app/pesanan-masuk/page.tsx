"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });


const namaToko = "The Diaries Store";

type PesananMasukItem = {
  id: number;
  namaProduk: string;
  namaBuyer: string;
  harga: number;
  fotoProduk: string;
};

const initialPesanan: PesananMasukItem[] = [];

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function PesananMasuk() {
  const [pesanan, setPesanan] = useState<PesananMasukItem[]>(initialPesanan);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const acceptAll = () => {
    setSelected(pesanan.map((p) => p.id));
  };

  const handleAccept = (id: number) => {
    console.log("Accept pesanan id:", id);
    setPesanan((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReject = (id: number) => {
    console.log("Reject pesanan id:", id);
    setPesanan((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTerimaSemua = () => {
    console.log("Terima pesanan terpilih:", selected);
    setPesanan((prev) => prev.filter((p) => !selected.includes(p.id)));
    setSelected([]);
  };

  const handleTolakSemua = () => {
    console.log("Tolak pesanan terpilih:", selected);
    setPesanan((prev) => prev.filter((p) => !selected.includes(p.id)));
    setSelected([]);
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <Link href="/pesanan-seller">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-base sm:text-lg font-bold tracking-wide text-black`}>
          {namaToko.toUpperCase()}
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-24">
          <p className={`${mono.className} text-[10px] tracking-[0.2em] text-gray-400 mb-1`}>
            MANAGEMENT PORTAL
          </p>
          <h2 className="text-2xl font-bold text-black mb-2">Pesanan Masuk</h2>

          {pesanan.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm mt-6">
              <Inbox className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
              <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
                Belum ada pesanan baru
              </p>
              <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                Pesanan yang masuk dan menunggu konfirmasi akan muncul di sini.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-gray-500">
                  You have {pesanan.length} unhandled orders awaiting action.
                </p>
                <button
                  onClick={acceptAll}
                  className="text-xs font-semibold underline text-black shrink-0 ml-3"
                >
                  ACCEPT ALL
                </button>
              </div>

              <div className="space-y-5">
                {pesanan.map((item) => (
                  <PesananMasukCard
                    key={item.id}
                    item={item}
                    checked={selected.includes(item.id)}
                    onToggle={() => toggleSelect(item.id)}
                    onAccept={() => handleAccept(item.id)}
                    onReject={() => handleReject(item.id)}
                  />
                ))}
              </div>

        
              <div className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:mt-6 md:static bg-white border-t md:border-t-0 px-6 py-4 md:px-0 md:py-0 space-y-2 md:max-w-xl md:mx-auto">
                <button
                  onClick={handleTerimaSemua}
                  disabled={selected.length === 0}
                  className="w-full bg-black text-white rounded-md py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-900 transition disabled:bg-gray-200 disabled:text-gray-400"
                >
                  TERIMA PESANAN
                </button>
                <button
                  onClick={handleTolakSemua}
                  disabled={selected.length === 0}
                  className="w-full border border-gray-300 rounded-md py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-50 transition disabled:text-gray-300"
                >
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

function PesananMasukCard({
  item,
  checked,
  onToggle,
  onAccept,
  onReject,
}: {
  item: PesananMasukItem;
  checked: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 mt-1 accent-black cursor-pointer shrink-0"
      />
      <div className="flex-1">
        <div className="flex gap-3 mb-3">
          <div className="w-16 h-16 bg-gray-100 rounded-sm overflow-hidden shrink-0">
            <img src={item.fotoProduk} alt={item.namaProduk} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-black leading-snug">
              {item.namaProduk}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Customer: {item.namaBuyer}</p>
            <p className="text-sm font-semibold text-black mt-1.5">{formatRupiah(item.harga)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAccept}
            className="bg-black text-white rounded-md py-2.5 text-xs font-semibold tracking-wide hover:bg-gray-900 transition"
          >
            ACCEPT
          </button>
          <button
            onClick={onReject}
            className="border border-gray-300 rounded-md py-2.5 text-xs font-semibold tracking-wide hover:bg-gray-50 transition"
          >
            REJECT
          </button>
        </div>
      </div>
    </div>
  );
}
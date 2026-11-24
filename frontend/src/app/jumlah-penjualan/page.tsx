"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type Periode = "HARIAN" | "MINGGUAN" | "BULANAN";
const PERIODE_LIST: Periode[] = ["HARIAN", "MINGGUAN", "BULANAN"];


type Ringkasan = {
  totalTerjual: number;
  totalPendapatan: number; 
  rataRata: number; 
};

const kosong: Ringkasan = { totalTerjual: 0, totalPendapatan: 0, rataRata: 0 };

function formatRingkas(angka: number) {
  if (angka >= 1_000_000) {
    return `Rp ${(angka / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (angka >= 1_000) {
    return `Rp ${Math.round(angka / 1_000)}K`;
  }
  return `Rp ${angka}`;
}

export default function JumlahPenjualan() {
  const [periode, setPeriode] = useState<Periode>("HARIAN");
  const [data, setData] = useState<Ringkasan>(kosong);
  const [isLoading, setIsLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [draftDari, setDraftDari] = useState("");
  const [draftSampai, setDraftSampai] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");

      if (!tokoId) {
        setData(kosong);
        setIsLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({ periode: periode.toLowerCase() });
        if (dari) query.set("dari", dari);
        if (sampai) query.set("sampai", sampai);

        const res = await fetch(
          `http://localhost:3001/penjualan/toko/${tokoId}?${query.toString()}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.ok) {
          const json = await res.json();
          setData({
            totalTerjual: json.totalTerjual ?? 0,
            totalPendapatan: json.totalPendapatan ?? 0,
            rataRata: json.rataRata ?? 0,
          });
        } else {
          setData(kosong);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap nol
        console.warn("Data penjualan belum bisa diambil:", err);
        setData(kosong);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [periode, dari, sampai]);

  const terapkanFilter = () => {
    setDari(draftDari);
    setSampai(draftSampai);
    setShowFilter(false);
  };

  const resetFilter = () => {
    setDraftDari("");
    setDraftSampai("");
    setDari("");
    setSampai("");
    setShowFilter(false);
  };

  const adaFilter = !!(dari || sampai);

  return (
    <div className="min-h-screen bg-white md:pl-56">
      <Navbar variant="seller" />

      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-black">
          <Link href="/berandaprofile-seller">
            <ArrowLeft className="w-6 h-6 text-black" />
          </Link>
          <h1
            className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black uppercase`}
          >
            JUMLAH PENJUALAN
          </h1>
          <button>
            <MessageCircle className="w-6 h-6 text-black" />
          </button>
        </div>

        <div className="flex-1 w-full px-6 sm:px-10 py-8">
          <div className="w-full md:max-w-xl md:mx-auto">
            {/* Rentang waktu + filter */}
            <div className="flex items-center justify-between pb-3 border-b border-black">
              <p className="text-sm tracking-[0.25em] text-gray-600">RENTANG WAKTU</p>
              <button
                onClick={() => setShowFilter((s) => !s)}
                className={`text-sm font-bold tracking-[0.2em] ${
                  adaFilter ? "underline underline-offset-4" : ""
                }`}
              >
                FILTER
              </button>
            </div>

            {showFilter && (
              <div className="border border-black p-4 mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-gray-600 mb-1.5">
                      DARI
                    </label>
                    <input
                      type="date"
                      value={draftDari}
                      onChange={(e) => setDraftDari(e.target.value)}
                      className="w-full border border-black px-2 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-gray-600 mb-1.5">
                      SAMPAI
                    </label>
                    <input
                      type="date"
                      value={draftSampai}
                      onChange={(e) => setDraftSampai(e.target.value)}
                      className="w-full border border-black px-2 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={resetFilter}
                    className="border border-black py-2.5 text-[11px] font-semibold tracking-[0.2em] text-black"
                  >
                    RESET
                  </button>
                  <button
                    onClick={terapkanFilter}
                    className="bg-black text-white py-2.5 text-[11px] font-semibold tracking-[0.2em]"
                  >
                    TERAPKAN
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 border border-black mt-6 mb-8">
              {PERIODE_LIST.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`py-5 text-sm tracking-[0.2em] transition ${
                    i > 0 ? "border-l border-black" : ""
                  } ${periode === p ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="text-sm tracking-[0.25em] text-gray-600 mb-3">PERFORMA PENJUALAN</p>
            <h2 className={`${playfair.className} text-4xl font-bold text-black mb-10`}>
              History Produk
            </h2>

            {isLoading ? (
              <p className="text-center text-xs text-black/40 py-10 tracking-widest uppercase">
                Memuat data...
              </p>
            ) : (
              <div>
                <Row label="TOTAL PRODUK TERJUAL" value={`${data.totalTerjual.toLocaleString("en-US")} Unit`} />
                <Row label="TOTAL PENDAPATAN" value={formatRingkas(data.totalPendapatan)} />
                <Row
                  label={`RATA-RATA ${periode}`}
                  value={`${Math.round(data.rataRata).toLocaleString("en-US")} Unit`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-black/10">
      <span className="text-base tracking-wide text-black">{label}</span>
      <span className="text-base font-bold tracking-wide text-black">{value}</span>
    </div>
  );
}

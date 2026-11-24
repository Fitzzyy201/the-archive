"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type Metode = "BankTransfer" | "EWallet";

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function TarikDana() {
  const router = useRouter();

  const [saldo, setSaldo] = useState(0);
  const [nominal, setNominal] = useState("");
  const [metode, setMetode] = useState<Metode>("BankTransfer");
  const [noRekening, setNoRekening] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSaldo = async () => {
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");
      if (!tokoId) return;

      try {
        const res = await fetch(`http://localhost:3001/keuangan/toko/${tokoId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setSaldo(data.saldoToko ?? 0);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: saldo tetap 0
        console.warn("Saldo belum bisa diambil:", err);
      }
    };

    fetchSaldo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jumlah = Number(nominal) || 0;

    if (jumlah <= 0) {
      alert("Masukkan nominal penarikan yang valid.");
      return;
    }
    if (jumlah > saldo) {
      alert("Nominal melebihi saldo yang tersedia.");
      return;
    }
    if (!noRekening.trim() || !namaPemilik.trim()) {
      alert("Lengkapi nomor rekening dan nama pemilik rekening.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const tokoId = localStorage.getItem("tokoId");

      const res = await fetch("http://localhost:3001/keuangan/tarik-dana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tokoId: Number(tokoId),
          nominal: jumlah,
          metode,
          noRekening,
          namaPemilik,
        }),
      });

      if (res.ok) {
        alert("Permintaan penarikan dana berhasil diajukan!");
        router.push("/keuangan-seller");
      } else {
        alert("Gagal mengajukan penarikan dana.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] md:pl-56">
      <Navbar variant="seller" />

      {/* Main content */}
      <div className={`${jakarta.className} flex min-h-screen flex-col`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-8 py-5 border-b border-black">
          <Link href="/keuangan-seller">
            <ArrowLeft className="w-6 h-6 text-black" />
          </Link>
          <h1
            className={`${playfair.className} flex-1 text-center text-3xl font-bold tracking-wide text-black pr-6`}
          >
            TARIK DANA
          </h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-10 py-8">
          <form onSubmit={handleSubmit} className="w-full md:max-w-xl md:mx-auto">
            {/* Saldo */}
            <p className="text-sm tracking-[0.25em] text-gray-600 mb-3">SALDO SAAT INI</p>
            <p
              className={`${playfair.className} text-2xl font-bold text-black pb-5 mb-8 border-b border-black`}
            >
              {formatRupiah(saldo)}
            </p>

            {/* Nominal */}
            <label className="block text-sm tracking-[0.25em] text-gray-600 mb-3">
              NOMINAL PENARIKAN
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={nominal ? formatRupiah(Number(nominal)) : ""}
              onChange={(e) => setNominal(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Rp 0"
              className={`${playfair.className} w-full bg-white border-b border-gray-500 px-4 py-4 text-3xl text-black placeholder:text-gray-400 focus:outline-none focus:border-black mb-8`}
            />

            {/* Metode */}
            <p className="text-sm tracking-[0.25em] text-gray-600 mb-3">METODE PENARIKAN</p>
            <div className="grid grid-cols-2 border border-black mb-8">
              <button
                type="button"
                onClick={() => setMetode("BankTransfer")}
                className={`py-4 text-sm font-semibold tracking-[0.2em] transition ${
                  metode === "BankTransfer" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                BANK TRANSFER
              </button>
              <button
                type="button"
                onClick={() => setMetode("EWallet")}
                className={`py-4 text-sm font-semibold tracking-[0.2em] transition ${
                  metode === "EWallet" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                E-WALLET
              </button>
            </div>

            {/* Nomor rekening */}
            <label className="block text-sm tracking-[0.25em] text-gray-600 mb-3">
              NOMOR REKENING
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={noRekening}
              onChange={(e) => setNoRekening(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0000 0000 0000"
              className="w-full bg-white border-b border-gray-500 px-4 py-4 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black mb-8"
            />

            {/* Nama pemilik */}
            <label className="block text-sm tracking-[0.25em] text-gray-600 mb-3">
              NAMA PEMILIK REKENING
            </label>
            <input
              type="text"
              value={namaPemilik}
              onChange={(e) => setNamaPemilik(e.target.value)}
              placeholder="NAMA LENGKAP"
              className="w-full bg-white border-b border-gray-500 px-4 py-4 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-black mb-12"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-6 text-sm font-semibold tracking-[0.3em] hover:bg-black/85 transition disabled:opacity-40"
            >
              {isSubmitting ? "MEMPROSES..." : "TARIK SEKARANG"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

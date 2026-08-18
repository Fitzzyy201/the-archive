"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const saldoToko = 0;

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function TarikDana() {
  const router = useRouter();

  const [nominal, setNominal] = useState("");
  const [metode, setMetode] = useState<"BankTransfer" | "EWallet">("BankTransfer");
  const [noRekening, setNoRekening] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");

  const handleTarik = (e: React.FormEvent) => {
    e.preventDefault();

    const jumlah = Number(nominal) || 0;

    if (jumlah <= 0) {
      alert("Masukkan nominal penarikan yang valid.");
      return;
    }
    if (jumlah > saldoToko) {
      alert("Nominal melebihi saldo yang tersedia.");
      return;
    }
    if (!noRekening || !namaPemilik) {
      alert("Lengkapi nomor rekening dan nama pemilik rekening.");
      return;
    }

    const payload = { nominal: jumlah, metode, noRekening, namaPemilik };
    console.log("Tarik dana:", payload);
    alert("Permintaan penarikan dana berhasil diajukan!");

    // Nanti tinggal:
    // await fetch("http://localhost:3001/keuangan/tarik-dana", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ ...payload, tokoId: TOKO_ID }),
    // });

    router.push("/keuangan-seller");
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          TARIK DANA
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-8 md:flex md:justify-center">
        <form onSubmit={handleTarik} className="w-full md:max-w-md space-y-5">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 mb-1">
              SALDO SAAT INI
            </p>
            <p className="text-2xl font-bold text-black">{formatRupiah(saldoToko)}</p>
          </div>

        //ini buat nominal melda yg nulis

          <Field label="Nominal Penarikan">
            <input
              type="number"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              placeholder="Rp 0"
              className={inputClass} />
          </Field>

          <div>
            <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-700">
              METODE PENARIKAN
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetode("BankTransfer")}
                className={`py-3 rounded-md text-xs font-semibold tracking-wide transition ${
                  metode === "BankTransfer"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>
                BANK TRANSFER
              </button>
              <button
                type="button"
                onClick={() => setMetode("EWallet")}
                className={`py-3 rounded-md text-xs font-semibold tracking-wide transition ${
                  metode === "EWallet"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>

                E-WALLET
              </button>
            </div>
          </div>

          <Field label="Nomor Rekening">
            <input
              type="text"
              value={noRekening}
              onChange={(e) => setNoRekening(e.target.value)}
              placeholder="0000 0000 0000"
              className={inputClass} />
          </Field>

          <Field label="Nama Pemilik Rekening">
            <input
              type="text"
              value={namaPemilik}
              onChange={(e) => setNamaPemilik(e.target.value)}
              placeholder="Nama Lengkap"
              className={inputClass} />
          </Field>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-3.5 font-medium tracking-wide hover:bg-gray-900 transition mt-4">
            TARIK SEKARANG
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border-b border-gray-300 px-1 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide mb-1.5 text-gray-700">
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}
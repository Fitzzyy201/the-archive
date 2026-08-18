"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function UbahProfilSeller() {
  // Data awal — nanti diganti fetch dari backend (data toko yang lagi login)
  const [fotoProfil, setFotoProfil] = useState<File | null>(null);
  const [namaToko, setNamaToko] = useState("");
  const [noHp, setNoHp] = useState("");
  const [kota, setKota] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      namaToko,
      noHp,
      kota,
      email,
      // fotoProfil: di uploadnya pisah ye ini melda yg nulis ya
    };

    console.log("Update profil toko:", payload);
    alert("Profil berhasil diperbarui!");

   
  };

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
     
      <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
        <Link href="/profile-seller" className="absolute left-4 sm:left-8">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          INFORMASI TOKO
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-8 md:flex md:justify-center">
        <div className="w-full md:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
         
            <div className="flex flex-col items-center">
              <label className="relative w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:border-black transition group">
                {fotoProfil ? (
                  <img
                    src={URL.createObjectURL(fotoProfil)}
                    alt="Foto profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-gray-300 group-hover:text-gray-400 transition" />
                )}
                <div className="absolute bottom-0 right-0 bg-black text-white rounded-full p-1.5">
                  <Camera className="w-3 h-3" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFotoProfil(e.target.files ? e.target.files[0] : null)
                  }
                />
              </label>
              <p className="text-xs text-gray-400 mt-2 tracking-wide">ADD PHOTO PROFILE</p>
            </div>

            {/* Form fields */}
            <Field label="Nama Toko">
              <input
                type="text"
                value={namaToko}
                onChange={(e) => setNamaToko(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="No Toko">
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Kota">
              <input
                type="text"
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              className="w-full bg-black text-white rounded-md py-3.5 font-medium tracking-wide hover:bg-gray-900 transition mt-4"
            >
              SELESAI
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border-b border-gray-300 px-1 py-2 text-sm font-semibold text-black focus:outline-none focus:border-black transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide mb-1.5 text-gray-500">
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}
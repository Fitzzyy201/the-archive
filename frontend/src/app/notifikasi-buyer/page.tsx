"use client";

import Navbar from "@/components/Navbar";
import { Bell } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
}); 

export default function NotifikasiSellerPage() {
  return (
    <main
      className={`${inter.className} min-h-screen w-full bg-white text-black`}
    >
      <Navbar />

      <section className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center px-6">
        <div className="flex w-full max-w-[1000px] flex-col items-center justify-center text-center">

         
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-black/10 bg-[#FAF9F6]">
            <Bell
              size={28}
              strokeWidth={1.2}
              className="text-black/45"
            />
          </div>

    
          <h1
            className={`${playfair.className} text-3xl font-semibold tracking-tight`}
          >
            No Notifications
          </h1>

          
          <p className="mt-3 max-w-md text-[11px] leading-relaxed tracking-wide text-black/45">
            Belum ada notifikasi untuk saat ini.
            <br />
            Notifikasi aktivitas seller akan muncul di sini.
          </p>

        </div>
      </section>
    </main>
  );
}
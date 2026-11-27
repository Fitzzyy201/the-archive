"use client";

import Navbar from "@/components/Navbar";
import { Bell } from "lucide-react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function NotifikasiBuyerPage() {
  return (
    <main className={`${jakarta.className} min-h-screen w-full flex flex-col bg-[#FAF9F6] text-black selection:bg-black selection:text-white`}>
      {/* NAVBAR - announcement ribbon disembunyikan */}
      <div className="[&>header>div:first-child]:hidden">
        <Navbar />
      </div>

      {/* MAIN CONTENT */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 md:py-14">
        <div className="flex w-full max-w-md flex-col items-center justify-center text-center">
          {/* NOTIFICATION ICON */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <Bell size={20} strokeWidth={1.5} className="text-black/30" />
          </div>

          {/* PAGE TITLE */}
          <h1 className={`${playfair.className} text-2xl md:text-3xl font-medium text-black`}>
            Notifications
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-3 text-[11px] sm:text-xs leading-relaxed text-black/40 font-medium tracking-wide">
            Your inbox is currently empty.
            <br />
            Updates on your purchases and account activity will appear here.
          </p>

          <div className="w-10 h-px bg-black/10 mt-8 mb-8" />

          <button
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white text-[10px] font-semibold tracking-[0.2em] uppercase rounded-sm hover:bg-gray-900 transition-all shadow-sm"
          >
            Continue Browsing
          </button>
        </div>
      </section>
    </main>
  );
}

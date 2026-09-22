"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

interface SellerProfile {
  id?: number;
  username?: string;
  nama?: string;
  name?: string;
  email?: string;
  no_hp?: string;
  phone?: string;
  foto?: string;
  foto_profil?: string;
  profile_picture?: string;
}

export default function ProfileSellerPage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setProfile(null);
          return;
        }

        const response = await fetch(
          "http://localhost:3001/auth/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data profile");
        }

        const data = await response.json();

        setProfile(data);
      } catch (error) {
        console.error("Error mengambil profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const nama =
    profile?.nama ||
    profile?.name ||
    profile?.username ||
    "";

  const email = profile?.email || "";

  const phone =
    profile?.no_hp ||
    profile?.phone ||
    "";

  const foto =
    profile?.foto ||
    profile?.foto_profil ||
    profile?.profile_picture ||
    "";

  return (
    <main
      className={`${inter.className} min-h-screen w-full bg-[#FAFAF8] text-black`}
    >
      <Navbar />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1100px] items-center justify-center px-5 py-12 md:px-8 lg:py-16">
        <div className="w-full max-w-[650px]">

          {/* PROFILE */}
          <div className="flex flex-col items-center text-center">

            {/* FOTO PROFILE */}
            <div className="relative mb-6">
              <div className="absolute -inset-3 rounded-full bg-[#EEF4FF] blur-xl opacity-70" />

              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#F0F0EE] md:h-32 md:w-32">
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-black/5" />
                ) : foto ? (
                  <img
                    src={foto}
                    alt={nama || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={38}
                    strokeWidth={1}
                    className="text-black/25"
                  />
                )}
              </div>
            </div>

            {/* NAMA */}
            <h1
              className={`${playfair.className} min-h-[42px] text-3xl font-semibold tracking-tight md:text-4xl`}
            >
              {loading ? (
                <span className="inline-block h-8 w-40 animate-pulse rounded bg-black/5" />
              ) : (
                nama || "Nama belum tersedia"
              )}
            </h1>

            {/* EMAIL */}
            <p className="mt-3 min-h-[16px] text-[10px] font-medium uppercase tracking-[0.18em] text-black/45 md:text-[11px]">
              {loading ? (
                <span className="inline-block h-3 w-52 animate-pulse rounded bg-black/5" />
              ) : (
                email || "Email belum tersedia"
              )}
            </p>

            {/* NOMOR */}
            <p className="mt-1 min-h-[16px] text-[10px] tracking-[0.15em] text-black/40 md:text-[11px]">
              {loading ? (
                <span className="inline-block h-3 w-28 animate-pulse rounded bg-black/5" />
              ) : (
                phone || "Nomor belum tersedia"
              )}
            </p>
          </div>

          {/* BUTTON */}
          <div className="mt-10 space-y-3">

            {/* MY PACKET */}
            <Link
              href="/my-packet"
              className="group flex min-h-[62px] w-full items-center justify-between rounded-[4px] bg-black px-5 text-white transition-all duration-300 hover:bg-[#171717] md:px-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center">
                  <Package
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

                <span className="text-[10px] font-semibold tracking-[0.18em] md:text-[11px]">
                  MY PACKET
                </span>
              </div>

              <ArrowRight
                size={17}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {/* UBAH PROFIL */}
            <Link
              href="/profile-seller/edit"
              className="group flex min-h-[62px] w-full items-center justify-between rounded-[4px] border border-black/10 bg-white px-5 text-black shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-black/20 hover:shadow-[0_12px_35px_rgba(0,0,0,0.07)] md:px-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center">
                  <UserRound
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

                <span className="text-[10px] font-semibold tracking-[0.18em] md:text-[11px]">
                  UBAH PROFIL
                </span>
              </div>

              <ArrowRight
                size={17}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* DIVIDER */}
          <div className="mt-12 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/10" />

            <div className="h-1.5 w-1.5 rotate-45 bg-black/25" />

            <div className="h-px flex-1 bg-black/10" />
          </div>

          <p className="mt-6 text-center text-[8px] uppercase tracking-[0.28em] text-black/20">
            The Archive · Buyer Profile
          </p>
        </div>
      </section>
    </main>
  );
}
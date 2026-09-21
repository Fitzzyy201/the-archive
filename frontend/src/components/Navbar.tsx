"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  MessageCircle,
  ShoppingBag,
  Home,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export const BUYER_NAV_ITEMS = [
  { href: "/", icon: Home, label: "BERANDA" },
  { href: "/notifikasi", icon: Bell, label: "NOTIFICATION" },
  { href: "/profile", icon: User, label: "PROFILE" },
];

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("tokoId");

      window.location.href = "/";
    }
  };

  return (
    <header className={`${inter.className} w-full flex flex-col`}>
      {/* 1. TOP ARCHIVAL ANNOUNCEMENT RIBBON */}
      <div className="w-full bg-[#F5F2EB] border-b border-black/10 text-black/60 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase py-2 px-4 sm:px-8 flex justify-between items-center font-mono select-none">
        <span className="hidden md:inline-block">
          THE ARCHIVE · VOL. 01 / 2024
        </span>
        <span className="mx-auto md:mx-0 tracking-[0.25em] font-medium text-black/70">
          CURATED ARCHIVE & TIMELESS GOODS
        </span>
        <span className="hidden lg:inline-block text-black/40">
          WORLDWIDE CURATION · IDR
        </span>
      </div>

      {/* 2. DESKTOP TOP HORIZONTAL NAVBAR (Hidden on Mobile) */}
      <div className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between gap-6">
          {/* Left: Navigation Menu */}
          <nav className="flex items-center gap-7">
            {BUYER_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative text-[11px] tracking-[0.2em] font-medium transition-colors uppercase py-1 ${
                    isActive
                      ? "text-black font-semibold"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-[1.5px] bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Center: Brand Masthead (Vintage Editorial Centerpiece) */}
          <div className="text-center shrink-0">
            <Link href="/" className="inline-flex flex-col items-center group">
              <span
                className={`${playfair.className} text-2xl lg:text-3xl font-bold tracking-tight text-black group-hover:opacity-85 transition leading-none`}
              >
                The Archive
              </span>
              <span
                className={`${mono.className} text-[8px] tracking-[0.35em] text-black/40 uppercase mt-1 group-hover:text-black/60 transition`}
              >
                Curated Selection
              </span>
            </Link>
          </div>

          {/* Right: Search & Action Utilities */}
          <div className="flex items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex items-center border border-black/15 hover:border-black/40 focus-within:border-black rounded-sm px-3 py-1.5 bg-[#FAF9F6] transition w-44 lg:w-56">
              <Search className="w-3.5 h-3.5 text-black/40 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="SEARCH CATALOGUE..."
                className={`${mono.className} w-full text-[10px] tracking-[0.08em] placeholder:text-black/30 outline-none bg-transparent text-black uppercase`}
              />
            </div>

            {/* Buka Toko Button */}
            <Link
              href="/daftar-seller"
              className={`${mono.className} text-[10px] font-semibold tracking-[0.15em] border border-black/20 hover:border-black hover:bg-black hover:text-white rounded-sm px-3.5 py-2 transition text-black whitespace-nowrap`}
            >
              BUKA TOKO
            </Link>

            {/* Login / Auth & Logout Area */}
            {!isLoggedIn ? (
              <Link
                href="/login"
                className={`${mono.className} text-[10px] font-semibold tracking-[0.15em] bg-black text-white rounded-sm px-4 py-2 hover:bg-black/85 transition whitespace-nowrap`}
              >
                LOGIN
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={`${mono.className} text-[10px] font-semibold tracking-[0.15em] bg-black text-white rounded-sm px-3.5 py-2 hover:bg-black/85 transition flex items-center gap-1.5 whitespace-nowrap`}
                >
                  <User className="w-3.5 h-3.5" /> AKUN
                </Link>
                <button
                  onClick={handleLogout}
                  title="Keluar Akun"
                  className={`${mono.className} text-[10px] font-semibold tracking-[0.15em] border border-black/20 hover:border-black hover:bg-black hover:text-white rounded-sm px-2.5 py-2 transition text-black flex items-center justify-center`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Action Icons */}
            <Link
              href="/pesan"
              className="flex items-center justify-center w-8 h-8 border border-black/15 rounded-sm hover:border-black hover:bg-black/5 transition text-black/70 hover:text-black"
              title="Pesan"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>

            <Link
              href="/cart-buyer"
              className="flex items-center justify-center w-8 h-8 border border-black/15 rounded-sm hover:border-black hover:bg-black/5 transition text-black/70 hover:text-black"
              title="Keranjang"
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MOBILE TOP HEADER BAR (Only for < md) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <Link href="/" className="flex flex-col">
            <span
              className={`${playfair.className} text-xl font-bold text-black leading-none`}
            >
              The Archive
            </span>
            <span
              className={`${mono.className} text-[7px] tracking-[0.3em] text-black/40 uppercase mt-0.5`}
            >
              Curated Selection
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/daftar-seller"
              className={`${mono.className} text-[9px] font-medium tracking-wider border border-black/15 px-2.5 py-1.5 rounded-sm text-black hover:bg-black hover:text-white transition`}
            >
              BUKA TOKO
            </Link>
            {!isLoggedIn ? (
              <Link
                href="/login"
                className={`${mono.className} text-[9px] font-medium tracking-wider bg-black text-white px-3 py-1.5 rounded-sm`}
              >
                LOGIN
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/profile"
                  className={`${mono.className} text-[9px] font-medium tracking-wider bg-black text-white px-2.5 py-1.5 rounded-sm flex items-center gap-1`}
                >
                  <User className="w-3 h-3" /> AKUN
                </Link>
                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className={`${mono.className} text-[9px] font-medium border border-black/20 text-black px-2 py-1.5 rounded-sm hover:bg-black hover:text-white transition flex items-center justify-center`}
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search & Quick Icon Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center border border-black/15 rounded-sm px-3 py-2 bg-[#FAF9F6]">
            <Search className="w-3.5 h-3.5 text-black/30 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="SEARCH CATALOGUE..."
              className={`${mono.className} w-full text-[10px] tracking-[0.05em] uppercase placeholder:text-black/30 outline-none bg-transparent text-black`}
            />
          </div>
          <Link
            href="/pesan"
            className="w-8 h-8 flex items-center justify-center border border-black/15 rounded-sm text-black/60 shrink-0 hover:bg-black/5 transition"
            title="Pesan"
          >
            <MessageCircle className="w-4 h-4" />
          </Link>
          <Link
            href="/cart-buyer"
            className="w-8 h-8 flex items-center justify-center border border-black/15 rounded-sm text-black/60 shrink-0 hover:bg-black/5 transition"
            title="Keranjang"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION (Intact & preserved for mobile view < md) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black flex items-center justify-around py-3 border-t border-white/10 shadow-2xl">
        {BUYER_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 cursor-pointer transition px-4 py-1 ${
                isActive
                  ? "text-white font-semibold opacity-100"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
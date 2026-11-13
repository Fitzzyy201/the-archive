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
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
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

export const ADMIN_NAV_ITEMS = [
  { href: "/admin-dashboard", icon: Home, label: "OVERVIEW" },
  { href: "/admin-verifikasi", icon: ShieldCheck, label: "VERIFIKASI" },
  { href: "/admin-users", icon: Users, label: "USERS" },
  { href: "/admin-laporan", icon: FileText, label: "LAPORAN" },
  { href: "/admin-komplain", icon: AlertTriangle, label: "KOMPLAIN" },
];

const NAV_ALIASES: Record<string, string[]> = {
  "/admin-dashboard": ["/dashboard-admin"],
  "/admin-laporan": ["/admin-monthly-report"],
};

function isNavItemActive(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;

  return (NAV_ALIASES[href] ?? []).some(
    (alias) => pathname === alias || pathname.startsWith(`${alias}/`)
  );
}

interface NavbarProps {
  onSearch?: (query: string) => void;
  variant?: "buyer" | "admin";
}

export default function Navbar({ onSearch, variant = "buyer" }: NavbarProps) {
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
      
      // Refresh total ke halaman utama
      window.location.href = "/";
    }
  };

  if (variant === "admin") {
    return (
      <>
        {/* ADMIN DESKTOP SIDEBAR (lg and up) */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-black text-white">
          <div className="border-b border-white/10 px-6 pb-6 pt-8">
            <p
              className={`${mono.className} text-[9px] uppercase tracking-[0.3em] text-white/50`}
            >
              Management
            </p>
            <p
              className={`${playfair.className} mt-2 text-lg font-bold tracking-[0.12em] text-white`}
            >
              ADMIN PORTAL
            </p>
          </div>

          <nav
            aria-label="Navigasi admin"
            className="flex-1 overflow-y-auto py-3"
          >
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-6 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                    isActive
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <item.icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      className="ml-auto h-1.5 w-1.5 bg-white"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-6 py-5">
            <p
              className={`${mono.className} text-[8px] uppercase tracking-[0.22em] text-white/50`}
            >
              The Archive / Admin
            </p>
          </div>
        </aside>

        {/* ADMIN MOBILE/TABLET BOTTOM NAVIGATION (below lg) */}
        <nav
          aria-label="Navigasi admin"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <div className="flex h-16 items-stretch">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex min-w-0 flex-1 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                    isActive ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  <span
                    className={`absolute inset-x-4 top-0 h-[2px] ${
                      isActive ? "bg-white" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  <item.icon
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

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
              href="/keranjang"
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
            href="/keranjang"
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
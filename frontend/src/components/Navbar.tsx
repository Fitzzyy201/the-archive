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
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const BUYER_NAV_ITEMS = [
  { href: "/", icon: Home, label: "BERANDA" },
  { href: "/notifikasi", icon: Bell, label: "NOTIFICATION" },
  { href: "/profile-buyer", icon: User, label: "PROFILE" },
];

export const ADMIN_NAV_ITEMS = [
  { href: "/admin-dashboard", icon: Home, label: "OVERVIEW" },
  { href: "/admin-verifikasi", icon: ShieldCheck, label: "VERIFIKASI" },
  { href: "/admin-users", icon: Users, label: "USERS" },
  { href: "/admin-finance", icon: Wallet, label: "FINANCE" },
  { href: "/admin-monthly-report", icon: FileText, label: "LAPORAN" },
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token && variant === "buyer") {
        fetch(`${API_BASE}/notification/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setUnreadCount(data.count ?? 0))
          .catch(() => {});
      }
    });
  }, [pathname, variant]);

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

  if (variant === "admin") {
    return (
      <>
        {/* ADMIN DESKTOP SIDEBAR (lg and up) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-black text-white lg:flex">
          <div className="border-b border-white/10 px-6 pb-7 pt-8">
            <p
              className={`${mono.className} text-[8px] uppercase tracking-[0.32em] text-white/45`}
            >
              Management
            </p>
            <p
              className={`${playfair.className} mt-2.5 text-xl font-bold leading-none tracking-[0.1em] text-white`}
            >
              ADMIN PORTAL
            </p>
            <span className="mt-5 block h-px w-10 bg-white/25" aria-hidden="true" />
          </div>

          <nav
            aria-label="Navigasi admin"
            className="flex-1 overflow-y-auto px-3 py-4"
          >
            <p
              className={`${mono.className} mb-2 px-3 text-[8px] uppercase tracking-[0.24em] text-white/30`}
            >
              Workspace
            </p>

            <div className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-3 text-[10px] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                      isActive
                        ? "bg-white/10 font-semibold text-white"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-2 left-0 w-[2px] transition-colors ${
                        isActive ? "bg-white" : "bg-transparent"
                      }`}
                    />
                    <item.icon
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 bg-white"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 px-6 py-5">
            <p
              className={`${mono.className} text-[8px] uppercase tracking-[0.22em] text-white/50`}
            >
              The Archive / Admin
            </p>
            <p
              className={`${mono.className} mt-1.5 text-[7px] uppercase tracking-[0.18em] text-white/25`}
            >
              Management Console
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
                    isActive ? "text-white" : "text-white/40 hover:text-white/75"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 top-0 h-[2px] transition-colors ${
                      isActive ? "bg-white" : "bg-transparent"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center transition-colors ${
                      isActive ? "bg-white/10" : ""
                    }`}
                  >
                    <item.icon
                      className="h-5 w-5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>
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
    <header className={`${inter.className} flex w-full flex-col`}>
      {/* 1. TOP ARCHIVAL ANNOUNCEMENT RIBBON */}
      <div className="w-full select-none border-b border-black/10 bg-[#F5F2EB] text-black/60">
        <div
          className={`${mono.className} mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-2 text-[9px] uppercase tracking-[0.2em] sm:px-8 sm:text-[10px] lg:px-10 xl:px-12`}
        >
          <span className="hidden truncate md:block">
            THE ARCHIVE · VOL. 01 / 2024
          </span>
          <span className="truncate text-center font-medium tracking-[0.25em] text-black/70">
            CURATED ARCHIVE & TIMELESS GOODS
          </span>
          <span className="hidden truncate text-right text-black/40 lg:block">
            WORLDWIDE CURATION · IDR
          </span>
        </div>
      </div>

      {/* 2. DESKTOP TOP HORIZONTAL NAVBAR (Hidden on Mobile) */}
      <div className="sticky top-0 z-40 hidden border-b border-black/10 bg-white/95 backdrop-blur-md transition-all md:block">
        <div className="mx-auto max-w-[1440px] px-5 py-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between gap-4 lg:gap-5">
          {/* Left: Navigation Menu */}
          <nav
            aria-label="Navigasi utama"
            className="flex items-center gap-4 lg:gap-7"
          >
            {BUYER_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative whitespace-nowrap py-1 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors lg:text-[11px] lg:tracking-[0.2em] ${
                    isActive
                      ? "font-semibold text-black"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  {item.label}
                  {item.href === "/notifikasi" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1.5px] bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Center: Brand Masthead (Vintage Editorial Centerpiece) */}
          <div className="shrink-0 text-center">
            <Link href="/" className="group inline-flex flex-col items-center">
              <span
                className={`${playfair.className} text-lg font-bold leading-none tracking-tight text-black transition group-hover:opacity-85 lg:text-2xl xl:text-3xl`}
              >
                The Archive
              </span>
              <span
                className={`${mono.className} mt-1 text-[7px] uppercase tracking-[0.32em] text-black/40 transition group-hover:text-black/60 lg:text-[8px]`}
              >
                Curated Selection
              </span>
            </Link>
          </div>

          {/* Right: Search & Action Utilities */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Search Input Box */}
            <div className="relative hidden w-32 items-center rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-1.5 transition hover:border-black/40 focus-within:border-black lg:flex lg:w-40 xl:w-56">
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="SEARCH CATALOGUE..."
                aria-label="Cari katalog"
                className={`${mono.className} w-full min-w-0 bg-transparent text-[10px] uppercase tracking-[0.08em] text-black outline-none placeholder:text-black/30`}
              />
            </div>

            {/* Buka Toko Button */}
            <Link
              href="/daftar-seller"
              className={`${mono.className} hidden whitespace-nowrap rounded-sm border border-black/20 px-3 py-1.5 text-[9px] font-semibold tracking-[0.14em] text-black transition hover:border-black hover:bg-black hover:text-white lg:inline-flex lg:px-3.5 lg:py-2 lg:text-[10px]`}
            >
              BUKA TOKO
            </Link>

            {/* Login / Auth & Logout Area */}
            {!isLoggedIn ? (
              <Link
                href="/login"
                className={`${mono.className} whitespace-nowrap rounded-sm bg-black px-3 py-1.5 text-[9px] font-semibold tracking-[0.14em] text-white transition hover:bg-black/85 lg:px-4 lg:py-2 lg:text-[10px]`}
              >
                LOGIN
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Link
                  href="/profile-buyer"
                  className={`${mono.className} flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-black px-3 py-1.5 text-[9px] font-semibold tracking-[0.14em] text-white transition hover:bg-black/85 lg:px-3.5 lg:py-2 lg:text-[10px]`}
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" /> AKUN
                </Link>
                <button
                  onClick={handleLogout}
                  title="Keluar Akun"
                  aria-label="Keluar akun"
                  className={`${mono.className} flex items-center justify-center rounded-sm border border-black/20 px-2 py-1.5 text-[10px] font-semibold tracking-[0.15em] text-black transition hover:border-black hover:bg-black hover:text-white lg:px-2.5 lg:py-2`}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Quick Action Icons */}
            <Link
              href="/pesan"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/15 text-black/70 transition hover:border-black hover:bg-black/5 hover:text-black lg:flex"
              title="Pesan"
              aria-label="Pesan"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/cart-buyer"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/15 text-black/70 transition hover:border-black hover:bg-black/5 hover:text-black lg:flex"
              title="Keranjang"
              aria-label="Keranjang"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          </div>

          {/* Tablet utility row */}
          <div className="mt-3 flex items-center gap-2 lg:hidden">
            <div className="flex flex-1 items-center rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-2 transition-colors focus-within:border-black">
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="SEARCH CATALOGUE..."
                aria-label="Cari katalog"
                className={`${mono.className} w-full min-w-0 bg-transparent text-[10px] uppercase tracking-[0.08em] text-black outline-none placeholder:text-black/30`}
              />
            </div>
            <Link
              href="/daftar-seller"
              className={`${mono.className} whitespace-nowrap rounded-sm border border-black/20 px-3 py-2 text-[9px] font-semibold tracking-[0.14em] text-black transition hover:border-black hover:bg-black hover:text-white`}
            >
              BUKA TOKO
            </Link>
            <Link
              href="/pesan"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/15 text-black/60 transition hover:border-black hover:bg-black/5"
              title="Pesan"
              aria-label="Pesan"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cart-buyer"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/15 text-black/60 transition hover:bg-black/5"
              title="Keranjang"
              aria-label="Keranjang"
            >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>

    {/* 3. MOBILE TOP HEADER BAR (Only for < md) */}
      <div className="sticky top-0 z-40 border-b border-black/10 bg-white/95 px-4 py-3.5 backdrop-blur-md md:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 flex-col">
            <span
              className={`${playfair.className} truncate text-xl font-bold leading-none text-black`}
            >
              The Archive
            </span>
            <span
              className={`${mono.className} mt-1 text-[7px] uppercase tracking-[0.3em] text-black/40`}
            >
              Curated Selection
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/daftar-seller"
              className={`${mono.className} rounded-sm border border-black/15 px-2.5 py-1.5 text-[9px] font-medium tracking-wider text-black transition hover:bg-black hover:text-white`}
            >
              BUKA TOKO
            </Link>
            {!isLoggedIn ? (
              <Link
                href="/login"
                className={`${mono.className} rounded-sm bg-black px-3 py-1.5 text-[9px] font-medium tracking-wider text-white`}
              >
                LOGIN
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/profile-buyer"
                  className={`${mono.className} flex items-center gap-1 rounded-sm bg-black px-2.5 py-1.5 text-[9px] font-medium tracking-wider text-white`}
                >
                  <User className="h-3 w-3" aria-hidden="true" /> AKUN
                </Link>
                <button
                  onClick={handleLogout}
                  title="Keluar"
                  aria-label="Keluar akun"
                  className={`${mono.className} flex items-center justify-center rounded-sm border border-black/20 px-2 py-1.5 text-[9px] font-medium text-black transition hover:bg-black hover:text-white`}
                >
                  <LogOut className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search & Quick Icon Row */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-2">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-black/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="SEARCH CATALOGUE..."
              aria-label="Cari katalog"
              className={`${mono.className} w-full min-w-0 bg-transparent text-[10px] uppercase tracking-[0.05em] text-black outline-none placeholder:text-black/30`}
            />
          </div>
          <Link
            href="/pesan"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/15 text-black/60 transition hover:bg-black/5"
            title="Pesan"
            aria-label="Pesan"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/cart-buyer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/15 text-black/60 transition hover:bg-black/5"
            title="Keranjang"
            aria-label="Keranjang"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION (Intact & preserved for mobile view < md) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black pb-[env(safe-area-inset-bottom)] shadow-2xl md:hidden">
        <div className="flex h-16 items-stretch">
          {BUYER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? "font-semibold text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-5 top-0 h-[2px] transition-colors ${
                    isActive ? "bg-white" : "bg-transparent"
                  }`}
                />
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.href === "/notifikasi" && unreadCount > 0 && (
                  <span className="absolute top-2 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span className="text-[8px] uppercase tracking-[0.14em]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

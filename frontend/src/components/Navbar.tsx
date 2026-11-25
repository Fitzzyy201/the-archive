"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  MessageCircle,
  ShoppingBag,
  Home,
  Package,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Users,
  FileText,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import {
  Playfair_Display,
  Inter,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const BUYER_NAV_ITEMS = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/notifikasi", icon: Bell, label: "Notification" },
  { href: "/profile-buyer", icon: User, label: "Profile" },
];

export const ADMIN_NAV_ITEMS = [
  { href: "/admin-dashboard", icon: Home, label: "OVERVIEW" },
  { href: "/admin-verifikasi", icon: ShieldCheck, label: "VERIFIKASI" },
  { href: "/admin-users", icon: Users, label: "USERS" },
  { href: "/admin-finance", icon: Wallet, label: "FINANCE" },
  { href: "/admin-monthly-report", icon: FileText, label: "LAPORAN" },
  { href: "/admin-komplain", icon: AlertTriangle, label: "KOMPLAIN" },
];

export const SELLER_NAV_ITEMS = [
  { href: "/beranda-seller", icon: Home, label: "Beranda" },
  { href: "/produk-seller", icon: Package, label: "Produk" },
  { href: "/pesanan-seller", icon: ShoppingBag, label: "Pesanan" },
  { href: "/berandaprofile-seller", icon: User, label: "Profil" },
];

const NAV_ALIASES: Record<string, string[]> = {
  "/admin-dashboard": ["/dashboard-admin"],
  "/admin-laporan": ["/admin-monthly-report"],
  "/produk-seller": ["/review-produk", "/tambah-produk", "/edit-produk"],
};

function isNavItemActive(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;

  return (NAV_ALIASES[href] ?? []).some(
    (alias) => pathname === alias || pathname.startsWith(`${alias}/`)
  );
}

interface NavbarProps {
  onSearch?: (query: string) => void;
  variant?: "buyer" | "admin" | "seller";
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

  if (variant === "seller") {
    return (
      <>
        {/* SELLER DESKTOP SIDEBAR (md and up) */}
        <aside
          className={`${jakarta.className} fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-black text-white md:flex`}
        >
          <div className="border-b border-white/10 px-6 pb-6 pt-7">
            <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-white/40">
              Seller Panel
            </p>
            <Link href="/beranda-seller" className="mt-2 block">
              <span
                className={`${playfair.className} text-[22px] font-bold leading-none tracking-tight text-white`}
              >
                The Archive
              </span>
            </Link>
            <span className="mt-4 block h-px w-8 bg-white/25" aria-hidden="true" />
          </div>

          <nav
            aria-label="Navigasi seller"
            className="flex-1 overflow-y-auto px-3 py-5"
          >
            <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-white/30">
              Toko
            </p>

            <div className="space-y-1">
              {SELLER_NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-3 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                      isActive
                        ? "bg-white/10 font-semibold text-white"
                        : "font-medium text-white/50 hover:bg-white/[0.06] hover:text-white"
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
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 px-6 py-5">
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/45">
              The Archive / Seller
            </p>
            <p className="mt-1.5 text-[7px] uppercase tracking-[0.18em] text-white/25">
              Store Management
            </p>
          </div>
        </aside>

        {/* SELLER MOBILE BOTTOM NAVIGATION (below md) */}
        <nav
          aria-label="Navigasi seller"
          className={`${jakarta.className} fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black pb-[env(safe-area-inset-bottom)] md:hidden`}
        >
          <div className="flex h-16 items-stretch">
            {SELLER_NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                    isActive ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-5 top-0 h-[2px] transition-colors ${
                      isActive ? "bg-white" : "bg-transparent"
                    }`}
                  />
                  <item.icon
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  return (
    <header className={`${jakarta.className} flex w-full flex-col`}>
      {/* 1. DESKTOP TOP HORIZONTAL NAVBAR (Hidden on Mobile) */}
      <div className="sticky top-0 z-40 hidden border-b border-black/10 bg-white/95 backdrop-blur-md transition-all md:block">
        <div className="mx-auto max-w-[1440px] px-5 py-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="relative flex items-center justify-between gap-4">
            {/* Left: Navigation Menu */}
            <nav
              aria-label="Navigasi utama"
              className="flex items-center gap-5 lg:gap-6"
            >
              {BUYER_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative whitespace-nowrap py-1 text-[12px] font-medium transition-colors lg:text-[13px] ${
                      isActive
                        ? "text-black"
                        : "text-black/45 hover:text-black"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-black transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Center: Brand Masthead */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
              <Link
                href="/"
                className="pointer-events-auto inline-flex flex-col items-center"
              >
                <span
                  className={`${playfair.className} text-xl font-bold leading-none tracking-tight text-black transition-opacity hover:opacity-75 lg:text-2xl xl:text-[26px]`}
                >
                  The Archive
                </span>
                <span
                  className={`${jakarta.className} mt-1 text-[8px] uppercase tracking-[0.24em] text-black/35`}
                >
                  Curated Selection
                </span>
              </Link>
            </div>

            {/* Right: Search & Action Utilities */}
            <div className="flex items-center justify-end gap-2">
            {/* Search Input Box */}
            <div className="relative hidden items-center rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-1.5 transition-colors hover:border-black/35 focus-within:border-black lg:flex lg:w-28 xl:w-48">
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search catalogue"
                aria-label="Cari katalog"
                className="w-full min-w-0 bg-transparent text-[11px] text-black outline-none placeholder:text-black/35"
              />
            </div>

            {/* Buka Toko Button */}
            <Link
              href="/daftar-seller"
              className="hidden whitespace-nowrap rounded-sm border border-black/20 px-3 py-1.5 text-[11px] font-medium text-black transition hover:border-black hover:bg-black hover:text-white lg:inline-flex lg:px-3.5 lg:py-2"
            >
              Buka Toko
            </Link>

            {/* Login / Auth & Logout Area */}
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="whitespace-nowrap rounded-sm bg-black px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-black/85 lg:px-4 lg:py-2"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Link
                  href="/profile-buyer"
                  className={`${mono.className} flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-black px-3 py-1.5 text-[9px] font-semibold tracking-[0.14em] text-white transition hover:bg-black/85 lg:px-3.5 lg:py-2 lg:text-[10px]`}
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" /> Akun
                </Link>
                <button
                  onClick={handleLogout}
                  title="Keluar Akun"
                  aria-label="Keluar akun"
                  className="flex items-center justify-center rounded-sm border border-black/20 px-2 py-1.5 text-black transition hover:border-black hover:bg-black hover:text-white lg:px-2.5 lg:py-2"
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
                placeholder="Search catalogue"
                aria-label="Cari katalog"
                className="w-full min-w-0 bg-transparent text-[11px] text-black outline-none placeholder:text-black/35"
              />
            </div>
            <Link
              href="/daftar-seller"
              className="whitespace-nowrap rounded-sm border border-black/20 px-3 py-2 text-[11px] font-medium text-black transition hover:border-black hover:bg-black hover:text-white"
            >
              Buka Toko
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

      {/* 2. MOBILE TOP HEADER BAR (Only for < md) */}
      <div className="sticky top-0 z-40 border-b border-black/10 bg-white/95 px-4 py-3.5 backdrop-blur-md md:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 flex-col">
            <span
              className={`${playfair.className} truncate text-xl font-bold leading-none text-black`}
            >
              The Archive
            </span>
            <span
              className={`${jakarta.className} mt-1 text-[8px] uppercase tracking-[0.24em] text-black/35`}
            >
              Curated Selection
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/daftar-seller"
              className="rounded-sm border border-black/15 px-2.5 py-1.5 text-[11px] font-medium text-black transition hover:bg-black hover:text-white"
            >
              Buka Toko
            </Link>
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="rounded-sm bg-black px-3 py-1.5 text-[11px] font-medium text-white"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/profile-buyer"
                  className="flex items-center gap-1 rounded-sm bg-black px-2.5 py-1.5 text-[11px] font-medium text-white"
                >
                  <User className="h-3 w-3" aria-hidden="true" /> Akun
                </Link>
                <button
                  onClick={handleLogout}
                  title="Keluar"
                  aria-label="Keluar akun"
                  className="flex items-center justify-center rounded-sm border border-black/20 px-2 py-1.5 text-black transition hover:bg-black hover:text-white"
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
              placeholder="Search catalogue"
              aria-label="Cari katalog"
              className="w-full min-w-0 bg-transparent text-[11px] text-black outline-none placeholder:text-black/35"
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

      {/* 3. MOBILE BOTTOM NAVIGATION (preserved for mobile view < md) */}
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
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.href === "/notifikasi" && unreadCount > 0 && (
                  <span className="absolute top-2 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

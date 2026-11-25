"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, UserX } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Tab = "BUYERS" | "SELLERS";

// Struktur disamain sama model User (+ TokoSeller buat seller) di Prisma
type UserItem = {
  id: number;
  nama: string | null;
  email: string;
  role: "Admin" | "Buyer" | "Seller";
  statusAkun: "Aktif" | "Suspend";
  createdAt?: string; // belum ada di schema User, dipakai kalau nanti ditambahin
  toko?: { namaToko: string } | null;
};

function formatJoined(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr)
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<Tab>("BUYERS");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const role = activeTab === "BUYERS" ? "Buyer" : "Seller";
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/admin/users?role=${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        } else {
          setUsers([]);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Data user belum bisa diambil:", err);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

  const handleSuspend = async (userId: number) => {
    if (!confirm("Suspend akun ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/admin/users/${userId}/suspend`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, statusAkun: "Suspend" } : u))
        );
      } else {
        alert("Gagal suspend akun.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const displayName = (u.toko?.namaToko || u.nama || "").toLowerCase();
    return displayName.includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pl-64 lg:pb-0`}>
      <Navbar variant="admin" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/admin-dashboard"
            aria-label="Kembali ke dashboard admin"
            className="flex h-9 w-9 items-center justify-center border border-black/15 text-black transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>

          <p
            className={`${mono.className} text-[9px] uppercase tracking-[0.32em] text-black/45`}
          >
            THE ARCHIVE
          </p>

          <span className="h-9 w-9" aria-hidden="true" />
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-10">
          <section className="border-b border-black pb-6 sm:pb-8">
            <h1
              className={`${playfair.className} text-3xl font-bold leading-none tracking-tight text-black sm:text-4xl lg:text-5xl`}
            >
              USER MANAGEMENT
            </h1>
          </section>

          <div className="pt-6 sm:pt-8">
            {/* Tabs */}
            <div
              className="relative mb-5 grid grid-cols-2 border border-black"
              role="group"
              aria-label="Filter tipe pengguna"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-black transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
                  activeTab === "SELLERS" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => setActiveTab("BUYERS")}
                aria-pressed={activeTab === "BUYERS"}
                className={`relative z-10 py-3.5 text-[11px] font-semibold tracking-[0.18em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black motion-reduce:transition-none ${
                  activeTab === "BUYERS"
                    ? "text-white"
                    : "text-black/50 hover:text-black"
                }`}
              >
                BUYERS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SELLERS")}
                aria-pressed={activeTab === "SELLERS"}
                className={`relative z-10 border-l border-black py-3.5 text-[11px] font-semibold tracking-[0.18em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black motion-reduce:transition-none ${
                  activeTab === "SELLERS"
                    ? "text-white"
                    : "text-black/50 hover:text-black"
                }`}
              >
                SELLERS
              </button>
            </div>

            {/* Search */}
            <div className="mb-6 flex items-center gap-3 border border-black/20 bg-[#FAF9F6] px-4 py-3 transition-colors focus-within:border-black">
              <Search
                className="h-4 w-4 shrink-0 text-black/40"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH SHOP NAME OR EMAIL..."
                aria-label="Cari nama toko atau email"
                className={`${mono.className} w-full bg-transparent text-[10px] uppercase tracking-[0.08em] text-black placeholder:text-black/30 focus:outline-none`}
              />
            </div>

            {/* List */}
            {isLoading ? (
              <div
                className="flex flex-col items-center justify-center gap-3 border border-black/10 py-20"
                aria-live="polite"
              >
                <span
                  className="h-px w-12 animate-pulse bg-black/30"
                  aria-hidden="true"
                />
                <p
                  className={`${mono.className} text-center text-[10px] uppercase tracking-[0.28em] text-black/40`}
                >
                  Memuat data...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    tab={activeTab}
                    onSuspend={() => handleSuspend(u.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-black/20 bg-[#FAF9F6] px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center border border-black/15 bg-white">
        <UserX
          className="h-6 w-6 text-black/35"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
      <p
        className={`${playfair.className} mt-6 text-lg font-semibold tracking-tight text-black`}
      >
        {tab === "BUYERS" ? "Belum ada buyer" : "Belum ada seller"}
      </p>
      <span className="mt-4 h-px w-10 bg-black/15" aria-hidden="true" />
      <p className="mt-4 max-w-[24ch] text-xs leading-relaxed text-black/45">
        Daftar user akan muncul di sini setelah ada yang terdaftar.
      </p>
    </div>
  );
}

function UserRow({
  user,
  tab,
  onSuspend,
}: {
  user: UserItem;
  tab: Tab;
  onSuspend: () => void;
}) {
  const displayName = tab === "SELLERS" ? user.toko?.namaToko || user.nama : user.nama;
  const detailHref =
    tab === "BUYERS" ? `/admin-users/buyer/${user.id}` : `/admin-users/seller/${user.id}`;

  return (
    <article className="border border-black/15 bg-white transition-colors duration-200 hover:border-black">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="min-w-0">
          <h3
            className={`${playfair.className} truncate text-lg font-bold leading-tight tracking-tight text-black`}
          >
            {displayName || "Tanpa Nama"}
          </h3>
          <p
            className={`${mono.className} mt-1.5 truncate text-[10px] tracking-[0.04em] text-black/55`}
          >
            {user.email}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={detailHref}
              className={`${mono.className} inline-flex border-b border-black pb-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black`}
            >
              READ MORE
            </Link>
            <span
              className={`${mono.className} text-[9px] uppercase tracking-[0.14em] text-black/35`}
            >
              JOINED {formatJoined(user.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex sm:shrink-0 sm:justify-end">
          {user.statusAkun === "Aktif" ? (
            <button
              type="button"
              onClick={onSuspend}
              className="w-full bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:w-auto sm:min-w-[8.5rem]"
            >
              SUSPEND
            </button>
          ) : (
            <span className="inline-flex w-full items-center justify-center border border-black/20 bg-[#F5F2EB] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55 sm:w-auto sm:min-w-[8.5rem]">
              SUSPENDED
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

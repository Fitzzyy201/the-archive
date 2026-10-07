"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Home,
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
  Search,
  UserX,
} from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Struktur disamain sama model User di Prisma
type UserItem = {
  id: number;
  nama: string | null;
  email: string;
  role: "Admin" | "Buyer" | "Seller";
  statusAkun: "Aktif" | "Suspend";
  createdAt?: string; 
};

type Tab = "BUYERS" | "SELLERS";

function formatJoined(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<Tab>("BUYERS");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const role = activeTab === "BUYERS" ? "Buyer" : "Seller";
      const res = await fetch(`http://localhost:3001/admin/users?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/admin/users/${userId}/suspend`, {
        method: "PATCH",
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, statusAkun: "Suspend" } : u
          )
        );
      } else {
        alert("Gagal suspend akun.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server.");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.nama?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-white`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b">
        <Link href="/admin-dashboard">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
          THE ARCHIVE
        </h1>
      </div>

      <div className="flex-1 w-full px-6 sm:px-12 md:px-16 py-6 md:flex md:justify-center">
        <div className="w-full md:max-w-xl pb-6">
          <h2 className="text-center text-sm font-bold tracking-wide text-black mb-5">
            USER MANAGEMENT
          </h2>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => setActiveTab("BUYERS")}
              className={`py-2.5 rounded-md text-xs font-semibold tracking-wide transition ${
                activeTab === "BUYERS"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              BUYERS
            </button>
            <button
              onClick={() => setActiveTab("SELLERS")}
              className={`py-2.5 rounded-md text-xs font-semibold tracking-wide transition ${
                activeTab === "SELLERS"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              SELLERS
            </button>
          </div>

          <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2.5 mb-5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shop name or email..."
              className="w-full text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {isLoading ? (
            <p className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}>
              Memuat data...
            </p>
          ) : filteredUsers.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
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

      {/* Bottom Nav khusus admin */}
      <div className="bg-black flex items-center justify-around py-3">
        <AdminNavItem href="/admin-dashboard" icon={<Home className="w-5 h-5" />} />
        <AdminNavItem href="/admin-verifikasi" icon={<ShieldCheck className="w-5 h-5" />} />
        <AdminNavItem href="/admin-users" icon={<Users className="w-5 h-5" />} />
        <AdminNavItem href="/admin-laporan" icon={<FileText className="w-5 h-5" />} />
        <AdminNavItem href="/admin-komplain" icon={<AlertTriangle className="w-5 h-5" />} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-sm mt-4">
      <UserX className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-gray-600 tracking-wide mb-1.5">
        Belum ada data user
      </p>
      <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
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
  const detailHref =
    tab === "BUYERS" ? `/admin-users/buyer/${user.id}` : `/admin-users/seller/${user.id}`;

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-black truncate">
            {user.nama || "Tanpa Nama"}
          </h3>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>

        {user.statusAkun === "Aktif" ? (
          <button
            onClick={onSuspend}
            className="shrink-0 bg-black text-white text-[10px] font-semibold tracking-wide px-3 py-1.5 rounded-md hover:bg-gray-800 transition"
          >
            SUSPEND
          </button>
        ) : (
          <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-semibold tracking-wide px-3 py-1.5 rounded-md">
            SUSPENDED
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <Link
          href={detailHref}
          className="text-[11px] font-semibold text-black underline underline-offset-2"
        >
          READ MORE
        </Link>
        <p className="text-[10px] text-gray-400">JOINED {formatJoined(user.createdAt)}</p>
      </div>
    </div>
  );
}

function AdminNavItem({ href, icon }: { href: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`p-2 rounded-md transition ${
        isActive ? "text-white" : "text-white/35 hover:text-white/60"
      }`}
    >
      {icon}
    </Link>
  );
}
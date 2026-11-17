"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCheck, Loader2 } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Notifikasi = {
  id: number;
  tipe: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NotifikasiPage() {
  const router = useRouter();
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifikasi = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/notification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifikasi(Array.isArray(data) ? data : []);
      } else if (res.status === 401) {
        router.replace("/login");
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchNotifikasi();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsMarkingAll(true);
    try {
      const res = await fetch(`${API_BASE}/notification/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifikasi((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Gagal menandai semua dibaca:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleClick = async (notif: Notifikasi) => {
    const token = localStorage.getItem("token");
    if (!notif.isRead && token) {
      try {
        await fetch(`${API_BASE}/notification/${notif.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifikasi((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Gagal menandai notifikasi dibaca:", err);
      }
    }

    if (notif.link) {
      router.push(notif.link);
    }
  };

  const unreadCount = notifikasi.filter((n) => !n.isRead).length;

  return (
    <div className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6]`}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-8 py-8 pb-28 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black`}>
              NOTIFIKASI
            </h1>
            <p className={`${mono.className} text-[10px] tracking-[0.2em] text-black/40 uppercase mt-1.5`}>
              {unreadCount > 0 ? `${unreadCount} BELUM DIBACA` : "SEMUA SUDAH DIBACA"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-black border border-black/15 px-3 py-2 rounded-sm hover:border-black hover:bg-black hover:text-white transition disabled:opacity-60"
            >
              {isMarkingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              BACA SEMUA
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-black/40 animate-pulse font-mono tracking-widest uppercase">
            Memuat notifikasi...
          </div>
        ) : notifikasi.length === 0 ? (
          <div className="bg-white border border-dashed border-black/15 rounded-sm p-10 text-center">
            <BellOff className="w-10 h-10 text-black/20 mx-auto mb-4" strokeWidth={1.25} />
            <p className={`${playfair.className} text-lg font-semibold text-black/70 mb-2`}>
              Belum Ada Notifikasi
            </p>
            <p className="text-xs text-black/40 max-w-xs mx-auto leading-relaxed">
              Update pesanan, pembayaran, dan informasi toko akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-black/10 rounded-sm divide-y divide-black/5">
            {notifikasi.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left p-4 flex items-start gap-3 transition hover:bg-black/[0.01] ${
                  notif.isRead ? "" : "bg-amber-50/40"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                    notif.isRead ? "bg-black/15" : "bg-amber-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm text-black ${
                        notif.isRead ? "font-medium" : "font-bold"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <span className={`${mono.className} text-[9px] text-black/35 shrink-0`}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-black/55 leading-relaxed mt-0.5">{notif.message}</p>
                  {notif.link && (
                    <span className={`${mono.className} inline-block text-[9px] tracking-widest text-black/35 uppercase mt-1.5`}>
                      Lihat detail →
                    </span>
                  )}
                </div>
                <Bell
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    notif.isRead ? "text-black/15" : "text-amber-500"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

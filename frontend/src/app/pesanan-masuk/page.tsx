"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, Package, ShoppingBag, User, Inbox } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Struktur disamain sama model Transaksi (+ buyer dan produknya) di Prisma
type PesananMasukItem = {
  id: number;
  totalHarga: number;
  statusPesanan: string;
  buyer?: { nama?: string | null; username?: string | null; email?: string };
  produk?: { namaProduk: string; fotoProduk: string } | null;
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function isRenderable(src?: string) {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:image"))
  );
}

function namaBuyer(p: PesananMasukItem) {
  const b = p.buyer;
  return b?.nama || b?.username || b?.email?.split("@")[0] || "-";
}

export default function PesananMasuk() {
  const [pesanan, setPesanan] = useState<PesananMasukItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [namaToko, setNamaToko] = useState("THE ARCHIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPesanan = async () => {
      const tokoId = localStorage.getItem("tokoId");
      const token = localStorage.getItem("token");

      if (!tokoId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/transaksi/toko/${tokoId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data: PesananMasukItem[] = await res.json();
          // Pesanan masuk = yang menunggu aksi seller
          setPesanan(Array.isArray(data) ? data.filter((t) => t.statusPesanan === "Diproses") : []);
        }

        const resToko = await fetch(`http://localhost:3001/toko/${tokoId}`);
        if (resToko.ok) {
          const toko = await resToko.json();
          if (toko.namaToko) setNamaToko(toko.namaToko);
        }
      } catch (err) {
        // Backend belum nyala / endpoint belum ada: tetap kosong
        console.warn("Pesanan masuk belum bisa diambil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPesanan();
  }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const kirimAksi = async (ids: number[], aksi: "terima" | "tolak") => {
    const token = localStorage.getItem("token");
    setIsProcessing(true);

    try {
      const berhasil: number[] = [];
      for (const id of ids) {
        const res = await fetch(`http://localhost:3001/transaksi/${id}/${aksi}`, {
          method: "PATCH",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) berhasil.push(id);
      }

      setPesanan((prev) => prev.filter((p) => !berhasil.includes(p.id)));
      setSelected((prev) => prev.filter((s) => !berhasil.includes(s)));

      if (berhasil.length < ids.length) {
        alert("Sebagian pesanan gagal diproses.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server. Pastikan backend aktif.");
    } finally {
      setIsProcessing(false);
    }
  };

  const aksiTerpilih = (aksi: "terima" | "tolak") => {
    if (selected.length === 0) {
      alert("Pilih minimal 1 pesanan dulu.");
      return;
    }
    kirimAksi(selected, aksi);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem
          href="/pesanan-seller"
          icon={<ShoppingBag className="w-5 h-5" />}
          label="PESANAN"
          active
        />
        <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      {/* Main content */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 sm:px-8 py-4 bg-[#FAF9F6] border-b border-black">
          <Link href="/pesanan-seller">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <h1 className={`${playfair.className} text-xl font-bold tracking-tight text-black uppercase`}>
            {namaToko}
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-8 py-6">
          <div className="w-full md:max-w-xl md:mx-auto pb-8">
            <p className={`${mono.className} text-[10px] tracking-[0.2em] text-black/55 mb-3`}>
              MANAGEMENT PORTAL
            </p>
            <h2 className={`${playfair.className} text-4xl font-bold text-black pb-5 border-b border-black mb-5`}>
              Pesanan Masuk
            </h2>

            {isLoading ? (
              <p
                className={`${mono.className} text-center text-xs text-black/40 py-16 tracking-widest uppercase`}
              >
                Memuat pesanan...
              </p>
            ) : pesanan.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <p className="text-sm text-black/60 mb-4">
                  You have {pesanan.length} unhandled orders awaiting action.
                </p>
                <button
                  onClick={() => setSelected(pesanan.map((p) => p.id))}
                  className="border border-black px-5 py-2.5 text-[11px] font-semibold tracking-[0.15em] text-black hover:bg-black/[0.03] transition mb-6"
                >
                  ACCEPT ALL
                </button>

                <div>
                  {pesanan.map((p) => (
                    <OrderCard
                      key={p.id}
                      item={p}
                      checked={selected.includes(p.id)}
                      disabled={isProcessing}
                      onToggle={() => toggleSelect(p.id)}
                      onAccept={() => kirimAksi([p.id], "terima")}
                      onReject={() => kirimAksi([p.id], "tolak")}
                    />
                  ))}
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => aksiTerpilih("terima")}
                    disabled={isProcessing}
                    className="w-full bg-black text-white py-4 text-xs font-semibold tracking-[0.2em] hover:bg-black/85 transition disabled:opacity-40"
                  >
                    TERIMA PESANAN
                  </button>
                  <button
                    onClick={() => aksiTerpilih("tolak")}
                    disabled={isProcessing}
                    className="w-full border border-black py-4 text-xs font-semibold tracking-[0.2em] text-black hover:bg-black/[0.03] transition disabled:opacity-40"
                  >
                    TOLAK PESANAN
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15">
      <Inbox className="w-6 h-6 text-black/25 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
        Belum ada pesanan baru
      </p>
      <p className="text-xs text-black/40 max-w-[240px] leading-relaxed">
        Pesanan yang masuk dan menunggu konfirmasi akan muncul di sini.
      </p>
    </div>
  );
}

function OrderCard({
  item,
  checked,
  disabled,
  onToggle,
  onAccept,
  onReject,
}: {
  item: PesananMasukItem;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="py-6 border-b border-black/10 first:pt-0">
      <div className="flex gap-4 mb-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-5 h-5 mt-8 accent-black cursor-pointer shrink-0"
        />
        <Link
          href={`/detail-pesanan?id=${item.id}`}
          className="w-24 h-32 bg-black/5 overflow-hidden shrink-0 flex items-center justify-center"
        >
          {isRenderable(item.produk?.fotoProduk) ? (
            <img
              src={item.produk?.fotoProduk}
              alt={item.produk?.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-5 h-5 text-black/20" strokeWidth={1.5} />
          )}
        </Link>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className={`${mono.className} text-[10px] tracking-wide text-black/45 mb-2`}>
              #ORDER-{item.id}
            </p>
            <h3 className={`${playfair.className} text-base font-bold uppercase text-black leading-snug`}>
              {item.produk?.namaProduk ?? "Produk"}
            </h3>
            <p className="text-sm text-black/55 mt-1">Customer: {namaBuyer(item)}</p>
          </div>
          <p className="text-base text-black">{formatRupiah(item.totalHarga)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAccept}
          disabled={disabled}
          className="bg-black text-white py-3.5 text-[11px] font-semibold tracking-[0.2em] hover:bg-black/85 transition disabled:opacity-40"
        >
          ACCEPT
        </button>
        <button
          onClick={onReject}
          disabled={disabled}
          className="border border-black py-3.5 text-[11px] font-semibold tracking-[0.2em] text-black hover:bg-black/[0.03] transition disabled:opacity-40"
        >
          REJECT
        </button>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const pathname = usePathname();
  const isActive = active || pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 transition md:px-6 md:py-3 md:rounded-md ${
        isActive ? "text-white font-semibold" : "text-white/40 hover:text-white/70"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm tracking-wide">{label}</span>
    </Link>
  );
}
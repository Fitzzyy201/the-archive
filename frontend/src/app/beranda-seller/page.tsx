"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingBag, User, PackageSearch, LogOut } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Produk = {
  id: number;
  namaProduk: string;
  harga: number;
  stok: number;
  fotoProduk: string;
  statusProduk: "Aktif" | "Nonaktif";
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function BerandaSeller() {
  const router = useRouter();
  const [products, setProducts] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const loadDataSeller = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    // Cek key role/userRole
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");
    let tokoId = localStorage.getItem("tokoId");

    // Wajib ada TOKEN dan ROLE harus 'Seller'
    if (!token || role !== "Seller") {
      setIsLoading(false);
      router.push("/");
      return;
    }

    try {
      // 1. Jika tokoId belum ada di localStorage, ambil dulu data toko berdasarkan userId
      if (!tokoId || tokoId === "undefined") {
        const tokoRes = await fetch(`http://localhost:3001/toko/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tokoRes.ok) {
          const tokoData = await tokoRes.json();
          tokoId = tokoData.id;
          if (tokoId) localStorage.setItem("tokoId", String(tokoId));
        }
      }

      // 2. Fetch daftar produk jika tokoId sudah didapatkan
      if (tokoId) {
        const res = await fetch(`http://localhost:3001/produk/toko/${tokoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data beranda seller:", err);
    } finally {
      setIsLoading(false);
    }
  };

  loadDataSeller();
}, [router]);
  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokoId");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-between md:w-56 md:py-8 py-3">
        <div className="flex md:flex-col items-center justify-around md:justify-start md:items-stretch w-full md:gap-2">
          <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
          <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
          <NavItem href="/pesanan-seller" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
          <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3 md:w-full text-red-500 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] md:text-sm font-medium">LOGOUT</span>
        </button>
      </div>

      {/* Main Area */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="px-5 sm:px-10 py-6 border-b border-black/10 bg-white">
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-semibold tracking-tight text-black`}>
            THE DIARIES STORE
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-8">
          <div className="w-full md:max-w-2xl mx-auto">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-black/40 animate-pulse">
                Memuat ringkasan toko...
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-6">
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border border-black/15 rotate-45" />
                  <PackageSearch className="w-6 h-6 text-black/40 relative z-10" strokeWidth={1.5} />
                </div>
                <h2 className={`${playfair.className} text-xl font-bold text-black mb-2`}>
                  BELUM ADA PRODUK YANG DI PUBLISH
                </h2>
                <p className={`${mono.className} text-[10px] tracking-widest text-black/40 mb-6 uppercase`}>
                  Your collection is currently empty
                </p>
                <Link
                  href="/tambah-produk"
                  className="bg-black text-white text-xs font-semibold px-6 py-3 rounded-sm hover:bg-black/85 transition"
                >
                  + TAMBAH PRODUK
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-black/10">
                  <h2 className="text-xs font-semibold tracking-[0.15em] text-black/70">
                    KOLLEKSI PRODUK TAMPIL
                  </h2>
                  <p className={`${mono.className} text-[11px] text-black/40`}>
                    {String(products.length).padStart(2, "0")} ITEMS
                  </p>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-4 bg-white border border-black/10 rounded-sm p-3"
                    >
                      <div className="w-16 h-16 bg-black/5 rounded-sm overflow-hidden shrink-0">
                        <img
                          src={
                            !product.fotoProduk
                              ? "/placeholder.png"
                              : product.fotoProduk.startsWith("http") || product.fotoProduk.startsWith("data:")
                              ? product.fotoProduk
                              : `http://localhost:3001/uploads/${product.fotoProduk}`
                          }
                          alt={product.namaProduk}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-black">{product.namaProduk}</h3>
                        <p className="text-xs text-black/60">{formatRupiah(product.harga)}</p>
                        <p className={`${mono.className} text-[10px] text-black/35 mt-1`}>
                          STOK: {product.stok}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 cursor-pointer transition md:px-6 md:py-3 md:rounded-md ${
        isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </Link>
  );
}
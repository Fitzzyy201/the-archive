"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, User, Plus, PackageSearch } from "lucide-react";
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

const products: Produk[] = [];

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function ProdukSeller() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
  
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/pesanan-seller" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/profile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

     
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="px-5 sm:px-10 py-6 border-b border-black/10 bg-white">
          <p className={`${mono.className} text-[10px] tracking-[0.25em] text-black/40 mb-2`}>
            THE ARCHIVE · SELLER PANEL
          </p>
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-semibold tracking-tight text-black`}>
            Product Management
          </h1>
        </div>

        <div className="flex-1 w-full px-5 sm:px-10 md:px-16 py-8">
          <div className="w-full md:max-w-2xl mx-auto">
            <Link
              href="/tambah-produk"
              className="w-full bg-black text-white rounded-sm py-3.5 font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-black/85 transition mb-10"
            >
              <Plus className="w-4 h-4" /> ADD NEW PRODUCT
            </Link>

            <div className="flex items-baseline justify-between mb-5 pb-2 border-b border-black/10">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-black/70">
                PUBLISHED PRODUCTS
              </h2>
              <p className={`${mono.className} text-[11px] text-black/40`}>
                {String(products.length).padStart(2, "0")} ITEMS
              </p>
            </div>

    
            {products.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-black/15 rounded-sm">
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        <div className="absolute inset-0 border border-black/15 rotate-45" />
        <PackageSearch className="w-6 h-6 text-black/40 relative z-10" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-black/70 tracking-wide mb-1.5">
        No products published yet
      </p>
      <p className="text-xs text-black/40 max-w-[220px] leading-relaxed">
        Every item you add here becomes part of your storefront record.
      </p>
    </div>
  );
}

function ProductRow({ product }: { product: Produk }) {
  return (
    <div className="flex gap-4 bg-white border border-black/10 rounded-sm p-3 hover:border-black/30 transition">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/5 rounded-sm overflow-hidden shrink-0">
        <img
          src={product.fotoProduk}
          alt={product.namaProduk}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-black truncate">
              {product.namaProduk}
            </h3>
            <span
              className={`shrink-0 text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full ${
                product.statusProduk === "Aktif"
                  ? "bg-black text-white"
                  : "bg-black/5 text-black/40"
              }`}
            >
              {product.statusProduk.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-black/60 mt-0.5">{formatRupiah(product.harga)}</p>
         <p className={`${mono.className} text-[10px] text-black/35 mt-1`}>
            STOCK {String(product.stok).padStart(2, "0")}
          </p>
        </div>

        <div className="flex gap-2 mt-3">
          <Link
            href={`/edit-produk/${product.id}`}
            className="flex-1 text-center text-xs font-medium border border-black/15 rounded-sm py-2 hover:border-black hover:bg-black/[0.02] transition"
          >
            EDIT
          </Link>
          <button className="flex-1 text-xs font-medium border border-black/15 rounded-sm py-2 hover:border-black hover:bg-black/[0.02] transition">
            {product.statusProduk === "Aktif" ? "NONAKTIFKAN" : "AKTIFKAN"}
          </button>
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
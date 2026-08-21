"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, MessageCircle, Home, ShoppingBag, User } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });


type Produk = {
  id: number;
  namaProduk: string;
  harga: number;
  stok: number;
  ukuranDimensi: string;
  fotoProduk: string;
  defect: boolean;
  statusProduk: "Aktif" | "Nonaktif";
};

const toko = {
  namaToko: "The Diaries Store",
};

// Produk milik toko ini — kosong dulu, belum ada yang di-publish
const products: Produk[] = [];

function formatRupiah(angka: number) {
  return `IDR ${angka.toLocaleString("id-ID")}`;
}

export default function BerandaSeller() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/pesanan-seller" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/profile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="flex items-center justify-between px-5 sm:px-10 py-5 border-b">
          <h1 className={`${playfair.className} text-lg sm:text-xl font-bold tracking-wide text-black`}>
            {toko.namaToko.toUpperCase()}
          </h1>
          <button className="p-1">
            <MessageCircle className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center max-w-xs mx-auto">
      <div className="relative w-20 h-20 flex items-center justify-center mb-8">
        <div className="absolute inset-0 border border-gray-300 rotate-45" />
        <Package className="w-8 h-8 text-black relative z-10" strokeWidth={1.5} />
      </div>

      <h2 className={`${playfair.className} text-xl sm:text-2xl font-bold text-black leading-snug mb-3`}>
        BELUM ADA
        <br />
        PRODUK YANG
        <br />
        DI PUBLISH
      </h2>

      <div className="w-10 h-px bg-black mb-3" />

      <p className="text-[11px] tracking-[0.15em] text-gray-400 mb-8">
        YOUR COLLECTION IS CURRENTLY EMPTY
      </p>

      <Link
        href="/tambah-produk"
        className="bg-black text-white text-sm font-medium rounded-md px-8 py-3 hover:bg-gray-900 transition"
      >
        + TAMBAH PRODUK
      </Link>
    </div>
  );
}

function ProductCard({ product }: { product: Produk }) {
  return (
    <Link href={`/produk-seller/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-2">
        <img
          src={product.fotoProduk}
          alt={product.namaProduk}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 left-2 bg-white/90 text-[10px] font-semibold px-2 py-0.5 rounded">
          STOCK: {product.stok}
        </span>
        {product.statusProduk === "Nonaktif" && (
          <span className="absolute top-2 right-2 bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            NONAKTIF
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-black leading-snug">{product.namaProduk}</h3>
      <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
        <span>{formatRupiah(product.harga)}</span>
        <span>SIZE: {product.ukuranDimensi}</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5">
        {product.defect ? "⚠ Ada Defect" : "✓ No Defect"}
      </p>
    </Link>
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
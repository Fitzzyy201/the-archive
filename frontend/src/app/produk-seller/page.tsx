"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingBag, User, Plus, PackageSearch, Trash2, X, Eye } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { getProductImageUrl } from "@/utils/image";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// Tipe data di-update biar mencakup deskripsi, dimensi, dan defect
type Produk = {
  id: number;
  namaProduk: string;
  harga: number;
  stok: number;
  fotoProduk: string;
  statusProduk: "Aktif" | "Nonaktif";
  deskripsi: string;
  ukuranDimensi: string;
  defect: boolean;
};

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function ProdukSeller() {
  const router = useRouter();
  const [products, setProducts] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State buat nyimpen data produk yang mau dilihat detailnya (Read More)
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    // Cek key role/userRole (sama seperti di beranda-seller)
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");
    const tokoId = localStorage.getItem("tokoId");

    if (role !== "Seller") {
      router.push("/");
      return;
    }

    if (token && tokoId) {
      try {
        const res = await fetch(`http://localhost:3001/produk/toko/${tokoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchProducts();
    });
  }, [router]);

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/produk/${id}/toggle-status`, {
        method: "PATCH",
      });

      if (res.ok) {
        fetchProducts(); 
      } else {
        alert("Gagal mengubah status produk.");
      }
    } catch (error) {
      console.error("Error toggle status:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) return;

    try {
      const res = await fetch(`http://localhost:3001/produk/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts(); 
      } else {
        alert("Gagal menghapus produk.");
      }
    } catch (error) {
      console.error("Error delete product:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3 relative z-10">
        <NavItem href="/beranda-seller" icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem href="/produk-seller" icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem href="/seller/pesanan" icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem href="/berandaprofile-seller" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      {/* Content */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col relative`}>
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

            {isLoading ? (
              <div className="py-10 text-center text-xs text-black/40 animate-pulse">
                Memuat katalog produk...
              </div>
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteProduct}
                    onViewDetail={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL POP-UP DETAIL PRODUK */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
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

function ProductRow({
  product,
  onToggleStatus,
  onDelete,
  onViewDetail,
}: {
  product: Produk;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetail: () => void;
}) {
  const displayImage = getProductImageUrl(product.fotoProduk);

  return (
    <div className="flex gap-4 bg-white border border-black/10 rounded-sm p-3 hover:border-black/30 transition">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/5 rounded-sm overflow-hidden shrink-0">
        <img
          src={displayImage}
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
                  : "bg-black/10 text-black/50"
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

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onViewDetail}
            className="flex items-center justify-center gap-1 flex-1 text-xs font-medium border border-black/15 rounded-sm py-2 hover:border-black hover:bg-black/[0.02] transition text-black"
          >
            <Eye className="w-3.5 h-3.5" /> DETAIL
          </button>

          <Link
            href={`/edit-produk/${product.id}`}
            className="flex-1 text-center text-xs font-medium border border-black/15 rounded-sm py-2 hover:border-black hover:bg-black/[0.02] transition text-black"
          >
            EDIT
          </Link>

          <button
            onClick={() => onToggleStatus(product.id)}
            className="flex-1 text-xs font-medium border border-black/15 rounded-sm py-2 hover:border-black hover:bg-black/[0.02] transition text-black"
          >
            {product.statusProduk === "Aktif" ? "NONAKTIFKAN" : "AKTIFKAN"}
          </button>

          <button
            onClick={() => onDelete(product.id)}
            className="p-2 border border-red-200 text-red-600 rounded-sm hover:bg-red-50 hover:border-red-400 transition"
            title="Hapus Produk"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Modal Detail Produk
function ProductDetailModal({ product, onClose }: { product: Produk; onClose: () => void }) {
  const displayImage = getProductImageUrl(product.fotoProduk);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className={`${playfair.className} text-lg font-bold text-black`}>Detail Produk</h2>
          <button onClick={onClose} className="text-black/50 hover:text-black transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Body Modal (Bisa di-scroll) */}
        <div className="p-5 overflow-y-auto">
          <div className="w-full aspect-square bg-gray-100 rounded-sm overflow-hidden mb-5 border border-black/10">
            <img src={displayImage} alt={product.namaProduk} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">Nama Produk</p>
              <p className="text-sm font-medium text-black">{product.namaProduk}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">Harga</p>
                <p className="text-sm font-medium text-black">{formatRupiah(product.harga)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">Stok & Dimensi</p>
                <p className="text-sm font-medium text-black">{product.stok} Pcs • {product.ukuranDimensi || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">Deskripsi</p>
              <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
                {product.deskripsi || "Tidak ada deskripsi."}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-widest text-black/40 uppercase mb-1">Kondisi Defect</p>
              <p className="text-sm font-medium text-black">
                {product.defect ? "Ada Defect (Tandai)" : "Mulus / Tanpa Defect"}
              </p>
            </div>
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
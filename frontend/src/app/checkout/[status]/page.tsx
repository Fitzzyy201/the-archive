"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type StatusContent = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  icon: typeof CheckCircle2;
  iconClass: string;
  bgClass: string;
};

const STATUS_MAP: Record<string, StatusContent> = {
  finish: {
    title: "PEMBAYARAN BERHASIL",
    description:
      "Terima kasih! Pembayaran Anda telah kami terima. Pesanan akan diproses oleh seller dalam waktu dekat.",
    ctaLabel: "LIHAT PESANAN SAYA",
    ctaHref: "/my-packet",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200",
  },
  pending: {
    title: "MENUNGGU PEMBAYARAN",
    description:
      "Pembayaran Anda sedang diproses. Status pesanan akan diperbarui otomatis setelah pembayaran dikonfirmasi.",
    ctaLabel: "LIHAT PESANAN SAYA",
    ctaHref: "/my-packet",
    icon: Clock,
    iconClass: "text-amber-600",
    bgClass: "bg-amber-50 border-amber-200",
  },
  error: {
    title: "PEMBAYARAN GAGAL",
    description:
      "Pembayaran tidak berhasil atau dibatalkan. Stok produk akan dikembalikan otomatis. Silakan coba lagi.",
    ctaLabel: "KEMBALI KE BERANDA",
    ctaHref: "/",
    icon: XCircle,
    iconClass: "text-red-600",
    bgClass: "bg-red-50 border-red-200",
  },
};

export default function CheckoutStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = use(params);
  const router = useRouter();

  const content = STATUS_MAP[status] ?? STATUS_MAP.pending;
  const Icon = content.icon;

  useEffect(() => {
    if (status === "finish" || status === "pending") {
      localStorage.removeItem("cartCount");
    }
  }, [status]);

  return (
    <div className={`${inter.className} min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] px-6`}>
      <div className="w-full max-w-md text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-6 ${content.bgClass}`}>
          <Icon className={`w-8 h-8 ${content.iconClass}`} />
        </div>

        <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black mb-3`}>
          {content.title}
        </h1>
        <p className="text-sm text-black/60 leading-relaxed mb-8">{content.description}</p>

        <div className="space-y-3">
          <Link
            href={content.ctaHref}
            className="flex items-center justify-center gap-2 w-full bg-black text-white text-xs font-semibold tracking-widest uppercase py-3.5 rounded-sm hover:bg-black/85 transition"
          >
            {content.ctaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/my-packet"
            className="block w-full border border-black/15 text-black text-xs font-semibold tracking-widest uppercase py-3.5 rounded-sm hover:border-black transition"
          >
            CEK STATUS PESANAN
          </Link>
          <button
            onClick={() => router.push("/")}
            className={`${mono.className} text-[10px] tracking-widest text-black/40 uppercase hover:text-black transition`}
          >
            Kembali ke beranda
          </button>
        </div>
      </div>
    </div>
  );
}

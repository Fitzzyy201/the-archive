"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PesananSeller() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/seller/pesanan/masuk");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <p className="text-xs text-black/40 font-mono tracking-widest uppercase animate-pulse">
        Membuka Manajemen Pesanan...
      </p>
    </div>
  );
}
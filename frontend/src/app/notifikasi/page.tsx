"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Notifikasi() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");
    
    if (role === "Seller") {
      router.push("/seller/pesanan");
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <p className="text-black/40 text-sm">Mengalihkan...</p>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Home, Package, ShoppingBag, User } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function LoginSeller() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/auth/login",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (data.id) localStorage.setItem("userId", data.id);

        alert("Login Seller Berhasil Cuyyy!!");

        router.push("/beranda");
      } else {
        alert(`Gagal Login: ${data.message || "Email atau password salah"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke server backend!");
    } finally {
      setIsLoading(false);
    }
    

  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem icon={<Package className="w-5 h-5" />} label="PRODUK" />
        <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="PESANAN" />
        <NavItem icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

      {/* Main content */}
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
          <button className="absolute left-4 sm:left-8">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-black`}>
            MASUK SELLER
          </h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 pt-8 pb-4 md:flex md:items-center md:justify-center">
          <div className="w-full md:max-w-md lg:max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight text-black">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed">
              Masukkan kredensial untuk mengakses akun seller Anda.
            </p>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@diaries-store.com"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="text-right">
                <Link href="/lupa-seller" className="text-sm underline text-gray-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white rounded-md py-3.5 flex items-center justify-center gap-2 font-medium mt-4 hover:bg-gray-900 transition"
              >
                LOGIN <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Belum buka toko?{" "}
              <Link href="/daftar-seller" className="underline text-black font-medium">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-white cursor-pointer hover:opacity-80 hover:bg-gray-900 transition md:px-6 md:py-3 md:rounded-md">
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </div>
  );
}
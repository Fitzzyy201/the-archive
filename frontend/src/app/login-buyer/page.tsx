"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Bell, User } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function LoginBuyer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
    alert(`Coba login dengan email: ${email}`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="order-2 md:order-1 bg-black flex items-center justify-around md:flex-col md:justify-start md:items-stretch md:w-56 md:py-8 md:gap-2 py-3">
        <NavItem icon={<Home className="w-5 h-5" />} label="BERANDA" />
        <NavItem icon={<Bell className="w-5 h-5" />} label="NOTIFICATION" />
        <NavItem icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>

   
      <div className={`${inter.className} order-1 md:order-2 flex-1 flex flex-col`}>
        <div className="flex items-center justify-center relative px-4 sm:px-8 py-4 border-b">
          <button className="absolute left-4 sm:left-8">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold tracking-tight text-black`}>
            MASUK
          </h1>
        </div>

        <div className="flex-1 w-full px-6 sm:px-12 md:px-16 pt-8 pb-6 md:flex md:items-center md:justify-center">
          <div className="w-full md:max-w-md lg:max-w-lg mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-black">Welcome Back</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Enter your credentials to access your account.
              </p>
            </div>

        
            <div className="border border-gray-300 rounded-md p-5 sm:p-6">
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-semibold tracking-wide mb-2 text-gray-800">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
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
                    className="w-full border-b border-gray-300 px-1 py-2 text-sm sm:text-base text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="text-right">
                  <Link href="/lupa-buyer" className="text-xs font-medium tracking-wide text-black">
                    FORGOT PASSWORD?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white rounded-md py-3.5 flex items-center justify-center gap-2 font-medium hover:bg-gray-900 transition"
                >
                  LOGIN <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <p className="text-center text-sm text-gray-700 mt-6">
              Belum punya akun?{" "}
              <Link href="/daftar-buyer" className="font-semibold text-black">
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
    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-white cursor-pointer hover:opacity-80 transition md:px-6 md:py-3 md:rounded-md">
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </div>
  );
}
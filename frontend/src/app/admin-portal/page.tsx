"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"] });
const inter = Inter({ subsets: ["latin"] });

export default function LoginAdmin() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

const data = await response.json();

const token = data.token || data.access_token;

if (response.ok) {
  if (data.role !== "Admin") {
    alert("Akses Ditolak! Anda bukan staf yang berwenang.");
    router.push("/login-buyer");
    return;
  }

  localStorage.setItem("token", token);
  localStorage.setItem("role", data.role);
  if (data.username) localStorage.setItem("username", data.username);

  alert("Welcome, Admin! 🛡️");
  router.push("/admin-dashboard");
} else {
        alert(`Akses Gagal: ${data.message || "Kredensial salah"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke server keamanan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 ${inter.className}`}>

      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl relative overflow-hidden">
        
        <div className="absolute -bottom-10 -right-10 text-[200px] font-bold text-gray-50 select-none pointer-events-none z-0 font-serif">
          A
        </div>

        <div className="border-b border-black py-5 text-center relative z-10">
          <h1 className="text-sm font-bold tracking-[0.2em] text-black">
            LOGIN ADMIN
          </h1>
        </div>

        <div className="px-8 py-10 relative z-10">
          <h2 className={`${playfair.className} text-4xl font-bold leading-tight text-black mb-4`}>
            Admin <br /> Authorization
          </h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Masukkan kredensial keamanan untuk mengakses dashboard sistem.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-2">
                USERNAME
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_username"
                className="w-full border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-2">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thearchive.com"
                className="w-full border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white text-xs font-bold tracking-[0.15em] py-4 mt-6 flex items-center justify-center gap-2 transition ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-900"
              }`}
            >
              {isLoading ? "AUTHORIZING..." : "SECURE LOGIN"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="border-t border-gray-100 py-6 text-center relative z-10 bg-white">
          <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
            RESTRICTED AREA.<br />
            HANYA UNTUK STAF YANG BERWENANG.
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Ambil data response secara fleksibel
        const token = data.access_token || data.token;
        const userObj = data.user || data;
        const userId = data.user?.id || data.userId || data.id;
        const role = data.user?.role || data.role;

        // 2. Simpan data ke localStorage secara konsisten
        if (token) localStorage.setItem("token", token);
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (userId) localStorage.setItem("userId", String(userId));
        if (role) localStorage.setItem("role", role);

        // Hapus key bekas lama jika ada
        localStorage.removeItem("userRole");

        alert("Login Berhasil!");

        // 3. Redirect otomatis sesuai Role
        if (role === "Seller") {
          window.location.href = "/beranda-seller";
        } else {
          window.location.href = "/";
        }
      } else {
        alert(`Gagal Login: ${data.message || "Email atau password salah."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke server backend! Pastikan backend sudah jalan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-black">
      {/* Top Navbar */}
      <Navbar />

      <main
        className={`${inter.className} flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-16 pb-28 md:pb-16 flex items-center justify-center`}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Header Card */}
          <div className="text-center mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs text-black/50 hover:text-black mb-4 transition font-mono"
            >
              <ArrowLeft className="w-4 h-4" /> KEMBALI
            </button>
            <h1
              className={`${playfair.className} text-3xl sm:text-4xl font-bold tracking-tight text-black mb-2`}
            >
              Welcome Back
            </h1>
            <p className="text-black/50 text-xs sm:text-sm leading-relaxed">
              Masukkan kredensial akun Anda untuk mengakses katalog arsip.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-black/10 rounded-sm p-6 sm:p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div>
                <label
                  className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-b border-black/20 px-1 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/lupa-password"
                  className={`${mono.className} text-[10px] tracking-wider text-black/60 hover:text-black transition`}
                >
                  LUPA PASSWORD?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`${mono.className} w-full bg-black text-white rounded-sm py-3.5 flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] hover:bg-black/85 transition ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "MASUK..." : "MASUK KE AKUN"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Footer Options */}
          <div className="text-center text-xs text-black/60 mt-6 font-sans space-y-2">
            <p>
              Belum memiliki akun?{" "}
              <Link
                href="/daftar-buyer"
                className="font-semibold text-black underline underline-offset-4 hover:opacity-80 transition"
              >
                Daftar di sini
              </Link>
            </p>
            <p>
              Ingin buka toko?{" "}
              <Link
                href="/daftar-seller"
                className="font-semibold text-black underline underline-offset-4 hover:opacity-80 transition"
              >
                Yuk klik di sini
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
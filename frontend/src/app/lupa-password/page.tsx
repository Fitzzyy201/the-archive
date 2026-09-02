"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function LupaPassword() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStep(2);
      else alert("Terjadi kesalahan pada server.");
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Hanya angka
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return alert("Masukkan 6 digit OTP");

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      if (res.ok) setStep(3);
      else alert("OTP salah atau kadaluarsa.");
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      if (res.ok) {
        alert("Password berhasil diubah! Silakan login kembali.");
        router.push("/login"); // Arahkan ke halaman login
      } else {
        alert("Gagal mengubah password.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col ${inter.className}`}>
      {/* Header */}
      <div className="flex items-center justify-center relative px-4 sm:px-8 py-5 border-b border-gray-200">
        <button onClick={() => router.back()} className="absolute left-4 sm:left-8">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className={`${playfair.className} text-xl sm:text-2xl font-bold tracking-widest uppercase text-black`}>
          {step === 2 ? "AUTHENTICATION" : "LUPA KATA SANDI"}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center pt-16 px-6">
        
        {step === 1 && (
          <div className="w-full max-w-sm text-center">
            <div className="w-12 h-12 border border-black mx-auto flex items-center justify-center mb-6">
              <RefreshCw className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-lg font-medium text-black mb-2">Pulihkan Akun</h2>
            <p className="text-sm text-gray-600 mb-10 leading-relaxed">
              Masukkan email Anda untuk menerima kode verifikasi.
            </p>

            <form onSubmit={handleRequestOtp} className="text-left space-y-6">
              <div>
                <label className="block text-[10px] font-semibold tracking-wider uppercase text-black mb-2">
                  ALAMAT EMAIL
                </label>
                <div className="flex items-center border-b border-black py-2">
                  <Mail className="w-4 h-4 text-gray-500 mr-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@contoh.com"
                    className="w-full text-sm outline-none placeholder:text-gray-300 text-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white text-sm tracking-widest font-medium py-3.5 mt-8 hover:bg-gray-900 transition"
              >
                {isLoading ? "MEMPROSES..." : "KIRIM KODE"}
              </button>
            </form>

            <button onClick={() => router.back()} className="mt-6 text-xs text-gray-500 underline uppercase tracking-wider hover:text-black transition">
              Kembali ke Halaman Masuk
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-sm text-center border border-gray-200 p-8 shadow-sm relative">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-black"></div>
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-black"></div>
            
            <h2 className={`${playfair.className} text-2xl font-bold text-black mb-2`}>Verifikasi OTP</h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Masukkan kode OTP yang telah dikirim ke email Anda.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`${playfair.className} w-10 h-12 sm:w-12 sm:h-14 border border-gray-300 text-center text-xl text-black focus:border-black focus:outline-none transition`}
                    placeholder="0"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white text-sm tracking-widest font-medium py-3.5 hover:bg-gray-900 transition"
              >
                {isLoading ? "MEMPROSES..." : "VERIFIKASI"}
              </button>
            </form>

            <p className="mt-8 text-xs text-gray-500 tracking-wide">
              Tidak menerima kode? <br />
              <button onClick={handleRequestOtp} className="text-black font-semibold underline mt-1 uppercase">
                Kirim Ulang Kode
              </button>
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-sm text-center">
            <h2 className={`${playfair.className} text-2xl font-bold text-black mb-2`}>Password Baru</h2>
            <p className="text-sm text-gray-600 mb-8">
              Silakan buat kata sandi baru untuk akun Anda.
            </p>

            <form onSubmit={handleResetPassword} className="text-left space-y-6">
              <div>
                <label className="block text-[10px] font-semibold tracking-wider uppercase text-black mb-2">
                  PASSWORD BARU
                </label>
                <div className="border-b border-black py-2">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm outline-none placeholder:text-gray-300 text-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white text-sm tracking-widest font-medium py-3.5 mt-8 hover:bg-gray-900 transition"
              >
                {isLoading ? "MENYIMPAN..." : "SIMPAN PASSWORD"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
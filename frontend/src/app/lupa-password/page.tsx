"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, RefreshCw, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function LupaPassword() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "", text: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (pass.length < 6) {
      return { score: 1, label: "LEMAH", color: "bg-red-500", text: "text-red-500" };
    }
    if (score <= 2) {
      return { score: 1, label: "LEMAH", color: "bg-red-500", text: "text-red-500" };
    }
    if (score === 3) {
      return { score: 2, label: "SEDANG", color: "bg-amber-500", text: "text-amber-600" };
    }
    return { score: 3, label: "KUAT", color: "bg-emerald-600", text: "text-emerald-600" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Kode OTP telah dikirim ke email Anda.");
        setStep(2);
      } else {
        alert(`Gagal: ${data.message || "Terjadi kesalahan pada server."}`);
      }
    } catch (error) {
      alert("Gagal terhubung ke server backend! Pastikan backend sudah jalan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && isNaN(Number(value))) return;

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
    if (otpString.length < 6) return alert("Masukkan 6 digit kode OTP lengkap.");

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        alert(data.message || "Kode OTP salah atau sudah kadaluarsa.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password berhasil diubah! Silakan login dengan password baru Anda.");
        router.push("/login");
      } else {
        alert(`Gagal: ${data.message || "Gagal mengubah password."}`);
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
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
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs text-black/50 hover:text-black mb-4 transition font-mono"
            >
              <ArrowLeft className="w-4 h-4" /> KEMBALI
            </button>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black/5 border border-black/10 rounded-full mb-3 text-black">
              {step === 1 && <Mail className="w-6 h-6" />}
              {step === 2 && <RefreshCw className="w-6 h-6" />}
              {step === 3 && <KeyRound className="w-6 h-6" />}
            </div>
            <h1
              className={`${playfair.className} text-3xl sm:text-4xl font-bold tracking-tight text-black mb-2`}
            >
              {step === 1 && "Pulihkan Akun"}
              {step === 2 && "Verifikasi OTP"}
              {step === 3 && "Password Baru"}
            </h1>
            <p className="text-black/50 text-xs sm:text-sm leading-relaxed">
              {step === 1 && "Masukkan email terdaftar Anda untuk menerima kode OTP 6 digit."}
              {step === 2 && `Masukkan 6 digit kode OTP yang kami kirimkan ke ${email}`}
              {step === 3 && "Buat kata sandi baru yang aman untuk akun The Archive Anda."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-black/10 rounded-sm p-6 sm:p-8 shadow-sm">
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label
                    className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                  >
                    ALAMAT EMAIL TERDAFTAR
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-sm hover:bg-black/85 transition disabled:opacity-50 mt-4"
                >
                  {isLoading ? "MEMPROSES..." : "KIRIM KODE OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`${playfair.className} w-11 h-14 sm:w-12 sm:h-16 border border-black/20 text-center text-xl font-bold text-black focus:border-black focus:outline-none transition rounded-sm bg-[#FAF9F6]/50`}
                      placeholder="•"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-sm hover:bg-black/85 transition disabled:opacity-50"
                >
                  {isLoading ? "MEMVERIFIKASI..." : "VERIFIKASI KODE"}
                </button>

                <div className="pt-2 text-xs text-black/50">
                  Tidak menerima kode?{" "}
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-black font-semibold underline underline-offset-4 hover:text-black/70 uppercase"
                  >
                    Kirim Ulang
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label
                    className={`${mono.className} block text-[10px] font-semibold tracking-widest text-black/70 mb-2 uppercase`}
                  >
                    KATA SANDI BARU
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-b border-black/20 px-1 py-2 pr-8 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 text-black/40 hover:text-black transition focus:outline-none"
                      title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className={`${mono.className} tracking-wider text-black/50 uppercase`}>
                          KEKUATAN: <span className={`font-semibold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                        </span>
                        <span className={`${mono.className} text-black/40`}>
                          {newPassword.length >= 8 ? "✓ Min. 8 Karakter" : "Min. 8 Karakter"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1">
                        <div className={`rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-black/10"}`} />
                        <div className={`rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-black/10"}`} />
                        <div className={`rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-black/10"}`} />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-sm hover:bg-black/85 transition disabled:opacity-50 mt-4"
                >
                  {isLoading ? "MENYIMPAN..." : "SIMPAN PASSWORD BARU"}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-black/10 text-center">
              <Link
                href="/login"
                className="text-xs text-black/60 hover:text-black underline underline-offset-4 transition font-sans"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
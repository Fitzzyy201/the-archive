"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-black">
      <Navbar />

      <main
        className={`${jakarta.className} flex flex-1 items-center justify-center px-4 pb-28 pt-10 sm:px-6 sm:pt-14 md:pb-20`}
      >
        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-9">
            <h1
              className={`${jakarta.className} text-[30px] font-bold leading-[1.15] tracking-tight text-black sm:text-4xl`}
            >
              {step === 1 && "Pulihkan Akun"}
              {step === 2 && "Verifikasi OTP"}
              {step === 3 && "Password Baru"}
            </h1>
            <p className="mx-auto mt-3 max-w-[340px] text-[13px] leading-relaxed text-black/50 sm:text-sm">
              {step === 1 && "Masukkan email terdaftar Anda untuk menerima kode OTP 6 digit."}
              {step === 2 && `Masukkan 6 digit kode OTP yang kami kirimkan ke ${email}`}
              {step === 3 && "Buat kata sandi baru yang aman untuk akun The Archive Anda."}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-sm border border-black/[0.08] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)] sm:p-8">
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-black/60">
                    ALAMAT EMAIL TERDAFTAR
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="mt-2 w-full border-b border-black/15 bg-transparent px-0.5 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-sm bg-black py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "MEMPROSES..." : "KIRIM KODE OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
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
                      className={`${jakarta.className} h-14 w-full min-w-0 rounded-sm border border-black/15 bg-[#FAF9F6]/60 text-center text-lg font-semibold text-black outline-none transition focus:border-black focus:bg-white sm:h-16 sm:text-xl`}
                      placeholder="•"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-sm bg-black py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "MEMVERIFIKASI..." : "VERIFIKASI KODE"}
                </button>

                <p className="text-[12px] leading-relaxed text-black/50 sm:text-[13px]">
                  Tidak menerima kode?{" "}
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-semibold text-black underline underline-offset-4 transition hover:text-black/60"
                  >
                    Kirim Ulang
                  </button>
                </p>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-black/60">
                    KATA SANDI BARU
                  </label>
                  <div className="relative mt-2 flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-b border-black/15 bg-transparent px-0.5 py-2.5 pr-10 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 flex h-9 w-9 items-center justify-center text-black/40 transition hover:text-black focus:outline-none"
                      title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="uppercase tracking-wide text-black/50">
                          KEKUATAN:{" "}
                          <span className={`font-semibold ${passwordStrength.text}`}>
                            {passwordStrength.label}
                          </span>
                        </span>
                        <span className="shrink-0 text-black/40">
                          {newPassword.length >= 8 ? "✓ Min. 8 Karakter" : "Min. 8 Karakter"}
                        </span>
                      </div>
                      <div className="grid h-1.5 grid-cols-3 gap-1.5">
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
                  className="w-full rounded-sm bg-black py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "MENYIMPAN..." : "SIMPAN PASSWORD BARU"}
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-black/10 pt-5 text-center">
              <Link
                href="/login"
                className="inline-flex text-[12px] font-medium text-black/55 underline-offset-4 transition hover:text-black hover:underline"
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

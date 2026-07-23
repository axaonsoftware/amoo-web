"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { SITE_NAME } from "../../lib/constants";
import { trackEvent } from "../../lib/tracking";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCircle2,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function RightPanel() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await api.adminLogin({ email, password });
      if (!data.admin) throw new Error("Invalid response from server");
      loginUser({ ...data.admin, kind: "admin" });
      setLoginSuccess(true);
      trackEvent("login", { method: "email", role: "admin" });
      setTimeout(() => router.push("/admin/admin-dashboard"), 1200);
    } catch (err: any) {
      setApiError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="relative flex w-full items-center justify-center overflow-hidden bg-[#FBF8FD] px-5 py-8 sm:px-8 sm:py-12 md:px-16 md:w-1/2">
      <Image
        src="https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1600&q=80"
        fill
        sizes="50vw"
        alt=""
        className="object-cover opacity-[0.035]"
      />

      <div className="absolute left-1/2 top-0 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-[#7E22CE]/10 blur-[120px]" />

      <div className="relative z-20 w-full max-w-[620px]">
        <div className="mx-auto flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-[#F8F0FF] shadow-[0_10px_40px_rgba(124,58,237,.18)]">
          <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#4C158D] text-white shadow-xl">
            <UserCircle2 size={32} className="sm:hidden" />
            <UserCircle2 size={42} className="hidden sm:block" />
          </div>
        </div>

        <h1 className="mt-6 sm:mt-8 text-center font-serif text-4xl sm:text-5xl lg:text-[58px] font-bold leading-none text-[#2F0B57]">
          Welcome Admin!
        </h1>

        <div className="mt-5 sm:mt-7 flex items-center justify-center gap-3 sm:gap-4">
          <div className="h-px w-16 sm:w-28 lg:w-44 bg-[#E9B44C]" />
          <div className="h-2 w-2 sm:h-3 sm:w-3 rotate-45 bg-[#E9B44C]" />
          <div className="h-px w-16 sm:w-28 lg:w-44 bg-[#E9B44C]" />
        </div>

        <p className="mt-5 sm:mt-7 text-center text-lg sm:text-xl lg:text-[24px] text-[#4B4B4B]">
          Sign in to access the {SITE_NAME} Admin Panel
        </p>

        {loginSuccess && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
            <CheckCircle2 size={20} />
            <span className="text-sm sm:text-base font-medium">Login successful! Redirecting...</span>
          </div>
        )}

        {apiError && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm sm:text-base font-medium">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mt-8 sm:mt-14">
            <label className="mb-3 sm:mb-4 block text-base sm:text-lg lg:text-[22px] font-semibold text-[#231942]">
              Email Address
            </label>
            <div className={`flex h-14 sm:h-[78px] items-center rounded-xl sm:rounded-2xl border bg-white px-4 sm:px-6 shadow-sm transition ${errors.email ? "border-red-400" : "border-[#DDD9EC]"}`}>
              <Mail className={`shrink-0 ${errors.email ? "text-red-400" : "text-[#8B86A7]"}`} size={24} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="Enter your admin email"
                className="ml-4 sm:ml-5 h-full w-full bg-transparent text-base sm:text-lg lg:text-[21px] outline-none placeholder:text-[#9996AF]"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle size={14} /> {errors.email}
              </p>
            )}
          </div>

          <div className="mt-6 sm:mt-10">
            <label className="mb-3 sm:mb-4 block text-base sm:text-lg lg:text-[22px] font-semibold text-[#231942]">
              Password
            </label>
            <div className={`flex h-14 sm:h-[78px] items-center rounded-xl sm:rounded-2xl border bg-white px-4 sm:px-6 shadow-sm transition ${errors.password ? "border-red-400" : "border-[#DDD9EC]"}`}>
              <Lock className={`shrink-0 ${errors.password ? "text-red-400" : "text-[#8B86A7]"}`} size={24} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="Enter your password"
                className="ml-4 sm:ml-5 h-full w-full bg-transparent text-base sm:text-lg lg:text-[21px] outline-none placeholder:text-[#9996AF]"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="shrink-0 text-[#8B86A7] hover:text-[#6A21C8] transition">
                {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle size={14} /> {errors.password}
              </p>
            )}
          </div>

          <div className="mt-6 sm:mt-9 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-3 sm:gap-4">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((v) => !v)}
                className="h-5 w-5 sm:h-6 sm:w-6 accent-[#6517C6]"
              />
              <span className="text-base sm:text-lg lg:text-[22px] text-[#322F43]">Remember Me</span>
            </label>
            <Link href="/contact" className="text-base sm:text-lg lg:text-[21px] font-semibold text-[#5B1AC8] hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="mt-8 sm:mt-12 flex h-16 sm:h-[82px] w-full items-center justify-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#4B0CA3] via-[#7C1BE5] to-[#5A0FC6] text-lg sm:text-2xl lg:text-[28px] font-semibold text-white shadow-[0_20px_35px_rgba(109,40,217,.35)] transition hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <>
                <UserCircle2 size={30} />
                Login to Dashboard
                <ArrowRight className="ml-3" size={30} />
              </>
            )}
          </button>
        </form>

        <div className="my-8 sm:my-12 flex items-center gap-4 sm:gap-5">
          <div className="h-px flex-1 bg-[#E3DFEC]" />
          <span className="text-sm sm:text-base lg:text-[20px] text-[#6E6A83]">or continue with</span>
          <div className="h-px flex-1 bg-[#E3DFEC]" />
        </div>

        <button className="flex h-14 sm:h-[82px] w-full items-center justify-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border border-[#E6E2F1] bg-white text-base sm:text-xl lg:text-[24px] font-medium text-[#2B2B2B] transition hover:bg-gray-50 active:scale-[0.99]">
          <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={28} height={28} unoptimized alt="Google" />
          Continue with Google
        </button>

        <button className="mt-4 sm:mt-6 flex h-14 sm:h-[82px] w-full items-center justify-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border border-[#E6E2F1] bg-white text-base sm:text-xl lg:text-[24px] font-medium text-[#2B2B2B] transition hover:bg-gray-50 active:scale-[0.99]">
          <Image src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" width={30} height={30} unoptimized alt="Microsoft" />
          Continue with Microsoft
        </button>

        <div className="mt-10 sm:mt-16 flex items-start gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border border-[#EEE4FF] bg-[#F6EDFF] p-4 sm:p-6">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#6A21C8] shadow">
            <Shield size={28} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-[#2D2045]">
              This is a restricted area.
            </h3>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-[19px] leading-6 sm:leading-8 text-[#5C5872]">
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

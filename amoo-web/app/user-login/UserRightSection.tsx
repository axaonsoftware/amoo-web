"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { trackEvent } from "../../lib/tracking";

export default function UserRightPanel() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"user" | "astrologer">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email or mobile number is required";
    } else if (email.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    } else if (!email.includes("@") && !/^\d{10}$/.test(email.replace(/\s/g, ""))) {
      newErrors.email = "Enter a valid 10-digit mobile number";
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
      const isAstrologer = activeTab === "astrologer";
      const data = isAstrologer
        ? await api.login({ email, password, role: "astrologer" })
        : await api.login({ email, password });
      if (!data.user) throw new Error("Invalid response from server");
      if (isAstrologer && data.user.role !== "astrologer") {
        throw new Error("This account is not registered as an astrologer");
      }
      loginUser({ ...data.user, kind: "user" });
      setLoginSuccess(true);
      trackEvent("login", { method: "email", role: isAstrologer ? "astrologer" : "user" });
      const dest = isAstrologer ? "/astrologer-dashboard" : "/user-dashboard";
      setTimeout(() => router.push(dest), 1200);
    } catch (err: any) {
      setApiError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const tabLabel = activeTab === "astrologer" ? "Astrologer" : "User";

  return (
    <div className="w-full h-full bg-white flex flex-col items-center px-6 sm:px-10 md:px-14 pt-10 sm:pt-12 pb-8 sm:pb-10 md:w-1/2">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-amber-500 text-lg">⟜</span>
            <h2
              className="text-[1.4rem] lg:text-[1.9rem] leading-none font-serif font-bold"
              style={{ color: "#3E1E7A" }}
            >
              Welcome Back!
            </h2>
            <span className="text-amber-500 text-lg">⟝</span>
          </div>
          <p className="text-gray-500 text-[0.9rem] mt-2">
            Login to continue your spiritual journey
          </p>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => { setActiveTab("user"); setErrors({}); }}
            className={`flex items-center gap-2 px-1 pb-3 mr-8 text-sm font-medium relative transition ${
              activeTab === "user" ? "text-[#5B2A9D]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Sparkles size={16} />
            User Login
            {activeTab === "user" && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#5B2A9D]" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("astrologer"); setErrors({}); }}
            className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium relative transition ${
              activeTab === "astrologer" ? "text-[#5B2A9D]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <User size={16} />
            Astrologer Login
            {activeTab === "astrologer" && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#5B2A9D]" />
            )}
          </button>
        </div>

        {loginSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            <CheckCircle2 size={16} />
            Login successful! Redirecting to {tabLabel} dashboard...
          </div>
        )}

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Email Address / Mobile Number
            </label>
            <div className={`relative ${errors.email ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]" />
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="Enter your email or mobile number"
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-purple-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Password
            </label>
            <div className={`relative ${errors.password ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end -mt-2">
            <Link href="/contact" className="text-xs font-medium text-[#5B2A9D]">
              Forgot Password?
            </Link>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember((v) => !v)}
              className="w-4 h-4 rounded accent-[#5B2A9D]"
            />
            Remember Me
          </label>

          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition disabled:opacity-60 active:scale-[0.99]"
            style={{
              background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or continue with</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition active:scale-[0.98]">
            <GoogleIcon /> Continue with Google
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition active:scale-[0.98]">
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#5B2A9D] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.2 3 9.5 7.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 35.6 26.9 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.4 40.5 16.1 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5C41 35.4 44 30 44 24c0-1.4-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
      <path d="M16.365 1.43c0 1.14-.463 2.093-1.39 2.958-.928.865-2.056 1.363-3.383 1.24-.02-1.09.5-2.14 1.39-2.99.94-.86 2.13-1.36 3.383-1.208zm4.615 16.523c-.398.926-.87 1.783-1.417 2.573-.756 1.1-1.375 1.86-1.855 2.284-.744.694-1.542 1.05-2.394 1.067-.615 0-1.354-.175-2.216-.53-.865-.353-1.66-.53-2.386-.53-.762 0-1.583.177-2.462.53-.88.355-1.588.54-2.126.556-.816.036-1.632-.334-2.447-1.107-.52-.463-1.166-1.253-1.94-2.37-.83-1.198-1.513-2.586-2.048-4.165C.63 13.998.353 12.523.353 11.1c0-1.633.353-3.04 1.06-4.22.556-.947 1.293-1.694 2.216-2.243.923-.55 1.92-.832 2.99-.852.65 0 1.5.202 2.552.6 1.05.398 1.724.6 2.02.6.222 0 .967-.234 2.23-.7 1.196-.434 2.207-.614 3.037-.542 2.243.18 3.928 1.064 5.05 2.654-2.007 1.216-3 2.92-2.98 5.11.018 1.71.638 3.133 1.86 4.267.554.526 1.172.933 1.858 1.222-.15.435-.31.85-.483 1.25z" />
    </svg>
  );
}

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
  const [activeTab, setActiveTab] = useState<"user">("user");
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
    // The API authenticates on email only (POST /api/auth/login validates
    // `email` with Joi's email rule), so accepting a mobile number here would
    // just produce a 400 after the round-trip.
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
      const data = await api.login({ email, password });
      if (!data.user) throw new Error("Invalid response from server");
      loginUser({ ...data.user, kind: "user" });
      setLoginSuccess(true);
      trackEvent("login", { method: "email", role: "user" });
      setTimeout(() => router.push("/"), 1200);
    } catch (err: any) {
      setApiError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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
          <button className="flex items-center gap-2 px-1 pb-3 mr-8 text-sm font-medium relative text-[#5B2A9D]">
            <Sparkles size={16} />
            User Login
            <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#5B2A9D]" />
          </button>
        </div>

        {loginSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            <CheckCircle2 size={16} />
            Login successful! Redirecting...
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
              Email Address
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
            {/* /forgot-password and POST /api/auth/forgot-password are both
                fully implemented; this used to point at /contact, leaving a
                working self-service reset flow completely unreachable. */}
            <Link href="/forgot-password" className="text-xs font-medium text-[#5B2A9D] hover:underline">
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

        {/* "Continue with Google / Apple" buttons were removed here.
            There is no OAuth support anywhere in the stack: no provider client
            id, no /api/auth/google or /api/auth/apple route, and no oauth
            columns on `users`. The buttons rendered, were clickable, and did
            absolutely nothing — a dead end on the primary sign-in path.
            Re-add them together with the backend routes, not before. */}

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

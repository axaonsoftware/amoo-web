"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { trackEvent } from "../../lib/tracking";

export default function SignUpForm() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (phone.trim() && !/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const data = await api.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
      if (!data.user) throw new Error("Invalid response from server");
      loginUser({ ...data.user, kind: "user" });
      setSignupSuccess(true);
      trackEvent("signup", { method: "email" });
      setTimeout(() => router.push("/user-dashboard"), 1200);
    } catch (err: any) {
      setApiError(err?.message || "Registration failed. Please try again.");
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
              Create Account
            </h2>
            <span className="text-amber-500 text-lg">⟝</span>
          </div>
          <p className="text-gray-500 text-[0.9rem] mt-2">
            Begin your spiritual journey with us
          </p>
        </div>

        {signupSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            <CheckCircle2 size={16} />
            Account created! Redirecting to dashboard...
          </div>
        )}

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Full Name
            </label>
            <div className={`relative ${errors.name ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-purple-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Email Address
            </label>
            <div className={`relative ${errors.email ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="Enter your email"
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
              Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className={`relative ${errors.phone ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
                placeholder="Enter your 10-digit mobile number"
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-purple-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.phone}
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
                placeholder="Create a password (min 8 characters)"
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

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Confirm Password
            </label>
            <div className={`relative ${errors.confirmPassword ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || signupSuccess}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition disabled:opacity-60 active:scale-[0.99]"
            style={{
              background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/user-login" className="text-[#5B2A9D] font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

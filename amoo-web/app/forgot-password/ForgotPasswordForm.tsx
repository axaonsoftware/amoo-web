"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: { email?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
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
      await api.forgotPassword({ email });
      setSuccess(true);
    } catch (err: unknown) {
      setApiError((err as Error)?.message || "Failed to send reset OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center px-10 pt-12 pb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-amber-500 text-lg">⟜</span>
          <h2
            className="text-[1.4rem] lg:text-[1.9rem] leading-none font-serif font-bold"
            style={{ color: "#3E1E7A" }}
          >
            Check Your Email
          </h2>
          <span className="text-amber-500 text-lg">⟝</span>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm w-full text-left">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>
            If an account exists for <strong>{email}</strong>, a 6-digit OTP has been sent. It expires in 15 minutes.
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-8">
          Enter the OTP on the next page to reset your password.
        </p>

        <button
          onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition active:scale-[0.99]"
          style={{
            background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
          }}
        >
          Enter OTP <ArrowRight size={18} />
        </button>

        <Link
          href="/user-login"
          className="mt-5 flex items-center gap-1.5 text-sm text-[#5B2A9D] font-medium hover:underline"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 sm:px-10 md:px-14 pt-10 sm:pt-12 pb-8 sm:pb-10">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-amber-500 text-lg">⟜</span>
            <h2
              className="text-[1.4rem] lg:text-[1.9rem] leading-none font-serif font-bold"
              style={{ color: "#3E1E7A" }}
            >
              Forgot Password?
            </h2>
            <span className="text-amber-500 text-lg">⟝</span>
          </div>
          <p className="text-gray-500 text-[0.9rem] mt-2">
            Enter your email and we&apos;ll send you a reset OTP
          </p>
        </div>

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="forgotpasswordform-email-address" className="block text-sm font-medium text-gray-800 mb-1.5">
              Email Address
            </label>
            <div className={`relative ${errors.email ? "ring-2 ring-red-300 rounded-lg" : ""}`}>
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]" />
              <input id="forgotpasswordform-email-address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-purple-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition disabled:opacity-60 active:scale-[0.99]"
            style={{
              background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Send OTP <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <Link
          href="/user-login"
          className="flex items-center justify-center gap-1.5 text-sm text-[#5B2A9D] font-medium hover:underline"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}

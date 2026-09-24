"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { api } from "../../lib/api";
import { useRateLimit } from "../../lib/use-rate-limit";
import RateLimitAlert from "../components/RateLimitAlert";

function ResetFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { isCoolingDown, remainingSeconds } = useRateLimit();
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const expiresAt = Number(
        sessionStorage.getItem("reset_otp_expires_at") || 0,
      );
      if (!expiresAt) {
        setOtpRemainingSeconds(0);
        return;
      }
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setOtpRemainingSeconds(remaining);
      if (remaining === 0) {
        sessionStorage.removeItem("reset_otp_expires_at");
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be a 6-digit number";
    }
    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
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
      await api.resetPassword({ email, otp, password });
      sessionStorage.removeItem("reset_otp_expires_at");
      setSuccess(true);
    } catch (err: unknown) {
      setApiError(
        (err as Error)?.message ||
          "Failed to reset password. Please try again.",
      );
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
            Password Reset!
          </h2>
          <span className="text-amber-500 text-lg">⟝</span>
        </div>

        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm w-full text-left"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span>Your password has been updated successfully.</span>
        </div>

        <p className="text-gray-500 text-sm mb-8">
          You can now log in with your new password.
        </p>

        <button
          onClick={() => router.push("/user-login")}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition active:scale-[0.99]"
          style={{
            background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
          }}
        >
          Go to Login <ArrowRight size={18} />
        </button>
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
              Reset Password
            </h2>
            <span className="text-amber-500 text-lg">⟝</span>
          </div>
          <p className="text-gray-500 text-[0.9rem] mt-2">
            Enter the OTP sent to your email and set a new password
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm"
          >
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <RateLimitAlert remainingSeconds={remainingSeconds} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="resetpasswordform-email-address"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Email Address
            </label>
            <div
              className={`relative ${errors.email ? "ring-2 ring-red-300 rounded-lg" : ""}`}
            >
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]"
              />
              <input
                id="resetpasswordform-email-address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
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

          <div>
            <label
              htmlFor="resetpasswordform-otp-code"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              OTP Code
            </label>
            <div
              className={`relative ${errors.otp ? "ring-2 ring-red-300 rounded-lg" : ""}`}
            >
              <KeyRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]"
              />
              <input
                id="resetpasswordform-otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  if (errors.otp) setErrors((p) => ({ ...p, otp: undefined }));
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-purple-200 text-sm placeholder-gray-400 tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            {errors.otp && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.otp}
              </p>
            )}

            {otpRemainingSeconds > 0 ? (
              <p className="mt-2 text-xs text-gray-500">
                OTP valid for{" "}
                <span className="font-semibold text-[#5B2A9D]">
                  {Math.floor(otpRemainingSeconds / 60)}:
                  {String(otpRemainingSeconds % 60).padStart(2, "0")}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-red-500">
                OTP has expired. Please request a new OTP.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="resetpasswordform-new-password"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              New Password
            </label>
            <div
              className={`relative ${errors.password ? "ring-2 ring-red-300 rounded-lg" : ""}`}
            >
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="resetpasswordform-new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="At least 8 characters"
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
            <label
              htmlFor="resetpasswordform-confirm-new-password"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Confirm New Password
            </label>
            <div
              className={`relative ${errors.confirmPassword ? "ring-2 ring-red-300 rounded-lg" : ""}`}
            >
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="resetpasswordform-confirm-new-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                placeholder="Re-enter your new password"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || success || isCoolingDown}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition disabled:opacity-60 active:scale-[0.99]"
            style={{
              background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Reset Password <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex items-center justify-center gap-5 text-sm">
          <Link
            href="/forgot-password"
            className="flex items-center gap-1.5 text-[#5B2A9D] font-medium hover:underline"
          >
            <ArrowLeft size={14} /> Resend OTP
          </Link>
          <Link
            href="/user-login"
            className="text-[#5B2A9D] font-medium hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#5B2A9D]" />
        </div>
      }
    >
      <ResetFormInner />
    </Suspense>
  );
}

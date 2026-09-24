"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import { useRateLimit } from "../../lib/use-rate-limit";
import RateLimitAlert from "../components/RateLimitAlert";

export default function AstrologerForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { isCoolingDown, remainingSeconds } = useRateLimit();
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const expiresAt = Number(
        sessionStorage.getItem("expert_reset_otp_expires_at") || 0,
      );

      if (!expiresAt) {
        setOtpRemainingSeconds(0);
        return;
      }

      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

      setOtpRemainingSeconds(remaining);

      if (remaining === 0) {
        sessionStorage.removeItem("expert_reset_otp_expires_at");
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

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
    setResendSuccess(false);

    try {
      await api.expertForgotPassword({ email });

      const expiresAt = Date.now() + 15 * 60 * 1000;

      sessionStorage.setItem("expert_reset_otp_expires_at", String(expiresAt));

      setOtpRemainingSeconds(15 * 60);
      setSuccess(true);
    } catch (err: unknown) {
      setApiError(
        (err as Error)?.message ||
          "Failed to send reset OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!email.trim() || resendLoading || isCoolingDown) return;

    setResendLoading(true);
    setApiError(null);
    setResendSuccess(false);

    try {
      await api.expertForgotPassword({ email });

      const expiresAt = Date.now() + 15 * 60 * 1000;

      sessionStorage.setItem("expert_reset_otp_expires_at", String(expiresAt));

      setOtpRemainingSeconds(15 * 60);
      setResendSuccess(true);
    } catch (err: unknown) {
      setApiError(
        (err as Error)?.message || "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResendLoading(false);
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

        {apiError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm w-full text-left"
          >
            <AlertCircle size={16} className="shrink-0" />
            {apiError}
          </div>
        )}

        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm w-full text-left"
        >
          <CheckCircle2 size={18} className="shrink-0" />

          <span>
            If an expert account exists for <strong>{email}</strong>, a 6-digit
            OTP has been sent.
            {otpRemainingSeconds > 0 ? (
              <>
                {" "}
                It expires in{" "}
                <strong>
                  {Math.floor(otpRemainingSeconds / 60)}:
                  {String(otpRemainingSeconds % 60).padStart(2, "0")}
                </strong>
                .
              </>
            ) : (
              <> OTP has expired. Please request a new OTP.</>
            )}
          </span>
        </div>

        {resendSuccess && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 size={15} />A new OTP has been sent to your email.
          </div>
        )}

        <p className="text-gray-500 text-sm mb-4">
          Enter the OTP on the next page to reset your password.
        </p>

        <button
          onClick={() =>
            router.push(
              `/astrologer-reset-password?email=${encodeURIComponent(email)}`,
            )
          }
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition active:scale-[0.99]"
          style={{
            background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
          }}
        >
          Enter OTP <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={otpRemainingSeconds > 0 || resendLoading || isCoolingDown}
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#5B2A9D] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Resending OTP...
            </>
          ) : otpRemainingSeconds > 0 ? (
            <>
              <RefreshCw size={15} />
              Resend OTP
              {/* ({Math.floor(otpRemainingSeconds / 60)}:
              {String(otpRemainingSeconds % 60).padStart(2, "0")}) */}
            </>
          ) : (
            <>
              <RefreshCw size={15} />
              Resend OTP
            </>
          )}
        </button>

        <RateLimitAlert remainingSeconds={remainingSeconds} />

        <Link
          href="/astrologer-login"
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
              Astrologer Forgot Password?
            </h2>

            <span className="text-amber-500 text-lg">⟝</span>
          </div>

          <p className="text-gray-500 text-[0.9rem] mt-2">
            Enter your email and we&apos;ll send you a reset OTP
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
              htmlFor="astrologer-forgot-password-email"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Email Address
            </label>

            <div
              className={`relative ${
                errors.email ? "ring-2 ring-red-300 rounded-lg" : ""
              }`}
            >
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]"
              />

              <input
                id="astrologer-forgot-password-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  if (errors.email) {
                    setErrors((p) => ({
                      ...p,
                      email: undefined,
                    }));
                  }
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

          <button
            type="submit"
            disabled={isLoading || isCoolingDown}
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
          href="/astrologer-login"
          className="flex items-center justify-center gap-1.5 text-sm text-[#5B2A9D] font-medium hover:underline"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}

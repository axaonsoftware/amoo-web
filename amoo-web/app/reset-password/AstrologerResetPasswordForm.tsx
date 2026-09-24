"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import { useRateLimit } from "../../lib/use-rate-limit";
import RateLimitAlert from "../components/RateLimitAlert";

export default function AstrologerResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [errors, setErrors] = useState<{
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    const newErrors: {
      otp?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      setApiError("Email is missing. Please request a new OTP.");
      return false;
    }

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "Enter a valid 6-digit OTP";
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

    if (otpRemainingSeconds === 0) {
      setApiError("OTP has expired. Please request a new OTP.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await api.expertResetPassword({
        email,
        otp,
        password,
      });

      sessionStorage.removeItem("expert_reset_otp_expires_at");

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

  async function handleResendOtp() {
    if (!email.trim() || resendLoading || otpRemainingSeconds > 0) return;
    setResendLoading(true);
    setApiError(null);
    setResendSuccess(false);
    try {
      await api.expertForgotPassword({ email });
      const expiresAt = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem("expert_reset_otp_expires_at", String(expiresAt));
      setOtpRemainingSeconds(15 * 60);
      setResendSuccess(true);
      setOtp("");
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
            Password Reset Successful
          </h2>

          <span className="text-amber-500 text-lg">⟝</span>
        </div>

        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm w-full text-left"
        >
          <CheckCircle2 size={18} className="shrink-0" />

          <span>
            Your astrologer account password has been reset successfully. Please
            login with your new password.
          </span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/astrologer-login")}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition active:scale-[0.99]"
          style={{
            background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
          }}
        >
          Go to Astrologer Login <ArrowRight size={18} />
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
              Astrologer Reset Password
            </h2>

            <span className="text-amber-500 text-lg">⟝</span>
          </div>

          <p className="text-gray-500 text-[0.9rem] mt-2">
            Enter the OTP sent to your email and create a new password
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm"
          >
            <AlertCircle size={16} className="shrink-0" />
            {apiError}
          </div>
        )}

        <RateLimitAlert remainingSeconds={remainingSeconds} />

        <div className="mb-5 flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-100 p-3 text-sm text-gray-600">
          <Mail size={16} className="text-[#5B2A9D] shrink-0" />

          <span className="truncate">
            OTP sent to <strong>{email}</strong>
          </span>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          <span>OTP expires in</span>

          <strong>
            {otpRemainingSeconds > 0
              ? `${Math.floor(otpRemainingSeconds / 60)}:${String(
                  otpRemainingSeconds % 60,
                ).padStart(2, "0")}`
              : "Expired"}
          </strong>
        </div>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendLoading || otpRemainingSeconds > 0}
          className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-[#5B2A9D] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Resending OTP...
            </>
          ) : (
            <>
              <RefreshCw size={15} />
              Resend OTP
            </>
          )}
        </button>

        {resendSuccess && (
          <div className="mb-5 flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle2 size={15} />A new OTP has been sent to your email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="astrologer-reset-otp"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Enter OTP
            </label>

            <input
              id="astrologer-reset-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);

                setOtp(value);

                if (errors.otp) {
                  setErrors((p) => ({ ...p, otp: undefined }));
                }
              }}
              placeholder="Enter 6-digit OTP"
              className={`w-full px-3 py-3 rounded-lg border text-sm tracking-[0.3em] text-center font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                errors.otp
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-purple-200"
              }`}
            />

            {errors.otp && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} /> {errors.otp}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="astrologer-reset-password"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              New Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]"
              />

              <input
                id="astrologer-reset-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (errors.password) {
                    setErrors((p) => ({ ...p, password: undefined }));
                  }
                }}
                placeholder="Enter new password"
                className={`w-full pl-10 pr-10 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                  errors.password
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-purple-200"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
              htmlFor="astrologer-confirm-password"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]"
              />

              <input
                id="astrologer-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  if (errors.confirmPassword) {
                    setErrors((p) => ({
                      ...p,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-10 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                  errors.confirmPassword
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-purple-200"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            disabled={isLoading || isCoolingDown || otpRemainingSeconds === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-white font-medium text-[0.95rem] transition disabled:opacity-60 active:scale-[0.99]"
            style={{
              background: "linear-gradient(90deg,#3E1E7A 0%,#6B2FA0 100%)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Resetting Password...
              </>
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

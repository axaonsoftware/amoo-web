"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { trackEvent } from "../../lib/tracking";

export default function AstrologerRightPanel() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Read callbackUrl from the query string (set by middleware when redirecting
  // an unauthenticated expert to login). After login we redirect there instead
  // of the default dashboard.
  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl") ||
        "/user-dashboard"
      : "/user-dashboard";

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
      const data = await api.expertLogin({ email, password });
      if (!data.expert) throw new Error("Invalid response from server");
      loginUser({ ...data.expert, kind: "expert" });
      setLoginSuccess(true);
      trackEvent("login", { method: "email", role: "expert" });
      setTimeout(() => router.push(callbackUrl), 1200);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
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
              Astrologer Login
            </h2>
            <span className="text-amber-500 text-lg">⟝</span>
          </div>
          <p className="text-gray-500 text-[0.9rem] mt-2">
            Sign in to manage consultations &amp; client reports
          </p>
        </div>

        {loginSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            <CheckCircle2 size={16} />
            Login successful! Redirecting to dashboard...
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
            <label
              htmlFor="astrologerrightsection-email-address"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Email Address
            </label>
            <div
              className={`relative ${errors.email ? "ring-2 ring-red-300 rounded-lg" : ""}`}
            >
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B2A9D]"
              />
              <input
                id="astrologerrightsection-email-address"
                type="text"
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
              htmlFor="astrologerrightsection-password"
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              Password
            </label>
            <div
              className={`relative ${errors.password ? "ring-2 ring-red-300 rounded-lg" : ""}`}
            >
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="astrologerrightsection-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
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
            {/* Experts have no self-service reset — an admin sets their password
                via POST /api/experts/:id/set-password. /contact is the correct
                destination here, made explicit so it does not look like the bug
                that was fixed on the user login page. */}
            <Link
              href="/contact"
              className="text-xs font-medium text-[#5B2A9D] hover:underline"
            >
              Forgot Password? Contact support
            </Link>
          </div>

          {/* "Remember Me" was removed here. Its state was captured and never
              read: the backend issues a 30-day refresh token on every login
              regardless (JWT_REFRESH_EXPIRES_IN), so unchecking it changed
              nothing and the control promised a shorter session it could not
              deliver. Reinstate it together with a backend option that varies
              the refresh-token lifetime. */}

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

        <p className="text-center text-sm text-gray-600 mt-6">
          Not an astrologer?{" "}
          <Link
            href="/user-login"
            className="text-[#5B2A9D] font-semibold hover:underline"
          >
            User Login
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { SITE_NAME } from "../../lib/constants";
import { trackEvent } from "../../lib/tracking";
import { errorMessage } from "../../lib/errors";
import { useRateLimit } from "../../lib/use-rate-limit";
import RateLimitAlert from "../components/RateLimitAlert";

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

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { isCoolingDown, remainingSeconds } = useRateLimit();

  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl") ||
        "/admin/admin-dashboard"
      : "/admin/admin-dashboard";

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    //  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    //   newErrors.email = "Enter a valid email address";
    // }

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
      const data = (await api.adminLogin({ email, password })) as {
        admin?: {
          id: number;
          name: string;
          email: string;
          phone?: string;
          avatar?: string;
          verified?: boolean;
        };
      };

      if (!data.admin) {
        throw new Error("Invalid response from server");
      }

      loginUser({
        ...data.admin,
        kind: "admin",
      });

      setLoginSuccess(true);

      trackEvent("login", {
        method: "email",
        role: "admin",
      });

      setTimeout(() => router.push(callbackUrl), 1200);
    } catch (err: unknown) {
      setApiError(errorMessage(err, "Login failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className="
      relative
      flex
      h-auto
      w-full
      items-center
      justify-center
      overflow-hidden
      bg-[#FBF8FD]
      px-5
      py-7
      md:h-full
      md:w-1/2
      md:px-8
      md:py-5
      lg:px-10
    "
    >
      <Image
        src="https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1600&q=80"
        fill
        sizes="50vw"
        alt=""
        className="pointer-events-none object-cover opacity-[0.025]"
      />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-[#7E22CE]/10 blur-[90px]" />

      <div className="relative z-20 w-full max-w-[390px]">
        {/* ICON */}
        <div className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#F8F0FF] shadow-[0_6px_25px_rgba(124,58,237,.16)]">
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#4C158D] text-white shadow-lg">
            <UserCircle2 size={25} />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="mt-3 text-center font-serif text-[30px] font-bold leading-tight text-[#2F0B57] sm:text-[34px]">
          Welcome Admin!
        </h1>

        {/* DIVIDER */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-[#E9B44C] sm:w-16" />
          <div className="h-2 w-2 rotate-45 bg-[#E9B44C]" />
          <div className="h-px w-12 bg-[#E9B44C] sm:w-16" />
        </div>

        {/* SUBTITLE */}
        <p className="mt-3 text-center text-[13px] leading-5 text-[#4B4B4B] sm:text-sm">
          Sign in to access the {SITE_NAME} Admin Panel
        </p>

        {/* SUCCESS */}
        {loginSuccess && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700"
          >
            <CheckCircle2 size={16} />
            <span className="text-xs font-medium">
              Login successful! Redirecting...
            </span>
          </div>
        )}

        {/* API ERROR */}
        {apiError && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
          >
            <AlertCircle size={16} />
            <span className="text-xs font-medium">{apiError}</span>
          </div>
        )}

        <RateLimitAlert remainingSeconds={remainingSeconds} />

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="mt-5">
            <label
              htmlFor="rightpanel-email-address"
              className="mb-1.5 block text-[13px] font-semibold text-[#231942]"
            >
              Email Address
            </label>

            <div
              className={`flex h-[46px] items-center rounded-lg border bg-white px-3 shadow-sm transition ${
                errors.email ? "border-red-400" : "border-[#DDD9EC]"
              }`}
            >
              <Mail
                size={18}
                className={
                  errors.email
                    ? "shrink-0 text-red-400"
                    : "shrink-0 text-[#8B86A7]"
                }
              />

              <input
                id="rightpanel-email-address"
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
                placeholder="Enter your admin email"
                className="ml-2.5 h-full min-w-0 w-full bg-transparent text-[13px] outline-none placeholder:text-[#9996AF]"
              />
            </div>

            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                <AlertCircle size={12} />
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mt-3.5">
            <label
              htmlFor="rightpanel-password"
              className="mb-1.5 block text-[13px] font-semibold text-[#231942]"
            >
              Password
            </label>

            <div
              className={`flex h-[46px] items-center rounded-lg border bg-white px-3 shadow-sm transition ${
                errors.password ? "border-red-400" : "border-[#DDD9EC]"
              }`}
            >
              <Lock
                size={18}
                className={
                  errors.password
                    ? "shrink-0 text-red-400"
                    : "shrink-0 text-[#8B86A7]"
                }
              />

              <input
                id="rightpanel-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (errors.password) {
                    setErrors((p) => ({
                      ...p,
                      password: undefined,
                    }));
                  }
                }}
                placeholder="Enter your password"
                className="ml-2.5 h-full min-w-0 w-full bg-transparent text-[13px] outline-none placeholder:text-[#9996AF]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 text-[#8B86A7] hover:text-[#6A21C8]"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                <AlertCircle size={12} />
                {errors.password}
              </p>
            )}
          </div>

          {/* FORGOT PASSWORD */}
          <div className="mt-3 flex justify-end">
            <Link
              href="/contact"
              className="text-xs font-semibold text-[#5B1AC8] hover:underline"
            >
              Forgot Password? Contact support
            </Link>
          </div>

          {/* LOGIN */}
          <button
            type="submit"
            disabled={isLoading || loginSuccess || isCoolingDown}
            className="
            mt-4
            flex
            h-[48px]
            w-full
            items-center
            justify-center
            gap-2.5
            rounded-lg
            bg-gradient-to-r
            from-[#4B0CA3]
            via-[#7C1BE5]
            to-[#5A0FC6]
            text-sm
            font-semibold
            text-white
            shadow-[0_12px_25px_rgba(109,40,217,.30)]
            transition
            hover:scale-[1.01]
            disabled:opacity-60
            disabled:hover:scale-100
          "
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <UserCircle2 size={20} />
                Login to Dashboard
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* RESTRICTED AREA */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#EEE4FF] bg-[#F6EDFF] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#6A21C8] shadow">
            <Shield size={19} />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#2D2045]">
              This is a restricted area.
            </h3>

            <p className="mt-0.5 text-[11px] leading-4 text-[#5C5872]">
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

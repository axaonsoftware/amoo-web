"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  // Token is passed via URL hash fragment (#email=...&token=...) rather than
  // query parameters, so it is never sent to the server in the HTTP request.
  // This prevents leakage through email logs, proxies, and referrer headers.
  const hash =
    typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
  const hashParams = new URLSearchParams(hash);
  const email = hashParams.get("email") || "";
  const token = hashParams.get("token") || "";

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState(
    "Invalid verification link. Please check the link and try again.",
  );

  useEffect(() => {
    if (!email || !token) {
      return;
    }
    api
      .verifyEmail({ email, token })
      .then((res) => {
        setStatus("success");
        setMessage(res?.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.message || "Verification failed. The link may have expired.",
        );
      });
  }, [email, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#faf7f2] to-[#f0e8d8] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5edfe]">
          {status === "verifying" ? (
            <Loader2 className="h-8 w-8 animate-spin text-[#5B2A9D]" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-[#3E1E7A]">
          {status === "verifying"
            ? "Verifying..."
            : status === "success"
              ? "Email Verified!"
              : "Verification Failed"}
        </h1>

        <p className="mt-3 text-sm text-gray-600">{message}</p>

        {email && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Mail className="h-4 w-4" />
            {email}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {status === "success" && (
            <button
              onClick={() => router.push("/user-login")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3E1E7A] to-[#6B2FA0] px-6 py-3 text-white font-medium transition active:scale-[0.99]"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {status === "error" && (
            <Link
              href="/user-login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#5B2A9D] px-6 py-3 text-[#5B2A9D] font-medium transition hover:bg-[#5B2A9D] hover:text-white"
            >
              Back to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

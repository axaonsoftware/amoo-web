"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";

export default function VerifyEmailBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.verified || user.kind === "admin" || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    setErr("");
    try {
      await api.verifyEmailSend();
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 shadow-sm">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-amber-400 hover:text-amber-600 transition"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
          {sent ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Mail className="h-5 w-5 text-amber-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-amber-900">
            {sent ? "Verification email sent!" : "Verify your email address"}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-[1.5] text-amber-700">
            {sent
              ? "Check your inbox and click the link to activate your account."
              : "You need to verify your email before you can book consultations or make payments."}
          </p>

          {err && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {err}
            </div>
          )}

          {!sent && (
            <button
              onClick={handleResend}
              disabled={sending}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {sending ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

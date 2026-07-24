"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Eye, EyeOff, Copy, Check } from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

/**
 * Set or reset an expert's login password.
 *
 * Experts sign in at /astrologer-login, but they have no self-service signup and
 * no password-reset route — `POST /api/auth/reset-password` only ever touches
 * the `users` table. The only way an expert can ever obtain a credential is
 * `POST /api/experts/:id/set-password`, which existed and worked but had no UI.
 *
 * Net effect before this dialog: the astrologer login page was unusable for
 * every expert created through the admin panel, because `experts.password_hash`
 * was always NULL and the login handler rejects that with "Invalid credentials".
 *
 * Setting a password also flips `experts.verified = 1` and bumps
 * `token_version`, which signs out any session the expert already had.
 */

// Server rule is min 8 (see the `setExpertPassword` Joi schema); generate
// comfortably above it. Ambiguous glyphs (O/0, l/1/I) are excluded because this
// value gets read aloud or retyped from a message.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generatePassword(length = 16): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export default function SetPasswordDialog({
  expert,
  onClose,
  onDone,
}: {
  expert: { id: number; name?: string; email?: string } | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fresh suggestion per expert, so reopening the dialog never reuses a value
  // that may already have been shared.
  useEffect(() => {
    if (expert) {
      setPassword(generatePassword());
      setShow(true);
      setError(null);
      setCopied(false);
    }
  }, [expert]);

  if (!expert) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — select the field and copy manually.");
    }
  };

  const save = async () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.admin.setExpertPassword(expert.id, password);
      onDone(`Password set for ${expert.name || "expert"}. Share it securely.`);
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Failed to set password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-password-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={saving ? undefined : onClose} />
      <div className="relative z-10 w-full max-w-[440px] rounded-[14px] border border-[#EEEDF4] bg-white p-6 shadow-[0_20px_60px_rgba(20,16,40,.18)]">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#F0EAFF]"
          >
            <KeyRound className="h-[18px] w-[18px] text-[#6D28D9]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 id="set-password-title" className="text-[15px] font-bold text-[#1F1836]">
              Set login password
            </h3>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-[#6B6480]">
              For <strong>{sanitize(expert.name) || "this expert"}</strong>
              {expert.email && <> ({sanitize(expert.email)})</>}. They sign in at{" "}
              <code className="rounded bg-[#F5F4F9] px-1 py-0.5 text-[11px]">/astrologer-login</code>.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="expert-password" className="mb-1 block text-[11px] font-medium text-[#3D3752]">
            Password
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="expert-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-[38px] w-full rounded-[8px] border border-[#E5E1F0] pl-3 pr-9 font-mono text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B879C] hover:text-[#3D3752]"
              >
                {show ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
            </div>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy password"
              className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] border border-[#E5E1F0] text-[#6D28D9] hover:bg-[#FAF7FF]"
            >
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setPassword(generatePassword()); setCopied(false); }}
            className="mt-2 text-[11px] font-medium text-[#6D28D9] hover:underline"
          >
            Generate a new one
          </button>

          <p className="mt-3 rounded-[8px] bg-[#FFF8E7] px-3 py-2 text-[11px] leading-[1.5] text-[#8A6212]">
            This password is shown once and stored only as a bcrypt hash — it cannot be
            retrieved later. Copy it now and send it through a secure channel. Setting it
            also signs the expert out of any existing session.
          </p>

          {error && (
            <p role="alert" className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-[8px] border border-[#E7E5EF] bg-white px-4 py-2 text-[12px] font-medium text-[#3D3752] hover:bg-[#F7F6FB] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || password.length < 8}
            className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-4 py-2 text-[12px] font-medium text-white disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {saving ? "Setting..." : "Set password"}
          </button>
        </div>
      </div>
    </div>
  );
}

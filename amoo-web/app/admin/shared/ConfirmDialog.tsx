"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  saving,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onCancel();
      if (e.key === "Tab" && dialog) {
        const focusables = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !saving && onCancel()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-[400px] rounded-[14px] border border-[#EEEDF4] bg-white p-6 shadow-[0_20px_60px_rgba(20,16,40,.18)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#FDE8E8]">
            <AlertTriangle
              className="h-[18px] w-[18px] text-[#EF4444]"
              strokeWidth={2}
            />
          </span>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-[15px] font-bold text-[#1F1836]"
            >
              {title}
            </h3>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-[#6B6480]">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-[8px] border border-[#E7E5EF] bg-white px-4 py-2 text-[12px] font-medium text-[#3D3752] hover:bg-[#F7F6FB] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#EF4444] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#DC2626] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

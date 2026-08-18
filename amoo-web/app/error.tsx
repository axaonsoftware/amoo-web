"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#fdfaf5] px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-[#e9b85c]" />
        </div>
        <h2 className="font-display text-xl font-bold text-[#2c0c47]">
          Something went wrong
        </h2>
        <p className="max-w-sm text-sm text-[#6c6b78]">
          We hit an unexpected snag. Please try again.
          {error?.digest && (
            <span className="mt-2 block text-xs text-[#6c6b78]/60">
              Reference: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(109,40,217,.35)] transition hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

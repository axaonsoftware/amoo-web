"use client";

import { AlertTriangle } from "lucide-react";

export default function RateLimitAlert({
  remainingSeconds,
}: {
  remainingSeconds: number;
}) {
  if (remainingSeconds <= 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const time =
    minutes > 0
      ? `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`
      : `${seconds}s`;

  return (
    <div
      role="alert"
      className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-700 text-sm"
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span>
        Too many attempts. Please wait{" "}
        <strong>{time}</strong> before trying again.
      </span>
    </div>
  );
}

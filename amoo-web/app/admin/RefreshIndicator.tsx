"use client";

import { RefreshCw } from "lucide-react";
import { useAutoRefreshTracking } from "./AutoRefreshProvider";

/**
 * Fixed-position indicator that appears in the top-right corner when any
 * admin data source is being refreshed in the background. Uses CSS transitions
 * for smooth fade-in/fade-out without causing layout shifts or page flicker.
 */
export default function RefreshIndicator() {
  const { isRefreshing } = useAutoRefreshTracking();

  return (
    <div
      className={`pointer-events-none fixed right-4 top-4 z-[9999] flex items-center gap-2 rounded-full border border-[#E7E5EF] bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#6D28D9] shadow-[0_2px_8px_rgba(109,40,217,.12)] backdrop-blur-sm transition-all duration-300 ${
        isRefreshing
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
        strokeWidth={2}
      />
      <span>Refreshing…</span>
    </div>
  );
}

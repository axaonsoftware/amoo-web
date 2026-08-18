"use client";

import { useEffect, useRef, useState } from "react";

const AUTO_REFRESH_INTERVAL = 30_000;

/**
 * Lightweight auto-refresh hook for components that fetch data via manual
 * `useEffect` + `api.*` calls (Pattern B). Provides an `isRefreshing` boolean
 * that tracks whether a background refresh is in-flight.
 *
 * The hook calls `refetchFn` on a 30-second interval, pauses when the browser
 * tab is hidden, and cleans up on unmount. It does NOT call `refetchFn` on
 * mount — the component's own `useEffect` handles the initial load.
 *
 * @param refetchFn  The data-fetching function to call on each interval tick.
 *                   Must be a stable reference (useCallback) to avoid re-creating
 *                   the interval on every render.
 * @param enabled    Set to false to temporarily disable auto-refresh (e.g. while
 *                   a modal is open and the user is editing).
 */
export function useAutoRefresh(
  refetchFn: () => void,
  enabled = true,
): { isRefreshing: boolean } {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fnRef = useRef(refetchFn);
  const mountedRef = useRef(true);

  // Keep the latest function reference without making it a dependency.
  useEffect(() => {
    fnRef.current = refetchFn;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      setIsRefreshing(true);
      try {
        fnRef.current();
      } finally {
        // Reset indicator after a short delay so the UI has time to process
        // the updated data. The actual data update happens asynchronously, so
        // this is a best-effort visual cue rather than a precise completion signal.
        setTimeout(() => {
          if (mountedRef.current) setIsRefreshing(false);
        }, 1000);
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(id);
  }, [enabled]);

  return { isRefreshing };
}

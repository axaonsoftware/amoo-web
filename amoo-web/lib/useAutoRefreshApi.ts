"use client";

import { useEffect } from "react";
import { useApi, type UseApiResult } from "./useApi";
import { useAutoRefreshTracking } from "../app/admin/AutoRefreshProvider";

/**
 * Drop-in wrapper around `useApi` that adds:
 * 1. Background polling at `pollInterval` ms (default 30 s).
 * 2. Registration with the global `AutoRefreshProvider` so the `RefreshIndicator`
 *    appears during background refreshes.
 *
 * Usage is identical to `useApi` — just pass the poll interval as the 3rd arg:
 *
 *   const { data, loading, error } = useAutoRefreshApi(
 *     () => api.admin.getOverview(),
 *     [],
 *     30_000,
 *   );
 */
export function useAutoRefreshApi<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  pollInterval = 30_000,
): UseApiResult<T> {
  const result = useApi<T>(fn, deps, pollInterval);
  const { start, stop } = useAutoRefreshTracking();

  useEffect(() => {
    if (result.isRefreshing) {
      start();
    } else {
      stop();
    }
  }, [result.isRefreshing, start, stop]);

  return result;
}

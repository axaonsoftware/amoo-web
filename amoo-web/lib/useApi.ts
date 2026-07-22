"use client";

import { useEffect, useState } from "react";
import api from "./api";

// Generic data-fetching hook backed by the backend API.
// Optionally pass `pollInterval` (ms) to auto-refresh on an interval.
export function useApi<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  pollInterval = 0
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = () => {
    fn()
      .then((res) => setData(res))
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch_();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Polling: only active when `pollInterval > 0`
  useEffect(() => {
    if (pollInterval <= 0) return;
    const id = setInterval(fetch_, pollInterval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval, ...deps]);

  return { data, loading, error };
}

export { api };

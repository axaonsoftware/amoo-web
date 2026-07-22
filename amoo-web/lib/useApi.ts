"use client";

import { useEffect, useState } from "react";
import api from "./api";

// Generic data-fetching hook backed by the backend API.
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fn()
      .then((res) => active && setData(res))
      .catch((e) => active && setError(e.message || "Failed to load"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export { api };

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api, { unwrapList, unwrapMeta, type PageMeta } from "./api";

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-run the fetch. Wire this to the "Try again" button of an error state. */
  refetch: () => void;
  /** Local write, for optimistic updates. Overwritten by the next fetch. */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Generic data-fetching hook backed by the backend API.
 *
 * `pollInterval` (ms) auto-refreshes on an interval — used by the notification
 * bell and the activity feed, which are the app's only near-real-time surfaces
 * (the backend exposes no websocket; see chat.js, which is REST + polling).
 */
export function useApi<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  pollInterval = 0,
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Bumped on every new fetch generation. A response whose generation is stale
  // (deps changed, or the component unmounted) must not write to state — the
  // previous version captured an `active` flag and then never read it, so a
  // slow response for page 1 could overwrite a fast response for page 2.
  const genRef = useRef(0);
  // Keep the latest `fn` without making it a dependency: callers pass an inline
  // arrow, which is a new identity every render. Assigned in an effect rather
  // than during render, and declared before the fetching effect so it is
  // already up to date by the time that one runs.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback((showSpinner: boolean) => {
    const gen = ++genRef.current;
    if (showSpinner) setLoading(true);
    setError(null);
    fnRef
      .current()
      .then((res) => {
        if (gen !== genRef.current) return;
        setData(res);
      })
      .catch((e: unknown) => {
        if (gen !== genRef.current) return;
        setError((e as Error)?.message || "Failed to load");
      })
      .finally(() => {
        if (gen !== genRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fetching on mount is the whole point of this hook; the setState here is
    // in the async continuation, not synchronous with the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run(true);
    const gen = genRef;
    return () => {
      // Invalidate any in-flight response so it cannot set state after unmount.
      gen.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  // Polling refreshes in the background — no spinner, so the list does not
  // flash back to a skeleton every interval.
  useEffect(() => {
    if (pollInterval <= 0) return;
    const id = setInterval(() => run(false), pollInterval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval, ...deps]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch, setData };
}

/**
 * `useApi` for the paginated envelope (`{ data, meta }`). Returns the rows as a
 * plain array plus the pagination meta, so callers never have to remember which
 * endpoints wrap and which don't.
 */
export function useApiList<T>(
  fn: () => Promise<unknown>,
  deps: unknown[] = [],
  pollInterval = 0,
): Omit<UseApiResult<T[]>, "setData"> & {
  items: T[];
  meta: PageMeta | null;
  setData: React.Dispatch<React.SetStateAction<T[] | null>>;
} {
  const { data, loading, error, refetch, setData } = useApi<unknown>(
    fn,
    deps,
    pollInterval,
  );
  return {
    data: unwrapList<T>(data),
    items: unwrapList<T>(data),
    meta: unwrapMeta(data),
    loading,
    error,
    refetch,
    setData,
  };
}

export { api };

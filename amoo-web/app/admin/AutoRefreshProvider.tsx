"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface AutoRefreshContextValue {
  /** Register a refreshing source. Returns an unregister function. */
  register: () => () => void;
  /** True when at least one source is refreshing. */
  isRefreshing: boolean;
}

const AutoRefreshContext = createContext<AutoRefreshContextValue | null>(null);

/**
 * Provider that tracks how many auto-refresh sources are currently active.
 * Wraps the admin layout so the `RefreshIndicator` can read the global state.
 */
export function AutoRefreshProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  const register = useCallback(() => {
    countRef.current += 1;
    setCount(countRef.current);
    return () => {
      countRef.current = Math.max(0, countRef.current - 1);
      setCount(countRef.current);
    };
  }, []);

  return (
    <AutoRefreshContext.Provider value={{ register, isRefreshing: count > 0 }}>
      {children}
    </AutoRefreshContext.Provider>
  );
}

/**
 * Hook to register an auto-refresh source with the global provider.
 * Call `start()` when a refresh begins and the returned `stop()` when it ends.
 * The provider aggregates all active sources to drive the `RefreshIndicator`.
 */
export function useAutoRefreshTracking() {
  const ctx = useContext(AutoRefreshContext);
  const unregisterRef = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    if (!ctx) return;
    // Avoid double-registering if already tracking.
    if (unregisterRef.current) return;
    unregisterRef.current = ctx.register();
  }, [ctx]);

  const stop = useCallback(() => {
    if (unregisterRef.current) {
      unregisterRef.current();
      unregisterRef.current = null;
    }
  }, []);

  return { start, stop, isRefreshing: ctx?.isRefreshing ?? false };
}

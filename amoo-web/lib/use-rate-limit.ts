"use client";

import { useCallback, useEffect, useState } from "react";
import { setRateLimitHandler } from "./api";

let globalCooldownEnd = 0;
let globalTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const fn of listeners) fn();
}

export function useRateLimit() {
  const [remainingMs, setRemainingMs] = useState(0);

  const tick = useCallback(() => {
    if (Date.now() >= globalCooldownEnd) {
      setRemainingMs(0);
      if (globalTimer) {
        clearInterval(globalTimer);
        globalTimer = null;
      }
      notifyListeners();
    } else {
      setRemainingMs(globalCooldownEnd - Date.now());
    }
  }, []);

  useEffect(() => {
    listeners.add(tick);
    return () => {
      listeners.delete(tick);
    };
  }, [tick]);

  useEffect(() => {
    setRateLimitHandler(({ retryAfter }) => {
      const end = Date.now() + retryAfter;
      if (end > globalCooldownEnd) globalCooldownEnd = end;
      setRemainingMs(globalCooldownEnd - Date.now());

      if (!globalTimer) {
        globalTimer = setInterval(() => {
          notifyListeners();
        }, 1000);
      }
    });

    return () => setRateLimitHandler(null);
  }, []);

  const isCoolingDown = remainingMs > 0;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return { isCoolingDown, remainingMs, remainingSeconds };
}

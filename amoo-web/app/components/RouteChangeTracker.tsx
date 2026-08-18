"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "../../lib/tracking";

/**
 * Drop into a client layout to automatically track page_view events on every
 * Next.js client-side route transition. Also fires once on initial mount.
 *
 * Uses `usePathname()` as the trigger — it re-renders on navigation in the
 * App Router, so a useEffect keyed on it captures every transition without
 * needing to monkey-patch the router.
 */
export function RouteChangeTracker() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      trackEvent("page_view", undefined, pathname);
    }
  }, [pathname]);

  // Fire once on initial mount
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      trackEvent("page_view", undefined, pathname);
    }
  }, [pathname]);

  return null;
}

"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/tracking";

/**
 * Embed in any page (server or client) to silently record a page_view event.
 * Usage: <PageViewTracker page="/my-page" />
 */
export function PageViewTracker({
  page,
  meta,
}: {
  page?: string;
  meta?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent("page_view", meta, page);
  }, [page]);
  return null;
}

/**
 * Hook for client components to track page views.
 */
export function usePageView(page?: string, meta?: Record<string, unknown>) {
  useEffect(() => {
    trackEvent("page_view", meta, page);
  }, []);
}

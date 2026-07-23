"use client";

import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function trackEvent(
  action: string,
  actionDetails?: Record<string, unknown>,
  pageOrRoute?: string
) {
  if (typeof window === "undefined") return;
  const body: Record<string, unknown> = { action };
  if (actionDetails) body.action_details = actionDetails;
  body.page_or_route = pageOrRoute || window.location.pathname;

  fetch(`${API_URL}/api/activity/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  }).catch(() => {});
}

export function useTrackActivity() {
  const track = useCallback(
    (action: string, actionDetails?: Record<string, unknown>, pageOrRoute?: string) => {
      trackEvent(action, actionDetails, pageOrRoute);
    },
    []
  );
  return { track };
}

"use client";

import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeader(tokenKey = "amoo_token"): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(tokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fire-and-forget activity event tracker.
 * Call from any page or component — never throws, never blocks the UI.
 */
export function trackEvent(
  action: string,
  actionDetails?: Record<string, unknown>,
  pageOrRoute?: string
) {
  if (typeof window === "undefined") return;
  const tokenKey = localStorage.getItem("amoo_admin_token") ? "amoo_admin_token" : "amoo_token";
  const body: Record<string, unknown> = { action };
  if (actionDetails) body.action_details = actionDetails;
  body.page_or_route = pageOrRoute || window.location.pathname;

  fetch(`${API_URL}/api/activity/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(tokenKey),
    },
    body: JSON.stringify(body),
  }).catch(() => {
    // Silently ignore — tracking must never break the UI
  });
}

/**
 * React hook for tracking activity events.
 * Returns a stable `track` function.
 */
export function useTrackActivity() {
  const track = useCallback(
    (action: string, actionDetails?: Record<string, unknown>, pageOrRoute?: string) => {
      trackEvent(action, actionDetails, pageOrRoute);
    },
    []
  );
  return { track };
}

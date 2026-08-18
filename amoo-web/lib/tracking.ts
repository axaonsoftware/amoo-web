"use client";

import { useCallback } from "react";
import api from "./api";

/**
 * Record a user action in the backend activity log.
 *
 * Fire-and-forget by design — tracking must never block or break a UI flow —
 * but it goes through `lib/api.ts` rather than a bare `fetch`. A raw fetch here
 * sent no `X-CSRF-Token`, and `POST /api/activity/log` is not in the backend's
 * CSRF exempt list, so every single call was rejected with 403. The `.catch()`
 * swallowed it and a non-2xx response does not reject anyway, so the failure
 * was completely silent: `/user-dashboard/activity` and `/admin/activity-logs`
 * could only ever render "No activity recorded yet".
 *
 * `api.logActivity` also supplies `credentials: "include"` and the single-flight
 * 401->refresh->retry, neither of which the bare fetch had.
 */
export function trackEvent(
  action: string,
  actionDetails?: Record<string, unknown>,
  pageOrRoute?: string,
  options?: { entity?: string; entityId?: number },
): void {
  if (typeof window === "undefined") return;

  api
    .logActivity({
      action,
      ...(actionDetails ? { action_details: actionDetails } : {}),
      ...(options?.entity ? { entity: options.entity } : {}),
      ...(options?.entityId != null ? { entity_id: options.entityId } : {}),
      page_or_route: pageOrRoute || window.location.pathname,
    })
    .catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[tracking] failed to log activity:", err);
      }
    });
}

export function useTrackActivity() {
  const track = useCallback(
    (
      action: string,
      actionDetails?: Record<string, unknown>,
      pageOrRoute?: string,
      options?: { entity?: string; entityId?: number },
    ) => {
      trackEvent(action, actionDetails, pageOrRoute, options);
    },
    [],
  );
  return { track };
}

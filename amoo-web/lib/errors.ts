/**
 * Error helpers for the API client.
 *
 * `lib/api.ts` throws an `Error` carrying `status` and `details` from the
 * backend's `fail()` envelope. Components were catching that with
 * `catch (e: any)` and reading `e.message` — which type-checks only because
 * `any` disables checking, and silently yields `undefined` if a non-Error is
 * ever thrown (a string, a rejected fetch, an abort).
 */

/** The shape `lib/api.ts` attaches to a failed request. */
export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof Error;
}

/**
 * Message for display. Never returns an empty string, so a UI branching on
 * truthiness cannot end up showing a blank error box.
 */
export function errorMessage(
  e: unknown,
  fallback = "Something went wrong",
): string {
  if (typeof e === "string" && e.trim()) return e;
  if (e instanceof Error && e.message) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

/** HTTP status of a failed request, when the API client recorded one. */
export function errorStatus(e: unknown): number | undefined {
  if (e instanceof Error && typeof (e as ApiError).status === "number") {
    return (e as ApiError).status;
  }
  return undefined;
}

/**
 * Per-field validation messages from the backend's Joi handler, which responds
 * `{ success: false, error: "Validation failed", details: ["\"x\" is required"] }`.
 */
export function validationDetails(e: unknown): string[] {
  if (!(e instanceof Error)) return [];
  const d = (e as ApiError).details;
  return Array.isArray(d)
    ? d.filter((x): x is string => typeof x === "string")
    : [];
}

/**
 * True when the failure is the user closing the Razorpay modal, which is a
 * normal action rather than an error worth showing.
 */
export function isUserCancellation(e: unknown): boolean {
  return errorMessage(e, "") === "Payment cancelled by user";
}

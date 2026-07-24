"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Catches errors thrown by the ROOT layout itself.
 *
 * `app/error.tsx` and the `<ErrorBoundary>` in the root layout can only catch
 * errors from their own children — neither can catch a crash in the root layout
 * that renders them. Without this file, such an error falls through to Next's
 * built-in error screen, which is unbranded and, in a production build, a blank
 * page with no way forward.
 *
 * global-error replaces the entire document, so it must render its own <html>
 * and <body>. That also means none of the app's fonts, providers or global
 * styles are available here — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Same reporting seam as components/ErrorBoundary.tsx. `digest` is the
    // server-side hash Next assigns; it is the only way to correlate what a
    // user saw with the corresponding server log line, so always include it.
    console.error("[GlobalError]", error, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          textAlign: "center",
          background: "#0d0616",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div role="alert">
          <div aria-hidden="true" style={{ fontSize: 64, color: "#e9b85c", opacity: 0.6 }}>
            !
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0.5rem 0" }}>
            Something went wrong
          </h1>
          <p style={{ maxWidth: 440, color: "rgba(255,255,255,.6)", fontSize: 14, lineHeight: 1.6 }}>
            We hit an unexpected problem. Please try again — if it keeps happening, contact
            support and quote the reference below.
          </p>

          {/* Shown to the user on purpose: it is an opaque hash, not internal
              detail, and it is what support needs to find the server log. */}
          {error.digest && (
            <p style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,.4)" }}>
              Reference: <code>{error.digest}</code>
            </p>
          )}

          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: 44,
                padding: "0 24px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.2)",
                background: "transparent",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                height: 44,
                padding: "0 24px",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 12,
                background: "linear-gradient(90deg,#7c3aed,#6d28d9)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

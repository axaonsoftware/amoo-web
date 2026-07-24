"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

const isProd = process.env.NODE_ENV === "production";

/**
 * Last-resort boundary for render errors anywhere in the client tree.
 *
 * Two problems with the previous version:
 *
 * 1. It rendered `this.state.error?.message` directly. React error messages
 *    routinely carry internal detail — module paths, prop names, and for an
 *    error thrown out of the API layer, whatever the server put in the message.
 *    Showing that to an end user leaks implementation detail and is meaningless
 *    to them. The backend takes the opposite care in its own error handler
 *    ("Never leak internal paths / stack traces"); the frontend undid it.
 *
 * 2. It had no `componentDidCatch`, so a crash was never recorded anywhere.
 *    Every client-side crash in production was invisible — no log, no counter,
 *    no report. The team would only learn about it from a user complaint.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      // In production show a generic line; keep the real message in
      // development, where it is the fastest route to a diagnosis.
      message: isProd ? "" : error?.message || "",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Console is the floor, not the goal: it at least surfaces in browser
    // devtools and in any log-forwarding wrapper. Wire a real reporter here
    // (Sentry, Datadog RUM, Bugsnag) — the call site is deliberately isolated
    // so that is a one-line change. See the manual steps in
    // docs/PRODUCTION_READINESS_REPORT.md.
    console.error("[ErrorBoundary]", error, info.componentStack);

    // window.__errorReporter?.(error, info)   <- example integration point
  }

  private reset = () => {
    // Full navigation rather than router.push: the React tree is in an unknown
    // state after a render crash, so re-mounting into it can fail again
    // immediately.
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center bg-[#0d0616] px-4 text-center"
      >
        <div aria-hidden="true" className="mb-4 font-serif text-[80px] font-bold text-[#e9b85c] opacity-60">
          !
        </div>
        <h1 className="font-display text-[24px] font-bold text-white">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-white/60">
          We hit an unexpected problem loading this page. Please try again — if it keeps
          happening, contact support and we will look into it.
        </p>

        {/* Development only: the actual message, for the person fixing it. */}
        {!isProd && this.state.message && (
          <pre className="mx-auto mt-4 max-w-lg overflow-x-auto rounded-lg bg-black/40 p-3 text-left text-[12px] text-amber-200">
            {this.state.message}
          </pre>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-[44px] items-center justify-center rounded-xl border border-white/20 px-6 text-[14px] font-semibold text-white hover:bg-white/10"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(109,40,217,.35)]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
}

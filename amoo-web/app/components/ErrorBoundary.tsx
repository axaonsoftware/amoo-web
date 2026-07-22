"use client";

import { Component } from "react";

type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0616] px-4 text-center">
          <div className="mb-4 font-serif text-[80px] font-bold text-[#e9b85c] opacity-60">!</div>
          <h1 className="font-display text-[24px] font-bold text-white">Something went wrong</h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-white/60">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
            className="mt-6 inline-flex h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(109,40,217,.35)]"
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

"use client";

import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Loading / empty / error primitives shared by every data-driven view.
 *
 * The app has two palettes and these must not clash with either:
 *   - `admin`     — violet #6D28D9, hairlines #EDECF3, muted #8B879C
 *   - `dashboard` — deep violet #3d1268 → #5a2496, gold #f0c877, borders #efe6d6
 * Pick with `tone`; it only swaps colours, never layout.
 */
export type Tone = "admin" | "dashboard";

const TONE = {
  admin: {
    accent: "text-[#6D28D9]",
    surface: "bg-[#f0eaf8]",
    border: "border-[#EDECF3]",
    muted: "text-[#8B879C]",
    heading: "text-[#2E2A3B]",
    btn: "bg-[#6D28D9] hover:bg-[#5B21B6]",
    iconWrap: "bg-[#F5F1FD] text-[#6D28D9]",
  },
  dashboard: {
    accent: "text-[#6b3fa0]",
    surface: "bg-[#f0eaf8]",
    border: "border-[#efe6d6]",
    muted: "text-[#5c5568]",
    heading: "text-[#2b0f47]",
    btn: "bg-[#5a2496] hover:bg-[#4a1d7d]",
    iconWrap: "bg-[#f4edfc] text-[#5a2496]",
  },
} as const;

/** A single shimmering block. Compose these into view-specific skeletons. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#f0eaf8] ${className}`} />;
}

/** Skeleton for a card grid — matches the StatsRow tile rhythm. */
export function CardGridSkeleton({
  count = 4,
  tone = "admin",
  className = "",
}: {
  count?: number;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={
        className || "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      }
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-[14px] border ${t.border} bg-white p-4 shadow-[0_2px_10px_rgba(42,17,72,.05)]`}
        >
          <div className="flex items-start gap-3.5">
            <div className="h-[46px] w-[46px] shrink-0 rounded-full bg-[#f0eaf8]" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 rounded bg-[#f0eaf8]" />
              <div className="mt-2 h-6 w-14 rounded bg-[#f0eaf8]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton rows for a table body. Render inside the real <tbody>. */
export function TableSkeletonRows({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-[#F3F2F7]">
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="py-[14px] pr-3 first:pl-5">
              <div
                className="h-3 animate-pulse rounded bg-[#f0eaf8]"
                style={{
                  width: c === 0 ? "70%" : `${45 + ((r + c) % 3) * 15}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Skeleton for a list of stacked rows (activity feeds, notifications). */
export function ListSkeleton({
  rows = 4,
  tone = "admin",
}: {
  rows?: number;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-[10px] border ${t.border} p-3`}
        >
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#f0eaf8]" />
          <div className="min-w-0 flex-1">
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#f0eaf8]" />
            <div className="mt-2 h-2.5 w-1/3 animate-pulse rounded bg-[#f0eaf8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton placeholder sized like a chart canvas. */
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 px-1" style={{ height }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t bg-[#f0eaf8]"
          style={{ height: `${30 + ((i * 37) % 60)}%` }}
        />
      ))}
    </div>
  );
}

/** Centred spinner, for small panels where a skeleton would be noisier. */
export function Spinner({
  tone = "admin",
  className = "py-10",
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Loader2 className={`h-6 w-6 animate-spin ${TONE[tone].accent}`} />
    </div>
  );
}

/**
 * Shown when a fetch succeeds but returns nothing. Every list must render one
 * of these instead of collapsing to blank space or a leftover example row.
 */
export function EmptyState({
  title,
  message,
  icon,
  action,
  tone = "admin",
  className = "",
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      <span
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${t.iconWrap}`}
      >
        {icon ?? <Inbox className="h-6 w-6" strokeWidth={1.8} />}
      </span>
      <p className={`text-[14px] font-semibold ${t.heading}`}>{title}</p>
      {message && (
        <p
          className={`mt-1 max-w-[380px] text-[12.5px] leading-[1.55] ${t.muted}`}
        >
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Empty state sized to sit inside a table body. */
export function EmptyRow({
  colSpan,
  title,
  message,
  tone = "admin",
}: {
  colSpan: number;
  title: string;
  message?: string;
  tone?: Tone;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <EmptyState title={title} message={message} tone={tone} />
      </td>
    </tr>
  );
}

/** Fetch failed. Always offers a retry — wire it to `refetch` from `useApi`. */
export function ErrorState({
  message,
  onRetry,
  tone = "admin",
  className = "",
}: {
  message?: string | null;
  onRetry?: () => void;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[12px] border border-[#F6D7D7] bg-[#FEF6F6] px-6 py-8 text-center ${className}`}
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FDE8E8]">
        <AlertCircle
          className="h-[21px] w-[21px] text-[#EF4444]"
          strokeWidth={1.9}
        />
      </span>
      <p className="text-[13.5px] font-semibold text-[#B42318]">
        Couldn&apos;t load this
      </p>
      <p className={`mt-1 max-w-[380px] text-[12px] leading-[1.55] ${t.muted}`}>
        {message || "Something went wrong while fetching data."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-2 text-[12px] font-medium text-white ${t.btn}`}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
          Try again
        </button>
      )}
    </div>
  );
}

/** Error state sized to sit inside a table body. */
export function ErrorRow({
  colSpan,
  message,
  onRetry,
  tone = "admin",
}: {
  colSpan: number;
  message?: string | null;
  onRetry?: () => void;
  tone?: Tone;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-4">
        <ErrorState message={message} onRetry={onRetry} tone={tone} />
      </td>
    </tr>
  );
}

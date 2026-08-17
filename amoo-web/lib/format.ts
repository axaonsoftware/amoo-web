// Shared display formatting.
//
// Currency: the schema has exactly one currency column — `wallets.currency
// VARCHAR(8) NOT NULL DEFAULT 'INR'`. Every other money column (bookings.amount,
// payments.amount, services.price, packages.price, coupons.discount_value, ...)
// is a bare DECIMAL(10,2) with no currency alongside it, so INR is the implied
// platform currency. Pass `currency` explicitly only where a row actually
// carries one (wallet / wallet transactions).

export const DEFAULT_CURRENCY = "INR";
export const LOCALE = "en-IN";

/** MySQL DECIMAL comes back from mysql2 as a string. Never trust the type. */
export function toNumber(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** "₹12,500" — whole rupees. Use for stat tiles, table cells, totals. */
export function formatCurrency(
  value: unknown,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

/** "₹12,500.00" — keeps paise. Use on invoices/receipts where exactness matters. */
export function formatCurrencyExact(
  value: unknown,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

/** "1,25,000" — Indian digit grouping. */
export function formatNumber(value: unknown): string {
  return new Intl.NumberFormat(LOCALE).format(toNumber(value));
}

/** "12.5k" / "1.2L" — compact, for chart axes and dense tiles. */
export function formatCompact(value: unknown): string {
  const n = toNumber(value);
  if (Math.abs(n) >= 1e7)
    return (n / 1e7).toFixed(1).replace(/\.0$/, "") + "Cr";
  if (Math.abs(n) >= 1e5) return (n / 1e5).toFixed(1).replace(/\.0$/, "") + "L";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  // MySQL DATE columns arrive as "YYYY-MM-DD"; DATETIME as an ISO string.
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "23 Jul 2026" */
export function formatDate(value: unknown, fallback = "—"): string {
  const d = asDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "23 Jul" — for chart labels and tight columns. */
export function formatDateShort(value: unknown, fallback = "—"): string {
  const d = asDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/** "4:30 PM" — accepts a datetime or a bare "HH:MM:SS" time column. */
export function formatTime(value: unknown, fallback = "—"): string {
  if (typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    const [h, m] = value.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  }
  const d = asDate(value);
  if (!d) return fallback;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "23 Jul 2026, 4:30 PM" */
export function formatDateTime(value: unknown, fallback = "—"): string {
  const d = asDate(value);
  if (!d) return fallback;
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/** "2h ago" / "3d ago" — activity feeds, audit logs, notification bells. */
export function formatRelative(value: unknown, fallback = "—"): string {
  const d = asDate(value);
  if (!d) return fallback;
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 0) return formatDate(d);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(d);
}

/**
 * The backend stores several enums lowercase/hyphenated
 * (bookings.status = 'pending-payment', payments.method = 'razorpay').
 * Render them as "Pending Payment" without hardcoding a per-enum map.
 */
export function titleCase(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Initials for avatar fallbacks: "Vedika Desai" -> "VD". */
export function initials(name: unknown, fallback = "U"): string {
  const s = String(name ?? "").trim();
  if (!s) return fallback;
  const parts = s.split(/\s+/);
  return (
    (
      parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
    ).toUpperCase() || fallback
  );
}

"use client";
import api from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { EmptyState, ErrorState, Skeleton } from "../../components/states";
import { formatCurrency, titleCase, toNumber } from "../../../lib/format";

type PaymentStats = {
  by_method: { method: string | null; count: number | string; amount: number | string }[];
};

const COLORS = ["#4C1D95", "#22C55E", "#F59E0B", "#3B82F6", "#EC4899"];

const R = 54;
const C = 2 * Math.PI * R;

// payments.method is a free-form VARCHAR(40); these are the values the gateway
// integration and seed data actually write.
const METHOD_NAMES: Record<string, string> = {
  razorpay: "Razorpay (UPI/Cards)",
  upi: "UPI",
  card: "Cards",
  cards: "Cards",
  netbanking: "Net Banking",
  "net banking": "Net Banking",
  wallet: "Wallets",
  wallets: "Wallets",
  mock: "Mock Gateway",
};

function label(method: string | null): string {
  if (!method) return "Unspecified";
  return METHOD_NAMES[method.toLowerCase().trim()] ?? titleCase(method);
}

/**
 * Backed by the `by_method` block of `GET /api/payments/stats/overview`, which
 * is `SELECT method, COUNT(*), SUM(amount) FROM payments WHERE status='success'
 * GROUP BY method` — the whole table, not a page of it.
 *
 * The previous version grouped `GET /api/payments` on `p.payment_method`. That
 * column does not exist (the schema column is `method`), so every row fell into
 * "Others"; and because it read only the first page it saw at most 20 payments.
 * On an empty result it swapped in a hardcoded five-slice donut.
 */
export default function PaymentMethods() {
  const { data, loading, error, refetch } = useApi<PaymentStats>(() =>
    api.admin.getPaymentStats()
  );

  const rows = (data?.by_method ?? [])
    .map((m) => ({ label: label(m.method), amount: toNumber(m.amount), count: toNumber(m.count) }))
    .sort((a, b) => b.amount - a.amount);

  const total = rows.reduce((s, m) => s + m.amount, 0);

  const top = rows.slice(0, 5);
  const restTotal = rows.slice(5).reduce((s, m) => s + m.amount, 0);
  const methods = [
    ...top,
    ...(restTotal > 0 ? [{ label: "Others", amount: restTotal, count: 0 }] : []),
  ].map((m, i) => ({
    ...m,
    color: COLORS[i % COLORS.length],
    pct: total === 0 ? 0 : (m.amount / total) * 100,
  }));

  const segments = methods.map((m, i) => {
    const len = (m.pct / 100) * C;
    const offset = methods.slice(0, i).reduce((sum, p) => sum + (p.pct / 100) * C, 0);
    return { ...m, dash: `${Math.max(0, len - 2)} ${C - len + 2}`, offset };
  });

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">Payment Methods</h2>

      {loading ? (
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-[128px] w-[128px] shrink-0 rounded-full" />
          <ul className="min-w-0 flex-1 space-y-[9px]">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex items-center gap-2">
                <Skeleton className="h-[7px] w-[7px] shrink-0 rounded-full" />
                <Skeleton className="h-[10px] w-[38%]" />
                <Skeleton className="ml-auto h-[10px] w-[28%]" />
              </li>
            ))}
          </ul>
        </div>
      ) : error ? (
        <ErrorState className="mt-[14px]" message={error} onRetry={refetch} />
      ) : methods.length === 0 ? (
        <EmptyState
          title="No successful payments yet"
          message="The method split appears once payments are captured."
        />
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <svg viewBox="0 0 140 140" className="h-[128px] w-[128px] shrink-0">
              <g transform="rotate(-90 70 70)">
                {segments.map((m) => (
                  <circle
                    key={m.label}
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={m.color}
                    strokeWidth="22"
                    strokeDasharray={m.dash}
                    strokeDashoffset={-m.offset}
                  />
                ))}
              </g>
            </svg>
            <ul className="min-w-0 flex-1 space-y-[9px]">
              {methods.map((m) => (
                <li key={m.label} className="flex items-center gap-2">
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="truncate text-[10.5px] text-[#4A3B63]">{m.label}</span>
                  <span className="ml-auto shrink-0 text-[10.5px] font-medium text-[#1B1630]">
                    {formatCurrency(m.amount)} ({m.pct.toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#F1EFF6] pt-3">
            <span className="text-[11.5px] font-medium text-[#8B879C]">Total</span>
            <span className="text-[12.5px] font-semibold text-[#1B1630]">
              {formatCurrency(total)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

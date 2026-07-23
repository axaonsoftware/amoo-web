"use client";
import {
  IndianRupee,
  ReceiptIndianRupee,
  Hourglass,
  RotateCcw,
  Wallet,
  Scale,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { ErrorState, Skeleton } from "../../components/states";
import { formatCompact, formatNumber, toNumber } from "../../../lib/format";

type PaymentStats = {
  total: number | string;
  total_revenue: number | string;
  collected: number | string;
  pending: number | string;
  refunded: number | string;
  refunds: number | string;
  refunded_amount: number | string;
  by_method: { method: string; count: number | string; amount: number | string }[];
};

type RevenueBucket = { label: string; payments: number; revenue: number | string };

type StatDef = {
  label: string;
  value: string;
  delta: number | null;
  note: string;
  /** true when a rise is bad. */
  inverted?: boolean;
  Icon: typeof IndianRupee;
  iconWrap: string;
  iconColor: string;
};

const money = (v: unknown) => "₹ " + formatCompact(v);

function pctChange(current?: number, previous?: number): number | null {
  if (current === undefined || previous === undefined || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Every figure comes from `GET /api/payments/stats/overview`, which aggregates
 * across the whole payments table server-side.
 *
 * Replaced a version that summed `GET /api/payments` — the first page only, so
 * 20 rows — and then derived "Payouts to Astrologers" as `total * 0.63` and
 * "Net Earnings" as `total * 0.37`, with all six deltas as multiples of a
 * hardcoded 19.3%.
 *
 * GAP: there is no payouts/commission model in the schema (no payouts table,
 * no rate on `experts`), so "Payouts to Astrologers" and "Net Earnings" cannot
 * be computed at all. Those two tiles are replaced with metrics the payments
 * aggregate genuinely provides. See WIRING_NOTES.md gap G8.
 */
export default function StatsRow() {
  const stats = useApi<PaymentStats>(() => api.admin.getPaymentStats());
  const revenue = useApi<RevenueBucket[]>(() => api.admin.getRevenue("month"));

  const loading = stats.loading || revenue.loading;
  const error = stats.error || revenue.error;
  const retry = () => {
    stats.refetch();
    revenue.refetch();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-[#EFEDF4] bg-white px-[14px] py-[14px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]"
          >
            <div className="flex items-start gap-[10px]">
              <Skeleton className="h-[38px] w-[38px] shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1 pt-[1px]">
                <Skeleton className="h-[11px] w-[75%]" />
                <Skeleton className="mt-[6px] h-[19px] w-[55%]" />
              </div>
            </div>
            <Skeleton className="mt-[10px] h-[10px] w-[80%]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={retry} />;

  const s = stats.data;
  const buckets = revenue.data ?? [];
  const now = buckets[buckets.length - 1];
  const prev = buckets[buckets.length - 2];
  const revenueDelta = pctChange(toNumber(now?.revenue), toNumber(prev?.revenue));
  const countDelta = pctChange(now?.payments, prev?.payments);

  const successCount = (s?.by_method ?? []).reduce((acc, m) => acc + toNumber(m.count), 0);

  const items: StatDef[] = [
    {
      label: "Total Revenue",
      value: money(s?.total_revenue),
      delta: revenueDelta,
      note: "vs last month",
      Icon: IndianRupee,
      iconWrap: "bg-[#F1EAFE]",
      iconColor: "text-[#7C3AED]",
    },
    {
      label: "Collected",
      value: money(s?.collected),
      delta: revenueDelta,
      note: "vs last month",
      Icon: ReceiptIndianRupee,
      iconWrap: "bg-[#E3F7EA]",
      iconColor: "text-[#16A34A]",
    },
    {
      label: "Pending Payments",
      value: money(s?.pending),
      // No per-period series for pending balances — only a live total.
      delta: null,
      note: "awaiting capture",
      inverted: true,
      Icon: Hourglass,
      iconWrap: "bg-[#FEF1E3]",
      iconColor: "text-[#F59E0B]",
    },
    {
      label: "Refunds Issued",
      value: money(s?.refunded_amount),
      delta: null,
      note: `${formatNumber(s?.refunds)} processed`,
      inverted: true,
      Icon: RotateCcw,
      iconWrap: "bg-[#FDE8E8]",
      iconColor: "text-[#EF4444]",
    },
    {
      label: "Successful Payments",
      value: formatNumber(successCount),
      delta: countDelta,
      note: "vs last month",
      Icon: Wallet,
      iconWrap: "bg-[#E7F0FE]",
      iconColor: "text-[#3B82F6]",
    },
    {
      label: "Total Transactions",
      value: formatNumber(s?.total),
      delta: countDelta,
      note: "all statuses",
      Icon: Scale,
      iconWrap: "bg-[#F1EAFE]",
      iconColor: "text-[#7C3AED]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((st) => {
        const rising = st.delta !== null && st.delta >= 0;
        const good = st.inverted ? !rising : rising;
        return (
          <div
            key={st.label}
            className="rounded-[12px] border border-[#EFEDF4] bg-white px-[14px] py-[14px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]"
          >
            <div className="flex items-start gap-[10px]">
              <div
                className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] ${st.iconWrap}`}
              >
                <st.Icon size={19} className={st.iconColor} />
              </div>
              <div className="min-w-0 pt-[1px]">
                <p className="truncate text-[11px] font-medium text-[#8B879C]">{st.label}</p>
                <p className="mt-[2px] text-[19px] font-semibold leading-[26px] text-[#1B1630]">
                  {st.value}
                </p>
              </div>
            </div>
            <p className="mt-[10px] flex items-center gap-[3px] text-[10.5px] font-medium">
              {st.delta === null ? (
                <span className="text-[#A5A2B5]">—</span>
              ) : (
                <span
                  className={`flex items-center gap-[2px] ${
                    good ? "text-[#16A34A]" : "text-[#EF4444]"
                  }`}
                >
                  {rising ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {Math.abs(st.delta).toFixed(1)}%
                </span>
              )}
              <span className="text-[#A5A2B5]">{st.note}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

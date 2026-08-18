"use client";
import {
  IndianRupee,
  CalendarDays,
  Headset,
  UserRoundPlus,
  UserRoundCheck,
  CircleX,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "../../../lib/api";
import { useAutoRefreshApi } from "../../../lib/useAutoRefreshApi";
import { ErrorState, Skeleton } from "../../components/states";
import { formatCompact, formatNumber, toNumber } from "../../../lib/format";

type StatDef = {
  label: string;
  value: string;
  /** null when the backend exposes no time series for this metric. */
  delta: number | null;
  note: string;
  /** true when a *rise* is bad (cancellation rate). */
  inverted?: boolean;
  Icon: typeof IndianRupee;
  iconWrap: string;
  iconColor: string;
};

type RevenueBucket = {
  label: string;
  payments: number;
  revenue: number | string;
};
type TrendBucket = {
  label: string;
  count: number | string;
  cancelled: number | string;
};
type GrowthBucket = { label: string; new_users: number | string };

/**
 * Period-over-period change between the last two buckets of a dashboard time
 * series. Returns null when there is no prior period to compare against —
 * callers must render "—" rather than inventing a number.
 */
function delta(current?: number, previous?: number): number | null {
  if (current === undefined || previous === undefined || previous === 0)
    return null;
  return ((current - previous) / previous) * 100;
}

function lastTwo<T>(
  rows: T[] | null | undefined,
): [T | undefined, T | undefined] {
  const r = rows ?? [];
  return [r[r.length - 1], r[r.length - 2]];
}

export default function StatsRow() {
  // Four independent aggregations, all server-side. Nothing here re-derives a
  // total the backend already computed.
  const overview = useAutoRefreshApi<{ stats: Record<string, number> }>(() =>
    api.admin.getOverview(), [], 30_000,
  );
  const payments = useAutoRefreshApi<{
    total: number;
    collected: number | string;
    by_method: { method: string; count: number | string }[];
  }>(() => api.admin.getPaymentStats(), [], 30_000);
  const revenue = useAutoRefreshApi<RevenueBucket[]>(() => api.admin.getRevenue("month"), [], 30_000);
  const trends = useAutoRefreshApi<TrendBucket[]>(() =>
    api.admin.getBookingsTrends("month"), [], 30_000,
  );
  const growth = useAutoRefreshApi<GrowthBucket[]>(() =>
    api.admin.getUsersGrowth("month"), [], 30_000,
  );

  const loading =
    overview.loading ||
    payments.loading ||
    revenue.loading ||
    trends.loading ||
    growth.loading;
  const error =
    overview.error ||
    payments.error ||
    revenue.error ||
    trends.error ||
    growth.error;

  const retry = () => {
    overview.refetch();
    payments.refetch();
    revenue.refetch();
    trends.refetch();
    growth.refetch();
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
                <Skeleton className="h-[10px] w-[70%]" />
                <Skeleton className="mt-[6px] h-[17px] w-[55%]" />
              </div>
            </div>
            <Skeleton className="mt-[10px] h-[10px] w-[80%]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={retry} />;

  const s = overview.data?.stats ?? {};
  const [revNow, revPrev] = lastTwo(revenue.data);
  const [trendNow, trendPrev] = lastTwo(trends.data);
  const [growNow, growPrev] = lastTwo(growth.data);

  // Successful payments = sum of the per-method counts, which the backend
  // already restricts to status='success'.
  const paidCount = (payments.data?.by_method ?? []).reduce(
    (acc, m) => acc + toNumber(m.count),
    0,
  );

  const cancelRate = (b?: TrendBucket) => {
    if (!b) return undefined;
    const count = toNumber(b.count);
    return count === 0 ? 0 : (toNumber(b.cancelled) / count) * 100;
  };
  const rateNow = cancelRate(trendNow);
  const ratePrev = cancelRate(trendPrev);

  const stats: StatDef[] = [
    {
      label: "Total Revenue",
      value: "₹ " + formatCompact(payments.data?.collected),
      delta: delta(toNumber(revNow?.revenue), toNumber(revPrev?.revenue)),
      note: "vs last month",
      Icon: IndianRupee,
      iconWrap: "bg-[#F1EAFE]",
      iconColor: "text-[#7C3AED]",
    },
    {
      label: "Total Bookings",
      value: formatNumber(s.bookings),
      delta: delta(toNumber(trendNow?.count), toNumber(trendPrev?.count)),
      note: "vs last month",
      Icon: CalendarDays,
      iconWrap: "bg-[#FEF1E3]",
      iconColor: "text-[#F59E0B]",
    },
    {
      label: "Paid Consultations",
      value: formatNumber(paidCount),
      delta: delta(revNow?.payments, revPrev?.payments),
      note: "vs last month",
      Icon: Headset,
      iconWrap: "bg-[#E3F7EA]",
      iconColor: "text-[#16A34A]",
    },
    {
      label: "New Users",
      value: formatNumber(growNow?.new_users ?? 0),
      delta: delta(toNumber(growNow?.new_users), toNumber(growPrev?.new_users)),
      note: "vs last month",
      Icon: UserRoundPlus,
      iconWrap: "bg-[#E7F0FE]",
      iconColor: "text-[#3B82F6]",
    },
    {
      label: "Active Astrologers",
      value: formatNumber(s.experts),
      // GAP: /api/dashboard has no experts-over-time series, so there is no
      // prior period to compare against. Renders "—" instead of a fake delta.
      delta: null,
      note: "currently active",
      Icon: UserRoundCheck,
      iconWrap: "bg-[#E7F0FE]",
      iconColor: "text-[#3B82F6]",
    },
    {
      label: "Cancellation Rate",
      value: rateNow === undefined ? "—" : `${rateNow.toFixed(2)}%`,
      // Percentage-point change, not a ratio-of-a-ratio.
      delta:
        rateNow !== undefined && ratePrev !== undefined
          ? rateNow - ratePrev
          : null,
      note: "vs last month",
      inverted: true,
      Icon: CircleX,
      iconWrap: "bg-[#FDE8E8]",
      iconColor: "text-[#EF4444]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((st) => {
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
                <p className="whitespace-nowrap text-[10px] font-medium text-[#8B879C]">
                  {st.label}
                </p>
                <p className="mt-[2px] whitespace-nowrap text-[17px] font-semibold leading-[24px] text-[#1B1630]">
                  {st.value}
                </p>
              </div>
            </div>
            <p className="mt-[10px] flex items-center gap-[3px] whitespace-nowrap text-[10px] font-medium">
              {st.delta === null ? (
                <span className="text-[#A5A2B5]">—</span>
              ) : (
                <span
                  className={`flex items-center gap-[2px] ${
                    good ? "text-[#16A34A]" : "text-[#EF4444]"
                  }`}
                >
                  {rising ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {Math.abs(st.delta).toFixed(1)}
                  {st.inverted ? " pp" : "%"}
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

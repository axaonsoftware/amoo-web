"use client";
import {
  CalendarDays,
  Clock,
  Headset,
  CalendarCheck,
  CircleX,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import api from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { ErrorState, Skeleton } from "../../components/states";
import { formatNumber, formatTime, toNumber } from "../../../lib/format";

type Patterns = {
  total: number;
  peakDay: { day: number; count: number | string } | null;
  peakHour: { hour: number; count: number | string } | null;
};
type Overview = {
  stats: Record<string, number>;
  topServices: { id: number; name: string; bookings: number | string }[];
};
type TrendBucket = { label: string; count: number | string; cancelled: number | string };

// MySQL DAYOFWEEK(): 1 = Sunday .. 7 = Saturday
const DAY_NAMES = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Every tile is now backed by a real aggregation.
 *
 * The previous version read `peakDay`, `peakDayPct`, `peakTime`, `peakTimePct`,
 * `topService`, `topServicePct`, `topSource`, `topSourcePct`,
 * `cancellationRate` and `cancellationDelta` off `GET /api/dashboard/overview`.
 * That endpoint returns `{stats, topServices, recent}` and has never had any of
 * those keys, so all ten `||` fallbacks always won and the card permanently
 * displayed "Saturday / 7 PM – 9 PM / Kundali Reading / WhatsApp / 6.32%"
 * regardless of the data.
 *
 * GAP: "Top Source" is dropped — no table records an acquisition channel
 * (`users` has no source/utm/referrer column), so it is not derivable at all.
 * Replaced with today's booking count, which /overview does provide.
 * See WIRING_NOTES.md gap G9.
 */
export default function QuickInsights() {
  const patterns = useApi<Patterns>(() => api.admin.getBookingPatterns());
  const overview = useApi<Overview>(() => api.admin.getOverview());
  const trends = useApi<TrendBucket[]>(() => api.admin.getBookingsTrends("month"));

  const loading = patterns.loading || overview.loading || trends.loading;
  const error = patterns.error || overview.error || trends.error;
  const retry = () => {
    patterns.refetch();
    overview.refetch();
    trends.refetch();
  };

  const p = patterns.data;
  const totalBookings = toNumber(p?.total);
  const share = (count: unknown) =>
    totalBookings === 0 ? "—" : `${((toNumber(count) / totalBookings) * 100).toFixed(1)}% of bookings`;

  const topService = overview.data?.topServices?.[0];
  const buckets = trends.data ?? [];
  const now = buckets[buckets.length - 1];
  const prev = buckets[buckets.length - 2];
  const rateOf = (b?: TrendBucket) => {
    if (!b) return undefined;
    const c = toNumber(b.count);
    return c === 0 ? 0 : (toNumber(b.cancelled) / c) * 100;
  };
  const rateNow = rateOf(now);
  const ratePrev = rateOf(prev);
  const rateDelta =
    rateNow !== undefined && ratePrev !== undefined ? rateNow - ratePrev : null;

  const peakHour = p?.peakHour?.hour;

  const insights = [
    {
      label: "Peak Booking Day",
      value: p?.peakDay ? DAY_NAMES[p.peakDay.day] || "—" : "—",
      note: p?.peakDay ? share(p.peakDay.count) : "No bookings yet",
      Icon: CalendarDays,
      iconWrap: "bg-[#F1EAFE]",
      iconColor: "text-[#7C3AED]",
    },
    {
      label: "Peak Booking Time",
      value:
        peakHour === undefined || peakHour === null
          ? "—"
          : `${formatTime(`${String(peakHour).padStart(2, "0")}:00`)} – ${formatTime(
              `${String((peakHour + 1) % 24).padStart(2, "0")}:00`
            )}`,
      note: p?.peakHour ? share(p.peakHour.count) : "No bookings yet",
      Icon: Clock,
      iconWrap: "bg-[#FEF1E3]",
      iconColor: "text-[#F59E0B]",
    },
    {
      label: "Most Popular Service",
      value: topService?.name ?? "—",
      note: topService ? `${formatNumber(topService.bookings)} bookings` : "No bookings yet",
      Icon: Headset,
      iconWrap: "bg-[#E3F7EA]",
      iconColor: "text-[#16A34A]",
    },
    {
      label: "Today's Bookings",
      value: formatNumber(overview.data?.stats?.todayBookings ?? 0),
      note: `${formatNumber(overview.data?.stats?.bookings ?? 0)} all time`,
      Icon: CalendarCheck,
      iconWrap: "bg-[#E7F0FE]",
      iconColor: "text-[#3B82F6]",
    },
    {
      label: "Cancellation Rate",
      value: rateNow === undefined ? "—" : `${rateNow.toFixed(2)}%`,
      note: rateDelta === null ? "no prior month" : `${Math.abs(rateDelta).toFixed(1)} pp vs last month`,
      delta: rateDelta,
      Icon: CircleX,
      iconWrap: "bg-[#FDE8E8]",
      iconColor: "text-[#EF4444]",
    },
  ];

  return (
    <div>
      <h2 className="text-[14px] font-semibold text-[#1B1630]">Quick Insights</h2>

      <div className="mt-3 rounded-[14px] border border-[#EFEDF4] bg-white px-[18px] py-[16px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        {loading ? (
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-[10px]">
                <Skeleton className="h-[38px] w-[38px] shrink-0 rounded-[10px]" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-[10px] w-[70%]" />
                  <Skeleton className="mt-[5px] h-[13px] w-[85%]" />
                  <Skeleton className="mt-[5px] h-[9px] w-[60%]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : (
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {insights.map((s) => (
              <div key={s.label} className="flex items-center gap-[10px]">
                <div
                  className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] ${s.iconWrap}`}
                >
                  <s.Icon size={19} className={s.iconColor} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-[#A5A2B5]">{s.label}</p>
                  <p className="truncate text-[13px] font-semibold leading-[19px] text-[#1B1630]">
                    {s.value}
                  </p>
                  {"delta" in s && s.delta !== null && s.delta !== undefined ? (
                    <p className="flex items-center gap-[3px] text-[9.5px] text-[#A5A2B5]">
                      <span
                        className={`flex items-center gap-[2px] font-medium ${
                          s.delta > 0 ? "text-[#EF4444]" : "text-[#16A34A]"
                        }`}
                      >
                        {s.delta > 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
                        {s.note}
                      </span>
                    </p>
                  ) : (
                    <p className="truncate text-[9.5px] text-[#A5A2B5]">{s.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

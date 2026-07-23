"use client";
import api from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { EmptyState, ErrorState, Skeleton } from "../../components/states";
import { formatCurrency, toNumber } from "../../../lib/format";

type ServiceRevenue = { id: number; name: string; payments: number | string; revenue: number | string };

const COLORS = ["#4C1D95", "#22C55E", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899"];

const R = 52;
const C = 2 * Math.PI * R;

/**
 * Backed by `GET /api/dashboard/revenue/by-service`, which joins
 * payments -> bookings -> services server-side. `payments` itself has no
 * service column, so the previous client-side grouping on `p.service_name`
 * matched nothing and bucketed 100% of revenue into "Others" — then fell back
 * to a hardcoded six-slice donut whenever the list came back empty.
 */
export default function RevenueByService() {
  const { data, loading, error, refetch } = useApi<ServiceRevenue[]>(() =>
    api.admin.getRevenueByService()
  );

  const rows = data ?? [];
  const total = rows.reduce((sum, r) => sum + toNumber(r.revenue), 0);

  // Top 6 by revenue; everything else folded into a real "Others" bucket.
  const top = rows.slice(0, 6);
  const restTotal = rows.slice(6).reduce((sum, r) => sum + toNumber(r.revenue), 0);
  const services = [
    ...top.map((r, i) => ({
      key: String(r.id),
      label: r.name,
      amount: toNumber(r.revenue),
      color: COLORS[i % COLORS.length],
    })),
    ...(restTotal > 0
      ? [{ key: "others", label: "Others", amount: restTotal, color: COLORS[5] }]
      : []),
  ].map((s) => ({ ...s, pct: total === 0 ? 0 : (s.amount / total) * 100 }));

  const segments = services.map((s, i) => {
    const len = (s.pct / 100) * C;
    const offset = services.slice(0, i).reduce((sum, p) => sum + (p.pct / 100) * C, 0);
    return { ...s, dash: `${Math.max(0, len - 2)} ${C - len + 2}`, offset };
  });

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">Revenue by Service</h2>

      {loading ? (
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-[126px] w-[126px] shrink-0 rounded-full" />
          <ul className="min-w-0 flex-1 space-y-[9px]">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex items-center gap-2">
                <Skeleton className="h-[7px] w-[7px] shrink-0 rounded-full" />
                <Skeleton className="h-[10px] w-[34%]" />
                <Skeleton className="ml-auto h-[10px] w-[30%]" />
              </li>
            ))}
          </ul>
        </div>
      ) : error ? (
        <ErrorState className="mt-[14px]" message={error} onRetry={refetch} />
      ) : services.length === 0 ? (
        <EmptyState
          title="No revenue yet"
          message="This chart fills in once payments are collected against a booked service."
        />
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <svg viewBox="0 0 140 140" className="h-[126px] w-[126px] shrink-0">
              <g transform="rotate(-90 70 70)">
                {segments.map((s) => (
                  <circle
                    key={s.key}
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="26"
                    strokeDasharray={s.dash}
                    strokeDashoffset={-s.offset}
                  />
                ))}
              </g>
            </svg>
            <ul className="min-w-0 flex-1 space-y-[9px]">
              {services.map((s) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate text-[10.5px] text-[#4A3B63]">{s.label}</span>
                  <span className="ml-auto shrink-0 text-[10.5px] font-medium text-[#1B1630]">
                    {formatCurrency(s.amount)} ({s.pct.toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#F1EFF6] pt-3">
            <span className="text-[11.5px] font-medium text-[#8B879C]">Total Revenue</span>
            <span className="text-[12.5px] font-semibold text-[#1B1630]">
              {formatCurrency(total)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

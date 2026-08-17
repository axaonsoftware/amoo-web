"use client";
import api from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { EmptyState, ErrorState, Skeleton } from "../../components/states";
import { formatNumber, toNumber } from "../../../lib/format";

type TopService = {
  id: number;
  name: string;
  bookings: number | string;
  price: number | string;
};

/**
 * `GET /api/dashboard/overview` already returns the top-5 services ranked by
 * `services.bookings` (a maintained counter column). The previous version
 * pulled `GET /api/bookings` and grouped client-side — which only ever saw the
 * first page (20 rows, the parsePagination default), so the ranking was
 * computed from a 20-row sample and then silently replaced with a hardcoded
 * list whenever the fetch returned nothing.
 */
export default function TopServicesByBookings() {
  const { data, loading, error, refetch } = useApi<{
    topServices: TopService[];
  }>(() => api.admin.getOverview());

  const services = data?.topServices ?? [];
  const max = services.reduce((m, s) => Math.max(m, toNumber(s.bookings)), 0);

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">
        Top Services by Bookings
      </h2>

      {loading ? (
        <ul className="mt-[18px] space-y-[15px]">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-[11px] w-[38%]" />
              <Skeleton className="mt-[6px] h-[6px] w-full rounded-full" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <ErrorState className="mt-[14px]" message={error} onRetry={refetch} />
      ) : services.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          message="Service rankings appear once customers start booking."
        />
      ) : (
        <ul className="mt-[18px] space-y-[15px]">
          {services.map((s) => {
            const count = toNumber(s.bookings);
            const width =
              max === 0 ? 0 : Math.max(5, Math.round((count / max) * 100));
            return (
              <li key={s.id} className="relative">
                <p className="text-[11px] text-[#4A3B63]">{s.name}</p>
                <span
                  className="absolute top-0 whitespace-nowrap text-[10.5px] font-semibold text-[#1B1630]"
                  style={{ left: `max(46px, calc(${width}% + 8px))` }}
                >
                  {formatNumber(count)}
                </span>
                <div className="mt-[6px] h-[6px] w-full rounded-full bg-[#F1EFF6]">
                  <div
                    className="h-full rounded-full bg-[#4C1D95]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

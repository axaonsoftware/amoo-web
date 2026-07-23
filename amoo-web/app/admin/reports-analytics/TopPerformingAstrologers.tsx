"use client";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import api from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { EmptyState, ErrorState, TableSkeletonRows } from "../../components/states";
import { formatCurrency, formatNumber, initials, toNumber } from "../../../lib/format";

type TopExpert = {
  id: number;
  name: string;
  avatar: string | null;
  rating: number | string | null;
  bookings: number | string;
  completed: number | string | null;
  revenue: number | string;
  clients: number | string;
};

const HEADERS = ["#", "Astrologer", "Bookings", "Completed", "Revenue", "Rating", "Clients"];

/**
 * Backed by `GET /api/dashboard/experts/top`, extended in this phase to also
 * return avatar, completed, revenue and clients.
 *
 * The table previously declared columns for `total_consultations`,
 * `completed_bookings`, `total_revenue`, `new_clients` and `repeat_clients` —
 * none of which the endpoint returned — so on real data every one of them
 * rendered 0 while a hardcoded five-row list of invented astrologers stood in
 * whenever the response was empty. Every row also used the same hardcoded
 * Unsplash portrait; `experts.avatar` is now used instead.
 *
 * GAP: new-vs-repeat client split needs first-booking-per-user attribution the
 * schema does not record. Replaced with a real distinct-client count.
 */
export default function TopPerformingAstrologers() {
  const { data, loading, error, refetch } = useApi<TopExpert[]>(() =>
    api.admin.getTopExperts(5)
  );

  const rows = data ?? [];

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">Top Performing Astrologers</h2>

      {error ? (
        <ErrorState className="mt-[14px]" message={error} onRetry={refetch} />
      ) : !loading && rows.length === 0 ? (
        <EmptyState
          title="No astrologers ranked yet"
          message="Rankings appear once experts start taking bookings."
        />
      ) : (
        <div className="mt-4 -mx-[2px] overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-y border-[#F1EFF6] bg-[#FAFAFC]">
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-2 py-[9px] text-left text-[9.5px] font-semibold text-[#8B879C]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows rows={5} cols={HEADERS.length} />
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id} className="border-b border-[#F5F3F9]">
                    <td className="py-[10px] pl-2 pr-2 text-[11px] text-[#8B879C]">{i + 1}</td>
                    <td className="py-[10px] pr-2">
                      <div className="flex items-center gap-[8px]">
                        {r.avatar ? (
                          <Image
                            src={r.avatar}
                            alt={r.name}
                            className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
                            width={26}
                            height={26}
                          />
                        ) : (
                          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[9px] font-bold text-white">
                            {initials(r.name)}
                          </span>
                        )}
                        <span className="whitespace-nowrap text-[11px] text-[#2E2A3B]">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">
                      {formatNumber(r.bookings)}
                    </td>
                    <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">
                      {formatNumber(r.completed ?? 0)}
                    </td>
                    <td className="whitespace-nowrap py-[10px] pr-2 text-center text-[11px] font-medium text-[#1B1630]">
                      {formatCurrency(r.revenue)}
                    </td>
                    <td className="py-[10px] pr-2">
                      <span className="flex items-center justify-center gap-[3px] text-[11px] font-medium text-[#1B1630]">
                        {toNumber(r.rating).toFixed(1)}
                        <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                      </span>
                    </td>
                    <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">
                      {formatNumber(r.clients)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Link
          href="/admin/expert-management"
          className="inline-flex h-[30px] items-center rounded-full bg-[#F1EAFE] px-4 text-[10.5px] font-medium text-[#5B21B6]"
        >
          View All Astrologers
        </Link>
      </div>
    </section>
  );
}

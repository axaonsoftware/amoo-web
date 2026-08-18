"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useAutoRefreshApi } from "@/lib/useAutoRefreshApi";
import { api } from "@/lib/api";

export default function TopAstrologers() {
  const { data, loading, error } = useAutoRefreshApi(() => api.admin.getTopExperts(5), [], 30_000);
  const rows = data?.data ?? [];

  return (
    <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[17px] font-bold text-[#3d1a63]">
          Top Astrologers
        </h2>
        <Link
          href="/admin/user-management"
          className="text-[11.5px] font-medium text-[#7c3aed]"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <p className="mt-4 text-[12.5px] text-[#8b8397]">Loading...</p>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-600">Failed to load.</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8397]">No astrologers yet.</p>
      ) : (
        <ul className="mt-4 space-y-[14px]">
          {rows.map(
            (a: {
              id: number;
              name: string;
              rating: number;
              bookings: number;
            }) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[12px] font-bold text-white">
                  {a.name?.slice(0, 2)?.toUpperCase() || "A"}
                </span>
                <p className="flex-1 truncate text-[12.5px] font-semibold text-[#2a1148]">
                  {a.name}
                </p>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#fdf3e2] px-2 py-[3px] text-[10.5px] font-semibold text-[#b7791f]">
                  {a.rating ?? "—"}
                  <Star
                    className="h-[10px] w-[10px] fill-[#e9b85c] text-[#e9b85c]"
                    strokeWidth={0}
                  />
                </span>
                <span className="w-[86px] shrink-0 text-right text-[10.5px] text-[#8b8397]">
                  {a.bookings} Bookings
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

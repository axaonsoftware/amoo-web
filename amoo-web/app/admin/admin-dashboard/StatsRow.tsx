"use client";

import Link from "next/link";
import { Users, UserCog, CalendarDays, IndianRupee, Star, ArrowRight } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const fmt = (n: number) => n.toLocaleString("en-IN");

export default function StatsRow() {
  const { data, loading, error } = useApi(() => api.admin.getOverview());
  const stats = (data as { stats?: { users: number; experts: number; bookings: number; revenue: number; pendingPayments: number } } | null)?.stats;
  const items = [
    { label: "Total Users", value: stats ? fmt(stats.users) : "—", Icon: Users },
    { label: "Active Astrologers", value: stats ? fmt(stats.experts) : "—", Icon: UserCog },
    { label: "Total Bookings", value: stats ? fmt(stats.bookings) : "—", Icon: CalendarDays },
    { label: "Total Revenue", value: stats ? "₹" + fmt(stats.revenue) : "—", Icon: IndianRupee },
    { label: "Pending Payments", value: stats ? "₹" + fmt(stats.pendingPayments) : "—", Icon: Star },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse rounded-[16px] border border-[#f0eaf8] bg-white p-4 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
            <div className="flex items-start gap-3">
              <div className="h-[44px] w-[44px] rounded-full bg-[#f0eaf8]" />
              <div className="min-w-0 flex-1">
                <div className="h-3 w-20 rounded bg-[#f0eaf8]" />
                <div className="mt-2 h-6 w-16 rounded bg-[#f0eaf8]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-[12.5px] text-red-700">Failed to load overview stats.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map(({ label, value, Icon }) => (
        <div
          key={label}
          className="rounded-[16px] border border-[#f0eaf8] bg-gradient-to-b from-white to-[#fbf9fe] px-4 pb-3 pt-4 shadow-[0_1px_3px_rgba(42,17,72,.05)]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white shadow-[0_6px_14px_rgba(109,40,217,.28)]">
              <Icon className="h-[20px] w-[20px]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-[#8b8397]">{label}</p>
              <p className="mt-[3px] text-[22px] font-bold leading-none tracking-[-0.01em] text-[#2a1148]">
                {value}
              </p>
            </div>
          </div>
          <div className="mt-3 h-px bg-[#f2ecf9]" />
          <Link
            href="/admin/admin-dashboard"
            className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-[#7c3aed]"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      ))}
    </div>
  );
}

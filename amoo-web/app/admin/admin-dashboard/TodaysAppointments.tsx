"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

export default function TodaysAppointments() {
  const { data, loading, error } = useApi(() => api.admin.getOverview());
  const rows = data?.recent ?? [];

  return (
    <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[17px] font-bold text-[#3d1a63]">
          Latest Bookings
        </h2>
        <Link
          href="/admin/booking-management"
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
        <p className="mt-4 text-[12.5px] text-[#8b8397]">No bookings yet.</p>
      ) : (
        <ul className="mt-4 space-y-[14px]">
          {rows
            .slice(0, 5)
            .map(
              (a: {
                booking_ref: string;
                user_name: string;
                service_name: string;
                amount: number;
                status: string;
                payment: string;
              }) => (
                <li key={a.booking_ref} className="flex items-center gap-3">
                  <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[12px] font-bold text-white">
                    {a.user_name?.slice(0, 2)?.toUpperCase() || "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#2a1148]">
                      {a.service_name}
                    </p>
                    <p className="mt-[2px] truncate text-[10.5px] text-[#8b8397]">
                      {a.user_name}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-[6px] bg-[#fdf3e2] px-[7px] py-[4px] text-[9.5px] font-semibold text-[#b7791f]">
                    ₹{Number(a.amount || 0).toLocaleString("en-IN")}
                  </span>
                  <span
                    className={
                      a.status === "upcoming" || a.payment === "Paid"
                        ? "w-[70px] shrink-0 rounded-[6px] bg-[#e7f7ee] px-[7px] py-[4px] text-center text-[9.5px] font-semibold text-[#16a34a]"
                        : "w-[70px] shrink-0 rounded-[6px] bg-[#eef0fd] px-[7px] py-[4px] text-center text-[9.5px] font-semibold text-[#4f46e5]"
                    }
                  >
                    {a.status}
                  </span>
                </li>
              ),
            )}
        </ul>
      )}

      <Link
        href="/admin/booking-management"
        className="mt-5 flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#ece4f6] bg-white text-[12.5px] font-medium text-[#3d1a63]"
      >
        View All Appointments
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </section>
  );
}

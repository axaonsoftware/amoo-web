"use client";

import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Booking = {
  id: number;
  service_name: string;
  expert_name: string | null;
  date: string;
  time: string;
  status: string;
};

export default function UpcomingSession() {
  const { data, loading, error } = useApi<{ data: Booking[] }>(() =>
    api.getBookings(),
  );
  const upcoming = (data?.data ?? []).find(
    (b) => b.status === "upcoming" || b.status === "pending-payment",
  );
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold text-[#2b0f47]">
          Upcoming Healing Session
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7a3fc0]"
        >
          View All
          <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>

      {/* Session box */}
      {loading ? (
        <div className="mt-3.5 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-3.5 text-[12.5px] text-red-500">{error}</p>
      ) : !upcoming ? (
        <p className="mt-3.5 text-[12.5px] text-[#8b8697]">
          No upcoming sessions. Book a new session.
        </p>
      ) : (
        <div className="mt-3.5 rounded-[12px] border border-[#ece9f3] bg-white p-3.5">
          <div className="flex items-start gap-3.5">
            <span className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=176&q=80"
                alt="Reiki energy healing"
                fill
                sizes="88px"
                className="object-cover"
              />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#2b0f47]">
                {upcoming.service_name}
              </p>
              <p className="mt-1 text-[12px] text-[#8b8697]">
                {upcoming.expert_name
                  ? `with ${upcoming.expert_name}`
                  : "Healing Session"}
              </p>
              <p className="mt-2.5 flex items-center gap-2 text-[11.5px] text-[#3d3a48]">
                <CalendarDays
                  className="h-[14px] w-[14px] text-[#7a3fc0]"
                  strokeWidth={1.8}
                />
                {new Date(upcoming.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-[11.5px] text-[#3d3a48]">
                <Clock
                  className="h-[14px] w-[14px] text-[#7a3fc0]"
                  strokeWidth={1.8}
                />
                {(upcoming.time || "").slice(0, 5) || "—"}
              </p>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="rounded-[9px] border border-[#d9c7f0] bg-white px-3 py-[10px] text-[12.5px] font-semibold text-[#6d28d9]"
            >
              View Details
            </button>
            <button
              type="button"
              className="rounded-[9px] bg-gradient-to-r from-[#6d28d9] to-[#4c1d95] px-3 py-[10px] text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(76,29,149,.28)]"
            >
              Join Session
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

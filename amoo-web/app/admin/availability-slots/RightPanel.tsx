"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useApiList } from "../../../lib/useApi";
import { api } from "../../../lib/api";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";

const dayHeads = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const legend = [
  { label: "Available", dot: "bg-[#3aa76d]" },
  { label: "Booked", dot: "bg-[#4c159f]" },
  { label: "Partially Booked", dot: "bg-[#e8a33d]" },
  { label: "Unavailable", dot: "bg-[#c9c5d6]" },
  { label: "On Break / Leave", dot: "bg-[#f0b45c]" },
];

export default function RightPanel() {
  const {
    items: experts,
    loading,
    error,
    isRefreshing,
  } = useApiList<{
    id: number;
    name: string;
    avatar: string | null;
    specialties: string | null;
    status: string;
    rating: number | string | null;
    total_slots: number;
    booked_slots: number;
    available_slots: number;
    blocked_slots: number;
  }>(() => api.admin.getSlotAvailability(), [], 30_000);

  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start(); else stop();
  }, [isRefreshing, start, stop]);

  const expert = experts?.[0] ?? null;
  const now = new Date();
  const viewMonth = now.getMonth();
  const viewYear = now.getFullYear();

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const blanks = (firstDay + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: blanks }, () => null as null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = now.getDate();

  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekSchedule = useMemo(() => {
    if (!expert?.total_slots) return null;
    const booked = expert.booked_slots || 0;
    const avail = expert.available_slots || 0;
    const total = expert.total_slots || 1;
    const pct = Math.round((booked / total) * 100);
    return { booked, avail, total, pct };
  }, [expert]);

  return (
    <div className="flex flex-col gap-4">
      {/* Astrologer details */}
      <section className="rounded-[14px] border border-[#ecebf1] bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <h2 className="text-[13.5px] font-semibold text-[#241f3d]">
          Astrologer Details
        </h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#4c159f]" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4 text-[11px] text-red-600">
            <AlertCircle size={14} />
            {error}
          </div>
        ) : expert ? (
          <>
            <div className="mt-3.5 flex items-start gap-3">
              <Image
                src={
                  expert.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=4c159f&color=fff&size=112`
                }
                alt={expert.name}
                width={112}
                height={112}
                unoptimized
                className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px] font-semibold leading-tight text-[#241f3d]">
                    {expert.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-[2px] text-[9.5px] font-medium ${
                      expert.status === "active"
                        ? "border-[#c9e9d7] bg-[#e9f7ef] text-[#2f8f5b]"
                        : "border-[#e6e6ec] bg-[#f4f4f7] text-[#8a86a0]"
                    }`}
                  >
                    {expert.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1.5 text-[10.5px] font-light leading-tight text-[#6f6b85]">
                  {expert.specialties || "—"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-3.5 h-[34px] w-full rounded-[8px] border border-[#d7c9f5] bg-white text-[12px] font-semibold text-[#4c159f] hover:bg-[#faf8ff]"
            >
              View Full Profile
            </button>
          </>
        ) : (
          <p className="py-4 text-[11px] text-[#8a86a0]">
            No astrologers found
          </p>
        )}
      </section>

      {/* Weekly availability */}
      <section className="rounded-[14px] border border-[#ecebf1] bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-[#241f3d]">
            Slot Summary
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#4c159f]" />
          </div>
        ) : weekSchedule ? (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#3f3d56]">Total Slots</span>
              <span className="font-semibold text-[#241f3d]">
                {expert!.total_slots}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#3f3d56]">Booked</span>
              <span className="font-semibold text-[#4c159f]">
                {expert!.booked_slots}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#3f3d56]">Available</span>
              <span className="font-semibold text-[#3aa76d]">
                {expert!.available_slots}
              </span>
            </div>
            <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#ecebf1]">
              <div
                className="h-full rounded-full bg-[#4c159f] transition-all"
                style={{ width: `${Math.min(weekSchedule.pct, 100)}%` }}
              />
            </div>
            <p className="text-right text-[10px] text-[#8a86a0]">
              {weekSchedule.pct}% utilisation
            </p>
          </div>
        ) : (
          <p className="py-4 text-[11px] text-[#8a86a0]">No data</p>
        )}
      </section>

      {/* Calendar */}
      <section className="rounded-[14px] border border-[#ecebf1] bg-white px-4 pb-4 pt-3.5 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-6 w-6 items-center justify-center text-[#c9c5d6]"
          >
            <ChevronLeft className="h-[16px] w-[16px]" strokeWidth={2} />
          </button>
          <p className="text-[12.5px] font-semibold text-[#241f3d]">
            {monthLabel}
          </p>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-6 w-6 items-center justify-center text-[#4c1d95]"
          >
            <ChevronRight className="h-[16px] w-[16px]" strokeWidth={2} />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-y-1">
          {dayHeads.map((d) => (
            <span
              key={d}
              className="text-center text-[10px] font-semibold text-[#241f3d]"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-y-[6px]">
          {cells.map((n, i) => {
            if (n === null) return <span key={`b${i}`} />;
            const isToday = n === today;
            return (
              <div key={n} className="flex flex-col items-center">
                <span
                  className={
                    isToday
                      ? "flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#2b1a9e] text-[10px] font-semibold text-white"
                      : "flex h-[20px] w-[20px] items-center justify-center text-[10px] font-normal text-[#241f3d]"
                  }
                >
                  {n}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Legend */}
      <section className="rounded-[14px] border border-[#ecebf1] bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <h2 className="text-[13px] font-semibold text-[#241f3d]">
          Slot Status Legend
        </h2>
        <div className="mt-3 flex flex-col gap-[9px]">
          {legend.map(({ label, dot }) => (
            <span key={label} className="flex items-center gap-2.5">
              <span className={`h-[8px] w-[8px] rounded-full ${dot}`} />
              <span className="text-[11px] font-light text-[#3f3d56]">
                {label}
              </span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

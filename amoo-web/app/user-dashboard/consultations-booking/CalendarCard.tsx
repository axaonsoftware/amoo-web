"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Slot } from "@/lib/types";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Day = {
  n: number;
  muted?: boolean;
  today?: boolean;
  scheduled?: boolean;
  dot?: boolean;
};

const legend = [
  { label: "Today", color: "bg-[#6d28d9]" },
  { label: "Scheduled", color: "bg-[#f0c26a]" },
  { label: "Completed", color: "bg-[#22c55e]" },
  { label: "Cancelled", color: "bg-[#f43f5e]" },
];

function buildDays(slots: Slot[]): Day[] {
  const now = new Date();
  const today = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const totalDays = last.getDate();
  const slotDates = new Set<number>();
  (slots || []).forEach((s) => {
    try {
      const d = new Date(s.date || s.start_time);
      if (!isNaN(d.getTime()) && d.getMonth() === month)
        slotDates.add(d.getDate());
    } catch {}
  });
  const days: Day[] = [];
  for (let p = 0; p < startPad; p++) {
    const prevMonthLast = new Date(year, month, 0).getDate();
    days.push({ n: prevMonthLast - startPad + 1 + p, muted: true });
  }
  for (let d = 1; d <= totalDays; d++) {
    const isToday = d === today;
    const hasSlot = slotDates.has(d);
    days.push({
      n: d,
      today: isToday,
      scheduled: hasSlot ? true : undefined,
      dot: hasSlot ? true : undefined,
    });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ n: d, muted: true });
  }
  return days;
}

export default function CalendarCard() {
  // /api/slots is paginated -> `{ data, meta }`. The old `Array.isArray(slots)`
  // guard was therefore always false, so the calendar never showed any slot.
  const {
    items: slotArray,
    loading,
    error,
  } = useApiList<Slot>(() => api.getSlots());
  const days = buildDays(slotArray);

  if (loading) {
    return (
      <section className="rounded-[16px] border border-[#efe6d6] bg-white px-[18px] pb-[18px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
        <h2 className="font-display text-[19px] font-bold text-[#4c1d95]">
          Consultation Calendar
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading calendar...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[16px] border border-[#efe6d6] bg-white px-[18px] pb-[18px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
        <h2 className="font-display text-[19px] font-bold text-[#4c1d95]">
          Consultation Calendar
        </h2>
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-[18px] pb-[18px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <h2 className="font-display text-[19px] font-bold text-[#4c1d95]">
        Consultation Calendar
      </h2>

      <div className="mt-3.5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[#2b0f47]">May 2025</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#7a7686]"
          >
            <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#7a7686]"
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="flex h-7 items-center justify-center text-[11.5px] font-medium text-[#9a95a5]"
          >
            {d}
          </div>
        ))}

        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span
              className={[
                "flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12.5px]",
                d.today
                  ? "bg-[#6d28d9] font-semibold text-white"
                  : d.scheduled
                    ? "bg-[#fbe6b8] font-semibold text-[#8a5f1c]"
                    : d.muted
                      ? "font-normal text-[#c9c4d1]"
                      : "font-normal text-[#3f3a4a]",
              ].join(" ")}
            >
              {d.n}
            </span>
            <span
              className={[
                "mt-[2px] h-[4px] w-[4px] rounded-full",
                d.dot ? "bg-[#7c4ec4]" : "bg-transparent",
              ].join(" ")}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
        {legend.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-[7px] w-[7px] rounded-full ${color}`} />
            <span className="text-[11px] text-[#7a7686]">{label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

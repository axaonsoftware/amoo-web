"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  CalendarLineIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockLineIcon,
  MoonIcon,
  SunIcon,
  SunsetIcon,
} from "./icons";
import { api } from "../../../lib/api";

const LEADING_BLANKS = 1;
const DAYS_IN_MONTH = 30;
const UNAVAILABLE = [3, 4, 5];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PERIODS = [
  { label: "Morning", range: "6 AM - 12 PM", Icon: SunIcon },
  { label: "Afternoon", range: "12 PM - 5 PM", Icon: SunIcon },
  { label: "Evening", range: "5 PM - 10 PM", Icon: SunsetIcon },
  { label: "Night", range: "10 PM - 12 AM", Icon: MoonIcon },
];

const DEFAULT_SLOTS: Record<string, string[]> = {
  Morning: ["06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  Afternoon: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"],
  Evening: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM"],
  Night: ["10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"],
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function DateTimeCard({
  selectedDate,
  selectedPeriod,
  selectedSlot,
  onSelectDate,
  onSelectPeriod,
  onSelectSlot,
}: {
  selectedDate: number;
  selectedPeriod: string;
  selectedSlot: string;
  onSelectDate: (day: number) => void;
  onSelectPeriod: (period: string) => void;
  onSelectSlot: (slot: string) => void;
}) {
  const [slotsByPeriod, setSlotsByPeriod] = useState<Record<string, string[]>>(DEFAULT_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  useEffect(() => {
    setLoadingSlots(true);
    setSlotsError("");
    api.getSlots()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data ?? [];
        if (list.length) {
          const grouped: Record<string, string[]> = {};
          for (const slot of list) {
            const period = slot.period || "Morning";
            if (!grouped[period]) grouped[period] = [];
            grouped[period].push(slot.time || slot.label);
          }
          setSlotsByPeriod((prev) => ({ ...prev, ...grouped }));
        }
      })
      .catch((e: any) => setSlotsError(e?.message || "Failed to load slots."))
      .finally(() => setLoadingSlots(false));
  }, []);

  const now = new Date();
  const month = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();
  const monthLabel = `${month} ${year}`;

  const cells: (number | null)[] = [
    ...Array.from({ length: LEADING_BLANKS }, () => null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  const slots = slotsByPeriod[selectedPeriod] || slotsByPeriod["Morning"] || DEFAULT_SLOTS["Morning"];

  const formatDate = (day: number) => {
    const date = new Date(year, now.getMonth(), day);
    return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <section className="grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(75,37,131,0.04)] lg:grid-cols-[382px_1fr]">
      {/* ═══ Select Date ═══ */}
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <CalendarLineIcon className="h-[19px] w-[19px] text-[#d09b38]" />
          <h2 className="font-display text-[17px] font-bold text-grape">
            Select Date
          </h2>
        </div>

        {/* Month navigation */}
        <div className="mt-5 flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#6b6879] transition-colors hover:bg-lilac"
          >
            <ChevronLeftIcon className="h-[16px] w-[16px]" />
          </button>
          <span className="text-[15.5px] font-semibold text-[#2f1a52]">
            {monthLabel}
          </span>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#6b6879] transition-colors hover:bg-lilac"
          >
            <ChevronRightIcon className="h-[16px] w-[16px]" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="mt-4 grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-center text-[12px] font-normal text-[#9a97a6]">{day}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="mt-2 grid grid-cols-7 gap-y-[6px]">
          {cells.map((day, i) => {
            if (day === null) {
              return <span key={`blank-${i}`} className="h-[38px]" />;
            }
            const isSelected = day === selectedDate;
            const isUnavailable = UNAVAILABLE.includes(day);
            const isWeekend = i % 7 === 0 || i % 7 === 6;
            return (
              <span key={day} className="flex h-[38px] items-center justify-center">
                <button
                  type="button"
                  disabled={isUnavailable}
                  onClick={() => onSelectDate(day)}
                  className={`flex h-[36px] w-[36px] items-center justify-center rounded-full text-[13.5px] transition-colors ${
                    isSelected
                      ? "bg-[#3d1a6d] font-semibold text-white shadow-[0_0_0_2px_#fff,0_0_0_4px_#e0a33e]"
                      : isUnavailable
                        ? "font-normal text-[#cdc9d4] cursor-not-allowed"
                        : isWeekend
                          ? "font-medium text-[#c9932f] hover:bg-lilac"
                          : "font-medium text-[#2f1a52] hover:bg-lilac"
                  }`}
                >
                  {day}
                </button>
              </span>
            );
          })}
        </div>

        {/* Selected date recap */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#e6dcf5] bg-[#f4eefc] px-4 py-3">
          <CalendarLineIcon className="h-[22px] w-[22px] shrink-0 text-grape-2" />
          <div>
            <p className="text-[12px] font-semibold text-grape">Selected Date</p>
            <p className="mt-[2px] text-[12.5px] text-[#5b4a7a]">{formatDate(selectedDate)}</p>
          </div>
        </div>
      </div>

      {/* ═══ Select Time ═══ */}
      <div className="border-t border-line p-5 lg:border-t-0 lg:border-l">
        <div className="flex items-center gap-2.5">
          <ClockLineIcon className="h-[19px] w-[19px] text-[#d09b38]" />
          <h2 className="font-display text-[17px] font-bold text-grape">Select Time</h2>
        </div>

        {/* Period tabs */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERIODS.map(({ label, range, Icon }) => {
            const active = label === selectedPeriod;
            return (
              <button
                key={label}
                type="button"
                onClick={() => { onSelectPeriod(label); onSelectSlot(""); }}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-[13px] transition-all ${
                  active
                    ? "border border-[#e0a33e] bg-[linear-gradient(180deg,#3d1a6d_0%,#2a1148_100%)] shadow-[0_4px_14px_rgba(61,26,109,0.28)]"
                    : "border border-line bg-white hover:border-gold/50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon className={`h-[16px] w-[16px] ${active ? "text-gold" : "text-[#e0a33e]"}`} />
                  <span className={`text-[13.5px] font-semibold ${active ? "text-white" : "text-[#2f1a52]"}`}>{label}</span>
                </span>
                <span className={`mt-[3px] text-[11.5px] ${active ? "text-white/70" : "text-[#9a97a6]"}`}>{range}</span>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {loadingSlots ? (
          <div className="mt-5 flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-grape" />
          </div>
        ) : slotsError ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-[12px] text-red-700">
            {slotsError}
            <button type="button" onClick={() => window.location.reload()} className="ml-2 underline">Retry</button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isSelected = slot === selectedSlot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`flex h-[50px] items-center justify-center rounded-xl text-[14px] transition-all ${
                    isSelected
                      ? "border-2 border-[#e0a33e] bg-[linear-gradient(180deg,#3d1a6d_0%,#2a1148_100%)] font-semibold text-white shadow-[0_4px_14px_rgba(61,26,109,0.28)]"
                      : "border border-line bg-white font-medium text-[#2f1a52] hover:border-gold/60 hover:bg-lilac/30"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}

        {/* IST note */}
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-[#d5e9d9] bg-[#f0f8f2] px-4 py-3">
          <CheckCircleIcon className="h-[16px] w-[16px] shrink-0 text-[#4b9668]" />
          <p className="text-[12.5px] text-[#3f7a55]">All available time slots are displayed in IST (Indian Standard Time)</p>
        </div>
      </div>
    </section>
  );
}

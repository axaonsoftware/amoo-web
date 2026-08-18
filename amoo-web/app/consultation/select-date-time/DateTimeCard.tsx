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

const UNAVAILABLE = [3, 4, 5];

// The backend rejects bookings whose date is not strictly in the future
// (`date.min("now")` in the booking schema). Computing the disabled set once
// per render keeps past AND today's cells out of the picker.
function todayMidnight(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PERIODS = [
  { label: "Morning", range: "6 AM - 12 PM", Icon: SunIcon },
  { label: "Afternoon", range: "12 PM - 5 PM", Icon: SunIcon },
  { label: "Evening", range: "5 PM - 10 PM", Icon: SunsetIcon },
  { label: "Night", range: "10 PM - 12 AM", Icon: MoonIcon },
];

const DEFAULT_SLOTS: Record<string, string[]> = {
  Morning: [
    "06:00 AM",
    "06:30 AM",
    "07:00 AM",
    "07:30 AM",
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
  ],
  Afternoon: [
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ],
  Evening: [
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
  ],
  Night: ["10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"],
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DateTimeCard({
  selectedDate,
  selectedMonth,
  selectedYear,
  onSelectDate,
  onSelectMonth,
  onSelectYear,
  selectedPeriod,
  selectedSlot,
  onSelectPeriod,
  onSelectSlot,
}: {
  selectedDate: number;
  selectedMonth: number;
  selectedYear: number;
  onSelectDate: (day: number) => void;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  selectedPeriod: string;
  selectedSlot: string;
  onSelectPeriod: (period: string) => void;
  onSelectSlot: (slot: string, slotId?: number) => void;
}) {
  const [slotsByPeriod, setSlotsByPeriod] =
    useState<Record<string, string[]>>(DEFAULT_SLOTS);
  const [slotIdByTime, setSlotIdByTime] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
  const month = MONTH_NAMES[selectedMonth];
  const monthLabel = `${month} ${selectedYear}`;
  const minDate = todayMidnight();

  const prevMonth = () => {
    if (selectedMonth === 0) {
      onSelectYear(selectedYear - 1);
      onSelectMonth(11);
    } else {
      onSelectMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      onSelectYear(selectedYear + 1);
      onSelectMonth(0);
    } else {
      onSelectMonth(selectedMonth + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  useEffect(() => {
    api
      .getSlots("?status=available")
      .then(
        (
          res:
            | { data?: { id?: number; period?: string; time?: string; label?: string; start_time?: string; status?: string }[] }
            | { id?: number; period?: string; time?: string; label?: string; start_time?: string; status?: string }[],
        ) => {
          const list = (Array.isArray(res) ? res : (res?.data ?? [])).filter(
            (s: { status?: string }) => !s.status || s.status === "available",
          );
          if (list.length) {
            // Backend rows carry start_time ("HH:mm:ss"); server defaults to
            // "HH:mm AM/PM" for the label used on the button and the summary.
            const toLocale = (raw: string) => {
              if (/[AP]M$/.test(raw)) return raw;
              const [h, m] = raw.split(":").map(Number);
              const suffix = h >= 12 ? "PM" : "AM";
              const hour = h % 12 === 0 ? 12 : h % 12;
              return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
            };
            const periodOf = (raw: string) => {
              const hour = Number(raw.split(":")[0]);
              if (hour < 12) return "Morning";
              if (hour < 17) return "Afternoon";
              if (hour < 22) return "Evening";
              return "Night";
            };
            const grouped: Record<string, string[]> = {};
            const idMap: Record<string, number> = {};
            for (const slot of list) {
              const rawTime = slot.time || slot.label || slot.start_time || "";
              if (!rawTime) continue;
              const period = slot.period || periodOf(rawTime.split(" ")[0]);
              if (!grouped[period]) grouped[period] = [];
              grouped[period].push(toLocale(rawTime));
              const display = toLocale(rawTime);
              if (slot.id && !idMap[display]) idMap[display] = slot.id;
            }
            setSlotsByPeriod((prev) => ({ ...prev, ...grouped }));
            setSlotIdByTime(idMap);
          }
        },
      )
      .catch((e: Error) => setSlotsError(e?.message || "Failed to load slots."))
      .finally(() => setLoadingSlots(false));
  }, []);

  const slots =
    slotsByPeriod[selectedPeriod] ||
    slotsByPeriod["Morning"] ||
    DEFAULT_SLOTS["Morning"];

  const formatDate = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
            onClick={prevMonth}
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
            onClick={nextMonth}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#6b6879] transition-colors hover:bg-lilac"
          >
            <ChevronRightIcon className="h-[16px] w-[16px]" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="mt-4 grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-center text-[12px] font-normal text-[#9a97a6]"
            >
              {day}
            </span>
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
            const isPastOrToday =
              new Date(selectedYear, selectedMonth, day).getTime() <= minDate;
            const isWeekend = i % 7 === 0 || i % 7 === 6;
            return (
              <span
                key={day}
                className="flex h-[38px] items-center justify-center"
              >
                <button
                  type="button"
                  disabled={isUnavailable || isPastOrToday}
                  onClick={() => onSelectDate(day)}
                  aria-disabled={isUnavailable || isPastOrToday}
                  className={`flex h-[36px] w-[36px] items-center justify-center rounded-full text-[13.5px] transition-colors ${
                    isSelected
                      ? "bg-[#3d1a6d] font-semibold text-white shadow-[0_0_0_2px_#fff,0_0_0_4px_#e0a33e]"
                      : isUnavailable || isPastOrToday
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
            <p className="text-[12px] font-semibold text-grape">
              Selected Date
            </p>
            <p className="mt-[2px] text-[12.5px] text-[#5b4a7a]">
              {formatDate(selectedDate)}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Select Time ═══ */}
      <div className="border-t border-line p-5 lg:border-t-0 lg:border-l">
        <div className="flex items-center gap-2.5">
          <ClockLineIcon className="h-[19px] w-[19px] text-[#d09b38]" />
          <h2 className="font-display text-[17px] font-bold text-grape">
            Select Time
          </h2>
        </div>

        {/* Period tabs */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERIODS.map(({ label, range, Icon }) => {
            const active = label === selectedPeriod;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  onSelectPeriod(label);
                  onSelectSlot("");
                }}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-[13px] transition-all ${
                  active
                    ? "border border-[#e0a33e] bg-[linear-gradient(180deg,#3d1a6d_0%,#2a1148_100%)] shadow-[0_4px_14px_rgba(61,26,109,0.28)]"
                    : "border border-line bg-white hover:border-gold/50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon
                    className={`h-[16px] w-[16px] ${active ? "text-gold" : "text-[#e0a33e]"}`}
                  />
                  <span
                    className={`text-[13.5px] font-semibold ${active ? "text-white" : "text-[#2f1a52]"}`}
                  >
                    {label}
                  </span>
                </span>
                <span
                  className={`mt-[3px] text-[11.5px] ${active ? "text-white/70" : "text-[#9a97a6]"}`}
                >
                  {range}
                </span>
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
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isSelected = slot === selectedSlot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectSlot(slot, slotIdByTime[slot])}
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
          <p className="text-[12.5px] text-[#3f7a55]">
            All available time slots are displayed in IST (Indian Standard Time)
          </p>
        </div>
      </div>
    </section>
  );
}

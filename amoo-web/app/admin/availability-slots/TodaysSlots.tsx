"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Plus, Coffee, Utensils, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../../lib/api";

type State = "available" | "booked" | "break";

function to12h(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  let hr = parseInt(h, 10);
  const ap = hr >= 12 ? "PM" : "AM";
  hr = hr % 12 || 12;
  return `${String(hr).padStart(2, "0")}:${m || "00"} ${ap}`;
}

const slots: { time: string; state: State; label: string }[] = [
  { time: "07:00 AM", state: "available", label: "Available" },
  { time: "07:30 AM", state: "booked", label: "Booked" },
  { time: "08:00 AM", state: "available", label: "Available" },
  { time: "08:30 AM", state: "booked", label: "Booked" },
  { time: "09:00 AM", state: "available", label: "Available" },
  { time: "09:30 AM", state: "break", label: "Break" },
  { time: "10:00 AM", state: "available", label: "Available" },
  { time: "10:30 AM", state: "booked", label: "Booked" },
  { time: "11:00 AM", state: "available", label: "Available" },
  { time: "11:30 AM", state: "booked", label: "Booked" },
  { time: "12:00 PM", state: "break", label: "Break" },
  { time: "12:30 PM", state: "available", label: "Available" },
  { time: "01:00 PM", state: "available", label: "Available" },
  { time: "01:30 PM", state: "booked", label: "Booked" },
  { time: "02:00 PM", state: "available", label: "Available" },
  { time: "02:30 PM", state: "booked", label: "Booked" },
  { time: "03:00 PM", state: "available", label: "Available" },
  { time: "03:30 PM", state: "booked", label: "Booked" },
  { time: "04:00 PM", state: "available", label: "Available" },
  { time: "04:30 PM", state: "booked", label: "Booked" },
  { time: "05:00 PM", state: "available", label: "Available" },
];

const stateStyles: Record<State, string> = {
  available: "border-[#dcefdd] bg-[#f5fbf5]",
  booked: "border-[#e6dcfa] bg-[#f9f4fe]",
  break: "border-[#f6e6c6] bg-[#fef8ef]",
};

const timeColor: Record<State, string> = {
  available: "text-[#2f8f5b]",
  booked: "text-[#4c159f]",
  break: "text-[#c98526]",
};

const labelColor: Record<State, string> = {
  available: "text-[#4aa976]",
  booked: "text-[#7c62c9]",
  break: "text-[#d09140]",
};

const legend = [
  { label: "Available", dot: "bg-[#3aa76d]" },
  { label: "Booked", dot: "bg-[#4c159f]" },
  { label: "Break", dot: "bg-[#e8a33d]" },
  { label: "Unavailable", dot: "bg-[#c9c5d6]" },
];

export default function TodaysSlots() {
  const [list, setList] = useState<{ time: string; state: State; label: string }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getSlots()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (Array.isArray(items) && items.length) {
          setList(
            items.map((s: any) => {
              const state: State =
                s.status === "booked"
                  ? "booked"
                  : s.status === "break"
                  ? "break"
                  : "available";
              return {
                time: to12h(s.start_time),
                state,
                label: state.charAt(0).toUpperCase() + state.slice(1),
              };
            })
          );
        }
      })
      .catch((err) => setError("Failed to load slots. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mt-4 rounded-[14px] border border-[#ecebf1] bg-white px-5 pb-5 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#4c159f]" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-4 rounded-[14px] border border-[#ecebf1] bg-white px-5 pb-5 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  const slotRows = list || slots;

  return (
    <section className="mt-4 rounded-[14px] border border-[#ecebf1] bg-white px-5 pb-5 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <h2 className="text-[13.5px] font-semibold text-[#241f3d]">
          Today&apos;s Slots - Ast. Neha Sharma
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          {legend.map(({ label, dot }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-[7px] w-[7px] rounded-full ${dot}`} />
              <span className="text-[10.5px] font-light text-[#6f6b85]">{label}</span>
            </span>
          ))}
        </div>

        <button
          type="button"
          className="ml-auto flex items-center gap-1.5 text-[11.5px] font-medium text-[#4c159f]"
        >
          View Full Calendar
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {slotRows.map(({ time, state, label }, i) => (
          <div
            key={`${time}-${i}`}
            className={`relative rounded-[8px] border py-2.5 text-center ${stateStyles[state]}`}
          >
            {state === "booked" && i === 1 ? (
              <span className="absolute right-2 top-1.5 h-[5px] w-[5px] rounded-full bg-[#4c159f]" />
            ) : null}
            <p className={`text-[11.5px] font-semibold leading-none ${timeColor[state]}`}>
              {time}
            </p>
            <p
              className={`mt-1.5 flex items-center justify-center gap-1 text-[10px] font-light leading-none ${labelColor[state]}`}
            >
              {state === "break" ? (
                i === 5 ? (
                  <Coffee className="h-[10px] w-[10px]" strokeWidth={1.8} />
                ) : (
                  <Utensils className="h-[10px] w-[10px]" strokeWidth={1.8} />
                )
              ) : null}
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          className="flex h-[36px] items-center gap-2 rounded-[8px] border border-[#e4e2ec] bg-white px-5 text-[12px] font-medium text-[#241f3d] hover:bg-[#f7f6fb]"
        >
          <Plus className="h-[14px] w-[14px]" strokeWidth={2.2} />
          Add Custom Slot / Break
        </button>
      </div>
    </section>
  );
}

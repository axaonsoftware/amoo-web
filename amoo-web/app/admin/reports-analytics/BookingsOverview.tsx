"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

const W = 340;
const H = 176;
const MAX = 200;
const slot = W / 14;
const BAR = 12;
const cx = (i: number) => i * slot + slot / 2;
const y = (v: number) => H - (v / MAX) * H;

const fallbackBookings = [
  96, 132, 108, 152, 118, 176, 122, 138, 168, 128, 158, 172, 148, 166,
];
const fallbackCompleted = [
  72, 60, 84, 66, 92, 74, 96, 68, 84, 74, 90, 76, 106, 80,
];

type TrendPoint = {
  total?: number;
  count?: number;
  bookings?: number;
  completed?: number;
  completed_bookings?: number;
};

export default function BookingsOverview() {
  const [bookings, setBookings] = useState(fallbackBookings);
  const [completed, setCompleted] = useState(fallbackCompleted);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin
      .getBookingsTrends("month")
      .then((res) => {
        if (cancelled) return;
        const data = (res as { data?: unknown } | null)?.data ?? res;
        if (Array.isArray(data)) {
          const typed = data as TrendPoint[];
          const b = typed.map((d) =>
            Number(d.total || d.count || d.bookings || 0),
          );
          const c = typed.map((d) =>
            Number(d.completed || d.completed_bookings || 0),
          );
          if (b.length >= 7) {
            setBookings(b.slice(0, 14));
            setCompleted(c.slice(0, 14));
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load bookings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentBookings = bookings;
  const linePoints = completed.map((v, i) => `${cx(i)},${y(v)}`).join(" ");

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Bookings Overview
        </h2>
        <button
          type="button"
          className="inline-flex h-[30px] items-center gap-[8px] rounded-[8px] border border-[#E7E5EF] bg-white pl-3 pr-2 text-[11px] font-medium text-[#2E2A3B]"
        >
          This Month
          <ChevronDown size={13} className="text-[#8B879C]" />
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-center gap-5">
            <span className="flex items-center gap-[6px] text-[10px] font-medium text-[#6C6B78]">
              <span className="h-[8px] w-[8px] rounded-[2px] bg-[#6D28D9]" />{" "}
              Bookings
            </span>
            <span className="flex items-center gap-[6px] text-[10px] font-medium text-[#6C6B78]">
              <span className="h-[8px] w-[8px] rounded-[2px] bg-[#F59E0B]" />{" "}
              Completed
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex w-[22px] shrink-0 flex-col justify-between py-[2px] text-right text-[9px] text-[#A5A2B5]">
              {["200", "150", "100", "50", "0"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="h-[168px] w-full overflow-visible"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                  <line
                    key={p}
                    x1="0"
                    x2={W}
                    y1={p * H}
                    y2={p * H}
                    stroke="#F1EFF6"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {currentBookings.map((v, i) => (
                  <rect
                    key={i}
                    x={cx(i) - BAR / 2}
                    y={y(v)}
                    width={BAR}
                    height={H - y(v)}
                    rx="3"
                    fill="#6D28D9"
                  />
                ))}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {completed.map((v, i) => (
                  <circle
                    key={i}
                    cx={cx(i)}
                    cy={y(v)}
                    r="2.5"
                    fill="#F59E0B"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              <div className="mt-[10px] flex justify-between text-[9px] text-[#A5A2B5]">
                {["1 May", "5 May", "9 May", "13 May", "18 May"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

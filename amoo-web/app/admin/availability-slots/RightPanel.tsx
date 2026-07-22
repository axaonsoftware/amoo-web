import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const weekly = [
  { day: "Monday", hours: "07:00 AM - 10:00 PM" },
  { day: "Tuesday", hours: "07:00 AM - 10:00 PM" },
  { day: "Wednesday", hours: "07:00 AM - 10:00 PM" },
  { day: "Thursday", hours: "07:00 AM - 10:00 PM" },
  { day: "Friday", hours: "07:00 AM - 10:00 PM" },
  { day: "Saturday", hours: "08:00 AM - 09:00 PM" },
  { day: "Sunday", hours: "08:00 AM - 09:00 PM" },
];

const dayHeads = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// 3 leading blanks, 1..31
const cells: (number | null)[] = [
  null,
  null,
  null,
  ...Array.from({ length: 31 }, (_, i) => i + 1),
];

const legend = [
  { label: "Available", dot: "bg-[#3aa76d]" },
  { label: "Booked", dot: "bg-[#4c159f]" },
  { label: "Partially Booked", dot: "bg-[#e8a33d]" },
  { label: "Unavailable", dot: "bg-[#c9c5d6]" },
  { label: "On Break / Leave", dot: "bg-[#f0b45c]" },
];

export default function RightPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Astrologer details */}
      <section className="rounded-[14px] border border-[#ecebf1] bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <h2 className="text-[13.5px] font-semibold text-[#241f3d]">
          Astrologer Details
        </h2>

        <div className="mt-3.5 flex items-start gap-3">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
            alt="Ast. Neha Sharma"
            width={112}
            height={112}
            unoptimized
            className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] font-semibold leading-tight text-[#241f3d]">
                Ast. Neha Sharma
              </p>
              <span className="shrink-0 rounded-full border border-[#c9e9d7] bg-[#e9f7ef] px-2 py-[2px] text-[9.5px] font-medium text-[#2f8f5b]">
                Active
              </span>
            </div>
            <p className="mt-1.5 text-[10.5px] font-light leading-tight text-[#6f6b85]">
              Vedic Astrology, Kundli, Vastu
            </p>
            <p className="mt-1 text-[10.5px] font-light leading-tight text-[#6f6b85]">
              8 Years Experience
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-3.5 h-[34px] w-full rounded-[8px] border border-[#d7c9f5] bg-white text-[12px] font-semibold text-[#4c159f] hover:bg-[#faf8ff]"
        >
          View Full Profile
        </button>
      </section>

      {/* Weekly availability */}
      <section className="rounded-[14px] border border-[#ecebf1] bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(23,16,45,.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-[#241f3d]">
            Weekly Availability
          </h2>
          <button
            type="button"
            className="text-[11px] font-medium text-[#4c159f]"
          >
            Edit Schedule
          </button>
        </div>

        <div className="mt-3">
          {weekly.map(({ day, hours }) => (
            <div key={day} className="flex items-center py-[7px]">
              <span className="w-[74px] shrink-0 text-[10.5px] font-normal text-[#3f3d56]">
                {day}
              </span>
              <span className="flex-1 text-[10.5px] font-light text-[#6f6b85]">
                {hours}
              </span>
              <span className="flex h-[16px] w-[30px] shrink-0 items-center justify-end rounded-full bg-[#4c159f] px-[2px]">
                <span className="h-[12px] w-[12px] rounded-full bg-white" />
              </span>
            </div>
          ))}
        </div>
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
          <p className="text-[12.5px] font-semibold text-[#241f3d]">May 2025</p>
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
            const isToday = n === 18;
            const hasDot = n >= 19;
            return (
              <div key={n} className="flex flex-col items-center">
                <span
                  className={
                    isToday
                      ? "flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#2b1a9e] text-[10px] font-semibold text-white"
                      : n < 18
                        ? "flex h-[20px] w-[20px] items-center justify-center text-[10px] font-normal text-[#b3afc4]"
                        : "flex h-[20px] w-[20px] items-center justify-center text-[10px] font-semibold text-[#241f3d]"
                  }
                >
                  {n}
                </span>
                <span
                  className={`mt-[1px] h-[4px] w-[4px] rounded-full ${
                    hasDot ? "bg-[#3aa76d]" : "bg-transparent"
                  }`}
                />
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
              <span className="text-[11px] font-light text-[#3f3d56]">{label}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

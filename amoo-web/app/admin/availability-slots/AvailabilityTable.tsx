"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Calendar,
  SlidersHorizontal,
  Eye,
  Pencil,
  MoreVertical,
  Sparkles,
  Layers,
  Orbit,
  Leaf,
  Flower2,
  Gem, Loader2, AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

const tabs = [
  { label: "Astrologer Availability", active: true },
  { label: "Slot Calendar View", active: false },
  { label: "Today's Schedule", active: false },
  { label: "Tomorrow's Schedule", active: false },
];

type Chip = { Icon: typeof Sparkles; bg: string; color: string };

const chipPurple: Chip = { Icon: Orbit, bg: "bg-[#f0ecfd]", color: "text-[#7c4dcf]" };
const chipPink: Chip = { Icon: Layers, bg: "bg-[#fdeaf0]", color: "text-[#d94f7c]" };
const chipBlue: Chip = { Icon: Gem, bg: "bg-[#e7f0fd]", color: "text-[#3d7bd9]" };
const chipGreen: Chip = { Icon: Leaf, bg: "bg-[#e6f6ed]", color: "text-[#3aa76d]" };
const chipTeal: Chip = { Icon: Flower2, bg: "bg-[#e4f5f1]", color: "text-[#2fa08c]" };

const allChips = [chipPurple, chipPink, chipBlue, chipGreen, chipTeal];

const statusStyles: Record<string, string> = {
  Active: "border-[#d3ecd6] bg-[#ebf8ec] text-[#2f8f5b]",
  "On Leave": "border-[#f6e3bf] bg-[#fef6e9] text-[#c98526]",
  Inactive: "border-[#e6e6ec] bg-[#f4f4f7] text-[#8a86a0]",
};

export default function AvailabilityTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin
      .getSlots()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (Array.isArray(items)) {
          setRows(
            items.map((s: any) => {
              const total = s.total_slots || s.slots || 24;
              const booked = s.booked_slots || s.booked || Math.floor(total * 0.6);
              const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
              return {
                name: s.name || s.expert_name || "Astrologer",
                exp: s.experience || `${s.expertise || "Astrologer"}`,
                chips: [allChips[Math.floor(Math.random() * allChips.length)]],
                days: s.available_days || "Mon - Sun",
                hours: s.available_hours || "09:00 AM - 06:00 PM",
                slots: `${total} Slots`,
                booked,
                total,
                pct: `${pct}%`,
                bar: `${Math.max(pct, 2)}%`,
                status: s.status || "Active",
              };
            })
          );
        }
      })
      .catch(() => setError("Failed to load availability. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-[14px] border border-[#ecebf1] bg-white shadow-[0_1px_2px_rgba(23,16,45,.03)]">
      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-[#ecebf1] px-5">
        {tabs.map(({ label, active }) => (
          <button
            key={label}
            type="button"
            className={
              active
                ? "-mb-px shrink-0 border-b-2 border-[#4c159f] pb-3 pt-4 text-[12.5px] font-semibold text-[#4c159f]"
                : "-mb-px shrink-0 border-b-2 border-transparent pb-3 pt-4 text-[12.5px] font-normal text-[#6f6b85] hover:text-[#241f3d]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 px-5 pt-4">
        <label className="relative flex h-[36px] w-full max-w-[206px] items-center">
          <input
            type="text"
            placeholder="Search astrologer by name..."
            className="h-full w-full rounded-[8px] border border-[#e4e2ec] bg-white pl-3 pr-8 text-[11px] font-light text-[#3f3d56] outline-none placeholder:text-[#a5a2b3] focus:border-[#c9bfe4]"
          />
          <Search
            className="pointer-events-none absolute right-2.5 h-[14px] w-[14px] text-[#6f6b85]"
            strokeWidth={2}
          />
        </label>

        <div className="relative flex h-[36px] w-[132px] items-center rounded-[8px] border border-[#e4e2ec] bg-white px-2.5">
          <span className="flex-1 whitespace-nowrap text-[11px] font-normal text-[#6f6b85]">
            All Services
          </span>
          <ChevronDown className="h-[14px] w-[14px] text-[#8a86a0]" strokeWidth={2} />
        </div>

        <div className="relative flex h-[36px] w-[126px] items-center rounded-[8px] border border-[#e4e2ec] bg-white px-2.5">
          <span className="flex-1 whitespace-nowrap text-[11px] font-normal text-[#6f6b85]">
            All Status
          </span>
          <ChevronDown className="h-[14px] w-[14px] text-[#8a86a0]" strokeWidth={2} />
        </div>

        <div className="flex h-[36px] w-[172px] items-center rounded-[8px] border border-[#e4e2ec] bg-white px-2.5">
          <span className="flex-1 whitespace-nowrap text-[11px] font-normal text-[#3f3d56]">
            01 May 2025 - 18 May 2025
          </span>
          <Calendar className="h-[14px] w-[14px] shrink-0 text-[#6f6b85]" strokeWidth={1.8} />
        </div>

        <button
          type="button"
          className="ml-auto flex h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[#e4e2ec] bg-white px-3.5 text-[11px] font-medium text-[#3f3d56]"
        >
          <SlidersHorizontal className="h-[14px] w-[14px]" strokeWidth={1.8} />
          Filters
        </button>
      </div>

      {/* Bulk actions */}
      <div className="flex justify-end px-5 pt-3">
        <button
          type="button"
          className="flex h-[30px] items-center gap-2 rounded-[7px] border border-[#e4e2ec] bg-white px-3 text-[11px] font-normal text-[#3f3d56]"
        >
          Bulk Actions
          <ChevronDown className="h-[13px] w-[13px] text-[#8a86a0]" strokeWidth={2} />
        </button>
      </div>

      {error ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mx-5 mt-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto px-5 pb-4 pt-2">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[#ecebf1]">
                  <th className="whitespace-nowrap py-2.5 pr-2 text-left text-[11px] font-medium text-[#6f6b85]">Astrologer</th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]">Services</th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]">Weekly Availability</th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]">Today&apos;s Slots</th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]">Booked / Total</th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-center text-[11px] font-medium text-[#6f6b85]">Status</th>
                  <th className="whitespace-nowrap py-2.5 pl-2 text-center text-[11px] font-medium text-[#6f6b85]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={sanitize(r.name)} className="border-b border-[#f2f1f6] last:border-b-0">
                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                          alt={sanitize(r.name)}
                          width={72}
                          height={72}
                          unoptimized
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-medium leading-tight text-[#241f3d]">{sanitize(r.name)}</p>
                          <p className="mt-0.5 text-[10px] font-light leading-tight text-[#a5a2b3]">{r.exp}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {r.chips.map(({ Icon, bg, color }: Chip, i: number) => (
                          <span key={i} className={`flex h-[22px] w-[22px] items-center justify-center rounded-[6px] ${bg}`}>
                            <Icon className={`h-[12px] w-[12px] ${color}`} strokeWidth={1.9} />
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3.5">
                      <p className="whitespace-nowrap text-[11px] font-normal leading-tight text-[#3f3d56]">{r.days}</p>
                      <p className="mt-1 whitespace-nowrap text-[10.5px] font-light leading-tight text-[#8a86a0]">{r.hours}</p>
                    </td>
                    <td className="px-2 py-3.5">
                      <span className="whitespace-nowrap text-[11.5px] font-medium text-[#241f3d]">{r.slots}</span>
                    </td>
                    <td className="px-2 py-3.5">
                      <div className="w-[104px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-normal text-[#3f3d56]">{r.booked} / {r.total}</span>
                          <span className="text-[10px] font-medium text-[#6f6b85]">{r.pct}</span>
                        </div>
                        <div className="mt-1.5 h-[4px] w-full rounded-full bg-[#eeecf4]">
                          <div className="h-full rounded-full bg-[#4c159f]" style={{ width: r.bar }} />
                        </div>
                        <span className="mt-1 block h-[4px] w-[4px] rounded-full bg-[#c9c5d6]" />
                      </div>
                    </td>
                    <td className="px-2 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[10px] font-medium ${statusStyles[r.status] || statusStyles.Active}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" aria-label="View" className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#e4e2ec] text-[#6f6b85] hover:bg-[#f7f6fb]">
                          <Eye className="h-[13px] w-[13px]" strokeWidth={1.8} />
                        </button>
                        <button type="button" aria-label="Edit" className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#e4e2ec] text-[#6f6b85] hover:bg-[#f7f6fb]">
                          <Pencil className="h-[13px] w-[13px]" strokeWidth={1.8} />
                        </button>
                        <button type="button" aria-label="More" className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#e4e2ec] text-[#6f6b85] hover:bg-[#f7f6fb]">
                          <MoreVertical className="h-[13px] w-[13px]" strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  CalendarPlus,
  UsersRound,
  CalendarX2,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

const legend = [
  { label: "Upcoming", value: "248 (19.3%)", color: "#F59E0B", pct: 19.3 },
  { label: "Completed", value: "896 (69.7%)", color: "#22C55E", pct: 69.7 },
  { label: "Cancelled", value: "52 (4.0%)", color: "#EF4444", pct: 4.0 },
  { label: "Pending", value: "90 (7.0%)", color: "#7C3AED", pct: 7.0 },
];

const quickActions = [
  {
    label: "Add\nNew Consultation",
    Icon: CalendarPlus,
    bg: "bg-[#F0EAFB]",
    color: "text-[#7C3AED]",
  },
  {
    label: "Manage Experts",
    Icon: UsersRound,
    bg: "bg-[#E3F7EC]",
    color: "text-[#22C55E]",
  },
  {
    label: "Block Time Slot",
    Icon: CalendarX2,
    bg: "bg-[#FEF1E1]",
    color: "text-[#F59E0B]",
  },
  {
    label: "Consultation Settings",
    Icon: Settings,
    bg: "bg-[#E3EDFD]",
    color: "text-[#2563EB]",
  },
];

const R = 30;
const C = 2 * Math.PI * R;

const segments = legend.map((l, i) => ({
  ...l,
  len: (l.pct / 100) * C,
  offset: (legend.slice(0, i).reduce((sum, p) => sum + p.pct, 0) / 100) * C,
}));

function isToday(iso: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function RightRail() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getBookings()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (Array.isArray(items)) {
          setSchedule(
            items.filter((b: any) => isToday(b.date || b.date_time || b.created_at)).slice(0, 5).map((b: any) => ({
              time: b.time || "",
              name: b.user_name || "Guest",
              service: b.service_name || "",
            }))
          );
        }
      })
      .catch((err) => setError(err?.message || "Failed to load schedule"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
        </div>
      )}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {/* Consultation Overview */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-semibold text-[#221C33]">
            Consultation Overview
          </h2>
          <button
            type="button"
            className="flex items-center gap-[3px] text-[10px] text-[#8B879C]"
          >
            This Month
            <ChevronDown size={12} />
          </button>
        </div>

        <div className="mt-[14px] flex items-center gap-[14px]">
          <svg
            viewBox="0 0 80 80"
            className="h-[78px] w-[78px] shrink-0 -rotate-90"
          >
            {segments.map((l) => {
              const dash = `${l.len} ${C - l.len}`;
              const dashOffset = -l.offset;
              return (
                <circle
                  key={l.label}
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  stroke={l.color}
                  strokeWidth="15"
                  strokeDasharray={dash}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
          </svg>

          <ul className="min-w-0 flex-1 space-y-[7px]">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-[7px]">
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="flex-1 truncate text-[10.5px] text-[#4A4658]">
                  {l.label}
                </span>
                <span className="whitespace-nowrap text-[9.5px] text-[#8B879C]">
                  {l.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[14px] flex items-center justify-between border-t border-[#F1F0F6] pt-[12px]">
          <span className="text-[11px] text-[#6E6A80]">Total Consultations</span>
          <span className="text-[13px] font-bold text-[#1D1630]">1,286</span>
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-semibold text-[#221C33]">
            Today&apos;s Schedule
          </h2>
          <Link href="/admin/consultation-management" className="text-[10px] font-medium text-[#6D28D9]">
            View All
          </Link>
        </div>
        <p className="mt-[3px] text-[10px] text-[#8B879C]">
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <ul className="mt-[10px] space-y-[10px]">
          {schedule.map((s) => (
            <li key={s.time} className="flex items-center gap-[8px]">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt={s.name}
                width={26}
                height={26}
                className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
              />
              <span className="w-[52px] shrink-0 text-[9.5px] font-semibold text-[#221C33]">
                {s.time}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[10px] font-semibold text-[#221C33]">
                  {sanitize(s.name)}
                </p>
                <p className="mt-[1px] truncate text-[9px] text-[#8B879C]">
                  {s.service}
                </p>
              </div>
              <span className="shrink-0 rounded-[5px] bg-[#FEF2E2] px-[6px] py-[3px] text-[8.5px] font-medium text-[#C2711A]">
                Upcoming
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick Actions */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <h2 className="text-[12.5px] font-semibold text-[#221C33]">
          Quick Actions
        </h2>

        <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
          {quickActions.map(({ label, Icon, bg, color }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-[8px] rounded-[10px] border border-[#F0EFF5] bg-[#FBFAFD] px-[9px] py-[10px] text-left hover:bg-[#F6F4FB]"
            >
              <span
                className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] ${bg} ${color}`}
              >
                <Icon size={14} />
              </span>
              <span className="min-w-0 whitespace-pre-line text-[9.5px] font-medium leading-[12px] text-[#3D3950]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-semibold text-[#221C33]">
            Recent Activity
          </h2>
          <Link href="/admin/consultation-management" className="text-[10px] font-medium text-[#6D28D9]">
            View All
          </Link>
        </div>

        <ul className="mt-[12px] space-y-[12px]">
          <li className="flex items-start gap-[9px]">
            <span className="mt-[4px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#7C3AED]" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[10.5px] font-semibold text-[#221C33]">Consultations synced</p>
              <p className="mt-[2px] truncate text-[9.5px] text-[#8B879C]">From API</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[9px] text-[#A5A2B5]">now</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  CalendarPlus,
  CircleCheckBig,
  CalendarRange,
  CalendarX2,
  Send,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";

const legend = [
  { label: "Upcoming", value: "542 (25.3%)", color: "#F59E0B", pct: 25.3 },
  { label: "Completed", value: "1,376 (64.2%)", color: "#22C55E", pct: 64.2 },
  { label: "Cancelled", value: "207 (9.6%)", color: "#EF4444", pct: 9.6 },
  { label: "Pending", value: "18 (0.0%)", color: "#7C3AED", pct: 0.9 },
];

const quickActions = [
  {
    label: "Add\nNew Booking",
    Icon: CalendarPlus,
    bg: "bg-[#E3EDFD]",
    color: "text-[#2563EB]",
  },
  {
    label: "Approve\nBookings",
    Icon: CircleCheckBig,
    bg: "bg-[#E3F7EC]",
    color: "text-[#22C55E]",
    badge: "7",
  },
  {
    label: "Manage Time Slots",
    Icon: CalendarRange,
    bg: "bg-[#F0EAFB]",
    color: "text-[#7C3AED]",
  },
  {
    label: "Block Dates",
    Icon: CalendarX2,
    bg: "bg-[#FDEAEA]",
    color: "text-[#EF4444]",
  },
  {
    label: "Email / SMS",
    Icon: Send,
    bg: "bg-[#E3EDFD]",
    color: "text-[#2563EB]",
  },
  {
    label: "Booking Settings",
    Icon: Settings,
    bg: "bg-[#F0EAFB]",
    color: "text-[#7C3AED]",
  },
];

const activity = [
  {
    title: "New booking received",
    sub: "by Rohit Sharma",
    time: "2 min ago",
    dot: "bg-[#7C3AED]",
  },
  {
    title: "Payment received",
    sub: "₹1,499 from Sneha Verma",
    time: "8 min ago",
    dot: "bg-[#2563EB]",
  },
  {
    title: "Booking cancelled",
    sub: "by Vivek Gupta",
    time: "15 min ago",
    dot: "bg-[#EF4444]",
  },
  {
    title: "Reschedule request",
    sub: "by Meera Iyer",
    time: "22 min ago",
    dot: "bg-[#F59E0B]",
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
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
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
          setTodaySchedule(
            items.filter((b: any) => isToday(b.date || b.date_time || b.created_at)).slice(0, 5).map((b: any) => ({
              time: b.time || "",
              name: b.user_name || "Guest",
              service: b.service_name || "",
              avatar: b.user_avatar || "",
            }))
          );
        }
      })
      .catch((err) => setError(err?.message || "Failed to load bookings"))
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
      {/* Booking Overview */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[14px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold text-[#221C33]">
            Booking Overview
          </h2>
          <button
            type="button"
            className="flex items-center gap-[3px] whitespace-nowrap text-[10px] text-[#8B879C]"
          >
            This Month
            <ChevronDown size={12} />
          </button>
        </div>

        <div className="mt-[12px] flex items-center gap-[8px]">
          <svg
            viewBox="0 0 80 80"
            className="h-[62px] w-[62px] shrink-0 -rotate-90"
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

          <ul className="min-w-0 flex-1 space-y-[6px]">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-[5px]">
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="flex-1 whitespace-nowrap text-[9px] text-[#4A4658]">
                  {l.label}
                </span>
                <span className="whitespace-nowrap text-[8.5px] text-[#8B879C]">
                  {l.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[14px] flex items-center justify-between border-t border-[#F1F0F6] pt-[12px]">
          <span className="text-[10.5px] text-[#6E6A80]">Total Bookings</span>
          <span className="text-[13px] font-bold text-[#1D1630]">2,143</span>
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[14px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold text-[#221C33]">
            Today&apos;s Schedule
          </h2>
          <Link href="/admin/booking-management" className="text-[10px] font-medium text-[#6D28D9]">
            View All
          </Link>
        </div>
        <p className="mt-[3px] text-[10px] text-[#8B879C]">
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <ul className="mt-[10px] space-y-[10px]">
          {todaySchedule.map((s: any) => (
            <li key={s.time} className="flex items-center gap-[6px]">
              <Image
                src={s.avatar}
                alt={s.name}
                width={22}
                height={22}
                className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="whitespace-nowrap text-[8.5px] font-semibold text-[#221C33]">
                  <span className="text-[#4A4658]">{s.time}</span>
                  <span className="px-[3px] text-[#D6D3E0]">|</span>
                  {s.name}
                </p>
                <p className="mt-[1px] truncate text-[8px] text-[#8B879C]">
                  {s.service}
                </p>
              </div>
              <span className="shrink-0 rounded-[5px] bg-[#FEF2E2] px-[4px] py-[2px] text-[7.5px] font-medium text-[#C2711A]">
                Upcoming
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick Actions */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[14px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <h2 className="text-[12px] font-semibold text-[#221C33]">
          Quick Actions
        </h2>

        <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
          {quickActions.map(({ label, Icon, bg, color, badge }) => (
            <button
              key={label}
              type="button"
              className="relative flex items-center gap-[6px] rounded-[10px] border border-[#F0EFF5] bg-[#FBFAFD] px-[7px] py-[9px] text-left hover:bg-[#F6F4FB]"
            >
              <span
                className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-[7px] ${bg} ${color}`}
              >
                <Icon size={13} />
              </span>
              <span className="min-w-0 whitespace-pre-line text-[8.5px] font-medium leading-[11px] text-[#3D3950]">
                {label}
              </span>
              {badge ? (
                <span className="absolute -right-[6px] -top-[6px] grid h-[16px] w-[16px] place-items-center rounded-full border-2 border-white bg-[#F59E0B] text-[8px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-[14px] border border-[#EDECF3] bg-white p-[14px] shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-semibold text-[#221C33]">
            Recent Activity
          </h2>
          <Link href="/admin/booking-management" className="text-[10px] font-medium text-[#6D28D9]">
            View All
          </Link>
        </div>

        <ul className="mt-[12px] space-y-[12px]">
          {activity.map((a) => (
            <li key={a.title} className="flex items-start gap-[8px]">
              <span
                className={`mt-[4px] h-[7px] w-[7px] shrink-0 rounded-full ${a.dot}`}
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[10px] font-semibold text-[#221C33]">
                  {a.title}
                </p>
                <p className="mt-[2px] truncate text-[9px] text-[#8B879C]">
                  {a.sub}
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-[8.5px] text-[#A5A2B5]">
                {a.time}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

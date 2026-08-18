"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  CalendarClock,
  CalendarCheck2,
  CircleCheckBig,
  CircleX,
  Loader2,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";
import { errorMessage } from "../../../lib/errors";

const statDefs: {
  label: string;
  field: string;
  Icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    label: "Total Bookings",
    field: "bookings",
    Icon: CalendarDays,
    iconBg: "bg-[#F0EAFB]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "Upcoming Bookings",
    field: "upcomingBookings",
    Icon: CalendarClock,
    iconBg: "bg-[#FEF1E1]",
    iconColor: "text-[#F59E0B]",
  },
  {
    label: "Today's Bookings",
    field: "todaysBookings",
    Icon: CalendarCheck2,
    iconBg: "bg-[#E3EDFD]",
    iconColor: "text-[#2563EB]",
  },
  {
    label: "Completed Bookings",
    field: "completedBookings",
    Icon: CircleCheckBig,
    iconBg: "bg-[#E3F7EC]",
    iconColor: "text-[#22C55E]",
  },
  {
    label: "Cancelled Bookings",
    field: "cancelledBookings",
    Icon: CircleX,
    iconBg: "bg-[#FDEAEA]",
    iconColor: "text-[#EF4444]",
  },
];

export default function StatsRow() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getOverview()
      .then((data: unknown) => {
        const s = (data as { stats?: Record<string, number> } | null)?.stats;
        setStats(s ?? (data as Record<string, number> | null));
      })
      .catch((e: unknown) => setError(errorMessage(e, "Failed to load stats")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const { isRefreshing } = useAutoRefresh(load);
  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start(); else stop();
  }, [isRefreshing, start, stop]);

  if (loading) {
    return (
      <div className="mt-5 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statDefs.map(({ label, field, Icon, iconBg, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = raw != null ? raw.toLocaleString() : "—";
        return (
          <div
            key={label}
            className="flex items-center gap-[12px] rounded-[14px] border border-[#EDECF3] bg-white px-[14px] py-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]"
          >
            <span
              className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[12px] ${iconBg} ${iconColor}`}
            >
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-[11px] text-[#8B879C]">
                {label}
              </p>
              <p className="mt-[2px] text-[21px] font-bold leading-[1.1] text-[#1D1630]">
                {value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

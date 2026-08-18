"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  CalendarDays,
  CalendarCheck,
  BarChart4,
  Gauge,
  Loader2,
} from "lucide-react";
import { api } from "../../../lib/api";
import { errorMessage } from "../../../lib/errors";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";

const statDefs: {
  label: string;
  field: string;
  Icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    label: "Total Astrologers",
    field: "astrologers",
    Icon: Users,
    iconBg: "bg-[#efe9fb]",
    iconColor: "text-[#7c4dcf]",
  },
  {
    label: "Available Today",
    field: "availableToday",
    Icon: UserCheck,
    iconBg: "bg-[#e6f6ed]",
    iconColor: "text-[#3aa76d]",
  },
  {
    label: "Total Slots (Today)",
    field: "totalSlots",
    Icon: CalendarDays,
    iconBg: "bg-[#e7f0fd]",
    iconColor: "text-[#3d7bd9]",
  },
  {
    label: "Booked Slots (Today)",
    field: "bookedSlots",
    Icon: CalendarCheck,
    iconBg: "bg-[#fdefe1]",
    iconColor: "text-[#e08a37]",
  },
  {
    label: "Next 7 Days Booked",
    field: "next7DaysBooked",
    Icon: BarChart4,
    iconBg: "bg-[#e9e8fb]",
    iconColor: "text-[#5b56d6]",
  },
  {
    label: "Utilization Rate",
    field: "utilizationRate",
    Icon: Gauge,
    iconBg: "bg-[#fde9ef]",
    iconColor: "text-[#d94f7c]",
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

  useEffect(() => {
    load();
  }, [load]);

  const { isRefreshing } = useAutoRefresh(load);
  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start(); else stop();
  }, [isRefreshing, start, stop]);

  const fmt = (n: number | undefined) =>
    n != null ? n.toLocaleString("en-IN") : "—";
  const rate = (n: number | undefined) =>
    n != null ? `${n.toFixed(1)}%` : "—";

  if (loading) {
    return (
      <div className="mt-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {statDefs.map(({ label, field, Icon, iconBg, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = field === "utilizationRate" ? rate(raw) : fmt(raw);
        return (
          <div
            key={label}
            className="rounded-[12px] border border-[#ecebf1] bg-white px-3 py-3.5 shadow-[0_1px_2px_rgba(23,16,45,.03)]"
          >
            <div className="flex items-start gap-2">
              <span
                className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full ${iconBg}`}
              >
                <Icon
                  className={`h-[17px] w-[17px] ${iconColor}`}
                  strokeWidth={1.8}
                />
              </span>
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[10px] font-normal leading-none text-[#8a86a0]">
                  {label}
                </p>
                <p className="mt-2 text-[20px] font-semibold leading-none text-[#241f3d]">
                  {value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

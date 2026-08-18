"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  UsersRound,
  Star,
  CalendarCheck,
  IndianRupee,
  Loader2,
} from "lucide-react";
import TarotIcon from "./TarotIcon";
import { api } from "../../../lib/api";
import { errorMessage } from "../../../lib/errors";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";

const statDefs: {
  label: string;
  field: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconWrap: string;
  iconColor: string;
}[] = [
  {
    label: "Total Readings",
    field: "readings",
    Icon: TarotIcon,
    iconWrap: "bg-[#F2EBFE]",
    iconColor: "text-[#4F46E5]",
  },
  {
    label: "Today's Readings",
    field: "todaysReadings",
    Icon: CalendarDays,
    iconWrap: "bg-[#FEF4E9]",
    iconColor: "text-[#F97316]",
  },
  {
    label: "Active Tarot Masters",
    field: "activeTarotMasters",
    Icon: UsersRound,
    iconWrap: "bg-[#E7F5E8]",
    iconColor: "text-[#16A34A]",
  },
  {
    label: "Popular Spreads",
    field: "popularSpreads",
    Icon: Star,
    iconWrap: "bg-[#E9F0FD]",
    iconColor: "text-[#2563EB]",
  },
  {
    label: "Total Bookings (May)",
    field: "bookings",
    Icon: CalendarCheck,
    iconWrap: "bg-[#F2EBFD]",
    iconColor: "text-[#4F46E5]",
  },
  {
    label: "Revenue (May)",
    field: "revenue",
    Icon: IndianRupee,
    iconWrap: "bg-[#FEF4E9]",
    iconColor: "text-[#F97316]",
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

  const fmt = (n: number | undefined) =>
    n != null ? n.toLocaleString("en-IN") : "—";
  const fmtCurrency = (n: number | undefined) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] sm:grid-cols-3 xl:grid-cols-[minmax(0,177fr)_minmax(0,177fr)_minmax(0,177fr)_minmax(0,177fr)_minmax(0,177fr)_minmax(0,212fr)]">
      {statDefs.map(({ label, field, Icon, iconWrap, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = field === "revenue" ? fmtCurrency(raw) : fmt(raw);
        return (
          <div
            key={label}
            className="rounded-[12px] border border-[#F0F1F5] bg-white px-[15px] py-[19px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]"
          >
            <div className="flex items-start gap-[14px]">
              <div
                className={`grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full ${iconWrap}`}
              >
                <Icon size={20} className={iconColor} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold leading-[16px] text-[#14134A]">
                  {label}
                </p>
                <p className="mt-[3px] whitespace-nowrap text-[20px] font-bold leading-[26px] text-[#0D0B2B]">
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

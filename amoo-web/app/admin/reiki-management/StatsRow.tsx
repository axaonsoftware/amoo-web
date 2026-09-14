"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  CalendarClock,
  CircleCheckBig,
  Globe,
  UserRound,
  Clock,
  Loader2,
} from "lucide-react";
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
    label: "Total Reiki Sessions",
    field: "reikiSessions",
    Icon: CalendarDays,
    iconWrap: "bg-[#F1EAFE]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "Upcoming Sessions",
    field: "upcomingSessions",
    Icon: CalendarClock,
    iconWrap: "bg-[#FEF1E3]",
    iconColor: "text-[#F59E0B]",
  },
  {
    label: "Completed Sessions",
    field: "completedSessions",
    Icon: CircleCheckBig,
    iconWrap: "bg-[#E3F7EA]",
    iconColor: "text-[#16A34A]",
  },
  {
    label: "Distance Healing",
    field: "distanceHealing",
    Icon: Globe,
    iconWrap: "bg-[#F1EAFE]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "Active Practitioners",
    field: "activePractitioners",
    Icon: UserRound,
    iconWrap: "bg-[#E7F0FE]",
    iconColor: "text-[#3B82F6]",
  },
  {
    label: "Healing Hours",
    field: "healingHours",
    Icon: Clock,
    iconWrap: "bg-[#FEF1E3]",
    iconColor: "text-[#F59E0B]",
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
      .getReports("?type=reiki")
      .then((response: any) => {
        const reports = response?.data ?? response;
        const total = response?.meta?.total ?? reports?.length ?? 0;

        setStats({
          reikiSessions: total,
          upcomingSessions: 0,
          completedSessions: 0,
          distanceHealing: 0,
          activePractitioners: 0,
          healingHours: 0,
        });
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
    if (isRefreshing) start();
    else stop();
  }, [isRefreshing, start, stop]);

  const fmt = (n: number | undefined) =>
    n != null ? n.toLocaleString("en-IN") : "—";

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
    <div className="mt-5 grid grid-cols-1 gap-[10px] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {statDefs.map(({ label, field, Icon, iconWrap, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value =
          field === "healingHours" && raw
            ? `${raw.toLocaleString("en-IN")} hrs`
            : fmt(raw);
        return (
          <div
            key={label}
            className="rounded-[12px] border border-[#EFEDF4] bg-white px-[14px] py-[14px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]"
          >
            <div className="flex items-start gap-[10px]">
              <div
                className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] ${iconWrap}`}
              >
                <Icon size={19} className={iconColor} />
              </div>
              <div className="min-w-0 pt-[1px]">
                <p className="truncate text-[11px] font-medium text-[#8B879C]">
                  {label}
                </p>
                <p className="mt-[2px] whitespace-nowrap text-[21px] font-semibold leading-[27px] text-[#1B1630]">
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

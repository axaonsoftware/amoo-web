"use client";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  CalendarClock,
  CircleCheckBig,
  CircleX,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { api } from "../../../lib/api";

const statDefs: {
  label: string;
  field: string;
  Icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    label: "Total Consultations",
    field: "consultations",
    Icon: CalendarDays,
    iconBg: "bg-[#F0EAFB]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "Upcoming",
    field: "upcomingConsultations",
    Icon: CalendarClock,
    iconBg: "bg-[#FEF1E1]",
    iconColor: "text-[#F59E0B]",
  },
  {
    label: "Completed",
    field: "completedConsultations",
    Icon: CircleCheckBig,
    iconBg: "bg-[#E3F7EC]",
    iconColor: "text-[#22C55E]",
  },
  {
    label: "Cancelled",
    field: "cancelledConsultations",
    Icon: CircleX,
    iconBg: "bg-[#FDEAEA]",
    iconColor: "text-[#EF4444]",
  },
  {
    label: "Total Revenue",
    field: "revenue",
    Icon: IndianRupee,
    iconBg: "bg-[#F0EAFB]",
    iconColor: "text-[#7C3AED]",
  },
];

export default function StatsRow() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getOverview()
      .then((data: any) => setStats(data?.stats ?? data))
      .catch((e: any) => setError(e?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number | undefined) =>
    n != null ? n.toLocaleString("en-IN") : "—";
  const fmtCurrency = (n: number | undefined) =>
    n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—";

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
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statDefs.map(({ label, field, Icon, iconBg, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = field === "revenue" ? fmtCurrency(raw) : fmt(raw);
        return (
          <div
            key={label}
            className="flex items-center gap-[14px] rounded-[14px] border border-[#EDECF3] bg-white px-[16px] py-[18px] shadow-[0_1px_2px_rgba(24,20,40,.04)]"
          >
            <span
              className={`grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[12px] ${iconBg} ${iconColor}`}
            >
              <Icon size={21} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11.5px] text-[#8B879C]">{label}</p>
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

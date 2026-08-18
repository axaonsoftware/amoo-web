"use client";
import { 
  Users, 
  CircleCheck, 
  CirclePause, 
  Star, 
  CalendarDays, 
  IndianRupee } from "lucide-react";
import type { Expert } from "../../../lib/types";

type StatsExpert = Expert & { sessions?: number; revenue?: number };

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
    label: "Total Experts",
    field: "total",
    Icon: Users,
    iconBg: "bg-[#F0EAFB]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "Active Experts",
    field: "active",
    Icon: CircleCheck,
    iconBg: "bg-[#E6F7EE]",
    iconColor: "text-[#16A34A]",
  },
  {
    label: "Inactive Experts",
    field: "inactive",
    Icon: CirclePause,
    iconBg: "bg-[#FEF1E1]",
    iconColor: "text-[#F59E0B]",
  },
  {
    label: "Avg. Rating",
    field: "avgRating",
    Icon: Star,
    iconBg: "bg-[#FEF0DC]",
    iconColor: "text-[#D97706]",
  },
  {
    label: "Total Sessions",
    field: "sessions",
    Icon: CalendarDays,
    iconBg: "bg-[#E7F0FE]",
    iconColor: "text-[#3B82F6]",
  },
  {
    label: "Total Revenue",
    field: "revenue",
    Icon: IndianRupee,
    iconBg: "bg-[#EAE9FB]",
    iconColor: "text-[#4F46E5]",
  },
];

export default function StatsRow({ experts }: { experts: StatsExpert[] }) {
  const fmt = (n: number | undefined) =>
    n != null ? n.toLocaleString("en-IN") : "—";
  const fmtCurrency = (n: number | undefined) =>
    n != null ? `₹ ${Number(n).toLocaleString("en-IN")}` : "—";

  const total = experts.length;
  const active = experts.filter((e) => e.status === "active").length;
  const inactive = experts.filter((e) => e.status === "inactive").length;
  const avgRating = experts.length
    ? (
        experts.reduce((sum, e) => sum + (Number(e.rating) || 0), 0) /
        experts.length
      ).toFixed(1)
    : "0";
  const totalSessions = experts.reduce(
    (sum, e) => sum + (Number(e.sessions) || 0),
    0,
  );
  const totalRevenue = experts.reduce(
    (sum, e) => sum + (Number(e.revenue) || 0),
    0,
  );

  const values: Record<string, string | number> = {
    total,
    active,
    inactive,
    avgRating,
    sessions: totalSessions,
    revenue: totalRevenue,
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {statDefs.map(({ label, field, Icon, iconBg, iconColor }) => {
        const raw = values[field];
        const display =
          field === "revenue"
            ? fmtCurrency(raw as number)
            : field === "avgRating"
              ? raw
              : fmt(raw as number);
        return (
          <div
            key={label}
            className="rounded-[12px] border border-[#EEEDF4] bg-white px-[14px] py-[13px] shadow-[0_1px_2px_rgba(20,16,40,.04)]"
          >
            <div className="flex items-center gap-[10px]">
              <span
                className={`grid h-[36px] w-[36px] shrink-0 place-items-center rounded-[10px] ${iconBg}`}
              >
                <Icon size={17} strokeWidth={1.9} className={iconColor} />
              </span>
              <p className="text-[10px] leading-tight text-[#8B879C]">
                {label}
              </p>
            </div>
            <p className="mt-[10px] text-[19px] font-semibold leading-none text-[#1F1836]">
              {display}
            </p>
          </div>
        );
      })}
    </div>
  );
}

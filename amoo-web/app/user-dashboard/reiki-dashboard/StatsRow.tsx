"use client";
import { ArrowRight, CalendarDays, HeartPulse, Leaf, Star } from "lucide-react";
import { Loader2 } from "lucide-react";
import { LotusGlyph } from "./icons";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

export default function StatsRow() {
  const { data: reportStats, loading: statsLoading, error: statsError } = useApi<any>(() => api.getReportStats());
  const { data: bookings } = useApi<any>(() => api.getBookings());

  const allBookings: any[] = bookings?.data ?? [];

  const upcomingReiki = allBookings.find((b: any) =>
    (b.service_name || "").toLowerCase().includes("reiki") &&
    (b.status === "upcoming" || b.status === "pending-payment")
  );

  const completedSessions = allBookings.filter((b: any) =>
    (b.service_name || "").toLowerCase().includes("reiki") && b.status === "completed"
  ).length;

  const s = reportStats || {};
  const totalReiki = s.reiki_has_chakra_data ?? completedSessions;

  const stats = [
    { label: "Active Healing Plan", value: "Yes", valueSize: "text-[22px]", sub: "Reiki Healing Plan", link: "View Plan", Icon: LotusGlyph, iconBg: "bg-[#f1e9fc]", iconColor: "text-[#7a3fc0]" },
    { label: "Upcoming Session", value: upcomingReiki ? new Date(upcomingReiki.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "None scheduled", valueSize: "text-[17px]", sub: upcomingReiki?.time?.slice(0, 5) || "", link: "View Details", Icon: CalendarDays, iconBg: "bg-[#fdf0dc]", iconColor: "text-[#e0952e]" },
    { label: "Sessions Completed", value: String(completedSessions || totalReiki), valueSize: "text-[22px]", link: "View History", Icon: Leaf, iconBg: "bg-[#e6f6ea]", iconColor: "text-[#2f9e56]" },
    { label: "Healing Streak", value: completedSessions > 0 ? `${Math.min(completedSessions, 30)} Days` : "0 Days", valueSize: "text-[22px]", link: "Keep Going!", Icon: HeartPulse, iconBg: "bg-[#fdeaf0]", iconColor: "text-[#e0567f]" },
    { label: "Energy Score", value: completedSessions > 0 ? `${Math.min(Math.round(completedSessions * 8.5), 100)}%` : "—", valueSize: "text-[22px]", sub: completedSessions > 5 ? "Good Balance" : "Getting Started", Icon: Star, iconBg: "bg-[#fdf0dc]", iconColor: "text-[#e0a63a]" },
  ];

  if (statsLoading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading stats...
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="mt-4 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">{statsError}</div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map(({ label, value, valueSize, sub, link, Icon, iconBg, iconColor }) => (
        <div
          key={label}
          className="flex items-start gap-3.5 rounded-[14px] border border-[#ece9f3] bg-white px-4 py-[20px] shadow-[0_1px_3px_rgba(43,15,71,.04)]"
        >
          <span
            className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
          >
            <Icon className="h-[21px] w-[21px]" strokeWidth={1.7} />
          </span>

          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#6c6b78]">{label}</p>
            <p
              className={`mt-2 font-display ${valueSize} font-bold leading-none text-[#2b0f47]`}
            >
              {value}
            </p>
            {sub ? <p className="mt-1.5 text-[11px] text-[#8b8697]">{sub}</p> : null}
            {link ? (
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7a3fc0]"
              >
                {link}
                <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

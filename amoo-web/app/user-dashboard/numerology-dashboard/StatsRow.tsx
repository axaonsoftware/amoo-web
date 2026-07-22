"use client";
import { ArrowRight, FileText, Download, Heart, CalendarDays } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

export default function StatsRow() {
  const { data: stats, loading, error } = useApi<any>(() => api.getReportStats());
  const s = stats || {};

  const statItems = [
    { label: "Total Reports", value: String(s.numerology_total ?? 0), Icon: FileText, iconBg: "bg-[#f1e9fc]", iconColor: "text-[#7a3fc0]" },
    { label: "Downloaded", value: String(s.numerology_downloaded ?? 0), Icon: Download, iconBg: "bg-[#fdf0dc]", iconColor: "text-[#e0952e]" },
    { label: "Favorites", value: String(s.numerology_favorites ?? 0), Icon: Heart, iconBg: "bg-[#fdeaf0]", iconColor: "text-[#e0567f]" },
    { label: "This Year Reports", value: String(s.numerology_this_year ?? 0), Icon: CalendarDays, iconBg: "bg-[#e6f6ea]", iconColor: "text-[#2f9e56]" },
  ];

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">{error}</div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map(({ label, value, Icon, iconBg, iconColor }) => (
        <div
          key={label}
          className="flex items-start gap-3.5 rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[21px] shadow-[0_1px_3px_rgba(43,15,71,.04)]"
        >
          <span
            className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
          >
            <Icon className="h-[21px] w-[21px]" strokeWidth={1.7} />
          </span>

          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#6c6b78]">{label}</p>
            <p className="mt-2 font-display text-[24px] font-bold leading-none text-[#2b0f47]">
              {value}
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7a3fc0]"
            >
              View All
              <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  ReceiptIndianRupee,
  Headset,
  UserRound,
  CircleX,
  ArrowDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../../lib/api";

type InsightDef = {
  label: string;
  value: string;
  note: string;
  Icon: typeof CalendarDays;
  iconWrap: string;
  iconColor: string;
  down?: boolean;
};

const fallback: InsightDef[] = [
  { label: "Peak Booking Day", value: "Saturday", note: "28% of total bookings", Icon: CalendarDays, iconWrap: "bg-[#F1EAFE]", iconColor: "text-[#7C3AED]" },
  { label: "Peak Booking Time", value: "7 PM \u2013 9 PM", note: "31% of total bookings", Icon: ReceiptIndianRupee, iconWrap: "bg-[#FEF1E3]", iconColor: "text-[#F59E0B]" },
  { label: "Most Popular Service", value: "Kundali Reading", note: "33.6% of total revenue", Icon: Headset, iconWrap: "bg-[#E3F7EA]", iconColor: "text-[#16A34A]" },
  { label: "Top Source", value: "WhatsApp", note: "42% of new users", Icon: UserRound, iconWrap: "bg-[#E7F0FE]", iconColor: "text-[#3B82F6]" },
  { label: "Cancellation Rate", value: "6.32%", note: "1.8% vs last month", down: true, Icon: CircleX, iconWrap: "bg-[#FDE8E8]", iconColor: "text-[#EF4444]" },
];

export default function QuickInsights() {
  const [insights, setInsights] = useState<InsightDef[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getOverview()
      .then((res) => {
        if (cancelled) return;
        const o = res?.data || res;
        if (!o) return;
        setInsights([
          { ...fallback[0], value: (o as Record<string, unknown>).peakDay as string || fallback[0].value, note: (o as Record<string, unknown>).peakDayPct as string || fallback[0].note },
          { ...fallback[1], value: (o as Record<string, unknown>).peakTime as string || fallback[1].value, note: (o as Record<string, unknown>).peakTimePct as string || fallback[1].note },
          { ...fallback[2], value: (o as Record<string, unknown>).topService as string || fallback[2].value, note: (o as Record<string, unknown>).topServicePct as string || fallback[2].note },
          { ...fallback[3], value: (o as Record<string, unknown>).topSource as string || fallback[3].value, note: (o as Record<string, unknown>).topSourcePct as string || fallback[3].note },
          { ...fallback[4], value: `${((o as Record<string, unknown>).cancellationRate as number || 6.32).toFixed(2)}%`, note: `${((o as Record<string, unknown>).cancellationDelta as number || 1.8).toFixed(1)}% vs last month`, down: true },
        ]);
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load insights"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h2 className="text-[14px] font-semibold text-[#1B1630]">Quick Insights</h2>

      <div className="mt-3 rounded-[14px] border border-[#EFEDF4] bg-white px-[18px] py-[16px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        {error ? (
          <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {insights.map((s) => (
              <div key={s.label} className="flex items-center gap-[10px]">
                <div className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] ${s.iconWrap}`}>
                  <s.Icon size={19} className={s.iconColor} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-[#A5A2B5]">{s.label}</p>
                  <p className="truncate text-[13px] font-semibold leading-[19px] text-[#1B1630]">{s.value}</p>
                  {s.down ? (
                    <p className="flex items-center gap-[3px] text-[9.5px] text-[#A5A2B5]">
                      <span className="flex items-center gap-[2px] font-medium text-[#EF4444]"><ArrowDown size={9} />{s.note}</span>
                    </p>
                  ) : (
                    <p className="truncate text-[9.5px] text-[#A5A2B5]">{s.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

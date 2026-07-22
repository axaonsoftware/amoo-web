"use client";
import { useState, useEffect } from "react";
import {
  Frame,
  CalendarClock,
  FileText,
  UserRound,
  IndianRupee,
  Crown,
  Loader2,
} from "lucide-react";
import { api } from "../../../lib/api";

const statDefs: {
  label: string;
  field: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconWrap: string;
  iconColor: string;
}[] = [
  { label: "Total Kundali Generated", field: "kundalis", Icon: Frame, iconWrap: "bg-[#F2EBFE]", iconColor: "text-[#4F46E5]" },
  { label: "Today's Kundali", field: "todaysKundali", Icon: CalendarClock, iconWrap: "bg-[#FEF4E9]", iconColor: "text-[#F97316]" },
  { label: "Detailed Reports", field: "detailedReports", Icon: FileText, iconWrap: "bg-[#E7F5E8]", iconColor: "text-[#16A34A]" },
  { label: "Active Astrologers", field: "activeAstrologers", Icon: UserRound, iconWrap: "bg-[#E9F0FD]", iconColor: "text-[#2563EB]" },
  { label: "Total Revenue (May)", field: "revenue", Icon: IndianRupee, iconWrap: "bg-[#F2EBFD]", iconColor: "text-[#4F46E5]" },
  { label: "Premium Reports", field: "premiumReports", Icon: Crown, iconWrap: "bg-[#FEF4E9]", iconColor: "text-[#F97316]" },
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

  const fmt = (n: number | undefined) => (n != null ? n.toLocaleString("en-IN") : "—");
  const fmtCurrency = (n: number | undefined) => (n != null ? `₹ ${n.toLocaleString("en-IN")}` : "—");

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
    <div className="grid grid-cols-1 gap-[12px] min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-[minmax(0,177fr)_minmax(0,177fr)_minmax(0,177fr)_minmax(0,177fr)_minmax(0,177fr)_minmax(0,212fr)]">
      {statDefs.map(({ label, field, Icon, iconWrap, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = field === "revenue" ? fmtCurrency(raw) : fmt(raw);
        return (
          <div
            key={label}
            className="rounded-[12px] border border-[#F0F1F5] bg-white px-[13px] py-[19px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]"
          >
            <div className="flex items-start gap-[12px]">
              <div
                className={`grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full ${iconWrap}`}
              >
                <Icon size={20} className={iconColor} />
              </div>
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[10px] font-semibold leading-[16px] tracking-[-0.2px] text-[#14134A]">
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

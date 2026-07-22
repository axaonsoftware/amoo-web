"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CircleCheck,
  Ban,
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
  { label: "Total Reports", field: "total", Icon: FileText, iconBg: "bg-[#F0EAFB]", iconColor: "text-[#7C3AED]" },
  { label: "Pending", field: "pending", Icon: Clock, iconBg: "bg-[#FEF1E1]", iconColor: "text-[#F59E0B]" },
  { label: "Ready", field: "ready", Icon: CircleCheck, iconBg: "bg-[#E3F7EC]", iconColor: "text-[#22C55E]" },
  { label: "Rejected", field: "rejected", Icon: Ban, iconBg: "bg-[#FDEAEA]", iconColor: "text-[#EF4444]" },
];

export default function StatsRow() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getReports()
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        const total = res?.meta?.total ?? data.length;
        const pending = data.filter((r: any) => r?.status === "pending").length;
        const ready = data.filter((r: any) => r?.status === "ready").length;
        const rejected = data.filter((r: any) => r?.status === "rejected").length;
        setStats({ total, pending, ready, rejected });
      })
      .catch((e: any) => setError(e?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="mt-5 grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-4">
      {statDefs.map(({ label, field, Icon, iconBg, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = raw != null ? raw.toLocaleString() : "—";
        return (
          <div
            key={label}
            className="flex items-center gap-[12px] rounded-[14px] border border-[#EDECF3] bg-white px-[14px] py-[16px] shadow-[0_1px_2px_rgba(24,20,40,.04)]"
          >
            <span
              className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full ${iconBg} ${iconColor}`}
            >
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-[11px] text-[#8B879C]">{label}</p>
              <p className="mt-[2px] text-[21px] font-bold leading-[1.1] text-[#1D1630]">{value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

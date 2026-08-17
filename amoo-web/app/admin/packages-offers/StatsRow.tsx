"use client";
import { useState, useEffect } from "react";
import {
  Package,
  CircleCheck,
  CirclePause,
  Tag,
  IndianRupee,
  Ticket,
  Loader2,
} from "lucide-react";
import { api } from "../../../lib/api";
import { errorMessage } from "../../../lib/errors";

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
    label: "Total Packages",
    field: "packages",
    Icon: Package,
    iconBg: "bg-[#F0EAFB]",
    iconColor: "text-[#7C3AED]",
  },
  {
    label: "Active Packages",
    field: "activePackages",
    Icon: CircleCheck,
    iconBg: "bg-[#E6F7EE]",
    iconColor: "text-[#16A34A]",
  },
  {
    label: "Inactive Packages",
    field: "inactivePackages",
    Icon: CirclePause,
    iconBg: "bg-[#FEF1E1]",
    iconColor: "text-[#F59E0B]",
  },
  {
    label: "Active Offers",
    field: "activeOffers",
    Icon: Tag,
    iconBg: "bg-[#E7F0FE]",
    iconColor: "text-[#3B82F6]",
  },
  {
    label: "Total Revenue (May)",
    field: "revenue",
    Icon: IndianRupee,
    iconBg: "bg-[#EAE9FB]",
    iconColor: "text-[#4F46E5]",
  },
  {
    label: "Offers Redeemed",
    field: "offersRedeemed",
    Icon: Ticket,
    iconBg: "bg-[#FDE9F0]",
    iconColor: "text-[#EC4899]",
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
      .then((data: unknown) => {
        const s = (data as { stats?: Record<string, number> } | null)?.stats;
        setStats(s ?? (data as Record<string, number> | null));
      })
      .catch((e: unknown) => setError(errorMessage(e, "Failed to load stats")))
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
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {statDefs.map(({ label, field, Icon, iconBg, iconColor }) => {
        const raw = stats ? stats[field] : undefined;
        const value = field === "revenue" ? fmtCurrency(raw) : fmt(raw);
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
              <p className="whitespace-nowrap text-[10px] leading-tight text-[#8B879C]">
                {label}
              </p>
            </div>
            <p className="mt-[10px] text-[19px] font-semibold leading-none text-[#1F1836]">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

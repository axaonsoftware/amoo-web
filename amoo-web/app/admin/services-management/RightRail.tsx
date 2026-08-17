"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  FolderPlus,
  Package,
  Blocks,
  Upload,
  Download,
  ArrowRight,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";
import type { TopExpert } from "../../../lib/types";

interface ServiceRow {
  name: string;
  img: string;
  bookings: number | string;
  revenue: string;
  rank: number;
}

interface TopExpertRow extends TopExpert {
  image?: string;
  sessions?: number;
}

const donut = [
  { label: "Numerology", value: "18 (32.1%)", pct: 32.1, color: "#7C3AED" },
  { label: "Astrology", value: "14 (25.0%)", pct: 25.0, color: "#3B82F6" },
  { label: "Tarot", value: "10 (17.9%)", pct: 17.9, color: "#EF4444" },
  { label: "Healing", value: "8 (14.3%)", pct: 14.3, color: "#F59E0B" },
  { label: "Others", value: "6 (10.7%)", pct: 10.7, color: "#0EA5E9" },
];

const quickActions = [
  {
    label: "Add New Service",
    Icon: Plus,
    chipBg: "bg-[#F0EAFB]",
    color: "text-[#7C3AED]",
  },
  {
    label: "Add Category",
    Icon: FolderPlus,
    chipBg: "bg-[#E7F0FE]",
    color: "text-[#3B82F6]",
  },
  {
    label: "Service Packages",
    Icon: Package,
    chipBg: "bg-[#EAE9FB]",
    color: "text-[#4F46E5]",
  },
  {
    label: "Manage Add-ons",
    Icon: Blocks,
    chipBg: "bg-[#E0F7F4]",
    color: "text-[#0D9488]",
  },
  {
    label: "Bulk Upload",
    Icon: Upload,
    chipBg: "bg-[#FDE8E8]",
    color: "text-[#EF4444]",
  },
  {
    label: "Import Services",
    Icon: Download,
    chipBg: "bg-[#E7F0FE]",
    color: "text-[#3B82F6]",
  },
];

const rankTone: Record<number, string> = {
  1: "bg-gradient-to-b from-[#F5D68D] to-[#D69B33]",
  2: "bg-gradient-to-b from-[#DDDCE4] to-[#B4B2C0]",
  3: "bg-gradient-to-b from-[#F0B57A] to-[#C97B34]",
};

const R = 31;
const C = 2 * Math.PI * R;

const segments = donut.map((d, i) => ({
  ...d,
  len: (d.pct / 100) * C,
  offset: (donut.slice(0, i).reduce((sum, p) => sum + p.pct, 0) / 100) * C,
}));

export default function RightRail() {
  const [topServices, setTopServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getTopExperts()
      .then((data: unknown) => {
        const items = (data as { data?: unknown } | null)?.data ?? data;
        if (Array.isArray(items)) {
          setTopServices(
            (items as TopExpertRow[]).slice(0, 5).map((e, i) => ({
              name: e.name || "Unknown",
              img: e.avatar || e.image || "",
              bookings: e.sessions || e.bookings || `${e.rating || "—"} rating`,
              revenue: `₹ ${Number(e.revenue || 0).toLocaleString("en-IN")}`,
              rank: i + 1,
            })),
          );
        }
      })
      .catch((err) => setError(err?.message || "Failed to load top services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[276px]">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
        </div>
      )}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {/* Service Overview */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Service Overview
        </h3>

        <div className="mt-[14px] flex items-center gap-[10px]">
          <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
            <g transform="translate(42,42) rotate(-90)">
              {segments.map((d) => (
                <circle
                  key={d.label}
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="13"
                  strokeDasharray={`${d.len - 2} ${C - d.len + 2}`}
                  strokeDashoffset={-d.offset}
                />
              ))}
            </g>
          </svg>

          <ul className="flex-1 space-y-[8px]">
            {donut.map((d) => (
              <li key={d.label} className="flex items-center gap-[5px]">
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="flex-1 whitespace-nowrap text-[9px] text-[#5B5570]">
                  {d.label}
                </span>
                <span className="whitespace-nowrap text-[9px] text-[#8B879C]">
                  {d.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[14px] flex items-center justify-between border-t border-[#EEEDF4] pt-[11px]">
          <p className="text-[10.5px] text-[#8B879C]">Total Services</p>
          <button
            type="button"
            className="flex items-center gap-[5px] text-[10px] font-medium text-[#7C3AED]"
          >
            View All Categories
            <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* Top Performing Services */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Top Performing Services
        </h3>

        <ul className="mt-[12px] space-y-[12px]">
          {topServices.map((p) => (
            <li key={p.name} className="flex items-center gap-[10px]">
              <span className="relative shrink-0">
                <Image
                  src={p.img}
                  alt=""
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] rounded-full bg-[#F3F2F7] object-contain p-[4px]"
                />
                <span
                  className={`absolute -left-[3px] -top-[3px] grid h-[15px] w-[15px] place-items-center rounded-full text-[8px] font-semibold text-white ring-2 ring-white ${rankTone[p.rank]}`}
                >
                  {p.rank === 1 ? (
                    <Crown size={8} className="fill-white text-white" />
                  ) : (
                    p.rank
                  )}
                </span>
              </span>

              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[10.5px] font-medium text-[#1F1836]">
                  {sanitize(p.name)}
                </p>
                <p className="mt-[2px] text-[9.5px] text-[#8B879C]">
                  {p.bookings}
                </p>
              </div>

              <p className="shrink-0 text-[10.5px] font-semibold text-[#1F1836]">
                {p.revenue}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-[14px] flex w-full items-center justify-center gap-[5px] text-[10.5px] font-medium text-[#7C3AED]"
        >
          View All Reports
          <ArrowRight size={12} />
        </button>
      </section>

      {/* Quick Actions */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Quick Actions
        </h3>

        <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
          {quickActions.map(({ label, Icon, chipBg, color }) => (
            <button
              key={label}
              type="button"
              className="flex h-[36px] items-center gap-[7px] rounded-[8px] border border-[#EEEDF4] px-[7px] text-left text-[9px] font-medium text-[#3D3752] hover:bg-[#FAF9FD]"
            >
              <span
                className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[6px] ${chipBg}`}
              >
                <Icon size={11} strokeWidth={2} className={color} />
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
            Recent Activity
          </h3>
          <button
            type="button"
            className="text-[10px] font-medium text-[#7C3AED]"
          >
            View All
          </button>
        </div>

        <ul className="mt-[12px] space-y-[12px]">
          <li className="flex items-start gap-[8px]">
            <span className="mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#7C3AED]" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[10.5px] font-medium text-[#1F1836]">
                Service updated
              </p>
              <p className="mt-[2px] truncate text-[9.5px] text-[#8B879C]">
                Latest API data
              </p>
            </div>
            <p className="shrink-0 text-[9.5px] text-[#A5A2B5]">now</p>
          </li>
        </ul>
      </section>
    </aside>
  );
}

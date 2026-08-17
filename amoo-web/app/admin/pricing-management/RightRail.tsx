"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  BadgePercent,
  TicketPercent,
  Download,
  FolderTree,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";

const donut = [
  { label: "One-time Plans", value: "24 (57.1%)", pct: 57.1, color: "#4C1D95" },
  {
    label: "Subscription Plans",
    value: "10 (23.8%)",
    pct: 23.8,
    color: "#EC4899",
  },
  { label: "Packages", value: "5 (11.9%)", pct: 11.9, color: "#22C55E" },
  { label: "Offers", value: "3 (7.1%)", pct: 7.1, color: "#F59E0B" },
];

const quickActions = [
  { label: "Add New Plan", Icon: Plus, color: "text-[#7C3AED]" },
  { label: "Add Package", Icon: Package, color: "text-[#3B82F6]" },
  { label: "Create Offer", Icon: BadgePercent, color: "text-[#EF4444]" },
  { label: "Manage Coupons", Icon: TicketPercent, color: "text-[#F59E0B]" },
  { label: "Bulk Update Prices", Icon: Download, color: "text-[#16A34A]" },
  { label: "Plan Categories", Icon: FolderTree, color: "text-[#7C3AED]" },
];

const R = 32;
const C = 2 * Math.PI * R;

const segments = donut.map((d, i) => ({
  ...d,
  len: (d.pct / 100) * C,
  offset: (donut.slice(0, i).reduce((sum, p) => sum + p.pct, 0) / 100) * C,
}));

export default function RightRail() {
  const [totalPlans, setTotalPlans] = useState("—");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getOverview()
      .then((data: any) => {
        const s = data?.stats ?? data;
        if (s?.plans != null)
          setTotalPlans(Number(s.plans).toLocaleString("en-IN"));
      })
      .catch((err) => setError(err?.message || "Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[292px]">
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
      {/* Pricing Overview */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Pricing Overview
        </h3>

        <div className="mt-[14px] flex items-center gap-3">
          <svg width="86" height="86" viewBox="0 0 86 86" className="shrink-0">
            <g transform="translate(43,43) rotate(-90)">
              {segments.map((d) => (
                <circle
                  key={d.label}
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="15"
                  strokeDasharray={`${d.len - 2} ${C - d.len + 2}`}
                  strokeDashoffset={-d.offset}
                />
              ))}
            </g>
          </svg>

          <ul className="flex-1 space-y-[9px]">
            {donut.map((d) => (
              <li key={d.label} className="flex items-center gap-[6px]">
                <span
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="flex-1 truncate text-[9.5px] text-[#5B5570]">
                  {d.label}
                </span>
                <span className="text-[9.5px] text-[#8B879C]">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[14px] flex items-center justify-between border-t border-[#EEEDF4] pt-[11px]">
          <p className="text-[10.5px] text-[#8B879C]">Total Plans</p>
          <p className="text-[12.5px] font-semibold text-[#1F1836]">
            {totalPlans}
          </p>
        </div>
      </section>

      {/* Popular Price Points */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Popular Price Points
        </h3>

        <ul className="mt-[14px] space-y-[13px]">
          <li>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-[#3D3752]">Basic</span>
              <span className="text-[9.5px] text-[#8B879C]">—</span>
            </div>
            <div className="mt-[6px] h-[5px] w-full overflow-hidden rounded-full bg-[#EFEBF8]">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#5B21B6] to-[#8B5CF6]"
                style={{ width: "0%" }}
              />
            </div>
          </li>
        </ul>
      </section>

      {/* Quick Actions */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Quick Actions
        </h3>

        <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
          {quickActions.map(({ label, Icon, color }) => (
            <button
              key={label}
              type="button"
              className="flex h-[32px] items-center gap-[5px] rounded-[8px] border border-[#EEEDF4] px-[7px] text-left text-[9.5px] font-medium text-[#3D3752] hover:bg-[#FAF9FD]"
            >
              <Icon
                size={12}
                strokeWidth={1.9}
                className={`shrink-0 ${color}`}
              />
              <span className="truncate">{label}</span>
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
                Plans synced
              </p>
              <p className="mt-[2px] truncate text-[9.5px] text-[#8B879C]">
                From API
              </p>
            </div>
            <p className="shrink-0 text-[9.5px] text-[#A5A2B5]">now</p>
          </li>
        </ul>
      </section>
    </aside>
  );
}

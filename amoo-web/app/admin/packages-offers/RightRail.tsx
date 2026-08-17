"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  PackagePlus,
  BadgePercent,
  TicketPercent,
  IndianRupee,
  FolderTree,
  PieChart,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

const donut = [
  {
    label: "Service Packages",
    value: "12 (42.9%)",
    pct: 42.9,
    color: "#6366F1",
  },
  { label: "Combo Packages", value: "8 (28.6%)", pct: 28.6, color: "#EF4444" },
  { label: "Offers", value: "6 (21.4%)", pct: 21.4, color: "#F59E0B" },
  { label: "Subscriptions", value: "2 (7.1%)", pct: 7.1, color: "#3B82F6" },
];

const quickActions = [
  { label: "Create Package", Icon: PackagePlus, color: "text-[#7C3AED]" },
  { label: "Create Offer", Icon: BadgePercent, color: "text-[#EF4444]" },
  { label: "Manage Coupons", Icon: TicketPercent, color: "text-[#F59E0B]" },
  { label: "Bulk Update Prices", Icon: IndianRupee, color: "text-[#16A34A]" },
  { label: "Package Categories", Icon: FolderTree, color: "text-[#3B82F6]" },
  { label: "Offer Analytics", Icon: PieChart, color: "text-[#7C3AED]" },
];

const R = 30;
const C = 2 * Math.PI * R;

const segments = donut.map((d, i) => ({
  ...d,
  len: (d.pct / 100) * C,
  offset: (donut.slice(0, i).reduce((sum, p) => sum + p.pct, 0) / 100) * C,
}));

export default function RightRail() {
  const [topPackages, setTopPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getPackages()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (Array.isArray(items)) {
          setTopPackages(
            items.slice(0, 5).map((p: any) => ({
              name: p.name || "Unknown",
              img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/aura_scanner.png",
              bookings: `${p.bookings || 0} bookings`,
              revenue: `₹ ${Number(p.revenue || p.price || 0).toLocaleString("en-IN")}`,
            })),
          );
        }
      })
      .catch((err) => setError(err?.message || "Failed to load packages"))
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
      {/* Packages Overview */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Packages Overview
        </h3>

        <div className="mt-[14px] flex items-center gap-[10px]">
          <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
            <g transform="translate(40,40) rotate(-90)">
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
          <p className="text-[10.5px] text-[#8B879C]">Total Packages</p>
          <p className="text-[12.5px] font-semibold text-[#1F1836]">—</p>
        </div>
      </section>

      {/* Top Performing Packages */}
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <h3 className="text-[12.5px] font-semibold text-[#1F1836]">
          Top Performing Packages
        </h3>

        <ul className="mt-[12px] space-y-[12px]">
          {topPackages.map((p) => (
            <li key={p.name} className="flex items-center gap-[10px]">
              <Image
                src={p.img}
                alt=""
                width={30}
                height={30}
                className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
              />
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
          View All Analytics
          <ArrowRight size={12} />
        </button>
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
              className="flex h-[32px] items-center gap-[5px] rounded-[8px] border border-[#EEEDF4] px-[6px] text-left text-[9px] font-medium text-[#3D3752] hover:bg-[#FAF9FD]"
            >
              <Icon
                size={12}
                strokeWidth={1.9}
                className={`shrink-0 ${color}`}
              />
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
                Packages synced
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

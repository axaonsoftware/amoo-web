"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  UserRoundCheck,
  UsersRound,
  Package,
  Hash,
  BarChart3,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

const quickActions = [
  { label: "Generate Report", Icon: Plus, color: "text-[#7C3AED]" },
  { label: "Name Correction", Icon: UserRoundCheck, color: "text-[#3B82F6]" },
  { label: "Name Suggestion", Icon: UsersRound, color: "text-[#16A34A]" },
  { label: "Numerology Packages", Icon: Package, color: "text-[#7C3AED]" },
  { label: "Numbers & Meanings", Icon: Hash, color: "text-[#16A34A]" },
  { label: "View Analytics", Icon: BarChart3, color: "text-[#F59E0B]" },
];

export default function RightRail() {
  const [masters, setMasters] = useState<any[]>([]);
  const [totalReports, setTotalReports] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.admin.getTopExperts().then((data: any) => {
        const items = data?.data ?? data;
        if (Array.isArray(items)) {
          setMasters(
            items.slice(0, 5).map((m: any) => ({
              name: m.name || "Unknown",
              reports: `${m.sessions || m.bookings || 0} reports`,
              rating: m.rating || "—",
            })),
          );
        }
      }),
      api.admin.getOverview().then((data: any) => {
        const s = data?.stats ?? data;
        if (s?.reports != null)
          setTotalReports(Number(s.reports).toLocaleString("en-IN"));
      }),
    ])
      .catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
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
      {/* Reports Overview */}
      <section className="rounded-[12px] border border-[#EFEDF4] bg-white p-4 shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <h2 className="text-[12.5px] font-semibold text-[#1B1630]">
          Reports Overview (This Month)
        </h2>

        <div className="mt-3 flex items-center justify-between border-t border-[#EFEDF4] pt-3">
          <span className="text-[11px] font-medium text-[#4A4557]">
            Total Reports
          </span>
          <span className="text-[12.5px] font-semibold text-[#1B1630]">
            {totalReports}
          </span>
        </div>
      </section>

      {/* Top Numerology Masters */}
      <section className="rounded-[12px] border border-[#EFEDF4] bg-white p-4 shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-semibold text-[#1B1630]">
            Top Numerology Masters
          </h2>
          <Link
            href="/admin/numerology-management"
            className="text-[10.5px] font-medium text-[#7C3AED]"
          >
            View All
          </Link>
        </div>

        <ul className="mt-3 space-y-[12px]">
          {masters.map((m) => (
            <li key={m.name} className="flex items-center gap-[10px]">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt={m.name}
                width={30}
                height={30}
                className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-medium text-[#1B1630]">
                  {sanitize(m.name)}
                </p>
                <p className="mt-[1px] text-[10px] text-[#8B879C]">
                  {m.reports}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-[3px] text-[10.5px] font-medium text-[#4A4557]">
                <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                {m.rating}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick Actions */}
      <section className="rounded-[12px] border border-[#EFEDF4] bg-white p-4 shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <h2 className="text-[12.5px] font-semibold text-[#1B1630]">
          Quick Actions
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-[8px]">
          {quickActions.map(({ label, Icon, color }) => (
            <button
              key={label}
              type="button"
              className="flex h-[34px] items-center gap-[7px] rounded-[8px] border border-[#E7E5EF] bg-white px-[9px] text-left text-[10px] font-medium text-[#4A4557] hover:bg-[#FAF9FC]"
            >
              <Icon size={13} className={`shrink-0 ${color}`} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-[12px] border border-[#EFEDF4] bg-white p-4 shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-semibold text-[#1B1630]">
            Recent Activity
          </h2>
          <Link
            href="/admin/numerology-management"
            className="text-[10.5px] font-medium text-[#7C3AED]"
          >
            View All
          </Link>
        </div>

        <ul className="mt-3 space-y-[12px]">
          <li className="flex items-start gap-[8px]">
            <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#7C3AED]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10.5px] font-medium text-[#1B1630]">
                Reports synced
              </p>
              <p className="mt-[1px] truncate text-[9.5px] text-[#8B879C]">
                From API
              </p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[9.5px] text-[#8B879C]">
              now
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  UserRoundPlus,
  LayoutGrid,
  Layers,
  BookOpen,
  Upload,
  FileText,
  ChartColumn,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";
import type { TopExpert } from "../../../lib/types";

interface MasterRow {
  name: string;
  role: string;
  rating: number | string;
  count: number;
}

interface TopExpertRow extends TopExpert {
  expertise?: string;
  sessions?: number;
}

const DONUT =
  "conic-gradient(#1B76BD 0deg 94.68deg, #FFFFFF 94.68deg 96.68deg," +
  " #36A34D 96.68deg 176.76deg, #FFFFFF 176.76deg 178.76deg," +
  " #F5822A 178.76deg 253.08deg, #FFFFFF 253.08deg 255.08deg," +
  " #ED2C81 255.08deg 309.96deg, #FFFFFF 309.96deg 311.96deg," +
  " #45058A 311.96deg 360deg)";

const quickActions = [
  {
    label: "Add New Reading",
    Icon: Plus,
    bg: "bg-[#DCE9FE]",
    fg: "text-[#2563EB]",
  },
  {
    label: "Add Tarot Master",
    Icon: UserRoundPlus,
    bg: "bg-[#F3EBFE]",
    fg: "text-[#7C3AED]",
  },
  {
    label: "Manage Spreads",
    Icon: LayoutGrid,
    bg: "bg-[#E4EEFD]",
    fg: "text-[#2B7FD4]",
  },
  {
    label: "Manage Decks",
    Icon: Layers,
    bg: "bg-[#E6F6EA]",
    fg: "text-[#22A34F]",
  },
  {
    label: "Card Meanings",
    Icon: BookOpen,
    bg: "bg-[#DCE9FE]",
    fg: "text-[#2563EB]",
  },
  {
    label: "Bulk Upload Readings",
    Icon: Upload,
    bg: "bg-[#FDE8EE]",
    fg: "text-[#EF3B5B]",
  },
  {
    label: "Reading Reports",
    Icon: FileText,
    bg: "bg-[#F3EBFE]",
    fg: "text-[#7C3AED]",
  },
  {
    label: "Revenue Analytics",
    Icon: ChartColumn,
    bg: "bg-[#FFECC6]",
    fg: "text-[#F59E0B]",
  },
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#F0F1F5] bg-white shadow-[0_1px_2px_rgba(24,20,40,.03)]">
      {children}
    </div>
  );
}

function ViewAll() {
  return (
    <button
      type="button"
      className="text-[10.5px] font-semibold text-[#4F1FD6]"
    >
      View All
    </button>
  );
}

export default function RightRail() {
  const [totalReadings, setTotalReadings] = useState("—");
  const [masters, setMasters] = useState<MasterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.admin.getOverview().then((data: unknown) => {
        const s =
          (data as { stats?: { readings?: number } } | undefined)?.stats ??
          (data as { readings?: number } | null);
        if (s?.readings != null)
          setTotalReadings(Number(s.readings).toLocaleString("en-IN"));
      }),
      api.admin.getTopExperts().then((data: unknown) => {
        const items = (data as { data?: unknown } | null)?.data ?? data;
        if (Array.isArray(items)) {
          setMasters(
            (items as TopExpertRow[]).slice(0, 5).map((m) => ({
              name: m.name || "Unknown",
              role: m.expertise || "Tarot Master",
              rating: m.rating || "—",
              count: m.sessions || m.bookings || 0,
            })),
          );
        }
      }),
    ])
      .catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-[12px]">
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
      {/* Readings Overview */}
      <Card>
        <div className="p-[14px]">
          <h3 className="text-[13px] font-bold leading-[18px] text-[#0B0620]">
            Readings Overview (This Month)
          </h3>

          <div className="mt-[12px] flex items-center gap-[16px]">
            <div
              className="relative h-[77px] w-[77px] shrink-0 rounded-full"
              style={{ background: DONUT }}
            >
              <div className="absolute inset-[13px] rounded-full bg-white" />
            </div>
          </div>

          <div className="mt-[12px] flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-[#14134A]">
              Total Readings
            </span>
            <span className="text-[18px] font-bold leading-[24px] text-[#0D0B2B]">
              {totalReadings}
            </span>
          </div>
        </div>
      </Card>

      {/* Top Tarot Masters */}
      <Card>
        <div className="p-[14px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold leading-[18px] text-[#0B0620]">
              Top Tarot Masters
            </h3>
            <ViewAll />
          </div>

          <div className="mt-[9px]">
            {masters.map((m) => (
              <div
                key={m.name}
                className="flex h-[38px] items-center gap-[10px]"
              >
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                  alt={m.name}
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold leading-[15px] text-[#14134A]">
                    {sanitize(m.name)}
                  </p>
                  <p className="truncate text-[10px] leading-[14px] text-[#8B879C]">
                    {m.role}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-[4px]">
                  <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="whitespace-nowrap text-[10.5px] font-semibold text-[#14134A]">
                    {m.rating}
                  </span>
                  <span className="whitespace-nowrap text-[10px] text-[#8B879C]">
                    ({m.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-[12px]">
          <h3 className="px-[2px] text-[13px] font-bold leading-[18px] text-[#0B0620]">
            Quick Actions
          </h3>

          <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
            {quickActions.map(({ label, Icon, bg, fg }) => (
              <button
                key={label}
                type="button"
                className="flex h-[28px] items-center gap-[9px] rounded-[8px] border border-[#F0F1F5] bg-white pl-[5px] pr-[6px] text-left hover:bg-[#FAF9FC]"
              >
                <span
                  className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[6px] ${bg}`}
                >
                  <Icon size={12} className={fg} />
                </span>
                <span className="truncate text-[10px] font-semibold text-[#14134A]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-[14px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold leading-[18px] text-[#0B0620]">
              Recent Activity
            </h3>
            <ViewAll />
          </div>

          <div className="mt-[10px] space-y-[8px]">
            <div className="flex items-start gap-[9px]">
              <span
                className="mt-[4px] grid h-[10px] w-[10px] shrink-0 place-items-center rounded-full"
                style={{ background: "#7C3AED33" }}
              >
                <span
                  className="h-[4px] w-[4px] rounded-full"
                  style={{ background: "#7C3AED" }}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-bold leading-[15px] text-[#14134A]">
                  Readings synced
                </p>
                <p className="truncate text-[10px] leading-[15px] text-[#8B879C]">
                  From API
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap pt-[1px] text-[10px] text-[#8B879C]">
                now
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

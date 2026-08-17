"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  UserRoundPlus,
  FileText,
  TriangleAlert,
  BrainCircuit,
  Download,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

const DONUT =
  "conic-gradient(#1173BB 0deg 127deg, #FFFFFF 127deg 129deg," +
  " #36A34D 129deg 198deg, #FFFFFF 198deg 200deg," +
  " #FB8E1A 200deg 241deg, #FFFFFF 241deg 243deg," +
  " #ED2C81 243deg 283deg, #FFFFFF 283deg 285deg," +
  " #45058A 285deg 360deg)";

const quickActions = [
  {
    label: "Generate Kundali",
    Icon: Plus,
    bg: "bg-[#DCE9FE]",
    fg: "text-[#2563EB]",
  },
  {
    label: "Assign Astrologer",
    Icon: UserRoundPlus,
    bg: "bg-[#E6F6EA]",
    fg: "text-[#22A34F]",
  },
  {
    label: "Kundali Types",
    Icon: FileText,
    bg: "bg-[#FFECC6]",
    fg: "text-[#F59E0B]",
  },
  {
    label: "Dosha Reports",
    Icon: TriangleAlert,
    bg: "bg-[#FDE8EE]",
    fg: "text-[#EF3B5B]",
  },
  {
    label: "AI Interpretation",
    Icon: BrainCircuit,
    bg: "bg-[#F3EBFE]",
    fg: "text-[#7C3AED]",
  },
  {
    label: "View Analytics",
    Icon: Download,
    bg: "bg-[#E4EEFD]",
    fg: "text-[#2B7FD4]",
  },
];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[12px] border border-[#F0F1F5] bg-white shadow-[0_1px_2px_rgba(24,20,40,.03)] ${className}`}
    >
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="whitespace-nowrap text-[11.5px] font-bold leading-[16px] text-[#0B0620]">
      {children}
    </h3>
  );
}

function ViewAll() {
  return (
    <button
      type="button"
      className="text-[10px] font-semibold leading-[16px] text-[#4F1FD6]"
    >
      View All
    </button>
  );
}

export default function RightRail() {
  const [totalKundali, setTotalKundali] = useState("—");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.admin.getOverview().then((data: any) => {
        const s = data?.stats ?? data;
        if (s?.kundalis != null)
          setTotalKundali(Number(s.kundalis).toLocaleString("en-IN"));
      }),
      api.admin.getTopExperts().then((data: any) => {
        const items = data?.data ?? data;
        if (Array.isArray(items)) {
          setAstrologers(
            items.slice(0, 5).map((a: any) => ({
              name: a.name || "Unknown",
              count: `${a.sessions || a.bookings || 0} kundalis`,
              rating: a.rating || "—",
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
      {/* Kundali Overview */}
      <Card className="px-[14px] pb-[7px] pt-[9px]">
        <Title>Kundali Overview (This Month)</Title>

        <div className="mt-[17px] flex items-center gap-[20px]">
          <div
            className="relative h-[77px] w-[77px] shrink-0 rounded-full"
            style={{ background: DONUT }}
          >
            <div className="absolute inset-[13px] rounded-full bg-white" />
          </div>
        </div>

        <div className="mt-[4px] flex h-[20px] items-center justify-between">
          <span className="text-[11px] font-bold text-[#14134A]">
            Total Kundali
          </span>
          <span className="text-[17px] font-bold leading-[20px] text-[#0D0B2B]">
            {totalKundali}
          </span>
        </div>
      </Card>

      {/* Top Astrologers */}
      <Card className="px-[14px] pb-[6px] pt-[7px]">
        <div className="flex items-center justify-between">
          <Title>Top Astrologers</Title>
          <ViewAll />
        </div>

        <div className="mt-[4px]">
          {astrologers.map((a) => (
            <div key={a.name} className="flex h-[31px] items-center gap-[8px]">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                alt={a.name}
                width={28}
                height={28}
                className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-bold leading-[14px] text-[#14134A]">
                  {sanitize(a.name)}
                </p>
                <p className="truncate text-[9.5px] leading-[13px] text-[#8B879C]">
                  {a.count}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-[5px]">
                <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-[10.5px] font-semibold text-[#14134A]">
                  {a.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="px-[12px] pb-[5px] pt-[8px]">
        <div className="px-[2px]">
          <Title>Quick Actions</Title>
        </div>

        <div className="mt-[8px] grid grid-cols-2 gap-x-[12px] gap-y-[4px]">
          {quickActions.map(({ label, Icon, bg, fg }) => (
            <button
              key={label}
              type="button"
              className="flex h-[24px] items-center gap-[8px] rounded-[8px] border border-[#F0F1F5] bg-white pl-[4px] pr-[4px] text-left hover:bg-[#FAF9FC]"
            >
              <span
                className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[6px] ${bg}`}
              >
                <Icon size={12} className={fg} />
              </span>
              <span className="whitespace-nowrap text-[9px] font-semibold text-[#14134A]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="px-[14px] pb-[4px] pt-[6px]">
        <div className="flex items-center justify-between">
          <Title>Recent Activity</Title>
          <ViewAll />
        </div>

        <div className="mt-[5px] space-y-[1px]">
          <div className="flex items-start gap-[9px] py-[3px]">
            <span
              className="mt-[3px] grid h-[10px] w-[10px] shrink-0 place-items-center rounded-full"
              style={{ background: "#7C3AED33" }}
            >
              <span
                className="h-[4px] w-[4px] rounded-full"
                style={{ background: "#7C3AED" }}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold leading-[13px] text-[#14134A]">
                Kundalis synced
              </p>
              <p className="truncate text-[9px] leading-[13px] text-[#8B879C]">
                From API
              </p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[9px] leading-[13px] text-[#8B879C]">
              now
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

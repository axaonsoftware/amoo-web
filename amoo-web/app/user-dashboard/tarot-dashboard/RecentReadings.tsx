"use client";

import Image from "next/image";
import { ArrowRight, Download, Heart, Globe, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const CHIP_MAP: Record<
  string,
  { label: string; bg: string; color: string; Icon?: typeof Heart }
> = {
  love: {
    label: "Love",
    bg: "bg-[#fde8f0]",
    color: "text-[#e0567f]",
    Icon: Heart,
  },
  career: {
    label: "Career",
    bg: "bg-[#e7effb]",
    color: "text-[#3b78cc]",
    Icon: Heart,
  },
  daily: { label: "Daily", bg: "bg-[#e6f6ea]", color: "text-[#2f9e56]" },
  general: {
    label: "General",
    bg: "bg-[#f0eef4]",
    color: "text-[#6c6b78]",
    Icon: Globe,
  },
};

type Report = { id: number; title: string; type: string; created_at: string };

export default function RecentReadings() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const reports: Report[] = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("tarot"),
  );
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Recent Readings
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View All Readings
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading readings...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : reports.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">
          No tarot readings found.
        </p>
      ) : (
        <ul className="mt-2">
          {reports.map((r, i) => {
            const typeKey =
              (r.type || "").toLowerCase().replace("tarot", "").trim() ||
              "general";
            const chip = CHIP_MAP[typeKey] || CHIP_MAP.general;
            const ChipIcon = chip.Icon;
            const created = new Date(r.created_at);
            const dateStr = created.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = created.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3.5 py-[11px] ${
                  i === 0 ? "" : "border-t border-[#f4f1f8]"
                }`}
              >
                <span className="relative block h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px]">
                  <Image
                    src="https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=104&q=80"
                    alt={r.title}
                    fill
                    sizes="52px"
                    className="object-cover"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-[#2b0f47]">
                    {r.title}
                  </p>
                  <p className="mt-[3px] text-[11.5px] text-[#8b8697]">
                    {r.type}
                  </p>
                  <p className="mt-[3px] text-[11px] text-[#a09aab]">
                    {dateStr}
                    <span className="ml-3">{timeStr}</span>
                  </p>
                </div>

                <span
                  className={`hidden items-center gap-1 rounded-full px-2.5 py-[4px] text-[11px] font-medium sm:inline-flex ${chip.bg} ${chip.color}`}
                >
                  {ChipIcon ? (
                    <ChipIcon className="h-[12px] w-[12px]" strokeWidth={2} />
                  ) : null}
                  {chip.label}
                </span>

                <button
                  type="button"
                  className="inline-flex h-[32px] items-center justify-center rounded-[8px] border border-[#e2d9f0] px-4 text-[12px] font-medium text-[#7a3fc0]"
                >
                  View
                </button>

                <button
                  type="button"
                  aria-label="Download"
                  className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] border border-[#efecf6] bg-white text-[#7a3fc0]"
                >
                  <Download className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { LayoutGrid, Layers, Orbit, Compass, Flower2, ChevronRight, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Numerology: LayoutGrid,
  "Tarot Reading": Layers,
  Kundli: Orbit,
  Vastu: Compass,
  "Reiki Healing": Flower2,
};

const TILE_MAP: Record<string, string> = {
  Numerology: "bg-[#f3ecfb]",
  "Tarot Reading": "bg-[#fdf0e2]",
  Kundli: "bg-[#fde8ee]",
  Vastu: "bg-[#e7f8ee]",
  "Reiki Healing": "bg-[#f0eafd]",
};

const ICON_COLOR_MAP: Record<string, string> = {
  Numerology: "text-[#7c3aed]",
  "Tarot Reading": "text-[#e0a63f]",
  Kundli: "text-[#e0507f]",
  Vastu: "text-[#2f9e63]",
  "Reiki Healing": "text-[#8b5cf6]",
};

export default function ReportCategories() {
  const { data: services, loading, error } = useApi<any[]>(() => api.getServices());
  const grouped: Record<string, number> = {};
  (services ?? []).forEach((s: any) => {
    const key = s.category || s.type || "Other";
    grouped[key] = (grouped[key] || 0) + 1;
  });
  const categories = Object.entries(grouped).slice(0, 5).map(([label, count]) => ({
    label,
    count: `${count} Reports`,
    Icon: ICON_MAP[label] || LayoutGrid,
    tile: TILE_MAP[label] || "bg-[#f3ecfb]",
    icon: ICON_COLOR_MAP[label] || "text-[#7c3aed]",
  }));
  return (
    <section className="rounded-[16px] border border-[#f0e7d8] bg-white px-[20px] pb-[10px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <h2 className="font-display text-[18px] font-bold leading-none text-[#4c1d95]">
        Report Categories
      </h2>

      {loading ? (
        <div className="mt-[8px] flex items-center justify-center gap-2 py-4 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-[8px] text-[12.5px] text-red-500">{error}</p>
      ) : (
      <ul className="mt-[8px] flex flex-col divide-y divide-[#f4eee4]">
        {categories.map(({ label, count, Icon, tile, icon }) => (
          <li key={label}>
            <Link
              href="/user-dashboard/my-reports"
              className="flex items-center gap-[12px] py-[5px]"
            >
              <span
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] ${tile}`}
              >
                <Icon className={`h-[16px] w-[16px] ${icon}`} strokeWidth={1.8} />
              </span>
              <span className="flex-1 text-[13px] font-medium text-[#2b0f47]">{label}</span>
              <span className="text-[11.5px] text-[#8b8697]">{count}</span>
              <ChevronRight className="h-[16px] w-[16px] shrink-0 text-[#c3bccd]" strokeWidth={2} />
            </Link>
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}

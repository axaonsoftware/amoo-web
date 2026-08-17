"use client";

import Link from "next/link";
import {
  LayoutGrid,
  Orbit,
  Flower2,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { sanitize } from "../../lib/sanitize";

const TYPE_META: Record<string, { Icon: LucideIcon; tagClass: string }> = {
  numerology: { Icon: LayoutGrid, tagClass: "bg-[#f3ecfb] text-[#7c3aed]" },
  kundli: { Icon: Orbit, tagClass: "bg-[#e7f7ee] text-[#2f9e63]" },
  vastu: { Icon: Flower2, tagClass: "bg-[#e7f8ee] text-[#2f9e63]" },
  tarot: { Icon: Layers, tagClass: "bg-[#fdf0e2] text-[#c2762a]" },
  reiki: { Icon: Sparkles, tagClass: "bg-[#f3ecfb] text-[#7c3aed]" },
};

type Report = { id: number; title: string; type: string; created_at: string };

export default function RecentReports() {
  const { data, loading, error } = useApi<{ data: Report[] }>(
    () => api.getReports(),
    [],
    15000,
  );
  const rows: Report[] = (data?.data ?? []).slice(0, 4);

  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-5 pb-5 pt-4 shadow-[0_2px_10px_rgba(42,17,72,.05)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold text-[#4a1c7d]">
          Recent Reports
        </h2>
        <Link
          href="/user-dashboard/my-reports"
          className="text-[12px] font-medium text-[#6b3fa0]"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">Loading reports...</p>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-600">
          Failed to load reports.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">No reports yet.</p>
      ) : (
        <div className="mt-3 flex flex-col">
          {rows.map((r, i) => {
            const meta =
              TYPE_META[String(r.type).toLowerCase()] ?? TYPE_META.numerology;
            const Icon = meta.Icon;
            return (
              <div
                key={r.id}
                className={`flex items-center gap-3 py-3.5 ${i === 0 ? "" : "border-t border-[#f1ebe0]"}`}
              >
                <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#5a2496] to-[#3d1268] shadow-[0_4px_10px_rgba(61,18,104,.25)]">
                  <Icon
                    className="h-[19px] w-[19px] text-[#f0c877]"
                    strokeWidth={1.7}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#2b0f47]">
                    {sanitize(r.title)}
                  </p>
                  <p className="mt-1 text-[11.5px] text-[#8b8697]">
                    Generated on{" "}
                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Link
                  href="/user-dashboard/my-reports"
                  className="shrink-0 rounded-[8px] border border-[#e0d3ee] bg-[#f7f2fd] px-5 py-2 text-[12px] font-semibold text-[#4a1c7d]"
                >
                  View
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

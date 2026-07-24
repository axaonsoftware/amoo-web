"use client";

import { ArrowRight, Download, FileText, Loader2, MoreVertical } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = { id: number; title: string; type: string; created_at: string };

function parseDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `Generated on ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function RecentReports() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() => api.getReports());
  const numerologyReports = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("numerology")
  );
  const reports = numerologyReports.slice(0, 5);

  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[14px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">Recent Reports</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View All
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-3 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-3 text-[12.5px] text-red-500">{error}</p>
      ) : reports.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-[#8b8697]">No numerology reports yet.</p>
      ) : (
      <ul className="mt-1">
        {reports.map(({ id, title, created_at }, i) => (
          <li
            key={id}
            className={`flex items-center gap-3 py-[4px] ${
              i === 0 ? "" : "border-t border-[#f4f1f8]"
            }`}
          >
            <span className="relative block h-[40px] w-[40px] shrink-0 overflow-hidden rounded-[8px] bg-[#f1e9fc]">
              <FileText className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 text-[#7a3fc0]" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-[#2b0f47]">{title}</p>
              <p className="mt-[3px] truncate text-[11px] text-[#8b8697]">{parseDate(created_at)}</p>
            </div>

            <button
              type="button"
              aria-label="Download"
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] border border-[#efecf6] bg-white text-[#7a3fc0]"
            >
              <Download className="h-[15px] w-[15px]" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label="More"
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] border border-[#efecf6] bg-white text-[#6c6b78]"
            >
              <MoreVertical className="h-[15px] w-[15px]" strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      )}

      <button
        type="button"
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#efecf6] bg-white px-4 py-[6px] text-[12px] font-medium text-[#7a3fc0]"
      >
        Go to Reports History
        <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
      </button>
    </section>
  );
}

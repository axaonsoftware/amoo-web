"use client";

import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = { id: number; title: string; type: string; created_at: string };

export default function RecentCards() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() => api.getReports());
  const reports: Report[] = (data?.data ?? [])
    .filter((r) => r.type && r.type.toLowerCase().includes("tarot"))
    .slice(0, 4);
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Recent Cards &amp; Insights
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View All
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : reports.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">No recent cards yet.</p>
      ) : (
        <ul className="mt-2">
          {reports.map((r, i) => {
            const dateStr = new Date(r.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3.5 py-[11px] ${
                  i === 0 ? "" : "border-t border-[#f4f1f8]"
                }`}
              >
                <span className="relative block h-[54px] w-[40px] shrink-0 overflow-hidden rounded-[7px] border border-[#ece5f5]">
                  <Image
                    src="https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=96&q=80"
                    alt={r.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-[#2b0f47]">{r.title}</p>
                  <p className="mt-[3px] truncate text-[11.5px] text-[#8b8697]">{r.type}</p>
                  <p className="mt-[3px] text-[11px] text-[#a09aab]">{dateStr}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

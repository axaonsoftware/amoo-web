"use client";

import Image from "next/image";
import { ArrowRight, Eye, MoreVertical, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = { id: number; title: string; type: string; created_at: string };

export default function RecentKundalis() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const rows: Report[] = (data?.data ?? [])
    .filter((r) => r.type && r.type.toLowerCase().includes("kundali"))
    .slice(0, 4);
  return (
    <section className="rounded-[14px] border border-[#f0e7d8] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Recent Kundalis
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View All Kundalis
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-2 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-2 text-[12.5px] text-red-500">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-2 text-[12.5px] text-[#8b8697]">
          No kundali reports found.
        </p>
      ) : (
        <ul className="mt-2">
          {rows.map((r, i) => {
            const dateStr = new Date(r.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3.5 py-[14px] ${
                  i === 0 ? "" : "border-t border-[#f2ecf7]"
                }`}
              >
                <span className="relative block h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[10px]">
                  <Image
                    src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=112&q=80"
                    alt={r.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#2b0f47]">
                    {r.title}
                  </p>
                  <p className="mt-[3px] truncate text-[11.5px] text-[#6c6b78]">
                    {r.type}
                  </p>
                  <p className="mt-[2px] truncate text-[11.5px] text-[#8b8697]">
                    {dateStr}
                  </p>
                </div>

                <span className="hidden shrink-0 rounded-full px-3 py-[5px] text-[10.5px] font-semibold sm:inline-block bg-[#f1e9fc] text-[#7a3fc0]">
                  {r.type}
                </span>

                <span className="hidden w-[92px] shrink-0 text-right text-[11.5px] text-[#6c6b78] md:block">
                  {dateStr}
                </span>

                <button
                  type="button"
                  aria-label="View"
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-[#f0e7d8] bg-white text-[#7a3fc0]"
                >
                  <Eye className="h-[16px] w-[16px]" strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  aria-label="More"
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-[#f0e7d8] bg-white text-[#6c6b78]"
                >
                  <MoreVertical
                    className="h-[16px] w-[16px]"
                    strokeWidth={1.8}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

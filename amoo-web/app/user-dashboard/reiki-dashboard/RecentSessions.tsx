"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { LotusGlyph } from "./icons";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Booking = {
  id: number;
  service_name: string;
  date: string;
  status: string;
};

export default function RecentSessions() {
  const { data, loading, error } = useApi<{ data: Booking[] }>(() =>
    api.getBookings(),
  );
  const sessions: Booking[] = (data?.data ?? [])
    .filter((b) => b.status === "completed" || b.status === "Confirmed")
    .slice(0, 3);
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold text-[#2b0f47]">
          Recent Healing Sessions
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7a3fc0]"
        >
          View All
          <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-3.5 flex items-center justify-center gap-2 py-4 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-3.5 text-[12.5px] text-red-500">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="mt-3.5 text-[12.5px] text-[#8b8697]">
          No completed sessions yet.
        </p>
      ) : (
        <div className="mt-3.5 flex flex-col gap-3">
          {sessions.map((s) => {
            const dateStr = new Date(s.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#f1e9fc] text-[#7a3fc0]">
                  <LotusGlyph className="h-[17px] w-[17px]" strokeWidth={1.7} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-[#2b0f47]">
                    {s.service_name}
                  </p>
                  <p className="mt-[3px] text-[10.5px] text-[#8b8697]">
                    {dateStr}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#e6f6ea] px-2.5 py-[4px] text-[10.5px] font-medium text-[#2f9e56]">
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

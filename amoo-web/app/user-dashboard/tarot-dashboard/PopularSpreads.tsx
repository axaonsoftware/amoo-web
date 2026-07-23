"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import {
  DailyGuidanceArt,
  PastPresentFutureArt,
  LoveSpreadArt,
  CareerPathArt,
  CelticCrossArt,
} from "./icons";
import { useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";

const ART_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "Daily Guidance": DailyGuidanceArt,
  "Past, Present, Future": PastPresentFutureArt,
  "Love Spread": LoveSpreadArt,
  "Career Path": CareerPathArt,
  "Celtic Cross": CelticCrossArt,
};

export default function PopularSpreads() {
  // /api/services is paginated -> `{ data, meta }`, never a bare array.
  const { items: services, loading, error } = useApiList<any>(() => api.getServices());
  const tarotServices = services.filter(
    (s: any) => s.category === "Tarot" || (s.type || "").toLowerCase() === "tarot"
  );
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">Popular Spreads</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View All Spreads
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading spreads...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : tarotServices.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">No tarot services available.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-5">
          {tarotServices.slice(0, 5).map((s: any, i: number) => {
            const Art = ART_MAP[s.name] || DailyGuidanceArt;
            return (
              <div
                key={s.id || i}
                className={`flex flex-col rounded-[12px] border p-[8px] text-center ${
                  i === 0 ? "border-[#c9a5f0] bg-[#f4ecfd]" : "border-[#efecf6] bg-[#faf8fd]"
                }`}
              >
                <div
                  className={`flex h-[152px] items-center justify-center rounded-[9px] ${
                    i === 0 ? "bg-[#efe4fc]" : "bg-[#f4f0fa]"
                  }`}
                >
                  <Art className="h-[128px] w-[112px]" />
                </div>

                <p className="mt-3 text-[13px] font-bold leading-[1.2] text-[#2b0f47]">{s.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#7a3fc0]">
                  {s.duration || s.category || "1 Session"}
                </p>
                <p className="mt-1.5 flex-1 text-[10.5px] leading-[1.45] text-[#8b8697]">
                  {s.description || ""}
                </p>

                <button
                  type="button"
                  aria-label={s.name}
                  className="mx-auto mt-2.5 inline-flex items-center justify-center text-[#7a3fc0]"
                >
                  <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

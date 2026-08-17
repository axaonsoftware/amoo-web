"use client";

import {
  ArrowRight,
  Star,
  Heart,
  Smile,
  Mountain,
  Target,
  Loader2,
} from "lucide-react";
import { useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  Star,
  Heart,
  Smile,
  Mountain,
  Target,
};

type Tool = {
  id: number;
  name: string;
  category?: string;
  description?: string | null;
};

export default function PopularTools() {
  // /api/services is paginated -> `{ data, meta }`, never a bare array.
  const {
    items: services,
    loading,
    error,
  } = useApiList<Tool>(() => api.getServices());
  const numerologyServices = services.filter(
    (s) => ((s.category as string) || "").toLowerCase() === "numerology",
  );
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Popular Numerology Tools
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View All Tools
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-3.5 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-3.5 text-[12.5px] text-red-500">{error}</p>
      ) : numerologyServices.length === 0 ? (
        <p className="mt-3.5 text-[12.5px] text-[#8b8697]">
          No numerology tools available.
        </p>
      ) : (
        <div className="mt-3.5 grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-5">
          {numerologyServices.slice(0, 5).map((s, i: number) => {
            const iconNames = ["Star", "Heart", "Smile", "Mountain", "Target"];
            const Icon = ICON_MAP[iconNames[i]] || Star;
            return (
              <div
                key={s.id || i}
                className="flex flex-col items-center rounded-[12px] border border-[#efecf6] bg-white px-1.5 py-[12px] text-center shadow-[0_1px_2px_rgba(43,15,71,.03)]"
              >
                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#f1e9fc] text-[#7a3fc0]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>

                <p className="mt-2 text-[10.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#2b0f47]">
                  {s.name}
                </p>
                <p className="mt-1 text-[9.5px] leading-[1.4] text-[#8b8697]">
                  {s.description || ""}
                </p>

                <button
                  type="button"
                  aria-label={s.name}
                  className="mt-2 inline-flex items-center justify-center text-[#7a3fc0]"
                >
                  <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

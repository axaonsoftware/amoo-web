"use client";

import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { DiyaGlyph, MeditationGlyph } from "./icons";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = { id: number; title: string; type: string; created_at: string };

export default function HealingPlan() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const reports: Report[] = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("reiki"),
  );
  const plan = reports[0];
  const planMeta = [
    { label: "Duration", value: plan ? "Ongoing" : "—" },
    {
      label: "Start Date",
      value: plan
        ? new Date(plan.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    { label: "End Date", value: plan ? "TBD" : "—" },
  ];
  return (
    <section className="flex flex-col rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      {/* Header */}
      <div className="flex items-center gap-2">
        <DiyaGlyph className="h-[17px] w-[17px] text-[#e0a63a]" />
        <h2 className="font-display text-[17px] font-bold text-[#2b0f47]">
          My Healing Plan
        </h2>
      </div>

      {/* Plan box */}
      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : (
        <div className="mt-4 rounded-[12px] border border-[#ece9f3] bg-white">
          <div className="flex items-center gap-2.5 px-3.5 py-[11px]">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#f1e9fc] text-[#7a3fc0]">
              <MeditationGlyph className="h-[16px] w-[16px]" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[#2b0f47]">
              {plan ? plan.title : "Reiki Healing Plan"}
            </span>
            <span className="shrink-0 rounded-full bg-[#e6f6ea] px-2.5 py-[3px] text-[10.5px] font-semibold text-[#2f9e56]">
              {plan ? "Active" : "No Plan"}
            </span>
          </div>

          <span className="block h-px w-full bg-[#ece9f3]" />

          <div className="grid grid-cols-3 divide-x divide-[#ece9f3]">
            {planMeta.map(({ label, value }) => (
              <div key={label} className="px-2 py-[10px] text-center">
                <p className="text-[10.5px] text-[#8b8697]">{label}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#2b0f47]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Focus */}
      <p className="mt-4 text-[12px] font-semibold text-[#3d3a48]">
        Today&apos;s Focus
      </p>

      <div className="mt-2.5 flex items-start gap-3">
        <span className="relative h-[46px] w-[46px] shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=92&q=80"
            alt="Heart chakra lotus"
            fill
            sizes="46px"
            className="object-contain"
          />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#2b0f47]">
            Heart Chakra Healing
          </p>
          <p className="mt-1 text-[11px] leading-[1.55] text-[#8b8697]">
            Open your heart to love, compassion and inner peace.
          </p>
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7a3fc0]"
        >
          View Full Plan
          <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}

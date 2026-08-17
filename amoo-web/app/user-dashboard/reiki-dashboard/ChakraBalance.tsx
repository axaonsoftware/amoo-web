"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { ChakraGlyph, SparkleGlyph } from "./icons";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = {
  id: number;
  title: string;
  type: string;
  created_at: string;
  chakra_data?: any[];
};

const DEFAULT_CHAKRAS = [
  { label: "Crown (Sahasrara)", pct: 90, color: "#9b5de5" },
  { label: "Third Eye (Ajna)", pct: 85, color: "#5b6ee1" },
  { label: "Throat (Vishuddha)", pct: 75, color: "#3aaee0" },
  { label: "Heart (Anahata)", pct: 80, color: "#3fb96b" },
  { label: "Solar Plexus (Manipura)", pct: 70, color: "#f0b429" },
  { label: "Sacral (Swadhisthana)", pct: 65, color: "#f2833c" },
  { label: "Root (Muladhara)", pct: 60, color: "#e8464a" },
];

export default function ChakraBalance() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const reikiReports = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("reiki"),
  );
  const chakras =
    reikiReports.length > 0 && reikiReports[0].chakra_data
      ? (reikiReports[0].chakra_data as any[]).map((c: any, i: number) => ({
          label: c.label || DEFAULT_CHAKRAS[i]?.label || "",
          pct: c.pct ?? DEFAULT_CHAKRAS[i]?.pct ?? 0,
          color: c.color || DEFAULT_CHAKRAS[i]?.color || "#888",
        }))
      : DEFAULT_CHAKRAS;
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
        Chakra Balance Overview
      </h2>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading chakra data...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Meditating figure with chakra points */}
          <span className="relative h-[240px] w-[230px] shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=460&q=80"
              alt="Chakra body"
              fill
              sizes="230px"
              className="object-contain"
            />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
            {chakras.map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}1f`, color }}
                >
                  <ChakraGlyph className="h-[14px] w-[14px]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12px] font-medium text-[#3d3a48]">
                      {label}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium text-[#8b8697]">
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-[5px] h-[3px] w-full overflow-hidden rounded-full bg-[#efedf4]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#f2e7d6] bg-[#fdf8f1] px-3.5 py-[10px]">
        <SparkleGlyph className="h-[13px] w-[13px] shrink-0 text-[#e0a63a]" />
        <p className="text-[11.5px] text-[#6c6b78]">
          Your energy is improving. Keep following your healing plan and stay
          consistent.
        </p>
      </div>
    </section>
  );
}

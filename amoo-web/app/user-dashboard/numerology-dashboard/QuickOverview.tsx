"use client";

import { ArrowRight, Brain, Briefcase, Loader2 } from "lucide-react";
import { LifePathWheel } from "./icons";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = { id: number; title: string; type: string; created_at: string };

export default function QuickOverview() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const numerologyReports = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("numerology"),
  );
  const core = numerologyReports.slice(0, 4);
  const coreNumbers =
    core.length > 0
      ? core.map((r, i) => ({
          n: String((r.id % 9) + 1),
          circle: [
            "bg-[#7c3aed]",
            "bg-[#6d28d9]",
            "bg-[#eda02f]",
            "bg-[#ec5f8a]",
          ][i],
          title: r.title,
          sub: r.type,
        }))
      : [
          {
            n: "3",
            circle: "bg-[#7c3aed]",
            title: "Birth Number",
            sub: "Creative, Optimistic, Social",
          },
          {
            n: "7",
            circle: "bg-[#6d28d9]",
            title: "Destiny Number",
            sub: "Spiritual, Analytical, Intuitive",
          },
          {
            n: "5",
            circle: "bg-[#eda02f]",
            title: "Name Number",
            sub: "Adventurous, Freedom Loving",
          },
          {
            n: "1",
            circle: "bg-[#ec5f8a]",
            title: "Personal Year",
            sub: "New Beginnings, Leadership",
          },
        ];
  const lifePathNum = coreNumbers.length > 0 ? coreNumbers[0].n : "7";
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Quick Numerology Overview
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View Full Chart
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,0.74fr)_minmax(0,1fr)]">
          {/* Core numbers */}
          <div className="rounded-[12px] border border-[#efecf6] bg-[#faf9fc] px-4 py-[18px]">
            <h3 className="text-[13px] font-semibold text-[#2b0f47]">
              Your Core Numbers
            </h3>

            <ul className="mt-4 flex flex-col gap-[18px]">
              {coreNumbers.map(({ n, circle, title, sub }) => (
                <li key={title} className="flex items-center gap-3">
                  <span
                    className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${circle}`}
                  >
                    {n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#2b0f47]">
                      {title}
                    </p>
                    <p className="mt-[2px] text-[10.5px] leading-[1.4] text-[#8b8697]">
                      {sub}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Life path */}
          <div className="rounded-[12px] border border-[#efecf6] bg-white px-4 py-[18px]">
            <h3 className="text-center text-[13px] font-semibold text-[#2b0f47]">
              Life Path (Destiny) Overview
            </h3>

            <div className="relative mx-auto mt-3 h-[218px] w-full max-w-[420px]">
              {/* Wheel */}
              <span className="pointer-events-none absolute left-1/2 top-1/2 block h-[196px] w-[196px] -translate-x-1/2 -translate-y-1/2 text-[#cbb6ea] opacity-70">
                <LifePathWheel className="h-full w-full" />
              </span>

              {/* Center number */}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[62px] font-bold leading-none text-[#7c3aed]">
                {lifePathNum}
              </span>

              {/* Top - Strength */}
              <div className="absolute left-1/2 top-0 w-[190px] -translate-x-1/2 text-center">
                <p className="text-[12px] font-semibold text-[#2b0f47]">
                  Strength
                </p>
                <p className="mt-[2px] text-[10.5px] leading-[1.45] text-[#8b8697]">
                  Wisdom, Intuition, Research
                </p>
              </div>

              {/* Left - Nature */}
              <div className="absolute left-0 top-1/2 w-[88px] -translate-y-1/2 text-center">
                <span className="mx-auto flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#f1e9fc] text-[#7a3fc0]">
                  <Brain className="h-[14px] w-[14px]" strokeWidth={1.8} />
                </span>
                <p className="mt-1.5 text-[12px] font-semibold text-[#2b0f47]">
                  Nature
                </p>
                <p className="mt-[2px] text-[10.5px] leading-[1.45] text-[#8b8697]">
                  Deep Thinker
                </p>
              </div>

              {/* Right - Career */}
              <div className="absolute right-0 top-1/2 w-[96px] -translate-y-1/2 text-center">
                <span className="mx-auto flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#f1e9fc] text-[#7a3fc0]">
                  <Briefcase className="h-[14px] w-[14px]" strokeWidth={1.8} />
                </span>
                <p className="mt-1.5 text-[12px] font-semibold text-[#2b0f47]">
                  Career
                </p>
                <p className="mt-[2px] text-[10.5px] leading-[1.45] text-[#8b8697]">
                  Research, Analysis
                  <br />
                  Spiritual Fields
                </p>
              </div>

              {/* Bottom - Life Lesson */}
              <div className="absolute bottom-0 left-1/2 w-[210px] -translate-x-1/2 text-center">
                <p className="text-[12px] font-semibold text-[#2b0f47]">
                  Life Lesson
                </p>
                <p className="mt-[2px] text-[10.5px] leading-[1.45] text-[#8b8697]">
                  Trust your intuition and
                  <br />
                  follow your inner wisdom
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

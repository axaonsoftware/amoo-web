"use client";

import { useMemo } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = { id: number; title: string; type: string; created_at: string };

const C = 2 * Math.PI * 52;
const X0 = 42;
const X1 = 370;
const Y_TOP = 14;
const Y_BASE = 110;

function deriveChartData(reports: Report[]) {
  if (reports.length === 0) {
    return {
      weeks: ["Week 1", "Week 2", "Week 3", "Week 4", "This Week"],
      values: [0, 0, 0, 0, 0],
    };
  }
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const buckets = [0, 0, 0, 0, 0];
  for (const r of reports) {
    const age = now - new Date(r.created_at).getTime();
    const bucket = Math.min(4, Math.max(0, Math.floor(age / weekMs)));
    buckets[4 - bucket]++;
  }
  const total = reports.length;
  const values = buckets.map((count) =>
    Math.round((count / Math.max(total, 1)) * 100),
  );
  const labels = [
    "4+ weeks ago",
    "3 weeks ago",
    "2 weeks ago",
    "Last week",
    "This week",
  ];
  return { weeks: labels, values };
}

export default function HealingProgress() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const reikiReports = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("reiki"),
  );
  const reportCount = Math.min(reikiReports.length, 100);
  const PROGRESS = reikiReports.length > 0 ? reportCount / 100 : 0.68;
  const OFFSET = C * (1 - PROGRESS);

  const { weeks, values } = useMemo(
    () => deriveChartData(reikiReports),
    [reikiReports],
  );

  const toX = (i: number) => X0 + (i * (X1 - X0)) / (values.length - 1);
  const toY = (value: number) => Y_BASE - (value / 100) * (Y_BASE - Y_TOP);

  const points = values.map((value, i) => ({ x: toX(i), y: toY(value) }));
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPoints = `${X0},${Y_BASE} ${linePoints} ${X1},${Y_BASE}`;

  const gridlines = [
    { label: "100%", y: toY(100) },
    { label: "50%", y: toY(50) },
    { label: "0%", y: toY(0) },
  ];

  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Healing Progress
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#7a3fc0]"
        >
          View Progress
          <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : reikiReports.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">
          No healing sessions yet. Start your first session to track progress.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_1.15fr] lg:items-center">
          {/* Donut */}
          <div className="relative h-[128px] w-[128px] shrink-0">
            <svg
              viewBox="0 0 120 120"
              fill="none"
              className="h-full w-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="#efedf4"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="#6d28d9"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={C}
                strokeDashoffset={OFFSET}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-[24px] font-bold leading-none text-[#2b0f47]">
                {Math.round(PROGRESS * 100)}%
              </p>
              <p className="mt-1 text-[10px] text-[#8b8697]">
                Overall Progress
              </p>
            </div>
          </div>

          {/* Copy */}
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-[#2b0f47]">
              You are on your healing journey.
            </p>
            <p className="mt-2 text-[11.5px] leading-[1.6] text-[#8b8697]">
              Stay consistent and complete your sessions to achieve complete
              balance.
            </p>
          </div>

          {/* Line chart */}
          <div className="min-w-0">
            <svg
              viewBox="0 0 400 140"
              fill="none"
              className="h-[130px] w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="reikiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {gridlines.map(({ label, y }) => (
                <g key={label}>
                  <line
                    x1={X0}
                    y1={y}
                    x2="384"
                    y2={y}
                    stroke="#efedf4"
                    strokeWidth="1"
                  />
                  <text
                    x="34"
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="11"
                    fill="#a8a2b4"
                  >
                    {label}
                  </text>
                </g>
              ))}
              <polygon points={areaPoints} fill="url(#reikiGrad)" />
              <polyline
                points={linePoints}
                stroke="#6d28d9"
                strokeWidth="2"
                fill="none"
              />
              {points.map(({ x, y }) => (
                <circle key={x} cx={x} cy={y} r="3.2" fill="#6d28d9" />
              ))}
              {weeks.map((week, i) => (
                <text
                  key={week}
                  x={toX(i)}
                  y="130"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#a8a2b4"
                >
                  {week}
                </text>
              ))}
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}

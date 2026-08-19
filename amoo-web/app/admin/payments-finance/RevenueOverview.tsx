"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

const W = 700;
const H = 200;
const x = (i: number, len: number) => (i / Math.max(len - 1, 1)) * W;
const y = (v: number, max: number) => H - (v / Math.max(max, 1)) * H;

type RevenuePoint = {
  date?: string;
  label?: string;
  amount?: number | string;
  revenue?: number | string;
  total?: number | string;
};

export default function RevenueOverview() {
  const [revenue, setRevenue] = useState<number[]>([]);
  const [netEarnings, setNetEarnings] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    let cancelled = false;
    api.admin
      .getRevenue(period)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        if (Array.isArray(data) && data.length >= 7) {
          const rev: number[] = [];
          const lbls: string[] = [];
          data.forEach((d: RevenuePoint) => {
            const v = Number(d.amount || d.revenue || d.total || 0);
            if (v > 0) {
              rev.push(v / 100000);
              const date = d.date || d.label || "";
              lbls.push(
                date
                  ? new Date(date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "",
              );
            }
          });
          if (rev.length >= 7) {
            const sliced = rev.slice(0, 18);
            setRevenue(sliced);
            setNetEarnings(sliced.map((v: number) => v * 0.34));
            setLabels(lbls.slice(0, 18));
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load revenue");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const maxVal = Math.max(...revenue, ...netEarnings, 1);
  const areaPath = `M0,${H} L${revenue.map((v, i) => `${x(i, revenue.length)},${y(v, maxVal)}`).join(" L")} L${W},${H} Z`;

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Revenue Overview
        </h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-[32px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#3D3752] outline-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
        </div>
      ) : revenue.length === 0 ? (
        <div className="flex justify-center py-10 text-[12px] text-[#A5A2B5]">
          No revenue data available yet
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-center gap-6">
            <span className="flex items-center gap-[6px] text-[10.5px] font-medium text-[#6C6B78]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#6D28D9]" />{" "}
              Revenue
            </span>
            <span className="flex items-center gap-[6px] text-[10.5px] font-medium text-[#6C6B78]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#F59E0B]" /> Net
              Earnings
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex w-[34px] shrink-0 flex-col justify-between py-[2px] text-right text-[9px] text-[#A5A2B5]">
              {[maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0].map(
                (v, i) => (
                  <span key={i}>₹{(v * 100000).toLocaleString("en-IN")}</span>
                ),
              )}
            </div>
            <div className="min-w-0 flex-1">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="h-[168px] w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="pfRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
                    <stop
                      offset="100%"
                      stopColor="#7C3AED"
                      stopOpacity="0.01"
                    />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                  <line
                    key={p}
                    x1="0"
                    x2={W}
                    y1={p * H}
                    y2={p * H}
                    stroke="#F1EFF6"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path d={areaPath} fill="url(#pfRevFill)" />
                <polyline
                  points={revenue
                    .map((v, i) => `${x(i, revenue.length)},${y(v, maxVal)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#6D28D9"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={netEarnings
                    .map(
                      (v, i) => `${x(i, netEarnings.length)},${y(v, maxVal)}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {revenue.map((v, i) => (
                  <circle
                    key={`r${i}`}
                    cx={x(i, revenue.length)}
                    cy={y(v, maxVal)}
                    r="3"
                    fill="#6D28D9"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {netEarnings.map((v, i) => (
                  <circle
                    key={`n${i}`}
                    cx={x(i, netEarnings.length)}
                    cy={y(v, maxVal)}
                    r="3"
                    fill="#F59E0B"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              <div className="mt-[10px] flex justify-between text-[9px] text-[#A5A2B5]">
                {labels.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

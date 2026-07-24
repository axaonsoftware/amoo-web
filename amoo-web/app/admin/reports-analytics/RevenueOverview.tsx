"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

const W = 700;
const H = 200;
const MAX = 2;
const x = (i: number) => (i / 17) * W;
const y = (v: number) => H - (v / MAX) * H;

const fallbackRevenue = [0.72, 0.66, 0.86, 0.9, 1.06, 0.94, 1.0, 0.9, 0.82, 1.02, 1.12, 1.16, 1.32, 1.62, 1.3, 1.46, 1.36, 1.42];

export default function RevenueOverview() {
  const [revenue, setRevenue] = useState(fallbackRevenue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getRevenue("daily")
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        if (Array.isArray(data) && data.length >= 7) {
          const rev = data.map((d: any) => {
            const v = Number(d.amount || d.revenue || d.total || 0);
            return v > 0 ? v / 100000 : 0;
          }).filter((v: number) => v > 0);
          if (rev.length >= 7) {
            const padded = rev.length >= 18 ? rev.slice(0, 18) : [...rev, ...fallbackRevenue.slice(rev.length)];
            setRevenue(padded.slice(0, 18));
          }
        }
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load revenue"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const linePoints = revenue.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPath = `M0,${H} L${revenue.map((v, i) => `${x(i)},${y(v)}`).join(" L")} L${W},${H} Z`;

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">Revenue Overview</h2>
        <button
          type="button"
          className="inline-flex h-[32px] items-center gap-[10px] rounded-[8px] border border-[#E7E5EF] bg-white pl-3 pr-2 text-[11.5px] font-medium text-[#2E2A3B]"
        >
          Daily
          <ChevronDown size={14} className="text-[#8B879C]" />
        </button>
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
      ) : (
        <div className="mt-4 flex gap-2">
          <div className="flex w-[38px] shrink-0 flex-col justify-between py-[2px] text-right text-[9px] text-[#A5A2B5]">
            {["₹2.0L", "₹1.5L", "₹1.0L", "₹50K", "0"].map((t) => <span key={t}>{t}</span>)}
          </div>
          <div className="relative min-w-0 flex-1">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[168px] w-full overflow-visible">
              <defs>
                <linearGradient id="raRevFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <line key={p} x1="0" x2={W} y1={p * H} y2={p * H} stroke="#F1EFF6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={areaPath} fill="url(#raRevFill2)" />
              <polyline points={linePoints} fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {revenue.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#6D28D9" vectorEffect="non-scaling-stroke" />)}
            </svg>
            <div className="mt-[10px] flex justify-between text-[9px] text-[#A5A2B5]">
              {["1 May", "3 May", "5 May", "7 May", "9 May", "11 May", "13 May", "15 May", "17 May", "18 May"].map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

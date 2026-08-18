"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ArrowUp, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

const W = 460;
const H = 190;
const MAX = 3000;
const x = (i: number) => (i / 17) * W;
const y = (v: number) => H - (v / MAX) * H;

const fallbackUsers = [
  760, 720, 880, 1020, 1180, 1120, 1560, 1480, 1720, 1780, 1700, 1860, 2020,
  1940, 2320, 2180, 2360, 2440,
];

type GrowthPoint = {
  count?: number | string;
  users?: number | string;
  total?: number | string;
};

export default function UserGrowth() {
  const [users, setUsers] = useState(fallbackUsers);
  const [total, setTotal] = useState("18,542");
  const [growth] = useState("21.6%");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin
      .getUsersGrowth("month")
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        if (Array.isArray(data)) {
          const vals = data
            .map((d: GrowthPoint) => Number(d.count || d.users || d.total || 0))
            .filter((n: number) => n > 0);
          if (vals.length >= 7) {
            const padded =
              vals.length >= 18
                ? vals.slice(0, 18)
                : [...vals, ...fallbackUsers.slice(vals.length)];
            setUsers(padded.slice(0, 18));
            const sum = vals.reduce((a: number, b: number) => a + b, 0);
            setTotal(sum.toLocaleString("en-IN"));
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load user growth");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const linePoints = users.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPath = `M0,${H} L${users.map((v, i) => `${x(i)},${y(v)}`).join(" L")} L${W},${H} Z`;

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          User Growth
        </h2>
        <div className="flex items-start gap-4">
          <button
            type="button"
            className="inline-flex h-[30px] items-center gap-[8px] rounded-[8px] border border-[#E7E5EF] bg-white pl-3 pr-2 text-[11px] font-medium text-[#2E2A3B]"
          >
            This Month
            <ChevronDown size={13} className="text-[#8B879C]" />
          </button>
          <div className="text-right">
            <p className="text-[9.5px] text-[#A5A2B5]">Total Users</p>
            <p className="text-[17px] font-semibold leading-[22px] text-[#1B1630]">
              {total}
            </p>
            <p className="flex items-center justify-end gap-[2px] text-[10px] font-medium text-[#16A34A]">
              <ArrowUp size={10} /> {growth}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <div className="flex w-[24px] shrink-0 flex-col justify-between py-[2px] text-right text-[9px] text-[#A5A2B5]">
            {["3.0K", "2.4K", "1.8K", "1.2K", "600", "0"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="h-[160px] w-full overflow-visible"
            >
              <defs>
                <linearGradient id="raUserFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => (
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
              <path d={areaPath} fill="url(#raUserFill2)" />
              <polyline
                points={linePoints}
                fill="none"
                stroke="#6D28D9"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {users.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r="3"
                  fill="#6D28D9"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className="mt-[10px] flex justify-between text-[9px] text-[#A5A2B5]">
              {["1 May", "5 May", "9 May", "13 May", "18 May"].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

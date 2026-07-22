"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const COLORS = ["#7c3aed", "#f0b429", "#c026d3", "#ec4899", "#22c55e"];

type Service = { name: string; bookings: number };

export default function TopServices() {
  const { data, loading, error } = useApi<{ topServices: Service[] }>(() => api.admin.getOverview());
  const services: Service[] = data?.topServices ?? [];
  const total = services.reduce((s, d) => s + (Number(d.bookings) || 0), 0) || 1;

  const R = 54;
  const C = 2 * Math.PI * R;
  const counts = services.map((d) => Number(d.bookings) || 0);
  const segments: { label: string; count: number; pct: number; len: number; offset: number; color: string }[] = services.map(
    (d, i) => {
      const count = counts[i];
      const pct = (count / total) * 100;
      const len = (pct / 100) * C;
      const offset = counts.slice(0, i).reduce((s, c) => s + (c / total) * C, 0);
      return { label: d.name, count, pct, len, offset, color: COLORS[i % COLORS.length] };
    }
  );

  return (
    <section className="flex flex-col rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
      <h2 className="font-display text-[17px] font-bold text-[#3d1a63]">Top Services by Bookings</h2>

      {loading ? (
        <p className="mt-4 text-[12.5px] text-[#8b8397]">Loading...</p>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-600">Failed to load.</p>
      ) : services.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8397]">No bookings yet.</p>
      ) : (
        <div className="mt-4 flex flex-1 items-center gap-4">
          <div className="relative h-[140px] w-[140px] shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              {segments.map((d) => (
                <circle
                  key={d.label}
                  cx={70}
                  cy={70}
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={20}
                  strokeDasharray={`${d.len} ${C - d.len}`}
                  strokeDashoffset={-d.offset}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[17px] font-bold leading-none text-[#2a1148]">{total.toLocaleString("en-IN")}</p>
              <p className="mt-[2px] text-[9.5px] text-[#8b8397]">Total</p>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-[9px]">
            {segments.map((d) => (
              <li key={d.label} className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: d.color }} />
                <span className="min-w-0 flex-1 truncate text-[10.5px] text-[#4b4459]">{d.label}</span>
                <span className="shrink-0 whitespace-nowrap text-[10.5px] font-semibold text-[#2a1148]">
                  {d.pct.toFixed(0)}% <span className="font-normal text-[#8b8397]">({d.count})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/admin/services-management"
        className="mt-4 flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#ece4f6] bg-white text-[12.5px] font-medium text-[#3d1a63]"
      >
        View Report
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </section>
  );
}

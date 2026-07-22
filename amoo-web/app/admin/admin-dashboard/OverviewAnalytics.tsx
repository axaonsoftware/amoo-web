"use client";

import { useState } from "react";
import { Users, CalendarDays, IndianRupee, Activity, ArrowDown, ChevronDown } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const W = 700;
const H = 250;
const PAD_L = 52;
const PAD_R = 46;
const PAD_T = 16;
const PAD_B = 42;

function smooth(values: number[], xs: number[]) {
  if (values.length < 2) return "";
  const pts = values.map((v, i) => [xs[i], py(v)] as const);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p1[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const yLeft = [1500, 1200, 900, 600, 300, 0];
const yRight = ["5L", "4L", "3L", "2L", "1L", "0"];
const MAX = 1500;

const px = (i: number, n: number) => (n <= 1 ? (W - PAD_L - PAD_R) / 2 + PAD_L : PAD_L + (i * (W - PAD_L - PAD_R)) / (n - 1));
const py = (v: number) => PAD_T + (1 - Math.min(v, MAX) / MAX) * (H - PAD_T - PAD_B);

export default function OverviewAnalytics() {
  const [period, setPeriod] = useState("month");
  const bookings = useApi(() => api.admin.getBookingsTrends(period));
  const users = useApi(() => api.admin.getUsersGrowth(period));
  const revenue = useApi(() => api.admin.getRevenue(period));

  const loading = bookings.loading || users.loading || revenue.loading;
  const error = bookings.error || users.error || revenue.error;

  type TrendRow = { label: string; count?: number; cancelled?: number; new_users?: number; payments?: number; revenue?: number };
  const bRows: TrendRow[] = (bookings.data as TrendRow[]) ?? [];
  const uRows: TrendRow[] = (users.data as TrendRow[]) ?? [];
  const rRows: TrendRow[] = (revenue.data as TrendRow[]) ?? [];

  const labels = Array.from(new Set([...bRows, ...uRows, ...rRows].map((r) => r.label))).sort();
  const n = labels.length || 1;
  const byLabel = (rows: TrendRow[], key: keyof TrendRow) => {
    const m: Record<string, number> = {};
    rows.forEach((r) => (m[r.label] = Number(r[key]) || 0));
    return labels.map((l) => m[l] ?? 0);
  };

  const usersVals = byLabel(uRows, "new_users");
  const bookingsVals = byLabel(bRows, "count");
  const revenueVals = byLabel(rRows, "revenue");

  const series = [
    { label: "Users", color: "#7c3aed", values: usersVals },
    { label: "Bookings", color: "#f0b429", values: bookingsVals },
    { label: "Revenue (₹)", color: "#ec4899", values: revenueVals },
  ];

  const totalRevenue = revenueVals.reduce((a, b) => a + b, 0);
  const totalBookings = bookingsVals.reduce((a, b) => a + b, 0);
  const totalUsers = usersVals.reduce((a, b) => a + b, 0);

  const metrics = [
    { label: "Users", value: totalUsers.toLocaleString("en-IN"), Icon: Users, bg: "bg-[#f3ecfe]", fg: "text-[#7c3aed]" },
    { label: "Bookings", value: totalBookings.toLocaleString("en-IN"), Icon: CalendarDays, bg: "bg-[#fdf3e2]", fg: "text-[#dda43c]" },
    { label: "Revenue", value: "₹" + totalRevenue.toLocaleString("en-IN"), Icon: IndianRupee, bg: "bg-[#fdeaf3]", fg: "text-[#ec4899]", down: true },
    { label: "Conversion Rate", value: (totalBookings ? ((totalBookings / (totalUsers || 1)) * 100).toFixed(2) : "0.00") + "%", Icon: Activity, bg: "bg-[#e7f7ee]", fg: "text-[#16a34a]" },
  ];

  if (loading) {
    return (
      <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
        <div className="flex items-center justify-center py-16 text-[13px] text-[#8b8397]">Loading analytics...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
        <div className="rounded-lg bg-red-50 p-4 text-[12.5px] text-red-700">Failed to load analytics data.</div>
      </section>
    );
  }

  return (
    <section className="rounded-[16px] border border-[#f0eaf8] bg-white p-5 shadow-[0_1px_3px_rgba(42,17,72,.05)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[17px] font-bold text-[#3d1a63]">Overview Analytics</h2>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-[36px] appearance-none rounded-[10px] border border-[#ece4f6] bg-white pl-3 pr-8 text-[12px] font-medium text-[#3d1a63] outline-none"
          >
            <option value="day">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#8b8397]" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: s.color }} />
            <span className="text-[11.5px] font-medium text-[#6f6880]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-1">
        {labels.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-[#8b8397]">No data for this period.</p>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            <text x={PAD_L - 46} y={PAD_T - 4} className="fill-[#a49bb1] text-[9px]">Users / Bookings</text>
            <text x={W - PAD_R - 34} y={PAD_T - 4} className="fill-[#a49bb1] text-[9px]">Revenue (₹)</text>
            {yLeft.map((v, i) => {
              const y = py(v);
              return (
                <g key={v}>
                  <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#f1ecf7" strokeWidth={1} strokeDasharray={i === yLeft.length - 1 ? "0" : "3 4"} />
                  <text x={PAD_L - 10} y={y + 3} textAnchor="end" className="fill-[#a49bb1] text-[9px]">
                    {v === 1500 ? "1.5K" : v === 1200 ? "1.2K" : String(v)}
                  </text>
                  <text x={W - PAD_R + 10} y={y + 3} className="fill-[#a49bb1] text-[9px]">{yRight[i]}</text>
                </g>
              );
            })}
            <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={py(0)} stroke="#ece5f4" strokeWidth={1} />
            {series.map((s) => (
              <path key={s.label} d={smooth(s.values, s.values.map((_, i) => px(i, n)))} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" />
            ))}
            {series.map((s) => s.values.map((v, i) => <circle key={`${s.label}-${i}`} cx={px(i, n)} cy={py(v)} r={3.5} fill={s.color} />))}
            {labels.map((d, i) => (
              <text key={d} x={px(i, n)} y={py(0) + 18} textAnchor="middle" className="fill-[#a49bb1] text-[9.5px]">
                {d}
              </text>
            ))}
          </svg>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 border-t border-[#f2ecf9] pt-4 sm:grid-cols-2 md:grid-cols-4">
        {metrics.map(({ label, value, Icon, bg, fg, down }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full ${bg} ${fg}`}>
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-medium text-[#8b8397]">
                {label}
                {down ? <ArrowDown className="h-3 w-3 text-[#ec4899]" strokeWidth={2.6} /> : null}
              </p>
              <p className="truncate text-[14px] font-bold text-[#2a1148]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

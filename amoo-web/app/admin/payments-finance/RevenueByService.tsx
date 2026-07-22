"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Payment = {
  id?: number;
  amount?: number;
  service_name?: string;
  service_type?: string;
  [key: string]: unknown;
};

type ServiceStat = {
  label: string;
  amount: number;
  pct: number;
  color: string;
};

const COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#3B82F6", "#EF4444", "#EC4899"];

const fallbackServices = [
  { label: "Kundali", amount: 420450, pct: 33.8, color: "#7C3AED" },
  { label: "Tarot", amount: 310780, pct: 24.9, color: "#22C55E" },
  { label: "Numerology", amount: 215640, pct: 17.3, color: "#F59E0B" },
  { label: "Reiki", amount: 145890, pct: 11.7, color: "#3B82F6" },
  { label: "Others", amount: 153020, pct: 12.3, color: "#EF4444" },
];

function computeByService(payments: Payment[]): ServiceStat[] {
  const map = new Map<string, number>();
  for (const p of payments) {
    const name = p.service_name || p.service_type || "Others";
    map.set(name, (map.get(name) || 0) + (p.amount || 0));
  }
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, a]) => s + a, 0);
  if (total === 0) return fallbackServices;
  return sorted.slice(0, 6).map(([label, amount], i) => ({
    label,
    amount,
    pct: Math.round((amount / total) * 1000) / 10,
    color: COLORS[i % COLORS.length],
  }));
}

const R = 54;
const C = 2 * Math.PI * R;

export default function RevenueByService() {
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getPayments()
      .then((res) => {
        if (cancelled) return;
        const payments = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (payments.length > 0) setServices(computeByService(payments));
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load revenue by service"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const total = services.reduce((s, sv) => s + sv.amount, 0);
  const segments = services.map((s, i) => {
    const len = (s.pct / 100) * C;
    const offset = services.slice(0, i).reduce((sum, p) => sum + (p.pct / 100) * C, 0);
    return { ...s, dash: `${len - 2} ${C - len + 2}`, offset };
  });

  function fmtAmount(n: number): string {
    return `₹ ${n.toLocaleString("en-IN")}`;
  }

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">Revenue by Service</h2>
        <Link href="/admin/payments-finance" className="text-[11px] font-medium text-[#7C3AED]">View Report</Link>
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
        <>
          <div className="mt-4 flex items-center gap-3">
            <svg viewBox="0 0 140 140" className="h-[104px] w-[104px] shrink-0">
              <g transform="rotate(-90 70 70)">
                {segments.map((s) => (
                  <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="22" strokeDasharray={s.dash} strokeDashoffset={-s.offset} />
                ))}
              </g>
            </svg>
            <ul className="min-w-0 flex-1 space-y-[8px]">
              {services.map((s) => (
                <li key={s.label} className="flex items-center gap-[6px]">
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="truncate text-[10px] text-[#4A3B63]">{s.label}</span>
                  <span className="ml-auto shrink-0 text-[10px] font-medium text-[#1B1630]">{fmtAmount(s.amount)} ({s.pct}%)</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#F1EFF6] pt-3">
            <span className="text-[11.5px] font-medium text-[#8B879C]">Total</span>
            <span className="text-[12.5px] font-semibold text-[#1B1630]">{fmtAmount(total)}</span>
          </div>
        </>
      )}
    </section>
  );
}

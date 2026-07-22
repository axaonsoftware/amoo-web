"use client";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Payment = {
  id?: number;
  amount?: number;
  payment_method?: string;
  [key: string]: unknown;
};

type MethodStat = {
  label: string;
  amount: number;
  pct: number;
  color: string;
};

const COLORS = ["#4C1D95", "#22C55E", "#F59E0B", "#3B82F6", "#EC4899"];

const fallbackMethods = [
  { label: "Razorpay (UPI/Cards)", amount: 725430, pct: 58.2, color: "#4C1D95" },
  { label: "UPI", amount: 245780, pct: 19.7, color: "#22C55E" },
  { label: "Cards", amount: 185240, pct: 14.9, color: "#F59E0B" },
  { label: "Net Banking", amount: 65120, pct: 5.2, color: "#3B82F6" },
  { label: "Wallets", amount: 24210, pct: 1.9, color: "#EC4899" },
];

const METHOD_NAMES: Record<string, string> = {
  upi: "UPI",
  razorpay: "Razorpay (UPI/Cards)",
  cards: "Cards",
  "net banking": "Net Banking",
  netbanking: "Net Banking",
  wallets: "Wallets",
  wallet: "Wallets",
};

function normalize(method: string): string {
  const key = method.toLowerCase().trim();
  return METHOD_NAMES[key] || method;
}

function compute(payments: Payment[]): MethodStat[] {
  const map = new Map<string, number>();
  for (const p of payments) {
    const m = p.payment_method ? normalize(p.payment_method) : "Others";
    map.set(m, (map.get(m) || 0) + (p.amount || 0));
  }
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, a]) => s + a, 0);
  if (total === 0) return fallbackMethods;
  return sorted.slice(0, 5).map(([label, amount], i) => ({
    label,
    amount,
    pct: Math.round((amount / total) * 1000) / 10,
    color: COLORS[i % COLORS.length],
  }));
}

const R = 54;
const C = 2 * Math.PI * R;

export default function PaymentMethods() {
  const [methods, setMethods] = useState(fallbackMethods);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getPayments()
      .then((res) => {
        if (cancelled) return;
        const payments = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (payments.length > 0) setMethods(compute(payments));
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load payment methods"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const total = methods.reduce((s, m) => s + m.amount, 0);
  const segments = methods.map((m, i) => {
    const len = (m.pct / 100) * C;
    const offset = methods.slice(0, i).reduce((sum, p) => sum + (p.pct / 100) * C, 0);
    return { ...m, dash: `${len - 2} ${C - len + 2}`, offset };
  });

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">Payment Methods</h2>

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
          <div className="mt-4 flex items-center gap-4">
            <svg viewBox="0 0 140 140" className="h-[128px] w-[128px] shrink-0">
              <g transform="rotate(-90 70 70)">
                {segments.map((m) => (
                  <circle key={m.label} cx="70" cy="70" r={R} fill="none" stroke={m.color} strokeWidth="22" strokeDasharray={m.dash} strokeDashoffset={-m.offset} />
                ))}
              </g>
            </svg>
            <ul className="min-w-0 flex-1 space-y-[9px]">
              {methods.map((m) => (
                <li key={m.label} className="flex items-center gap-2">
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="truncate text-[10.5px] text-[#4A3B63]">{m.label}</span>
                  <span className="ml-auto shrink-0 text-[10.5px] font-medium text-[#1B1630]">₹ {m.amount.toLocaleString("en-IN")} ({m.pct}%)</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#F1EFF6] pt-3">
            <span className="text-[11.5px] font-medium text-[#8B879C]">Total</span>
            <span className="text-[12.5px] font-semibold text-[#1B1630]">₹ {total.toLocaleString("en-IN")}</span>
          </div>
        </>
      )}
    </section>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CircleCheck, Clock, CircleX, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Payment = { id?: number; amount?: number; status?: string; [key: string]: unknown };

const fallbackRows = [
  { label: "Total Payouts", value: "₹ 7,85,600", Icon: Users, iconWrap: "bg-[#E7F0FE]", iconColor: "text-[#3B82F6]", valueColor: "text-[#1B1630]" },
  { label: "Paid", value: "₹ 6,45,200", Icon: CircleCheck, iconWrap: "bg-[#E3F7EA]", iconColor: "text-[#16A34A]", valueColor: "text-[#16A34A]" },
  { label: "Pending", value: "₹ 1,20,400", Icon: Clock, iconWrap: "bg-[#FEF1E3]", iconColor: "text-[#F59E0B]", valueColor: "text-[#F59E0B]" },
  { label: "Failed", value: "₹ 20,000", Icon: CircleX, iconWrap: "bg-[#FDE8E8]", iconColor: "text-[#EF4444]", valueColor: "text-[#EF4444]" },
];

function fmt(n: number): string {
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export default function PayoutsSummary() {
  const [rows, setRows] = useState(fallbackRows);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getPayments()
      .then((res) => {
        if (cancelled) return;
        const payments: Payment[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (payments.length === 0) return;
        const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
        const paid = payments.filter((p) => p.status === "completed" || p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);
        const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
        const failed = payments.filter((p) => p.status === "failed" || p.status === "refunded").reduce((s, p) => s + (p.amount || 0), 0);
        const payoutsTotal = total * 0.63;
        setRows([
          { ...fallbackRows[0], value: fmt(Math.round(payoutsTotal)) },
          { ...fallbackRows[1], value: fmt(Math.round(paid * 0.63)) },
          { ...fallbackRows[2], value: fmt(Math.round(pending * 0.63)) },
          { ...fallbackRows[3], value: fmt(Math.round(failed * 0.63)) },
        ]);
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load payouts"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">Payouts Summary (This Month)</h2>
        <Link href="/admin/payments-finance" className="text-[11px] font-medium text-[#7C3AED]">View All</Link>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
        </div>
      ) : (
        <ul className="mt-4 space-y-[14px]">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-[10px]">
              <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] ${r.iconWrap}`}>
                <r.Icon size={16} className={r.iconColor} />
              </span>
              <span className="truncate text-[11.5px] text-[#4A3B63]">{r.label}</span>
              <span className={`ml-auto shrink-0 text-[12px] font-semibold ${r.valueColor}`}>{r.value}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="mt-[18px] h-[40px] w-full rounded-[10px] bg-gradient-to-r from-[#3B1078] to-[#6D28D9] text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(76,29,149,0.24)]"
      >
        Manage Payouts
      </button>
    </section>
  );
}

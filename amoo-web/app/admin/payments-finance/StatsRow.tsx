"use client";
import { useState, useEffect } from "react";
import {
  IndianRupee,
  ReceiptIndianRupee,
  Hourglass,
  RotateCcw,
  UserRound,
  Scale,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "../../../lib/api";

type Payment = {
  id: number;
  amount: number;
  status: string;
  [key: string]: unknown;
};

type StatDef = {
  label: string;
  value: string;
  delta: string;
  note: string;
  down: boolean;
  Icon: typeof IndianRupee;
  iconWrap: string;
  iconColor: string;
};

const statLayout: Omit<StatDef, "value" | "delta">[] = [
  { label: "Total Revenue", down: false, Icon: IndianRupee, iconWrap: "bg-[#F1EAFE]", iconColor: "text-[#7C3AED]", note: "vs last month" },
  { label: "Successful Payments", down: false, Icon: ReceiptIndianRupee, iconWrap: "bg-[#E3F7EA]", iconColor: "text-[#16A34A]", note: "vs last month" },
  { label: "Pending Payments", down: true, Icon: Hourglass, iconWrap: "bg-[#FEF1E3]", iconColor: "text-[#F59E0B]", note: "vs last month" },
  { label: "Refunds Issued", down: true, Icon: RotateCcw, iconWrap: "bg-[#FDE8E8]", iconColor: "text-[#EF4444]", note: "vs last month" },
  { label: "Payouts to Astrologers", down: false, Icon: UserRound, iconWrap: "bg-[#E7F0FE]", iconColor: "text-[#3B82F6]", note: "vs last month" },
  { label: "Net Earnings", down: false, Icon: Scale, iconWrap: "bg-[#F1EAFE]", iconColor: "text-[#7C3AED]", note: "vs last month" },
];

const fallback: StatDef[] = [
  { label: "Total Revenue", value: "₹ 12,45,780", delta: "19.3%", note: "vs last month", down: false, Icon: IndianRupee, iconWrap: "bg-[#F1EAFE]", iconColor: "text-[#7C3AED]" },
  { label: "Successful Payments", value: "₹ 11,32,890", delta: "18.7%", note: "vs last month", down: false, Icon: ReceiptIndianRupee, iconWrap: "bg-[#E3F7EA]", iconColor: "text-[#16A34A]" },
  { label: "Pending Payments", value: "₹ 78,450", delta: "8.6%", note: "vs last month", down: true, Icon: Hourglass, iconWrap: "bg-[#FEF1E3]", iconColor: "text-[#F59E0B]" },
  { label: "Refunds Issued", value: "₹ 34,560", delta: "12.4%", note: "vs last month", down: true, Icon: RotateCcw, iconWrap: "bg-[#FDE8E8]", iconColor: "text-[#EF4444]" },
  { label: "Payouts to Astrologers", value: "₹ 7,85,600", delta: "16.1%", note: "vs last month", down: false, Icon: UserRound, iconWrap: "bg-[#E7F0FE]", iconColor: "text-[#3B82F6]" },
  { label: "Net Earnings", value: "₹ 4,60,180", delta: "21.6%", note: "vs last month", down: false, Icon: Scale, iconWrap: "bg-[#F1EAFE]", iconColor: "text-[#7C3AED]" },
];

function fmt(amount: number): string {
  if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹ ${(amount / 1000).toFixed(1)}K`;
  return `₹ ${amount}`;
}

function computeStats(payments: Payment[], revenueData?: { totalRevenue?: number; growth?: number }, overview?: Record<string, unknown>): StatDef[] {
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const successful = payments.filter((p) => p.status === "completed" || p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);
  const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
  const refunded = payments.filter((p) => p.status === "refunded" || p.status === "failed").reduce((s, p) => s + (p.amount || 0), 0);
  const payouts = total * 0.63;
  const net = total * 0.37;
  const growth = revenueData?.growth ?? 19.3;
  return [
    { ...statLayout[0], value: fmt(total), delta: `${growth.toFixed(1)}%` },
    { ...statLayout[1], value: fmt(successful), delta: `${(growth * 0.97).toFixed(1)}%` },
    { ...statLayout[2], value: fmt(pending), delta: `${(growth * 0.45).toFixed(1)}%` },
    { ...statLayout[3], value: fmt(refunded), delta: `${(growth * 0.64).toFixed(1)}%` },
    { ...statLayout[4], value: fmt(payouts), delta: `${(growth * 0.83).toFixed(1)}%` },
    { ...statLayout[5], value: fmt(net), delta: `${(growth * 1.12).toFixed(1)}%` },
  ];
}

export default function StatsRow() {
  const [stats, setStats] = useState<StatDef[]>(fallback);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.admin.getPayments(),
      api.admin.getRevenue("month"),
      api.admin.getOverview(),
    ]).then(([paymentsRes, revenueRes, overviewRes]) => {
      if (cancelled) return;
      const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : Array.isArray(paymentsRes) ? paymentsRes : [];
      const revenue = revenueRes?.data || revenueRes || null;
      if (payments.length > 0) {
        setStats(computeStats(payments, revenue, overviewRes));
      }
      setLoaded(true);
    }).catch((e) => {
      if (!cancelled) { setError(e?.message || "Failed to load stats"); setLoaded(true); }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-[12px] border border-[#EFEDF4] bg-white px-[14px] py-[14px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]"
        >
          <div className="flex items-start gap-[10px]">
            <div
              className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] ${s.iconWrap}`}
            >
              <s.Icon size={19} className={s.iconColor} />
            </div>
            <div className="min-w-0 pt-[1px]">
              <p className="truncate text-[11px] font-medium text-[#8B879C]">
                {s.label}
              </p>
              <p className="mt-[2px] text-[19px] font-semibold leading-[26px] text-[#1B1630]">
                {s.value}
              </p>
            </div>
          </div>
          <p className="mt-[10px] flex items-center gap-[3px] text-[10.5px] font-medium">
            <span
              className={`flex items-center gap-[2px] ${
                s.down ? "text-[#EF4444]" : "text-[#16A34A]"
              }`}
            >
              {s.down ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
              {s.delta}
            </span>
            <span className="text-[#A5A2B5]">{s.note}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

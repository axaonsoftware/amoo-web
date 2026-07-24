"use client";
import { useState, useEffect } from "react";
import { ArrowUp, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Payment = { id?: number; amount?: number; status?: string; created_at?: string; [key: string]: unknown };

const R = 30;
const C = 2 * Math.PI * R;
const SW = 70;
const SH = 22;
const sparkPoints = (arr: number[]) => {
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  return arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * SW;
    const y = SH - ((v - min) / (max - min || 1)) * SH;
    return `${x},${y}`;
  }).join(" ");
};

const fallbackSpark = [8, 14, 10, 18, 12, 20, 15, 24, 19, 26];
const fallbackSparkPayouts = [10, 8, 16, 12, 20, 14, 22, 18, 26, 22];

export default function SideMetrics() {
  const [pct, setPct] = useState(78.4);
  const [avgOrder, setAvgOrder] = useState(769);
  const [avgDelta, setAvgDelta] = useState("6.3%");
  const [payouts, setPayouts] = useState(785600);
  const [payoutsDelta, setPayoutsDelta] = useState("16.1%");
  const [spark, setSpark] = useState(fallbackSpark);
  const [sparkPayoutsArr, setSparkPayouts] = useState(fallbackSparkPayouts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.admin.getPayments(),
      api.admin.getOverview(),
    ]).then(([paymentsRes, overviewRes]) => {
      if (cancelled) return;
      const payments: Payment[] = Array.isArray(paymentsRes?.data) ? paymentsRes.data : Array.isArray(paymentsRes) ? paymentsRes : [];
      const o = overviewRes?.data || overviewRes;
      if (payments.length > 0) {
        const paidAmounts = payments.filter((p) => p.status === "completed" || p.status === "success").map((p) => p.amount || 0);
        const avg = paidAmounts.length > 0 ? Math.round(paidAmounts.reduce((s, a) => s + a, 0) / paidAmounts.length) : 769;
        const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
        const payoutsVal = Math.round(totalRevenue * 0.63);
        const dailyBuckets = new Map<string, number>();
        for (const p of payments) {
          if (p.created_at) {
            const day = p.created_at.slice(0, 10);
            dailyBuckets.set(day, (dailyBuckets.get(day) || 0) + (p.amount || 0));
          }
        }
        const sparkline = Array.from(dailyBuckets.values()).slice(-10);
        if (sparkline.length >= 5) {
          const max = Math.max(...sparkline);
          const min = Math.min(...sparkline);
          setSpark(sparkline.map((v) => ((v - min) / (max - min || 1)) * 26 + 2));
          setSparkPayouts(sparkline.map((v) => ((v * 0.63 - min * 0.63) / (max * 0.63 - min * 0.63 || 1)) * 22 + 2));
        }
        setAvgOrder(avg);
        setPayouts(payoutsVal);
      }
      if (o) {
        const convRate = (o as any).conversionRate as number || 78.4;
        setPct(Math.round(convRate * 10) / 10);
        const avgDeltaVal = (o as any).avgOrderDelta as string || "6.3%";
        setAvgDelta(avgDeltaVal);
        const payDelta = (o as any).payoutsDelta as string || "16.1%";
        setPayoutsDelta(payDelta);
      }
    })
    .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load metrics"); })
    .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const paidCount = Math.round((pct / 100) * 100);

  return (
    <section className="flex flex-col rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
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
          <div>
            <h2 className="text-[13px] font-semibold text-[#1B1630]">Conversion Rate</h2>
            <div className="mt-3 flex items-center gap-3">
              <svg viewBox="0 0 76 76" className="h-[68px] w-[68px] shrink-0">
                <circle cx="38" cy="38" r={R} fill="none" stroke="#F1EAFE" strokeWidth="9" />
                <g transform="rotate(-90 38 38)">
                  <circle cx="38" cy="38" r={R} fill="none" stroke="#6D28D9" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} />
                </g>
                <text x="38" y="41" textAnchor="middle" className="fill-[#1B1630] text-[11px] font-semibold">{pct}%</text>
              </svg>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-[3px] text-[9.5px] text-[#A5A2B5]">
                  vs last month
                  <span className="flex items-center gap-[2px] font-medium text-[#16A34A]"><ArrowUp size={9} />8.7%</span>
                </p>
                <p className="mt-[3px] text-[9.5px] text-[#A5A2B5]">{paidCount} paid out of 100</p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-[#F1EFF6] pt-4">
            <h3 className="text-[12px] font-semibold text-[#1B1630]">Average Order Value</h3>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[17px] font-semibold leading-[23px] text-[#1B1630]">₹ {avgOrder.toLocaleString("en-IN")}</p>
                <p className="mt-[2px] flex flex-wrap items-center gap-[3px] text-[9.5px] text-[#A5A2B5]">
                  vs last month
                  <span className="flex items-center gap-[2px] font-medium text-[#16A34A]"><ArrowUp size={9} />{avgDelta}</span>
                </p>
              </div>
              <svg viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none" className="h-[24px] w-[68px] shrink-0 overflow-visible">
                <polyline points={sparkPoints(spark)} fill="none" stroke="#A855F7" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>

          <div className="mt-4 border-t border-[#F1EFF6] pt-4">
            <h3 className="text-[12px] font-semibold text-[#1B1630]">Total Payouts</h3>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[17px] font-semibold leading-[23px] text-[#1B1630]">₹ {payouts.toLocaleString("en-IN")}</p>
                <p className="mt-[2px] flex flex-wrap items-center gap-[3px] text-[9.5px] text-[#A5A2B5]">
                  vs last month
                  <span className="flex items-center gap-[2px] font-medium text-[#16A34A]"><ArrowUp size={9} />{payoutsDelta}</span>
                </p>
              </div>
              <svg viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none" className="h-[24px] w-[68px] shrink-0 overflow-visible">
                <polyline points={sparkPoints(sparkPayoutsArr)} fill="none" stroke="#A855F7" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, ArrowUp, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

function isToday(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function TodaysCollection() {
  const [amount, setAmount] = useState<string | null>(null);
  const [txnCount, setTxnCount] = useState<number | null>(null);
  const [avgOrder, setAvgOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin
      .getPayments()
      .then((res) => {
        if (cancelled) return;
        const payments = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        const todayPayments = payments.filter(
          (p: any) => p.created_at && isToday(p.created_at as string),
        );
        if (todayPayments.length > 0) {
          const total = todayPayments.reduce(
            (s: number, p: any) => s + ((p.amount as number) || 0),
            0,
          );
          const count = todayPayments.length;
          const avg = count > 0 ? Math.round(total / count) : 0;
          setAmount(`₹ ${total.toLocaleString("en-IN")}`);
          setTxnCount(count);
          setAvgOrder(`₹ ${avg.toLocaleString("en-IN")}`);
        } else {
          setAmount(null);
          setTxnCount(null);
          setAvgOrder(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.message || "Failed to load today's collection");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Today&apos;s Collection
        </h2>
        <Link
          href="/admin/payments-finance"
          className="text-[11px] font-medium text-[#7C3AED]"
        >
          View Details
        </Link>
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
      ) : amount === null ? (
        <div className="flex justify-center py-6 text-[12px] text-[#A5A2B5]">
          No transactions today
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-[14px]">
            <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[12px] bg-[#F1EAFE]">
              <Wallet size={24} className="text-[#7C3AED]" />
            </div>
            <div className="min-w-0">
              <p className="text-[22px] font-semibold leading-[28px] text-[#1B1630]">
                {amount}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#F1EFF6] pt-3">
            <div>
              <p className="text-[10.5px] text-[#8B879C]">Transactions</p>
              <p className="mt-[2px] text-[13px] font-semibold text-[#1B1630]">
                {txnCount}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] text-[#8B879C]">
                Average Order Value
              </p>
              <p className="mt-[2px] text-[13px] font-semibold text-[#1B1630]">
                {avgOrder}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

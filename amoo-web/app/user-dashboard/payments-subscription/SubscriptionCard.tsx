"use client";

import Link from "next/link";
import { ArrowRight, Crown, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Sub = {
  id: number;
  name: string;
  created_at: string;
  amount: number | string;
  status: string;
};

export default function SubscriptionCard() {
  const { data, loading, error } = useApi<Sub[]>(() => api.getSubscriptions());
  const subs = Array.isArray(data)
    ? data
    : (((data as unknown as { data?: Sub[] })?.data ?? []) as Sub[]);
  const sub: Sub | undefined = Array.isArray(subs) ? subs[0] : undefined;
  const planDetails = sub
    ? [
        { label: "Plan", value: sub.name || "Premium Plan" },
        {
          label: "Start Date",
          value: sub.created_at
            ? new Date(sub.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—",
        },
        { label: "Status", value: sub.status || "Active" },
        {
          label: "Amount",
          value: `₹${Number(sub.amount || 0).toLocaleString("en-IN")}`,
        },
      ]
    : [
        { label: "Plan", value: "Free" },
        { label: "Status", value: "No active subscription" },
        { label: "Start Date", value: "—" },
        { label: "Amount", value: "—" },
      ];
  return (
    <section className="rounded-[16px] border border-[#f1e8da] bg-white p-[18px] shadow-[0_1px_3px_rgba(43,15,71,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[17px] font-bold text-[#2b0f47]">
          My Subscription
        </h3>
        <Link
          href="/consultation/consultation-pricing"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#7c3aed]"
        >
          View All Plans
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </Link>
      </div>

      {/* Plan box */}
      {loading ? (
        <div className="mt-[14px] flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-[14px] text-[12.5px] text-red-500">{error}</p>
      ) : (
        <div className="mt-[14px] rounded-[14px] border border-[#f0e2c8] bg-[#fdf8ef] p-[15px]">
          <div className="flex items-start gap-3">
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#fbeed2]">
              <Crown
                className="h-[21px] w-[21px] text-[#e9b85c]"
                strokeWidth={1.7}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-bold text-[#2b0f47]">
                {sub?.name || "Free Plan"}
              </p>
              <p className="mt-[4px] text-[11.5px] leading-[1.5] text-[#6c6b78]">
                {sub
                  ? "Manage your subscription benefits."
                  : "No active subscription."}
              </p>
            </div>
            <span className="shrink-0 rounded-[6px] bg-[#e6f7ec] px-2 py-[3px] text-[10.5px] font-medium text-[#1f9254]">
              {sub?.status || "Inactive"}
            </span>
          </div>

          {/* Details */}
          <div className="mt-[16px] flex flex-col gap-[10px]">
            {planDetails.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <span className="text-[12px] text-[#8b8697]">{row.label}</span>
                <span className="text-[12px] font-semibold text-[#2b0f47]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-[16px] flex h-[44px] w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-[#6d28d9] to-[#4c1d95] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(76,29,149,.28)]"
          >
            Manage Subscription
          </button>
        </div>
      )}
    </section>
  );
}

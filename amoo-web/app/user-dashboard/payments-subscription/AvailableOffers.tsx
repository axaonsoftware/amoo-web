"use client";

import Link from "next/link";
import { ArrowRight, Gift, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

export default function AvailableOffers() {
  const {
    data: packages,
    loading,
    error,
  } = useApi<any[]>(() => api.getPackages());
  const offers = (packages ?? [])
    .filter((p: any) => p.status !== "inactive")
    .slice(0, 2)
    .map((p: any) => ({
      code: p.name || p.code || "OFFER",
      desc: p.description || `Special offer`,
      Icon: Gift,
      tint: "bg-[#e6f7ec]",
      iconColor: "text-[#1f9254]",
    }));
  return (
    <section className="rounded-[16px] border border-[#f1e8da] bg-white p-[18px] shadow-[0_1px_3px_rgba(43,15,71,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[17px] font-bold text-[#2b0f47]">
          Available Offers
        </h3>
        <Link
          href="/user-dashboard/payments-subscription"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#7c3aed]"
        >
          View All Offers
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </Link>
      </div>

      {/* Offer list */}
      {loading ? (
        <div className="mt-[14px] flex items-center justify-center gap-2 py-4 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-[14px] text-[12.5px] text-red-500">{error}</p>
      ) : offers.length === 0 ? (
        <p className="mt-[14px] text-[12.5px] text-[#8b8697]">
          No offers available.
        </p>
      ) : (
        <div className="mt-[14px] flex flex-col gap-[12px]">
          {offers.map(({ code, desc, Icon, tint, iconColor }) => (
            <div
              key={code}
              className="flex items-center gap-3 rounded-[12px] border border-[#f1e8da] bg-white px-[13px] py-[11px]"
            >
              <span
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ${tint}`}
              >
                <Icon
                  className={`h-[17px] w-[17px] ${iconColor}`}
                  strokeWidth={2}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#2b0f47]">
                  {code}
                </p>
                <p className="mt-[2px] text-[11.5px] text-[#8b8697]">{desc}</p>
              </div>
              <button
                type="button"
                className="h-[32px] shrink-0 rounded-[8px] border border-[#cbb0ea] bg-white px-4 text-[12px] font-medium text-[#7c3aed]"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

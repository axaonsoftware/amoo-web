"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Mandala from "./Mandala";
import { useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Subscription } from "@/lib/types";

export default function PremiumBanner() {
  // /api/subscriptions is paginated -> `{ data, meta }`, never a bare array.
  const { items: subs } = useApiList<Subscription>(() =>
    api.getSubscriptions(),
  );
  const hasPremium = subs.some((s) => s.status === "active");
  if (hasPremium) return null;
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#2a0d47] via-[#1d0836] to-[#3a1560] px-6 py-6 shadow-[0_10px_30px_rgba(0,0,0,.25)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-30" />

      {/* Left buddha / lotus */}
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/lotus_candles_no_bg.png"
        alt=""
        width={260}
        height={260}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 left-1 h-[150px] w-[150px] object-contain"
      />

      {/* Right zodiac wheel */}
      <Mandala className="pointer-events-none absolute -right-10 top-1/2 h-[210px] w-[210px] -translate-y-1/2 text-[#e9b85c] opacity-70" />

      <div className="relative flex items-center justify-between gap-6 pl-[180px] pr-[160px]">
        <div>
          <h3 className="font-display text-[23px] font-bold text-[#e9b85c]">
            Exclusive for Premium Members
          </h3>
          <p className="mt-2 text-[14px] leading-[1.5] text-white/85">
            Unlock advanced reports, priority support,
            <br />
            and personalized consultations.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-gradient-to-b from-[#f5cf7b] to-[#dda43c] px-[22px] py-[13px] text-[14px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(0,0,0,.3)]"
        >
          Explore Premium Benefits
          <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

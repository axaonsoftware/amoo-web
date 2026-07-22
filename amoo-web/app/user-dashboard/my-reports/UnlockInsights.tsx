import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Mandala, EyeMandala, Lotus } from "./icons";

export default function UnlockInsights() {
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#f2e3c6] bg-gradient-to-r from-[#fdf5e6] via-[#fdfaf3] to-[#fdf2e0] px-[26px] py-[22px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      {/* Decorations */}
      <Mandala className="pointer-events-none absolute -right-[26px] -top-[34px] h-[168px] w-[168px] text-[#d9a441] opacity-30" />
      <EyeMandala className="pointer-events-none absolute -bottom-[22px] right-[104px] h-[112px] w-[112px] text-[#d9a441] opacity-25" />

      <div className="relative flex flex-wrap items-center gap-x-[18px] gap-y-4">
        <Lotus className="h-[42px] w-[42px] shrink-0 text-[#d9a441]" />

        <div className="min-w-0">
          <h2 className="font-display text-[21px] font-bold leading-none text-[#2f1250]">
            Unlock Deeper Insights
          </h2>
          <p className="mt-[9px] text-[13px] leading-[1.5] text-[#6c6b78]">
            Upgrade your plan to access advanced AI insights, detailed predictions and expert
            recommendations.
          </p>
        </div>

        <Link
          href="/user-dashboard/payments-subscription"
          className="ml-auto inline-flex h-[46px] shrink-0 items-center justify-center gap-2.5 rounded-[10px] bg-gradient-to-b from-[#f3cd7c] to-[#e0a63f] px-[22px] text-[14px] font-semibold text-[#3d1a04] shadow-[0_6px_18px_rgba(224,166,63,.35)]"
        >
          Upgrade Now
          <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.4} />
        </Link>
      </div>
    </section>
  );
}

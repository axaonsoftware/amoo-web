import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Mandala } from "./icons";

export default function UpgradeBanner() {
  return (
    <section className="relative mt-4 flex flex-col items-start gap-5 overflow-hidden rounded-[14px] border border-[#f0e0bd] bg-gradient-to-r from-[#fdf3e2] via-[#fdf6ea] to-[#fdf1dd] px-6 py-[20px] shadow-[0_1px_3px_rgba(43,15,71,.04)] lg:flex-row lg:items-center">
      {/* Left mandala */}
      <span className="pointer-events-none absolute left-3 top-1/2 hidden h-[96px] w-[96px] -translate-y-1/2 text-[#d09b38] opacity-35 lg:block">
        <Mandala rings={[56, 44, 30, 16]} spokes={16} className="h-full w-full" />
      </span>

      {/* Crystal artwork */}
      <span className="pointer-events-none absolute left-[26px] bottom-0 hidden h-[62px] w-[74px] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=148&q=80"
          alt="Premium crystals"
          fill
          sizes="74px"
          className="object-contain object-bottom"
        />
      </span>

      {/* Right mandalas */}
      <span className="pointer-events-none absolute right-[86px] top-1/2 hidden h-[86px] w-[86px] -translate-y-1/2 text-[#d09b38] opacity-30 xl:block">
        <Mandala rings={[54, 38, 22]} spokes={12} className="h-full w-full" />
      </span>
      <span className="pointer-events-none absolute -right-3 top-1/2 hidden h-[104px] w-[104px] -translate-y-1/2 text-[#d09b38] opacity-35 lg:block">
        <Mandala rings={[56, 42, 26, 12]} spokes={18} className="h-full w-full" />
      </span>

      <div className="relative min-w-0 flex-1 lg:pl-[112px]">
        <h2 className="font-display text-[21px] font-bold leading-[1.25] text-[#2b0f47]">
          Want Deeper Insights?
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#6c6b78]">
          Upgrade to Premium and get access to advanced analysis,
          <br />
          PDF reports, remedies and expert guidance.
        </p>
      </div>

      <button
        type="button"
        className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-6 py-[12px] text-[13.5px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(208,155,56,.35)] xl:mr-[196px]"
      >
        Upgrade to Premium
        <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.2} />
      </button>
    </section>
  );
}

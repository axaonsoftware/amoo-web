import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function GoPremiumBanner() {
  return (
    <section className="relative flex items-center gap-4 overflow-hidden rounded-[14px] bg-gradient-to-r from-[#170a2b] via-[#241043] to-[#2f1256] px-6 py-[20px] shadow-[0_8px_24px_rgba(30,10,55,.28)]">
      <span className="stars pointer-events-none absolute inset-0 opacity-45" />

      <div className="relative min-w-0 flex-1">
        <h2 className="font-display text-[20px] font-bold leading-[1.2] text-[#f3c76e]">
          Go Premium. Go Deeper.
        </h2>
        <p className="mt-2 text-[12px] leading-[1.5] text-white/80">
          Unlock unlimited spreads, advanced insights &amp; ad-free experience.
        </p>
      </div>

      <button
        type="button"
        className="relative z-[1] inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-5 py-[11px] text-[13px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(208,155,56,.4)]"
      >
        Upgrade Now
        <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
      </button>

      {/* Lotus artwork */}
      <span className="pointer-events-none relative block h-[70px] w-[92px] shrink-0">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=184&q=80"
          alt="Lotus"
          fill
          sizes="92px"
          className="object-contain object-right-bottom"
        />
      </span>
    </section>
  );
}

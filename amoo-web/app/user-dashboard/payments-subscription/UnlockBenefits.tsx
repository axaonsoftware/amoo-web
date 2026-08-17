import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

export default function UnlockBenefits() {
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#ecd9b4] bg-[#fdf8ef] px-[24px] py-[22px] shadow-[0_1px_3px_rgba(43,15,71,0.04)]">
      {/* Decorative mandala */}
      <Image
        src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/images/deco-chakra-right.png"
        alt=""
        aria-hidden="true"
        width={220}
        height={220}
        className="pointer-events-none absolute -right-6 top-1/2 h-[150px] w-[220px] -translate-y-1/2 object-contain opacity-[0.18]"
      />

      {/* Content */}
      <div className="relative flex flex-wrap items-center gap-5">
        <span className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border border-[#e6c98f] bg-white shadow-[0_2px_10px_rgba(201,146,47,.18)]">
          <span className="absolute inset-[6px] rounded-full border border-dashed border-[#e6c98f]/70" />
          <Crown
            className="relative h-[26px] w-[26px] text-[#e9b85c]"
            strokeWidth={1.7}
          />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[18px] font-bold text-[#2b0f47]">
            Unlock More Benefits
          </h3>
          <p className="mt-[6px] max-w-[520px] text-[12.5px] leading-[1.6] text-[#6c6b78]">
            Upgrade to Premium and enjoy unlimited consultations, advanced AI
            reports,
            <br />
            priority support and exclusive member benefits.
          </p>
        </div>

        <Link
          href="/consultation/consultation-pricing"
          className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-[11px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-6 text-[13.5px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(217,164,60,.35)]"
        >
          Upgrade Now
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}

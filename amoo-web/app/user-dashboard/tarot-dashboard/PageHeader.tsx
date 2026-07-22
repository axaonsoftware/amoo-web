import { Crown, ArrowRight } from "lucide-react";
import { TarotFanGlyph, StarBurstGlow } from "./icons";

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      {/* Title */}
      <div className="flex items-center gap-4">
        <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#6d28d9] via-[#5b21b6] to-[#3b0f6d] shadow-[0_6px_18px_rgba(76,29,149,.35)]">
          <TarotFanGlyph className="relative h-[32px] w-[32px] text-white" />
        </span>
        <div>
          <h1 className="font-display text-[28px] font-bold leading-[1.15] text-[#2b0f47]">
            Tarot Dashboard
          </h1>
          <p className="mt-1 text-[13.5px] text-[#6c6b78]">
            Seek clarity. Trust your intuition. The cards have a message for you.
          </p>
        </div>
      </div>

      {/* Unlock banner */}
      <div className="relative flex min-h-[86px] w-full items-center overflow-hidden rounded-[14px] bg-gradient-to-r from-[#170a2b] via-[#241043] to-[#3a1568] px-5 py-4 shadow-[0_8px_24px_rgba(30,10,55,.28)] xl:w-[560px]">
        <span className="stars pointer-events-none absolute inset-0 opacity-50" />

        {/* Fireball glow */}
        <span className="pointer-events-none absolute right-[172px] top-1/2 hidden h-[96px] w-[96px] -translate-y-1/2 sm:block">
          <StarBurstGlow className="h-full w-full" />
        </span>

        <div className="relative min-w-0 flex-1 pr-[150px]">
          <div className="flex items-center gap-2">
            <Crown className="h-[21px] w-[21px] shrink-0 text-[#f3c76e]" strokeWidth={1.8} />
            <p className="text-[15px] font-bold leading-none text-[#f3c76e]">
              Unlock Deeper Guidance
            </p>
          </div>
          <p className="mt-2 text-[11.5px] leading-[1.55] text-white/80">
            Upgrade to Premium for advanced spreads,
            <br />
            priority support &amp; more exclusive features.
          </p>
        </div>

        <button
          type="button"
          className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center gap-2 rounded-[9px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-4 py-[10px] text-[12.5px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(208,155,56,.4)]"
        >
          Upgrade Now
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

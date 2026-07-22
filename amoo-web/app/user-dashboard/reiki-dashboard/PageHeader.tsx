import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HealingHands, Mandala } from "./icons";

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      {/* Title */}
      <div className="flex items-center gap-4">
        <span className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#2a0d4a] via-[#22093c] to-[#180628] shadow-[0_6px_18px_rgba(30,10,55,.35)]">
          <span className="stars pointer-events-none absolute inset-0 rounded-full opacity-40" />
          <HealingHands
            className="relative h-[32px] w-[32px] text-[#e9b85c]"
            strokeWidth={1.3}
          />
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-[29px] font-bold leading-[1.15] text-[#2b0f47]">
            Reiki &amp; Healing Dashboard
          </h1>
          <p className="mt-1 text-[13.5px] text-[#6c6b78]">
            Balance your energy. Heal your life. Transform your soul.
          </p>
        </div>
      </div>

      {/* Unlock Deeper Healing banner */}
      <section className="relative flex min-h-[94px] w-full items-center gap-4 overflow-hidden rounded-[12px] bg-gradient-to-r from-[#1a0730] via-[#2a0d4a] to-[#3a1466] px-5 py-4 shadow-[0_8px_24px_rgba(30,10,55,.28)] xl:w-[608px]">
        <span className="stars pointer-events-none absolute inset-0 opacity-50" />

        {/* Meditating figure */}
        <span className="relative h-[70px] w-[70px] shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=140&q=80"
            alt="Healing meditation"
            fill
            sizes="70px"
            className="object-contain"
          />
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="font-display text-[17px] font-bold leading-none text-[#f3c76e]">
            Unlock Deeper Healing
          </p>
          <p className="mt-2 text-[11.5px] leading-[1.55] text-white/75">
            Get personalized healing plans, chakra balance insights &amp; unlimited
            sessions.
          </p>
        </div>

        <button
          type="button"
          className="relative inline-flex shrink-0 items-center gap-1.5 rounded-[9px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-4 py-[9px] text-[12.5px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(208,155,56,.35)]"
        >
          Upgrade Now
          <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
        </button>

        {/* Right-edge mandala */}
        <span className="pointer-events-none absolute -right-4 top-1/2 h-[110px] w-[110px] -translate-y-1/2 text-[#e9b85c] opacity-25">
          <Mandala rings={[54, 40, 26, 12]} spokes={16} className="h-full w-full" />
        </span>
      </section>
    </div>
  );
}

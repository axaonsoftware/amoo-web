import { Crown } from "lucide-react";
import { LotusGlyph } from "./planet-icons";

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      {/* Title */}
      <div className="flex items-center gap-4">
        <span className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border border-[#7c4bb5]/40 bg-gradient-to-b from-[#3a1263] via-[#2a0e4a] to-[#1d0834] shadow-[0_6px_18px_rgba(42,17,72,.28)]">
          <span className="stars pointer-events-none absolute inset-0 rounded-full opacity-40" />
          <LotusGlyph className="relative h-[30px] w-[30px] text-[#e9b85c]" strokeWidth={1.4} />
        </span>
        <div>
          <h1 className="font-display text-[29px] font-bold leading-[1.15] text-[#2b0f47]">
            Kundali Dashboard
          </h1>
          <p className="mt-0.5 text-[13.5px] text-[#6c6b78]">
            Explore your birth chart and cosmic insights.
          </p>
        </div>
      </div>

      {/* Premium banner */}
      <div className="relative flex min-h-[86px] w-full items-center gap-4 overflow-hidden rounded-[14px] border border-[#4a2277] bg-gradient-to-r from-[#1d0733] via-[#2a0d47] to-[#1d0733] px-5 py-4 shadow-[0_8px_24px_rgba(30,10,55,.28)] xl:w-[570px]">
        <span className="stars pointer-events-none absolute inset-0 opacity-50" />

        {/* Left mandala */}
        <span className="pointer-events-none absolute -left-6 -top-6 h-[92px] w-[92px] opacity-[.18]">
          <svg viewBox="0 0 100 100" fill="none" className="h-full w-full text-[#e9b85c]">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="4"
                x2="50"
                y2="96"
                stroke="currentColor"
                strokeWidth="0.7"
                transform={`rotate(${i * 15} 50 50)`}
              />
            ))}
          </svg>
        </span>

        {/* Right mandala */}
        <span className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px] opacity-[.22]">
          <svg viewBox="0 0 120 120" fill="none" className="h-full w-full text-[#e9b85c]">
            <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" />
            <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="1" />
            <circle cx="60" cy="60" r="28" stroke="currentColor" strokeWidth="1" />
            <circle cx="60" cy="60" r="14" stroke="currentColor" strokeWidth="1" />
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="60"
                y1="4"
                x2="60"
                y2="116"
                stroke="currentColor"
                strokeWidth="0.6"
                transform={`rotate(${i * 11.25} 60 60)`}
              />
            ))}
          </svg>
        </span>

        <Crown className="relative h-[30px] w-[30px] shrink-0 text-[#e9b85c]" strokeWidth={1.6} />

        <div className="relative min-w-0 flex-1">
          <p className="font-display text-[15px] font-bold leading-none text-[#f3c76e]">
            You&apos;re a Premium User
          </p>
          <p className="mt-1.5 text-[11.5px] leading-[1.55] text-white/70">
            Access advanced reports, detailed predictions
            <br />
            and personalized remedies.
          </p>
        </div>

        <button
          type="button"
          className="relative shrink-0 rounded-[8px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-4 py-[9px] text-[12.5px] font-semibold text-[#2a1148] shadow-[0_4px_12px_rgba(0,0,0,.3)]"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}

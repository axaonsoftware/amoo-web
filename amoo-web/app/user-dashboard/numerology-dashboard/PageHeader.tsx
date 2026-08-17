import { FlowerGlyph, SunBurst } from "./icons";

const floatingNumbers = [
  { n: "3", className: "right-[74px] top-[8px] text-[19px] opacity-90" },
  { n: "3", className: "right-[36px] top-[4px] text-[15px] opacity-70" },
  { n: "9", className: "right-[8px] top-[10px] text-[17px] opacity-80" },
  { n: "5", className: "right-[92px] bottom-[16px] text-[15px] opacity-70" },
  { n: "7", className: "right-[52px] bottom-[10px] text-[16px] opacity-80" },
  { n: "7", className: "right-[18px] bottom-[22px] text-[13px] opacity-60" },
];

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      {/* Title */}
      <div className="flex items-center gap-4">
        <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#6d28d9] via-[#5b21b6] to-[#3b0f6d] shadow-[0_6px_18px_rgba(76,29,149,.35)]">
          <FlowerGlyph
            className="relative h-[30px] w-[30px] text-white"
            strokeWidth={1.3}
          />
        </span>
        <div>
          <h1 className="font-display text-[28px] font-bold leading-[1.15] text-[#2b0f47]">
            Numerology Dashboard
          </h1>
          <p className="mt-1 text-[13.5px] text-[#6c6b78]">
            Decode numbers. Discover yourself. Design your destiny.
          </p>
        </div>
      </div>

      {/* Vibration banner */}
      <div className="relative flex min-h-[76px] w-full items-center overflow-hidden rounded-[12px] bg-gradient-to-r from-[#150726] via-[#1d0a33] to-[#2b1050] px-5 py-4 shadow-[0_8px_24px_rgba(30,10,55,.28)] xl:w-[500px]">
        <span className="stars pointer-events-none absolute inset-0 opacity-50" />

        {/* Sunburst mandala */}
        <span className="pointer-events-none absolute -bottom-[38px] right-[6px] h-[136px] w-[136px] text-[#e9b85c] opacity-70">
          <SunBurst className="h-full w-full" />
        </span>

        {/* Floating numbers */}
        {floatingNumbers.map(({ n, className }, i) => (
          <span
            key={`${n}-${i}`}
            className={`pointer-events-none absolute font-display font-bold text-[#f3c76e] ${className}`}
          >
            {n}
          </span>
        ))}

        <div className="relative min-w-0 flex-1 pr-[120px]">
          <p className="text-[13.5px] font-semibold leading-none text-[#f3c76e]">
            Numbers Have Vibration, You Have Power.
          </p>
          <p className="mt-2 text-[11.5px] leading-[1.55] text-white/75">
            Align with the right numbers and attract positivity.
          </p>
        </div>
      </div>
    </div>
  );
}

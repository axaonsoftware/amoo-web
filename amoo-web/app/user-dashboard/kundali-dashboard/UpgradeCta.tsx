import { ArrowRight } from "lucide-react";

function Mandala({ rings, spokes }: { rings: number[]; spokes: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className="h-full w-full text-[#d09b38]"
    >
      {rings.map((r) => (
        <circle
          key={r}
          cx="60"
          cy="60"
          r={r}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: spokes }).map((_, i) => (
        <line
          key={i}
          x1="60"
          y1="4"
          x2="60"
          y2="116"
          stroke="currentColor"
          strokeWidth="0.7"
          transform={`rotate(${(i * 180) / spokes} 60 60)`}
        />
      ))}
    </svg>
  );
}

export default function UpgradeCta() {
  return (
    <section className="relative mt-4 flex flex-col items-start gap-5 overflow-hidden rounded-[14px] border border-[#e8d3a8] bg-gradient-to-r from-[#fdf3e2] via-[#fdf6ea] to-[#fdf1dd] px-6 py-[22px] shadow-[0_1px_3px_rgba(43,15,71,.04)] lg:flex-row lg:items-center">
      {/* Left mandala */}
      <span className="pointer-events-none absolute left-2 top-1/2 hidden h-[92px] w-[92px] -translate-y-1/2 opacity-40 lg:block">
        <Mandala rings={[56, 44, 30, 16]} spokes={16} />
      </span>

      {/* Right mandalas */}
      <span className="pointer-events-none absolute right-[92px] top-1/2 hidden h-[86px] w-[86px] -translate-y-1/2 opacity-40 xl:block">
        <Mandala rings={[54, 38, 22]} spokes={12} />
      </span>
      <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-[104px] w-[104px] -translate-y-1/2 opacity-40 lg:block">
        <Mandala rings={[56, 42, 26, 12]} spokes={18} />
      </span>

      <div className="relative min-w-0 flex-1 lg:pl-[104px]">
        <h2 className="font-display text-[21px] font-bold leading-[1.25] text-[#2b0f47]">
          Want Accurate Predictions &amp; Personalized Remedies?
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#6c6b78]">
          Upgrade to Premium and unlock advanced dasha analysis, detailed
          predictions,
          <br />
          dosha remedies and expert guidance.
        </p>
      </div>

      <button
        type="button"
        className="relative shrink-0 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-b from-[#f1c469] to-[#dda43c] px-6 py-[12px] text-[13.5px] font-semibold text-[#2a1148] shadow-[0_6px_16px_rgba(208,155,56,.35)] xl:mr-[196px]"
      >
        Upgrade to Premium
        <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.2} />
      </button>
    </section>
  );
}

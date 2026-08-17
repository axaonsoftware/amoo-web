import { Users } from "lucide-react";

function MeditationMark() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 104 104"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <radialGradient id="ofOrb" cx="0.5" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#3D1E7A" />
          <stop offset="0.55" stopColor="#26124F" />
          <stop offset="1" stopColor="#150B2E" />
        </radialGradient>
        <linearGradient id="ofGold" x1="52" y1="26" x2="52" y2="82">
          <stop offset="0" stopColor="#FBD35C" />
          <stop offset="1" stopColor="#EFA724" />
        </linearGradient>
      </defs>
      <circle cx="52" cy="52" r="52" fill="url(#ofOrb)" />

      {/* faint radial spokes */}
      <g stroke="#7C5AC4" strokeWidth="0.7" opacity="0.35">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={52 + Math.cos(a) * 26}
              y1={52 + Math.sin(a) * 26}
              x2={52 + Math.cos(a) * 40}
              y2={52 + Math.sin(a) * 40}
            />
          );
        })}
      </g>
      <circle
        cx="52"
        cy="52"
        r="34"
        stroke="#6D4CB4"
        strokeWidth="0.7"
        opacity="0.4"
      />

      {/* meditating figure */}
      <g
        stroke="url(#ofGold)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <circle cx="52" cy="35" r="6.4" />
        <path d="M52 44c-7.2 0-12.4 5.4-13.6 12.6" />
        <path d="M52 44c7.2 0 12.4 5.4 13.6 12.6" />
        <path d="M38.4 56.6c-2.6 1.4-5.6 3.4-7.6 5.6" />
        <path d="M65.6 56.6c2.6 1.4 5.6 3.4 7.6 5.6" />
        <path d="M30.8 62.2c4.6 6.4 12 10.2 21.2 10.2s16.6-3.8 21.2-10.2" />
        <path d="M40 68.6c3.6-2.6 8-4 12-4s8.4 1.4 12 4" />
      </g>
      <path
        d="M52 20l1.8 3.8 3.8 1.8-3.8 1.8L52 31l-1.8-3.6-3.8-1.8 3.8-1.8L52 20Z"
        fill="#F6C34A"
        opacity="0.85"
      />
    </svg>
  );
}

export default function PageHeader() {
  return (
    <div className="flex flex-wrap items-center gap-x-[25px] gap-y-[18px] pl-[22px]">
      <MeditationMark />

      <div className="min-w-0">
        <h1 className="text-[44px] font-bold leading-[1.06] tracking-[-0.012em] text-[#2B1275]">
          Other User Features
        </h1>
        <p className="mt-[9px] text-[16px] font-normal leading-none text-[#66628C]">
          A complete spiritual &amp; astrology experience at your fingertips.
        </p>
      </div>

      <button
        type="button"
        className="ml-auto flex h-[49px] shrink-0 items-center gap-[13px] rounded-[14px] border border-[#EFEDF7] bg-white px-[24px] shadow-[0_1px_2px_rgba(45,25,110,0.03)]"
      >
        <Users className="h-[20px] w-[20px] text-[#5B21D6]" strokeWidth={1.9} />
        <span className="text-[15px] font-semibold leading-none text-[#2F1580]">
          User Experience Overview
        </span>
      </button>
    </div>
  );
}

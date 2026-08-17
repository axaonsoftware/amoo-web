import Link from "next/link";
import { ArrowRight } from "lucide-react";

const zodiac = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
];

function ZodiacWheel() {
  return (
    <svg
      viewBox="0 0 220 220"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="110"
        cy="110"
        r="105"
        stroke="#d9ab54"
        strokeWidth="1"
        opacity=".45"
      />
      <circle
        cx="110"
        cy="110"
        r="88"
        stroke="#d9ab54"
        strokeWidth="1"
        opacity=".75"
      />
      <circle
        cx="110"
        cy="110"
        r="66"
        stroke="#d9ab54"
        strokeWidth="1"
        opacity=".5"
      />
      <circle
        cx="110"
        cy="110"
        r="34"
        stroke="#d9ab54"
        strokeWidth="1"
        opacity=".55"
      />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <line
            key={i}
            x1={110 + 34 * Math.cos(a)}
            y1={110 + 34 * Math.sin(a)}
            x2={110 + 88 * Math.cos(a)}
            y2={110 + 88 * Math.sin(a)}
            stroke="#d9ab54"
            strokeWidth="0.8"
            opacity=".4"
          />
        );
      })}
      {zodiac.map((glyph, i) => {
        const a = (i * Math.PI) / 6 - Math.PI / 2 + Math.PI / 12;
        return (
          <text
            key={glyph}
            x={110 + 77 * Math.cos(a)}
            y={110 + 77 * Math.sin(a) + 5}
            textAnchor="middle"
            fontSize="14"
            fill="#c9922f"
            opacity=".9"
          >
            {glyph}
          </text>
        );
      })}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI) / 8;
        return (
          <line
            key={`r${i}`}
            x1={110 + 12 * Math.cos(a)}
            y1={110 + 12 * Math.sin(a)}
            x2={110 + 28 * Math.cos(a)}
            y2={110 + 28 * Math.sin(a)}
            stroke="#e9b85c"
            strokeWidth="1.2"
            opacity=".85"
          />
        );
      })}
      <circle cx="110" cy="110" r="10" fill="#f2c877" />
      <circle cx="110" cy="110" r="20" fill="#e9b85c" opacity=".18" />
    </svg>
  );
}

export default function DailyHoroscope() {
  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-5 pb-5 pt-4 shadow-[0_2px_10px_rgba(42,17,72,.05)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold text-[#4a1c7d]">
          Daily Horoscope
        </h2>
        <Link
          href="/services"
          className="text-[12px] font-medium text-[#6b3fa0]"
        >
          View All
        </Link>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#5a2496] to-[#3d1268] shadow-[0_4px_10px_rgba(61,18,104,.28)]">
              <span className="text-[22px] leading-none text-[#f0c877]">
                ♌
              </span>
            </span>
            <div>
              <p className="font-display text-[19px] font-bold leading-none text-[#2b0f47]">
                Leo
              </p>
              <p className="mt-1.5 text-[12px] text-[#8b8697]">
                23 Jul – 22 Aug
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12.5px] leading-[1.7] text-[#6c6b78]">
            A positive day for relationships and financial growth. Stay focused
            and trust your intuition.
          </p>

          <Link
            href="/services"
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#6b3fa0]"
          >
            Read Full Horoscope
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>

        <div className="hidden h-[170px] w-[170px] shrink-0 sm:block">
          <ZodiacWheel />
        </div>
      </div>
    </section>
  );
}

import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import Phone, { StatusBar } from "../Phone";

type Trait = {
  label: string;
  color: string;
  score: number;
  highlight?: boolean;
};

const TRAITS: Trait[] = [
  { label: "Love", color: "#F5B33C", score: 4, highlight: true },
  { label: "Career", color: "#FF5A52", score: 4 },
  { label: "Health", color: "#FFD740", score: 4 },
  { label: "Finance", color: "#FF8A9B", score: 3 },
];

function Stars({ score }: { score: number }) {
  return (
    <span className="ml-auto flex items-center gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => {
        const on = i < score;
        return (
          <Star
            key={i}
            size={9}
            strokeWidth={1}
            fill={on ? "#FFC22E" : "rgba(255,255,255,0.22)"}
            color={on ? "#FFC22E" : "rgba(255,255,255,0.28)"}
          />
        );
      })}
    </span>
  );
}

export default function HoroscopePhone() {
  return (
    <Phone>
      <div className="flex h-full flex-col bg-gradient-to-b from-[#4A28AD] via-[#301578] to-[#190845]">
        <StatusBar tone="light" />

        <div className="flex min-h-0 flex-1 flex-col px-[5px] pb-[6px]">
          {/* Header */}
          <div className="relative mt-[6px] flex h-[20px] shrink-0 items-center px-[5px]">
            <ChevronLeft size={11} strokeWidth={2.25} color="#FFFFFF" />
            <span className="pointer-events-none absolute inset-x-0 text-center text-[9px] font-bold leading-none text-white">
              Daily Horoscope
            </span>
          </div>

          {/* Sign */}
          <div className="mt-[16px] flex h-[22px] shrink-0 items-center px-[5px]">
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#FFD86B] to-[#E0A21A] text-[9px] leading-none text-[#5A3300]">
              &#9804;
            </span>
            <span className="ml-[6px] text-[15px] font-bold leading-none text-white">
              Leo
            </span>
            <span className="ml-auto flex h-[16px] w-[16px] items-center justify-center rounded-full border border-white/20 bg-white/10">
              <ChevronRight size={9} strokeWidth={2.25} color="#FFFFFF" />
            </span>
          </div>

          <p className="mt-[6px] shrink-0 px-[5px] text-[8px] font-medium leading-none text-[#B4A2E0]">
            18 May 2025
          </p>

          {/* Reading */}
          <div className="mt-[12px] shrink-0 rounded-[10px] border border-white/10 bg-white/[0.07] p-[9px]">
            <p className="text-[9px] font-medium leading-[14px] text-white/90">
              Today is a great day to focus on your goals. You may get good news
              related to work...
            </p>
          </div>

          {/* Traits */}
          <div className="mt-[11px] flex shrink-0 flex-col gap-[3px]">
            {TRAITS.map((trait) => (
              <div
                key={trait.label}
                className={`flex h-[24px] items-center rounded-[8px] px-[7px] ${
                  trait.highlight ? "bg-white/[0.12]" : "bg-white/[0.06]"
                }`}
              >
                <Heart
                  size={9}
                  strokeWidth={1.5}
                  fill={trait.color}
                  color={trait.color}
                />
                <span className="ml-[5px] text-[8px] font-semibold leading-none text-white">
                  {trait.label}
                </span>
                <Stars score={trait.score} />
              </div>
            ))}
          </div>

          {/* Read more */}
          <div className="mt-[6px] flex h-[21px] shrink-0 items-center justify-end rounded-[8px] bg-white/[0.04] px-[8px]">
            <span className="text-[8px] font-medium leading-none text-white/35">
              Read More
            </span>
          </div>
        </div>
      </div>
    </Phone>
  );
}

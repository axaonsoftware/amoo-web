import { CalendarDays, Gem, Grid3x3 } from "lucide-react";

import Phone, { StatusBar } from "../Phone";

const REMEDIES = [
  {
    kind: "icon" as const,
    Icon: Gem,
    label: "Gemstone",
    value: "Yellow Sapphire",
  },
  {
    kind: "om" as const,
    label: "Mantra",
    value: "ॐ बृहस्पतये नमः",
  },
  {
    kind: "icon" as const,
    Icon: Grid3x3,
    label: "Yantra",
    value: "Guru Yantra",
  },
  {
    kind: "icon" as const,
    Icon: CalendarDays,
    label: "Daily Puja",
    value: "Thursday",
  },
];

export default function RemediesPhone() {
  return (
    <Phone>
      <StatusBar tone="dark" />

      <div className="flex min-h-0 flex-1 flex-col px-[11px] pb-[13px]">
        {/* Title */}
        <span className="mt-[9px] shrink-0 text-center text-[11px] font-bold leading-none text-[#241268]">
          Recommended Remedies
        </span>

        {/* List */}
        <div className="mt-[13px] flex shrink-0 flex-col gap-[10px]">
          {REMEDIES.map((item) => (
            <div
              key={item.label}
              className="flex h-[46px] items-center gap-[10px] rounded-[11px] border border-[#EFEDF7] bg-white px-[9px] shadow-[0_1px_2px_rgba(45,25,110,0.03)]"
            >
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(145deg,#FCE3B4_0%,#F9CE86_100%)]">
                {item.kind === "om" ? (
                  <span className="text-[14px] font-bold leading-none text-[#E4791B]">
                    ॐ
                  </span>
                ) : (
                  <item.Icon
                    className="h-[15px] w-[15px] text-[#E4791B]"
                    strokeWidth={1.9}
                  />
                )}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[7.5px] leading-[1.2] text-[#8E8AA3]">
                  {item.label}
                </span>
                <span className="mt-[2px] truncate text-[9.5px] font-bold leading-[1.2] text-[#241268]">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-auto flex h-[28px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEEAFB]">
          <span className="text-[10px] font-bold leading-none text-[#4A22DE]">
            View All Remedies
          </span>
        </div>
      </div>
    </Phone>
  );
}

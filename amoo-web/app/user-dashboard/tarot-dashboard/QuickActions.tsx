import { ArrowRight, MapPin, Grid3x3 } from "lucide-react";
import { DailyDrawIcon, OneCardActionIcon, ThreeCardActionIcon } from "./icons";

const actions = [
  {
    title: "Draw a Daily Card",
    sub: "Get your daily guidance",
    Icon: DailyDrawIcon,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
  {
    title: "One Card Reading",
    sub: "Draw a card for insight",
    Icon: OneCardActionIcon,
    iconBg: "bg-[#fdf0dc]",
    iconColor: "text-[#e0952e]",
  },
  {
    title: "Three Card Reading",
    sub: "Past, Present, Future",
    Icon: ThreeCardActionIcon,
    iconBg: "bg-[#fdeaf1]",
    iconColor: "text-[#e0567f]",
  },
  {
    title: "Yes or No Reading",
    sub: "Get a clear answer",
    Icon: MapPin,
    iconBg: "bg-[#e6f6ea]",
    iconColor: "text-[#2f9e56]",
  },
  {
    title: "Custom Spread",
    sub: "Create your own spread",
    Icon: Grid3x3,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
        Quick Actions
      </h2>

      <ul className="mt-3 flex flex-col gap-[10px]">
        {actions.map(({ title, sub, Icon, iconBg, iconColor }) => (
          <li key={title}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-[11px] border border-[#efecf6] bg-[#faf9fc] px-3 py-[10px] text-left"
            >
              <span
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] ${iconBg} ${iconColor}`}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-[1.2] text-[#2b0f47]">
                  {title}
                </p>
                <p className="mt-[3px] text-[11px] text-[#8b8697]">{sub}</p>
              </div>

              <ArrowRight
                className="h-[16px] w-[16px] shrink-0 text-[#7a3fc0]"
                strokeWidth={2}
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

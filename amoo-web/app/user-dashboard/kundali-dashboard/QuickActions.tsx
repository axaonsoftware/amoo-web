import {
  ArrowRight,
  FilePlus2,
  LayoutPanelTop,
  BookImage,
  Target,
  Orbit,
  Heart,
} from "lucide-react";

const actions = [
  {
    title: "Create New Kundali",
    subtitle: "Generate a new birth chart",
    Icon: FilePlus2,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
  {
    title: "Birth Chart (Rashi)",
    subtitle: "North Indian Style Chart",
    Icon: LayoutPanelTop,
    iconBg: "bg-[#fdf0dc]",
    iconColor: "text-[#e0952e]",
  },
  {
    title: "Birth Chart (Lagna)",
    subtitle: "South Indian Style Chart",
    Icon: BookImage,
    iconBg: "bg-[#fdeaf0]",
    iconColor: "text-[#e0567f]",
  },
  {
    title: "Dasha Analysis",
    subtitle: "View your planetary dasha",
    Icon: Target,
    iconBg: "bg-[#e6f6ea]",
    iconColor: "text-[#2f9e56]",
  },
  {
    title: "Dosha Analysis",
    subtitle: "Check yogas and doshas",
    Icon: Orbit,
    iconBg: "bg-[#fdf0dc]",
    iconColor: "text-[#e0952e]",
  },
  {
    title: "Transit (Gochar)",
    subtitle: "Current planetary transits",
    Icon: Orbit,
    iconBg: "bg-[#e7effb]",
    iconColor: "text-[#3f5bd0]",
  },
  {
    title: "Match Kundali",
    subtitle: "Check compatibility",
    Icon: Heart,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#a53fc4]",
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-[14px] border border-[#f0e7d8] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">Quick Actions</h2>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {actions.map(({ title, subtitle, Icon, iconBg, iconColor }) => (
          <button
            key={title}
            type="button"
            className="flex w-full items-center gap-3 rounded-[10px] border border-[#f0e7d8] bg-white px-3 py-[10px] text-left transition-colors hover:bg-[#faf7f2]"
          >
            <span
              className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] ${iconBg} ${iconColor}`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold text-[#2b0f47]">{title}</span>
              <span className="mt-[1px] block text-[11px] text-[#8b8697]">{subtitle}</span>
            </span>
            <ArrowRight className="h-[15px] w-[15px] shrink-0 text-[#a8a2b4]" strokeWidth={2} />
          </button>
        ))}
      </div>
    </section>
  );
}

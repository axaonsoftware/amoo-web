import type { ComponentType } from "react";
import {
  CalendarPlus,
  FileText,
  NotebookPen,
  Music,
  Heart,
} from "lucide-react";
import { MeditationGlyph } from "./icons";

type TileIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

type Action = {
  label: string;
  Icon: TileIcon;
  iconBg: string;
  iconColor: string;
};

const actions: Action[] = [
  {
    label: "Book New Session",
    Icon: CalendarPlus,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
  {
    label: "Chakra Assessment",
    Icon: MeditationGlyph,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
  {
    label: "View Reports",
    Icon: FileText,
    iconBg: "bg-[#e7effb]",
    iconColor: "text-[#3f5bd0]",
  },
  {
    label: "Healing Journal",
    Icon: NotebookPen,
    iconBg: "bg-[#fdf0dc]",
    iconColor: "text-[#e0952e]",
  },
  {
    label: "Meditations",
    Icon: Music,
    iconBg: "bg-[#e6f6ea]",
    iconColor: "text-[#2f9e56]",
  },
  {
    label: "Affirmations",
    Icon: Heart,
    iconBg: "bg-[#fdeaf0]",
    iconColor: "text-[#e0567f]",
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <h2 className="font-display text-[17px] font-bold text-[#2b0f47]">
        Quick Actions
      </h2>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {actions.map(({ label, Icon, iconBg, iconColor }) => (
          <button
            key={label}
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border border-[#ece9f3] bg-white px-2 py-[12px] text-center transition-colors hover:bg-[#faf8fd]"
          >
            <span
              className={`flex h-[32px] w-[32px] items-center justify-center rounded-[10px] ${iconBg} ${iconColor}`}
            >
              <Icon className="h-[16px] w-[16px]" strokeWidth={1.7} />
            </span>
            <span className="text-[10.5px] font-medium leading-[1.3] text-[#3d3a48]">
              {label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

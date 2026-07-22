import Link from "next/link";
import { FileText, Download, Heart, Clock, ArrowRight } from "lucide-react";

const stats = [
  {
    label: "Total Reports",
    value: "24",
    Icon: FileText,
    tile: "bg-[#f3ecfb]",
    icon: "text-[#7c3aed]",
  },
  {
    label: "Downloaded",
    value: "18",
    Icon: Download,
    tile: "bg-[#fdf1dc]",
    icon: "text-[#e0a63f]",
  },
  {
    label: "Favorites",
    value: "6",
    Icon: Heart,
    tile: "bg-[#fde8ee]",
    icon: "text-[#ef5f8b]",
  },
  {
    label: "Recently Added",
    value: "5",
    Icon: Clock,
    tile: "bg-[#e7f8ee]",
    icon: "text-[#2eb872]",
  },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, Icon, tile, icon }) => (
        <div
          key={label}
          className="rounded-[14px] border border-[#f0e7d8] bg-white px-[20px] py-[20px] shadow-[0_1px_2px_rgba(38,17,66,.04)]"
        >
          <div className="flex items-center gap-[16px]">
            <span
              className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] ${tile}`}
            >
              <Icon className={`h-[24px] w-[24px] ${icon}`} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <p className="text-[12.5px] leading-none text-[#7a7686]">{label}</p>
              <p className="mt-[8px] text-[26px] font-semibold leading-none text-[#2b0f47]">
                {value}
              </p>
              <Link
                href="/user-dashboard/my-reports"
                className="mt-[10px] inline-flex items-center gap-[5px] text-[11.5px] font-medium leading-none text-[#7c3aed]"
              >
                View All
                <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

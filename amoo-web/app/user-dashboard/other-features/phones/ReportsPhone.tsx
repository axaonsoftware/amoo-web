import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import Phone, { StatusBar } from "../Phone";

const TABS = ["All", "Recent", "Saved"] as const;

const REPORTS = [
  {
    title: "Kundali Report",
    date: "18 May 2025",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
  {
    title: "Numerology Report",
    date: "15 May 2025",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
  {
    title: "Tarot Reading",
    date: "14 May 2025",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
  {
    title: "Aura Report",
    date: "12 May 2025",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
];

export default function ReportsPhone() {
  return (
    <Phone>
      <StatusBar tone="dark" />

      <div className="flex min-h-0 flex-1 flex-col px-[8px] pb-[25px]">
        {/* Header */}
        <div className="relative mt-[4px] flex h-[20px] shrink-0 items-center">
          <ChevronLeft
            width={11}
            height={11}
            strokeWidth={2.5}
            className="text-[#241268]"
            aria-hidden
          />
          <span className="absolute inset-x-0 text-center text-[10px] font-bold leading-none text-[#241268]">
            My Reports
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-[16px] flex shrink-0 justify-between px-[10px]">
          {TABS.map((tab) =>
            tab === "All" ? (
              <span
                key={tab}
                className="relative text-[9px] font-bold leading-[1.2] text-[#241268]"
              >
                {tab}
                <span className="absolute bottom-[-6px] left-1/2 h-[1.5px] w-[32px] -translate-x-1/2 rounded-full bg-[#6C3CF0]" />
              </span>
            ) : (
              <span
                key={tab}
                className="text-[9px] font-medium leading-[1.2] text-[#9F9BB4]"
              >
                {tab}
              </span>
            ),
          )}
        </div>

        {/* Report list */}
        <div className="mt-[16px] flex shrink-0 flex-col gap-[9px]">
          {REPORTS.map((report) => (
            <div
              key={report.title}
              className="flex h-[42px] items-center gap-[8px] rounded-[10px] border border-[#EFEDF7] bg-white px-[5px] shadow-[0_1px_2px_rgba(45,25,110,0.03)]"
            >
              <Image
                src={report.thumb}
                alt=""
                width={26}
                height={26}
                className="h-[26px] w-[26px] shrink-0 rounded-[7px] object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[8.5px] font-bold leading-[1.15] text-[#241268]">
                  {report.title}
                </span>
                <span className="mt-[3px] truncate text-[7px] leading-[1.15] text-[#8E8AA3]">
                  {report.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-auto flex h-[24px] shrink-0 items-center justify-center rounded-[8px] bg-[#EDE9FC]">
          <span className="text-[9px] font-bold leading-none text-[#4A22DE]">
            View All
          </span>
        </div>
      </div>
    </Phone>
  );
}

import { LotusIcon } from "../../components/home-icons";
import {
  CalendarLineIcon,
  ClockLineIcon,
  HourglassIcon,
  PinIcon,
  ShieldTickIcon,
  VideoLineIcon,
} from "./icons";

export default function SummaryCard({
  service,
  mode,
  date,
  month,
  year,
  time,
  price,
}: {
  service: string;
  mode: string;
  date: number;
  month: number;
  year: number;
  time: string;
  price?: number;
}) {
  const dateObj = new Date(year, month, date);
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });
  const dateStr = `${dayName}, ${date} ${monthName} ${year}`;

  const ROWS = [
    { Icon: VideoLineIcon, label: "Mode", value: `${mode} Consultation` },
    { Icon: CalendarLineIcon, label: "Date", value: dateStr },
    { Icon: ClockLineIcon, label: "Time", value: `${time || "—"} (IST)` },
    { Icon: HourglassIcon, label: "Duration", value: "60 Minutes" },
  ];

  return (
    <aside className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(75,37,131,0.04)]">
      {/* Header */}
      <div className="bg-[linear-gradient(180deg,#3d1a6d_0%,#2a1148_100%)] px-5 py-[15px]">
        <h2 className="text-center font-display text-[16.5px] font-bold text-gold">
          Your Consultation Summary
        </h2>
      </div>

      <div className="px-5 py-5">
        {/* Service */}
        <div className="flex items-start gap-3.5">
          <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-lilac text-grape-2">
            <LotusIcon className="h-[30px] w-[30px]" />
          </span>
          <div className="pt-1">
            <p className="font-display text-[16px] font-bold text-grape">
              {service}
            </p>
            <p className="mt-[3px] text-[12px] leading-[1.55] text-body">
              Consultation with our expert
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-line" />

        {/* Detail rows */}
        <div className="space-y-[13px]">
          {ROWS.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="h-[16px] w-[16px] shrink-0 text-grape-2" />
              <span className="flex-1 text-[13px] text-body">{label}</span>
              <span className="text-[13px] font-semibold text-grape">
                {value}
              </span>
            </div>
          ))}

          {/* Price */}
          <div className="flex items-center gap-2.5">
            <PinIcon className="h-[16px] w-[16px] shrink-0 text-grape-2" />
            <span className="flex-1 text-[13px] text-body">Price</span>
            <span className="text-[14.5px] font-bold text-[#1f8a4c]">
              ₹{price ?? 799}
            </span>
          </div>
        </div>

        {/* Privacy */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#eeddc0] bg-[#fdf8ef] px-3.5 py-3">
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#d09b38] text-white">
            <ShieldTickIcon className="h-[17px] w-[17px]" />
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-grape">
              100% Private &amp; Confidential
            </p>
            <p className="mt-[2px] text-[11.5px] text-body">
              Your privacy and trust are our top priority.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

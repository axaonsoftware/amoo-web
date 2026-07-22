import Image from "next/image";
import {
  CalendarDays,
  Lock,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  Icon: LucideIcon;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    Icon: ShieldCheck,
    title: "100% Confidential",
    desc: "Your privacy is our top priority.",
  },
  {
    Icon: Lock,
    title: "Secure & Safe",
    desc: "End-to-end encrypted consultations.",
  },
  {
    Icon: UserRound,
    title: "Expert Guidance",
    desc: "Consult with experienced spiritual experts.",
  },
  {
    Icon: CalendarDays,
    title: "Easy Booking",
    desc: "Simple, fast & hassle-free booking process.",
  },
];

export default function TrustRow() {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-[22px] pt-[22px] pb-[26px]">
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[1fr_420px]">
        {/* feature strip */}
        <div className="flex flex-col justify-between gap-[18px] rounded-[14px] border border-[#eee3d2] bg-white px-[26px] py-[22px] sm:flex-row sm:gap-0">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className={`flex flex-1 items-start gap-[11px] ${
                i > 0 ? "sm:border-l sm:border-[#efe6d6] sm:pl-[16px]" : ""
              } ${i < FEATURES.length - 1 ? "sm:pr-[14px]" : ""}`}
            >
              <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[#3b1a63] text-gold">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-[14px] leading-none font-semibold text-[#3d1e6d]">
                  {title}
                </p>
                <p className="mt-[7px] text-[12px] leading-[1.5] text-[#6c6b78]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* first time offer */}
        <div className="flex items-center gap-[14px] rounded-[14px] border border-[#eee3d2] bg-white px-[20px] py-[18px]">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80"
            alt=""
            width={200}
            height={200}
            className="h-[86px] w-[86px] shrink-0 rounded-[10px] object-contain"
          />
          <div>
            <p className="text-[16px] leading-none font-bold text-[#3d1e6d]">
              First Time Here?
            </p>
            <p className="mt-[8px] text-[13px] text-[#6c6b78]">
              Get 10% OFF on your first consultation.
            </p>
            <div className="mt-[10px] inline-flex items-center rounded-[8px] border border-[#e0b96a] bg-[#f7f0de] px-[16px] py-[8px] text-[13px] text-[#4b2583]">
              Use Code:&nbsp;<span className="font-bold">FIRST10</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

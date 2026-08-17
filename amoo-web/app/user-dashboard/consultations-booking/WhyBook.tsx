import { ShieldCheck, CalendarCheck, Lock, Headphones } from "lucide-react";
import { SITE_NAME } from "../../../lib/constants";

const features = [
  {
    Icon: ShieldCheck,
    title: "Verified Experts",
    desc: "Experienced and trusted astrologers",
  },
  {
    Icon: CalendarCheck,
    title: "Flexible Scheduling",
    desc: "Book at your convenience",
  },
  {
    Icon: Lock,
    title: "100% Secure",
    desc: "Your data is safe with us",
  },
  {
    Icon: Headphones,
    title: "24/7 Support",
    desc: "We are here for you",
  },
];

export default function WhyBook() {
  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-[18px] pb-6 pt-5 shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <h2 className="px-1 font-display text-[19px] font-bold text-[#4c1d95]">
        Why Book With {SITE_NAME}?
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 px-1">
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#f3ecfb]">
              <Icon
                className="h-[20px] w-[20px] text-[#7c4ec4]"
                strokeWidth={1.7}
              />
            </span>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-[13px] font-semibold text-[#4c1d95]">
                {title}
              </p>
              <p className="mt-[3px] text-[11.5px] leading-[1.45] text-[#8b8697]">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

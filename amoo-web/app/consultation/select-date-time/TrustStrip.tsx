import {
  TrustCalendarIcon,
  TrustExpertIcon,
  TrustHeadsetIcon,
  TrustLotusIcon,
  TrustShieldIcon,
} from "./icons";

const ITEMS = [
  {
    Icon: TrustShieldIcon,
    title: "100% Confidential",
    lines: ["Your privacy is", "always protected."],
  },
  {
    Icon: TrustExpertIcon,
    title: "Expert Guidance",
    lines: ["Consult with experienced", "and trusted experts."],
  },
  {
    Icon: TrustCalendarIcon,
    title: "Easy Rescheduling",
    lines: ["Reschedule or change your", "slots with ease."],
  },
  {
    Icon: TrustHeadsetIcon,
    title: "Dedicated Support",
    lines: ["We are here to help you", "at every step."],
  },
  {
    Icon: TrustLotusIcon,
    title: "Positive Transformation",
    lines: ["Receive guidance that brings", "clarity and peace."],
  },
];

export default function TrustStrip() {
  return (
    <section className="grid grid-cols-1 rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(75,37,131,0.04)] sm:grid-cols-2 lg:grid-cols-5">
      {ITEMS.map(({ Icon, title, lines }, i) => (
        <div
          key={title}
          className={`flex items-center gap-3.5 px-5 py-[18px] ${
            i > 0 ? "lg:border-l lg:border-line" : ""
          }`}
        >
          <Icon className="h-[46px] w-[46px] shrink-0 text-gold-3" />
          <div>
            <p className="text-[13.5px] font-semibold text-grape">{title}</p>
            <p className="mt-[3px] text-[12px] leading-[1.5] text-body">
              {lines[0]}
              <br />
              {lines[1]}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

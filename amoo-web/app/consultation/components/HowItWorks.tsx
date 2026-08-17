import {
  CalendarDays,
  ChevronRight,
  CircleCheck,
  CreditCard,
  Crown,
  Flower2,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Ornament } from "../../components/ornament";

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const steps: Step[] = [
  {
    icon: Flower2,
    title: "Select Service",
    desc: "Choose the service you need guidance on.",
  },
  {
    icon: CalendarDays,
    title: "Choose Mode & Time",
    desc: "Select your preferred mode and convenient time.",
  },
  {
    icon: UserRound,
    title: "Provide Details",
    desc: "Fill in your details and share your concern.",
  },
  {
    icon: CreditCard,
    title: "Make Payment",
    desc: "Secure your booking with easy payment.",
  },
  {
    icon: CircleCheck,
    title: "Get Confirmation",
    desc: "Receive instant confirmation on WhatsApp & Email.",
  },
  {
    icon: MessagesSquare,
    title: "Join & Get Guidance",
    desc: "Join the session and receive powerful guidance.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-[22px] pt-[42px] pb-[26px]">
        <div className="flex items-center justify-center gap-4">
          <Ornament flip className="hidden text-gold sm:block" />
          <h2 className="font-display text-center text-[30px] font-bold text-grape">
            How Our Consultation Works
          </h2>
          <Ornament className="hidden text-gold sm:block" />
        </div>

        <div className="mt-[6px] flex justify-center text-gold">
          <Crown size={16} />
        </div>

        <div className="mt-[26px] flex flex-col items-start justify-center gap-[10px] md:flex-row">
          {steps.flatMap((step, i) => {
            const Icon = step.icon;
            const items = [
              <div
                key={`step-${i}`}
                className="flex w-full flex-col items-center px-2 text-center md:w-[172px]"
              >
                <div className="relative">
                  <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-lilac text-grape-2">
                    <Icon size={28} />
                  </span>
                  <span className="absolute -top-[2px] -left-[2px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-royal text-[12px] font-bold text-white ring-2 ring-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-[12px] text-[13.5px] font-semibold text-grape">
                  {step.title}
                </h3>
                <p className="mt-[5px] text-[11.5px] leading-[1.5] text-body">
                  {step.desc}
                </p>
              </div>,
            ];
            if (i < steps.length - 1) {
              items.push(
                <div
                  key={`conn-${i}`}
                  className="mt-[30px] hidden items-center md:flex"
                >
                  <span className="block h-px w-[28px] border-t-2 border-dotted border-[#c9a45f]" />
                  <ChevronRight
                    size={14}
                    className="-ml-[3px] text-[#c9a45f]"
                  />
                </div>,
              );
            }
            return items;
          })}
        </div>
      </div>
    </section>
  );
}

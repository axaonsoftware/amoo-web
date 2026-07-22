import {
  Clock,
  Compass,
  Flower2,
  HeartHandshake,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Ornament } from "../../components/ornament";
import { SITE_NAME } from "../../../lib/constants";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    icon: Compass,
    title: "Expert Guidance",
    desc: "Get guidance from Reiki Grand Master & spiritual expert.",
  },
  {
    icon: ShieldCheck,
    title: "100% Confidential",
    desc: "Your privacy and trust are always protected with us.",
  },
  {
    icon: Target,
    title: "Accurate Insights",
    desc: "Receive precise insights for better clarity and decision making.",
  },
  {
    icon: HeartHandshake,
    title: "Healing Energy",
    desc: "Experience powerful healing and positive transformation.",
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    desc: "Choose time that suits you with easy scheduling.",
  },
  {
    icon: Flower2,
    title: "Holistic Approach",
    desc: "Guidance for mind, body, emotions and soul.",
  },
];

export default function WhyConsult() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-[22px] pt-[26px] pb-[32px]">
        <div className="flex items-center justify-center gap-4">
          <Ornament flip className="hidden text-gold sm:block" />
          <h2 className="font-display text-center text-[30px] font-bold text-grape">
            Why Consult With {SITE_NAME}?
          </h2>
          <Ornament className="hidden text-gold sm:block" />
        </div>

        <div className="mt-[24px] rounded-[16px] border border-line bg-cream p-[18px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] sm:grid-cols-3 lg:grid-cols-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="flex flex-col items-center rounded-[12px] border border-line bg-white px-[14px] py-[22px] text-center"
              >
                <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full text-gold">
                  <Icon size={30} strokeWidth={1.5} />
                </span>
                <h3 className="mt-[10px] text-[13.5px] font-semibold text-grape">
                  {title}
                </h3>
                <p className="mt-[6px] text-[11.5px] leading-[1.55] text-body">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

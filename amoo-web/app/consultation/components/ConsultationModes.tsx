import {
  CircleCheck,
  Clock,
  MessageSquare,
  Phone,
  ShieldCheck,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Ornament } from "../../components/ornament";

type Mode = {
  Icon: LucideIcon;
  title: string;
  desc: string;
  features: string[];
  price: string;
  cta: string;
};

const MODES: Mode[] = [
  {
    Icon: Phone,
    title: "Audio Call Consultation",
    desc: "Speak directly and receive powerful guidance.",
    features: [
      "Personal 1-to-1 audio call",
      "Clear answers to your questions",
      "Perfect for instant clarity",
      "Secure & private session",
    ],
    price: "₹499",
    cta: "Book Audio Consultation",
  },
  {
    Icon: Video,
    title: "Video Call Consultation",
    desc: "Face-to-face guidance for a deeper connection.",
    features: [
      "Live video interaction",
      "Better understanding & connection",
      "Ideal for detailed consultation",
      "Screen share & visual support",
    ],
    price: "₹999",
    cta: "Book Video Consultation",
  },
  {
    Icon: MessageSquare,
    title: "Chat Consultation",
    desc: "Chat privately and get written guidance.",
    features: [
      "Real-time private chat",
      "Perfect for quick questions",
      "Comfortable & convenient",
      "Detailed written guidance",
    ],
    price: "₹349",
    cta: "Book Chat Consultation",
  },
];

export default function ConsultationModes() {
  return (
    <section className="bg-white mt-15">
      <div className="mx-auto w-full max-w-[1440px] px-[22px] pb-[10px]">
        <div className="relative overflow-hidden rounded-[18px] border border-gold/20 bg-[radial-gradient(115%_130%_at_50%_0%,#2a1245_0%,#1d0c33_55%,#160726_100%)] px-[30px] pt-[28px] pb-[24px]">
          <div className="stars pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative">
            <div className="flex items-center justify-center gap-4">
              <Ornament flip className="hidden text-gold sm:block" />
              <h2 className="font-display text-center text-[30px] font-bold text-white">
                Choose Your Preferred Consultation Mode
              </h2>
              <Ornament className="hidden text-gold sm:block" />
            </div>

            <p className="mt-[10px] text-center text-[13px] text-white/55">
              Every conversation is private, every answer is personalized, every
              guidance is powerful.
            </p>

            <div className="mt-[26px] grid grid-cols-1 gap-[24px] md:grid-cols-3">
              {MODES.map(({ Icon, title, desc, features, price, cta }) => (
                <article
                  key={title}
                  className="flex flex-col rounded-[14px] border border-gold/20 bg-[linear-gradient(180deg,#251038_0%,#1b0b2f_100%)] p-[22px]"
                >
                  <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#8b3fc4,#4d1173)] text-white shadow-[0_0_28px_rgba(139,63,196,0.45)]">
                    <Icon size={32} />
                  </span>

                  <h3 className="font-display mt-[16px] max-w-[170px] text-[22px] leading-[1.2] font-bold text-gold">
                    {title}
                  </h3>

                  <p className="mt-[8px] text-[13px] leading-[1.6] text-white/55">
                    {desc}
                  </p>

                  <ul className="mt-[16px] space-y-[9px]">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-[12.5px] text-white/85"
                      >
                        <CircleCheck size={16} className="shrink-0 text-gold" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-[18px] flex items-center justify-between rounded-[10px] border border-gold/25 bg-[#2b1349]/70 px-[14px] py-[12px]">
                    <div className="flex items-center gap-2.5">
                      <Clock size={20} className="shrink-0 text-gold" />
                      <div>
                        <p className="text-[12.5px] font-medium text-white">
                          Duration
                        </p>
                        <p className="mt-[2px] text-[11.5px] text-white/60">
                          15, 30, 45, 60 Min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gold/90">Starting From</p>
                      <p className="mt-[1px] text-[22px] leading-none font-bold text-gold">
                        {price}
                      </p>
                    </div>
                  </div>

                  <a
                    href="/consultation/select-service"
                    className="mt-[16px] block h-[44px] w-full rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 text-[14px] font-semibold text-[#2b0a3d] leading-[44px] text-center"
                  >
                    {cta}
                  </a>
                </article>
              ))}
            </div>

            <div className="mt-[24px] flex items-center justify-center gap-2.5">
              <ShieldCheck size={17} className="text-gold" />
              <p className="text-[13px] text-white/70">
                All consultations are completely private &amp; confidential.
                Your trust is our priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

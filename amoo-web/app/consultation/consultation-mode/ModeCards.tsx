import Image from "next/image";
import {
  CircleCheck,
  Clock,
  Headphones,
  MessageSquare,
  MessageSquareMore,
  Monitor,
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
  BestIcon: LucideIcon;
  bestFor: string;
  price: string;
  cta: string;
  popular?: boolean;
  image: { src: string; width: number; height: number; className: string };
  /* keeps the header + description clear of the mockup */
  pad: string;
};

const DURATIONS = ["15 Min", "30 Min", "45 Min", "60 Min"];

const MODES: Mode[] = [
  {
    Icon: Phone,
    title: "Audio Call",
    desc: "Speak directly with our expert and get powerful guidance.",
    features: [
      "1-to-1 Audio Call with Expert",
      "Clear answers to all your questions",
      "Personalized remedies & guidance",
      "Secure & private session",
    ],
    BestIcon: Headphones,
    bestFor: "Quick answers, remedies & on the go guidance",
    price: "₹499",
    cta: "Choose Audio Call",
    image: {
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80",
      width: 300,
      height: 440,
      className:
        "absolute top-[12px] right-[16px] h-[120px] w-[85px] sm:h-[158px] sm:w-[112px]",
    },
    pad: "pr-[95px] sm:pr-0",
  },
  {
    Icon: Video,
    title: "Video Call",
    desc: "Face-to-face connection for deeper understanding and clarity.",
    features: [
      "Live Video Call with Expert",
      "Better connection & in-depth discussion",
      "Screen sharing & chart explanation",
      "Personalized solutions & remedies",
    ],
    BestIcon: Monitor,
    bestFor: "Detailed consultation, visual explanation & deep clarity",
    price: "₹999",
    cta: "Choose Video Call",
    popular: true,
    image: {
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=460&q=80",
      width: 460,
      height: 300,
      className:
        "absolute top-[14px] right-[14px] h-[104px] w-[150px] sm:h-[142px] sm:w-[205px]",
    },
    pad: "pr-[160px] sm:pr-0",
  },
  {
    Icon: MessageSquareMore,
    title: "Chat",
    desc: "Chat privately and get written guidance at your convenience.",
    features: [
      "Real-time private chat",
      "Written detailed guidance",
      "Share documents & images",
      "Perfect for quick questions",
    ],
    BestIcon: MessageSquare,
    bestFor: "Quick queries, written advice & detailed solutions",
    price: "₹349",
    cta: "Choose Chat",
    image: {
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80",
      width: 300,
      height: 440,
      className:
        "absolute top-[12px] right-[16px] h-[120px] w-[85px] sm:h-[158px] sm:w-[112px]",
    },
    pad: "pr-[95px] sm:pr-0",
  },
];

export default function ModeCards({
  selectedMode,
  onSelectMode,
}: {
  selectedMode: string | null;
  onSelectMode: (mode: string) => void;
}) {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-[22px] pt-[26px]">
      {/* heading */}
      <div className="flex items-center justify-center gap-[18px]">
        <Ornament flip className="hidden text-gold sm:block" />
        <h1 className="font-display text-center text-[34px] leading-tight font-bold text-[#3b1e63]">
          Select Your Consultation Mode
        </h1>
        <Ornament className="hidden text-gold sm:block" />
      </div>

      <p className="mt-[10px] text-center text-[14px] text-[#6c6b78]">
        Choose the way you feel most comfortable to connect with our expert.
      </p>

      {/* privacy pill */}
      <div className="mt-[16px] flex justify-center">
        <div className="flex items-center gap-[10px] rounded-[10px] border border-[#ecdfc6] bg-white px-[22px] py-[13px] shadow-[0_1px_4px_rgba(75,37,131,0.05)]">
          <ShieldCheck size={18} className="shrink-0 text-gold" />
          <p className="text-[13.5px] text-[#4b3a63]">
            All consultations are 100% private, secure and confidential.
          </p>
        </div>
      </div>

      {/* cards */}
      <div className="mt-[22px] grid grid-cols-1 gap-[22px] lg:grid-cols-3">
        {MODES.map((mode) => (
          <ModeCard
            key={mode.title}
            mode={mode}
            isSelected={selectedMode === mode.title}
            onSelect={() => onSelectMode(mode.title)}
          />
        ))}
      </div>
    </section>
  );
}

function ModeCard({
  mode,
  isSelected,
  onSelect,
}: {
  mode: Mode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    Icon,
    BestIcon,
    title,
    desc,
    features,
    bestFor,
    price,
    cta,
    popular,
    image,
    pad,
  } = mode;

  return (
    <article
      onClick={onSelect}
      className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[16px] p-[20px] transition-all ${
        isSelected
          ? "border-[2px] border-gold shadow-[0_0_0_3px_rgba(224,163,62,0.25)]"
          : "border border-[#c9963f]/55 hover:border-gold/70"
      } bg-[radial-gradient(120%_110%_at_88%_58%,rgba(168,84,196,0.28)_0%,rgba(45,17,73,0)_58%),linear-gradient(165deg,#3f1d69_0%,#2d1149_52%,#230d3d_100%)]`}>
      {popular && (
        <div className="pointer-events-none absolute -right-[40px] top-[18px] z-20 w-[150px] rotate-45 bg-gradient-to-r from-[#f5d68d] to-[#d09b38] py-[4px] text-center text-[9px] font-bold tracking-[0.06em] text-[#3a1a12] uppercase">
          Most Popular
        </div>
      )}

      {/* device mockup */}
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        className={`${image.className} z-0 rounded-[10px] object-cover`}
      />

      {/* header */}
      <div className={`relative z-10 flex items-start gap-[14px] ${pad}`}>
        <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border-2 border-gold/70 bg-[#3a1a5e]/70 text-gold">
          <Icon size={28} />
        </span>
        <div className="pt-[6px]">
          <h2 className="font-display text-[21px] leading-none font-bold tracking-[0.02em] text-gold uppercase">
            {title}
          </h2>
          <p className="mt-[6px] text-[15px] leading-none font-semibold tracking-[0.02em] text-white uppercase">
            Consultation
          </p>
        </div>
      </div>

      {/* description */}
      <p
        className={`relative z-10 mt-[14px] max-w-[250px] text-[13px] leading-[1.6] text-white/70 ${pad}`}
      >
        {desc}
      </p>

      {/* features + best for */}
      <div className="relative z-10 mt-[16px] flex flex-1 items-start gap-[14px]">
        <ul className="flex-1 space-y-[9px]">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-[9px] text-[12.3px] leading-[1.45] text-white/90"
            >
              <CircleCheck size={15} className="mt-[2px] shrink-0 text-gold" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex w-[132px] shrink-0 items-start gap-[8px] pt-[30px]">
          <BestIcon size={22} className="mt-[1px] shrink-0 text-gold" />
          <div>
            <p className="text-[12.5px] leading-none font-bold text-gold">
              Best For
            </p>
            <p className="mt-[5px] text-[10.5px] leading-[1.5] text-white/55">
              {bestFor}
            </p>
          </div>
        </div>
      </div>

      {/* duration + price */}
      <div className="relative z-10 mt-[16px] flex flex-wrap items-center justify-between gap-x-[8px] gap-y-[6px] rounded-[10px] bg-[#e7dcf6] px-[14px] py-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white/70 text-[#5c2d9e]">
            <Clock size={17} />
          </span>
          <div>
            <p className="text-[12px] font-medium text-[#3b2a58]">Duration</p>
            <div className="mt-[4px] flex items-center gap-[8px]">
              {DURATIONS.map((duration, i) => (
                <div key={duration} className="flex items-center gap-[8px]">
                  {i > 0 && <span className="h-[12px] w-px bg-[#c4b2e0]" />}
                  <span className="text-[11.5px] whitespace-nowrap text-[#4a3570]">
                    {duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pl-[8px] text-right">
          <p className="text-[11px] text-[#6b5b86]">Starting From</p>
          <p className="mt-[2px] text-[23px] leading-none font-bold text-[#5c2d9e]">
            {price}
          </p>
        </div>
      </div>

      {/* cta */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className="relative z-10 mt-[14px] h-[46px] w-full rounded-[8px] bg-gradient-to-b from-[#f2cd76] to-[#dfa63f] text-[15px] font-semibold text-[#2b0a3d]"
      >
        {cta}
      </button>
    </article>
  );
}

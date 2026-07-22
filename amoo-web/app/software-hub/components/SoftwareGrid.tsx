import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon } from "./icons";

type Software = {
  title: string;
  description: string;
  features: string[];
  image: string;
  href: string;
};

const SOFTWARE: Software[] = [
  {
    title: "Kundli Generator",
    description: "Generate accurate Vedic Kundlis in seconds.",
    features: [
      "Lagna & Planet Positions",
      "Dasha Analysis",
      "Detailed Reports",
    ],
    image: "/imagesP/kundli_generator.png",
    href: "/software-hub/basic-kundali-software",
  },
  {
    title: "Numerology Software",
    description: "Complete numerology analysis & predictions.",
    features: [
      "Name & DOB Analysis",
      "Personalized Reports",
      "Remedies & Suggestions",
    ],
    image: "/imagesP/numerology_software.png",
    href: "/software-hub/numerology-software",
  },
  {
    title: "Name Numerology",
    description: "Find the perfect name with ideal vibrations.",
    features: ["Name Correction", "Name Suggestions", "Lucky Number & Charts"],
    image: "/imagesP/name_numerology.png",
    href: "/software-hub/numerology-software",
  },
  {
    title: "Tarot Reading",
    description: "Professional tarot reading software for experts.",
    features: [
      "78 Card Meanings",
      "Spreads & Layouts",
      "Client Reading Reports",
    ],
    image: "/imagesP/tarot_reading.png",
    href: "/software-hub/tarot-software",
  },
  {
    title: "Past Life Analysis",
    description: "Discover your past life and karmic lessons.",
    features: ["Past Life Report", "Karmic Patterns", "Soul Purpose Insights"],
    image: "/imagesP/past_life_analysis.png",
    href: "/software-hub",
  },
  {
    title: "Aura Scanner",
    description: "Analyze aura and energy fields with precision.",
    features: ["Aura Report", "Chakra Analysis", "Energy Balancing Tips"],
    image: "/imagesP/aura_scanner.png",
    href: "/software-hub",
  },
  {
    title: "Reiki Healer",
    description: "Reiki healing tracking and client management.",
    features: ["Session Management", "Healing Reports", "Energy Tracking"],
    image: "/imagesP/reiki_healer.png",
    href: "/services/reiki-healing",
  },
  {
    title: "Vastu Analyzer",
    description: "Analyze and correct Vastu defects with ease.",
    features: [
      "Home & Office Analysis",
      "Vastu Score & Map",
      "Remedies & Guidance",
    ],
    image: "/imagesP/vastu_analyzer.png",
    href: "/software-hub",
  },
  {
    title: "Daily Horoscope",
    description: "Generate daily, weekly, monthly horoscopes.",
    features: [
      "All 12 Rashis",
      "Detailed Predictions",
      "Share & Print Reports",
    ],
    image: "/imagesP/daily_horoscope.png",
    href: "/software-hub",
  },
  {
    title: "AI Astro Chat",
    description: "AI-powered astrology assistant for all queries.",
    features: ["Instant Answers", "Birth Chart Insights", "24/7 Support"],
    image: "/imagesP/ai_astro_chat.png",
    href: "/software-hub",
  },
];

export default function SoftwareGrid() {
  return (
    <div className="mt-[13px] grid grid-cols-1 gap-[11px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SOFTWARE.map((s) => (
        <article
          key={s.title}
          className="flex flex-col rounded-[14px] border border-[#f0e4d6] bg-[#fdfbf8] p-[17px] pb-[11px] shadow-[0_2px_10px_rgba(75,37,131,0.05)]"
        >
          <div className="flex items-start gap-[15px]">
            <Image
              src={s.image}
              alt=""
              width={136}
              height={136}
              className="h-[68px] w-[68px] shrink-0 rounded-full object-cover shadow-[0_0_14px_rgba(107,63,160,0.35)]"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[17px] leading-[22px] font-bold text-[#4b2583]">
                {s.title}
              </h3>
              <p className="mt-[6px] text-[10px] leading-[17px] font-normal text-[#57545e]">
                {s.description}
              </p>
            </div>
          </div>

          <ul className="mt-[15px] mb-[8px] space-y-[7px]">
            {s.features.map((f) => (
              <li key={f} className="flex items-center gap-[9px]">
                <CheckCircleIcon className="h-[15px] w-[15px] shrink-0 text-[#ca863c]" />
                <span className="text-[10px] leading-[15px] font-normal text-[#4a4750]">
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={s.href}
            className="mt-auto flex h-[30px] w-full items-center justify-between rounded-[8px] border border-[#e6cfa8] bg-[#fdf6ea] px-[12px]"
          >
            <span className="flex-1 text-center text-[12.5px] font-semibold text-[#4b2583]">
              View Details
            </span>
            <ArrowRightIcon className="h-[13px] w-[13px] shrink-0 text-[#8a5a2b]" />
          </Link>
        </article>
      ))}
    </div>
  );
}

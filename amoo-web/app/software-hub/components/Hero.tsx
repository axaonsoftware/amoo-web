import Image from "next/image";
import {
  BadgeAccurateIcon,
  BadgeEasyIcon,
  BadgeTrustedIcon,
  BadgeUpdatesIcon,
} from "./icons";

const BADGES = [
  { Icon: BadgeAccurateIcon, l1: "Highly Accurate", l2: "Calculations" },
  { Icon: BadgeEasyIcon, l1: "Easy to Use", l2: "Interface" },
  { Icon: BadgeUpdatesIcon, l1: "Regular Updates", l2: "& Support" },
  { Icon: BadgeTrustedIcon, l1: "Trusted by", l2: "Experts" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[400px] w-full overflow-hidden bg-[#14032b] sm:min-h-[460px]">
      {/* full background image */}
      <div className="absolute inset-0">
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/softwareHero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-[#14032b]/70" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pt-[110px] pb-[56px] sm:px-10 lg:px-[82px] lg:pt-[120px] lg:pb-[49px]">
        <h1 className="font-display text-[24px] leading-[1.2] font-bold text-gold sm:text-[36px] lg:text-[40px]">
          Spiritual Software Hub
        </h1>

        <p className="mt-1 text-[18px] leading-[1.4] font-semibold text-white sm:text-[20px] lg:text-[22px]">
          Smart Tools for Divine Guidance
        </p>

        <p className="mt-[11px] w-full max-w-[340px] text-[14px] leading-[23px] font-light text-white/90 lg:text-[15px]">
          Powerful, accurate and easy-to-use spiritual software for
          professionals and seekers.
        </p>

        <div className="mt-[17px] flex w-full max-w-[557px] flex-wrap items-center gap-x-[26px] gap-y-3 rounded-[12px] border border-gold/45 bg-white/[0.04] px-[14px] py-[9px] sm:flex-nowrap">
          {BADGES.map(({ Icon, l1, l2 }) => (
            <div key={l1} className="flex items-center gap-[9px]">
              <Icon className="h-[22px] w-[22px] shrink-0 text-gold" />
              <span className="text-[11.5px] leading-[17px] font-normal whitespace-nowrap text-white">
                {l1}
                <br />
                {l2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

import { HomeHeader } from "../../components/home-header";

import {
  CalendarDays,
  CircleCheck,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const BADGES = [
  { Icon: ShieldCheck, line1: "100% Confidential", line2: "& Safe" },
  { Icon: UserRound, line1: "Expert Guidance", line2: "You Can Trust" },
  { Icon: CalendarDays, line1: "Easy Booking", line2: "Process" },
  { Icon: CircleCheck, line1: "Instant", line2: "Confirmation" },
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden sm:min-h-[490px]">
      <HomeHeader />

      {/* Mobile Image */}
      <div className="relative h-[300px] w-full sm:absolute sm:inset-0 sm:h-full">
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/serviceHeroBg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[95%_center] sm:object-center"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full sm:mx-auto sm:w-full sm:max-w-[1336px] sm:px-5">
        <div className="w-full bg-[#21102b] px-5 py-8 sm:max-w-[520px] sm:bg-transparent sm:px-0 sm:pt-[30px] sm:pb-[54px]">
          <p className="flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.18em] text-gold uppercase sm:mt-14">
            <Sparkles size={14} />
            Consultation
            <span className="h-px w-[26px] bg-gold/60" />
          </p>

          <h1 className="font-display mt-4 text-[30px] leading-[1.15] font-bold lg:mt-[16px] lg:text-[44px]">
            <span className="text-white">Connect. Consult.</span>
            <br />
            <span className="text-gold">Transform.</span>
          </h1>

          <p className="mt-3 text-[16px] font-medium text-white sm:mt-[14px] sm:text-[17px]">
            Personalized Spiritual Guidance Just For You
          </p>

          <p className="mt-3 max-w-[380px] text-[14px] leading-[1.6] text-white/70 sm:mt-[14px] sm:leading-[1.75]">
            Choose the consultation mode that suits you best and connect with
            Reiki Grand Master Surinder Kaur Sehgal for accurate guidance and
            powerful healing.
          </p>

          <ul className="mt-6 flex w-full flex-wrap justify-center gap-x-3 gap-y-6 sm:mt-[30px] sm:justify-start sm:gap-[30px]">
            {BADGES.map(({ Icon, line1, line2 }) => (
              <li
                key={line1}
                className="flex w-[calc(50%-6px)] flex-col items-center text-center sm:w-[92px]"
              >
                <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-gold/50 bg-white/[0.04] text-gold">
                  <Icon size={22} />
                </span>

                <p className="mt-[10px] text-[11.5px] leading-[1.45] text-white">
                  {line1}
                  <br />
                  {line2}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

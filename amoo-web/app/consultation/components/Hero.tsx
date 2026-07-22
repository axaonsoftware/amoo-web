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
    <section className="relative min-h-[420px] w-full overflow-hidden sm:min-h-[490px]">
      <Image
        src="/imagesP/serviceHeroBg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <HomeHeader />

      <div className="relative z-10 mx-auto w-full max-w-[1336px] px-5 mb-4">
        <div className="w-full max-w-[520px] pt-[30px] pb-[54px]">
          <p className="flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.18em] text-gold uppercase mt-14">
            <Sparkles size={14} />
            Consultation
            <span className="h-px w-[26px] bg-gold/60" />
          </p>

          <h1 className="font-display mt-[16px] text-[28px] lg:text-[44px] leading-[1.15] font-bold">
            <span className="text-white">Connect. Consult.</span>
            <br />
            <span className="text-gold">Transform.</span>
          </h1>

          <p className="mt-[14px] text-[17px] font-medium text-white">
            Personalized Spiritual Guidance Just For You
          </p>

          <p className="mt-[14px] max-w-[380px] text-[14px] leading-[1.75] text-white/70">
            Choose the consultation mode that suits you best and connect with
            Reiki Grand Master Surinder Kaur Sehgal for accurate guidance and
            powerful healing.
          </p>

          <ul className="mt-[30px] flex items-start gap-[30px]">
            {BADGES.map(({ Icon, line1, line2 }) => (
              <li
                key={line1}
                className="flex w-[92px] flex-col items-center text-center"
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

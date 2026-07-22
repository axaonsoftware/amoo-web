import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  LotusIcon,
} from "../../../components/home-icons";
import {
  ChakraBalancingIcon,
  DivineEnergyIcon,
  EmotionalHealingIcon,
  EnergyClearingIcon,
} from "./icons";

const FEATURES = [
  { icon: DivineEnergyIcon, lines: ["Divine Healing", "Energy"] },
  { icon: ChakraBalancingIcon, lines: ["Chakra", "Balancing"] },
  { icon: EmotionalHealingIcon, lines: ["Emotional", "Healing"] },
  { icon: EnergyClearingIcon, lines: ["Energy", "Clearing"] },
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

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(23,4,38,0.7)_0%,rgba(23,4,38,0.4)_32%,rgba(23,4,38,0)_58%)]" />

      <div className="relative mx-auto h-full w-full max-w-[1336px] px-5">
        <div className="w-full max-w-[560px] pt-[122px] pb-[70px]">
          <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.16em] text-gold uppercase">
            <LotusIcon className="h-[16px] w-[16px]" />
            Reiki Healing
          </p>

          <h1 className="font-display mt-[16px] text-[28px] leading-[1.24] font-bold sm:text-[46px]">
            <span className="text-[#f0c874]">Heal. Balance.</span>
            <br />
            <span className="text-white">Transform.</span>
          </h1>

          <p className="mt-[16px] max-w-[430px] text-[14px] leading-[1.8] text-white/85">
            Experience the divine energy of Reiki to heal your mind, body,
            emotions and soul. Remove energy blocks and realign with positivity,
            peace and purpose.
          </p>

          <ul className="mt-[26px] flex flex-wrap gap-x-[26px] gap-y-5">
            {FEATURES.map(({ icon: Icon, lines }) => (
              <li key={lines.join(" ")} className="w-[74px] text-center">
                <span className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-full border border-gold/55 bg-white/[0.04] text-gold">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <p className="mt-[9px] text-[10.5px] leading-[1.45] text-white/90">
                  {lines[0]}
                  <br />
                  {lines[1]}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-[30px] flex flex-wrap items-center gap-[18px]">
            <Link
              href="/consultation/consultation-mode?service=Reiki%20Healing%20Session"
              className="flex h-[48px] items-center gap-2.5 rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 px-[24px] text-[14px] font-semibold text-[#2b0a3d]"
            >
              <CalendarIcon className="h-[17px] w-[17px]" />
              Book Reiki Session
            </Link>
            <Link
              href="/services/reiki-healing"
              className="flex h-[48px] items-center gap-3 rounded-[8px] border border-white/50 px-[24px] text-[14px] font-medium text-white"
            >
              Explore Reiki Services
              <ArrowRightIcon className="h-[16px] w-[16px]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section className="relative w-full overflow-hidden sm:min-h-[490px]">
      {/* Image */}
      <div className="relative h-[300px] w-full sm:absolute sm:inset-0 sm:h-full">
        <Image
          src="/reiki2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[35%_center] sm:object-center"
        />
      </div>

      {/* Desktop overlay */}
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(23,4,38,0)_0%,rgba(23,4,38,0.15)_42%,rgba(23,4,38,0.65)_72%,rgba(23,4,38,0.78)_100%)] sm:block" />

      <div className="relative mx-auto flex w-full max-w-[1336px] justify-end px-0 sm:h-full sm:px-5">
        <div className="w-full max-w-none bg-[#21102b] px-5 py-[32px] sm:max-w-[560px] sm:bg-transparent sm:px-0 sm:py-10 lg:pt-[122px] lg:pb-[70px]">
          <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.16em] text-gold uppercase">
            <LotusIcon className="h-[16px] w-[16px]" />
            Reiki Healing
          </p>

          <h1 className="font-display mt-[16px] text-[28px] leading-[1.15] font-bold sm:text-[46px] sm:leading-[1.24]">
            <span className="text-[#f0c874]">Heal. Balance.</span>
            <br />
            <span className="text-white">Transform.</span>
          </h1>

          <p className="mt-[16px] max-w-[430px] text-[14px] leading-[1.55] text-white/85 sm:leading-[1.8]">
            Experience the divine energy of Reiki to heal your mind, body,
            emotions and soul. Remove energy blocks and realign with positivity,
            peace and purpose.
          </p>

          <ul className="mt-[26px] flex flex-wrap gap-x-[26px] gap-y-5">
            {FEATURES.map(({ icon: Icon, lines }) => (
              <li
                key={lines.join(" ")}
                className="w-[calc(50%-13px)] text-center sm:w-[74px]"
              >
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

          <div className="mt-[30px] flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[18px]">
            <Link
              href="/consultation/consultation-mode?service=Reiki%20Healing%20Session"
              className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-gradient-to-b from-gold-2 to-gold-3 px-[24px] text-[14px] font-semibold text-[#2b0a3d] sm:w-auto"
            >
              <CalendarIcon className="h-[17px] w-[17px]" />
              Book Reiki Session
            </Link>

            <Link
              href="/services/reiki-healing"
              className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[8px] border border-white/50 px-[24px] text-[14px] font-medium text-white sm:w-auto"
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

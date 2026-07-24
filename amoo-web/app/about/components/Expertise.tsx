import Image from "next/image";
import {
  CheckCircleIcon,
  SparkOrnament,
  StatLotusIcon,
  StatMedalIcon,
  StatStarIcon,
  StatUsersIcon,
} from "./icons";

const STATS = [
  { Icon: StatMedalIcon, value: "20+", label: ["Years of", "Experience"] },
  { Icon: StatLotusIcon, value: "50K+", label: ["Consultations", "Completed"] },
  { Icon: StatUsersIcon, value: "25K+", label: ["Happy", "Clients"] },
  { Icon: StatStarIcon, value: "98%", label: ["Client", "Satisfaction"] },
];

const CREDENTIALS = [
  "Reiki Grand Master",
  "Chakra Healer",
  "Numerology Expert",
  "Spiritual Teacher",
  "Tarot Card Reader",
  "Life Coach & Guide",
];

export default function Expertise() {
  return (
    <section className="relative grid w-full grid-cols-1 bg-[#21102b] lg:grid-cols-[41.2%_1fr_18.5%]">
      {/* Portrait */}
      <div className="relative min-h-[300px] w-full lg:min-h-[500px]">
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/aboutLady2.png"
          alt="Surinder Kaur Sehgal writing"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 41vw"
          className="object-cover object-center"
        />
      </div>

      {/* Credentials panel */}
      <div className="bg-[#21102b] px-6 pt-[26px] pb-[28px] lg:px-[30px]">
        <div className="flex items-center justify-center gap-3">
          <SparkOrnament flip className="h-[11px] w-[38px] text-gold" />
          <h2 className="font-display text-[26px] leading-none font-bold text-white">
            My Expertise &amp; Credentials
          </h2>
          <SparkOrnament className="h-[11px] w-[38px] text-gold" />
        </div>

        <p className="mt-[14px] text-center text-[12px] leading-[20px] text-white/85">
          I blend the divine sciences of Reiki, Numerology, Tarot and Astrology
          <br />
          to provide holistic solutions for mind, body and soul.
        </p>

        <div className="mt-[20px] grid grid-cols-1 sm:grid-cols-2 gap-[10px] sm:grid-cols-4">
          {STATS.map(({ Icon, value, label }) => (
            <div
              key={value}
              className="flex h-[129px] flex-col items-center justify-center rounded-[10px] border border-gold/30 bg-[#2f103f] px-2"
            >
              <Icon className="h-[26px] w-[26px] text-gold" />
              <p className="mt-[8px] font-display text-[26px] leading-none font-bold text-gold">
                {value}
              </p>
              <p className="mt-[8px] text-center text-[11px] leading-[15px] text-white/90">
                {label.map((liner) => (
                  <span key={liner} className="block">
                    {liner}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-[14px] rounded-[10px] border border-gold/25 bg-[#2a1136]/60 px-[26px] py-[18px]">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-[14px] sm:grid-cols-2">
            {CREDENTIALS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-[10px] text-[14px] text-white"
              >
                <CheckCircleIcon className="h-[18px] w-[18px] shrink-0 text-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Om panel */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#1a0828] px-4 py-4">
        <Image
          src="https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/OmSignP.png"
          alt="Om"
          width={330}
          height={330}
          className="relative h-[290px] w-[290px] object-contain mt-5"
        />
        <p className="relative  text-center text-[13px] leading-[22px] text-white">
          My guidance is not just
          <br />
          about predictions,
          <br />
          it&apos;s about transformation.
        </p>
      </div>
    </section>
  );
}

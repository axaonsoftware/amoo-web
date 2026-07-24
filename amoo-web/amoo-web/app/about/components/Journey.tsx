import Image from "next/image";
import {
  DashedConnector,
  JourneyBookIcon,
  JourneyButterflyIcon,
  JourneyLotusIcon,
  JourneySearchIcon,
  JourneyStarIcon,
  JourneyUsersIcon,
  SparkOrnament,
} from "./icons";

const STEPS = [
  {
    Icon: JourneyLotusIcon,
    title: "Early Awakening",
    body: ["A deep connection", "with spirituality", "from a young age."],
  },
  {
    Icon: JourneySearchIcon,
    title: "The Search",
    body: ["Years of exploring", "ancient wisdom,", "healing & energies."],
  },
  {
    Icon: JourneyBookIcon,
    title: "Learning & Training",
    body: ["Trained under great", "masters in Reiki,", "Numerology & Tarot."],
  },
  {
    Icon: JourneyButterflyIcon,
    title: "Transformation",
    body: ["Experiencing the", "power of healing and", "inner transformation."],
  },
  {
    Icon: JourneyUsersIcon,
    title: "Guiding Others",
    body: ["Started helping", "people find clarity,", "healing & balance."],
  },
  {
    Icon: JourneyStarIcon,
    title: "Today",
    body: [
      "Thousands of lives",
      "transformed with love,",
      "wisdom & guidance.",
    ],
  },
];

export default function Journey() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#0e041e] via-[#1b0730] to-[#0e041e] pt-[40px] pb-[36px]">
      <div className="stars pointer-events-none absolute inset-0 opacity-50" />

      <Image
        src="/images/deco-chakra-left.png"
        alt=""
        width={222}
        height={399}
        aria-hidden
        className="pointer-events-none absolute -bottom-[10px] left-0 hidden h-[190px] w-[120px] object-cover opacity-70 xl:block"
      />
      <Image
        src="/images/deco-chakra-right.png"
        alt=""
        width={222}
        height={399}
        aria-hidden
        className="pointer-events-none absolute -bottom-[10px] right-0 hidden h-[190px] w-[120px] object-cover opacity-70 xl:block"
      />

      <div className="relative mx-auto w-full max-w-[1336px] px-5">
        <div className="flex items-center justify-center gap-3">
          <SparkOrnament flip className="h-[12px] w-[46px] text-gold" />
          <h2 className="font-display text-[28px] leading-none font-bold text-white">
            My Spiritual Journey
          </h2>
          <SparkOrnament className="h-[12px] w-[46px] text-gold" />
        </div>

        <ol className="mx-auto mt-[30px] grid max-w-[1140px] grid-cols-2 gap-y-9 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
          {STEPS.map(({ Icon, title, body }, index) => (
            <li
              key={title}
              className="relative flex flex-col items-center px-2 text-center"
            >
              {index > 0 && (
                <DashedConnector className="pointer-events-none absolute top-[35px] right-[calc(50%+42px)] hidden h-[8px] w-[calc(100%-84px)] -translate-y-1/2 text-gold/70 lg:block" />
              )}

              <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full border border-gold/45 bg-[#41174e]/70">
                <Icon className="h-[32px] w-[32px] text-gold-2" />
              </span>

              <h3 className="mt-[16px] text-[15px] leading-none font-semibold text-gold">
                {title}
              </h3>

              <p className="mt-[12px] text-[12px] leading-[19px] text-white/85">
                {body.map((liner) => (
                  <span key={liner} className="block">
                    {liner}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

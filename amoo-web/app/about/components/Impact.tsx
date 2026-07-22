import {
  ImpactEnergyIcon,
  ImpactHandsHeartIcon,
  ImpactLotusIcon,
  ImpactMeditateIcon,
  SparkOrnament,
} from "./icons";

const CARDS = [
  {
    Icon: ImpactHandsHeartIcon,
    title: "Lives Transformed",
    body: ["Helping people find peace,", "healing & happiness."],
  },
  {
    Icon: ImpactMeditateIcon,
    title: "Emotional Healing",
    body: ["Releasing stress, anxiety", "and emotional blocks."],
  },
  {
    Icon: ImpactEnergyIcon,
    title: "Energy Balance",
    body: ["Restoring harmony in", "mind, body and soul."],
  },
  {
    Icon: ImpactLotusIcon,
    title: "Spiritual Growth",
    body: ["Guiding towards higher", "consciousness & purpose."],
  },
];

export default function Impact() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0219] pt-[20px] pb-[22px]">
      <div className="stars pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[1336px] px-5">
        <div className="flex items-center justify-center gap-3">
          <SparkOrnament flip className="h-[11px] w-[40px] text-gold" />
          <h2 className="font-display text-[25px] leading-none font-bold text-white">
            The Impact We Create Together
          </h2>
          <SparkOrnament className="h-[11px] w-[40px] text-gold" />
        </div>

        <div className="mx-auto mt-[22px] grid max-w-[1150px] grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="flex h-[94px] items-center gap-[14px] rounded-[10px] border border-gold/25 bg-[#271139]/80 px-[16px]"
            >
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border border-gold/40 bg-[#3a1550]">
                <Icon className="h-[30px] w-[30px] text-gold-2" />
              </span>
              <div>
                <h3 className="font-display text-[14.5px] leading-none font-bold text-gold">
                  {title}
                </h3>
                <p className="mt-[8px] text-[11.5px] leading-[17px] text-white/85">
                  {body.map((liner) => (
                    <span key={liner} className="block">
                      {liner}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import {
  StatAwardIcon,
  StatGlobeIcon,
  StatLotusIcon,
  StatStarIcon,
  StatUsersIcon,
} from "./icons";

const STATS = [
  { Icon: StatUsersIcon, value: "50K+", label: "Happy Clients" },
  { Icon: StatStarIcon, value: "98%", label: "Client Satisfaction" },
  { Icon: StatAwardIcon, value: "20+", label: "Years of Experience" },
  { Icon: StatLotusIcon, value: "100K+", label: "Sessions Conducted" },
  { Icon: StatGlobeIcon, value: "Worldwide", label: "Healing & Guidance" },
];

export default function StatsBand() {
  return (
    <div className="mx-auto w-full max-w-[1336px] px-5 pt-[56px]">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[14px] bg-[radial-gradient(120%_150%_at_50%_40%,#3a1560_0%,#2a0f46_50%,#1b0a2e_100%)] px-[20px] py-[24px]">
        <div className="haze pointer-events-none absolute inset-0 opacity-60" />

        <ul className="relative grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map(({ Icon, value, label }, index) => (
            <li
              key={label}
              className={`flex flex-col items-center justify-center px-[16px] py-[10px] ${
                index === 0 ? "" : "lg:border-l lg:border-gold/20"
              }`}
            >
              <Icon className="h-[32px] w-[32px] text-gold" />
              <p className="font-display mt-[10px] text-[24px] leading-none font-bold text-gold">
                {value}
              </p>
              <p className="mt-[8px] text-[11.5px] leading-none text-white/85">
                {label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import {
  TabAchievementsIcon,
  TabCertificationsIcon,
  TabDrivesIcon,
  TabExperienceIcon,
  TabJourneyIcon,
  TabMediaIcon,
  TabStoriesIcon,
} from "./icons";

const TABS = [
  { label: "My Journey", Icon: TabJourneyIcon, active: true },
  { label: "Experience", Icon: TabExperienceIcon },
  { label: "Certifications", Icon: TabCertificationsIcon },
  { label: "Achievements", Icon: TabAchievementsIcon },
  { label: "Media & Gallery", Icon: TabMediaIcon },
  { label: "Success Stories", Icon: TabStoriesIcon },
  { label: "What Drives Me", Icon: TabDrivesIcon },
];

export default function TabsBar() {
  return (
    <nav className="relative z-20 w-full border-b border-white/5 bg-[#150824] ">
      <div className="mx-auto flex min-h-[56px] w-full max-w-[1336px] items-center justify-center overflow-x-auto px-5">
        <ul className="flex items-center gap-[26px]">
          {TABS.map(({ label, Icon, active }) => (
            <li key={label}>
              <button
                type="button"
                className={`relative flex h-[42px] items-center gap-2 whitespace-nowrap rounded-[8px] px-[14px] text-[13px] transition-colors ${
                  active
                    ? "border border-gold/70 font-medium text-gold"
                    : "font-normal text-white/85 hover:text-gold"
                }`}
              >
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 ${
                    active ? "text-gold" : "text-gold/85"
                  }`}
                />
                {label}
                {active && (
                  <span className="absolute -bottom-[8px] left-1/2 flex w-[46px] -translate-x-1/2 flex-col items-center">
                    <span className="h-px w-full bg-gold" />
                    <span className="mt-[3px] h-[3px] w-[3px] rotate-45 bg-gold" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

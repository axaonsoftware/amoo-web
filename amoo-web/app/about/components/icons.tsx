import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* ---------- Heading ornament ---------- */

export function SparkOrnament({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 46 12"
      fill="none"
      aria-hidden="true"
      className={`${flip ? "scale-x-[-1]" : ""} ${className}`}
    >
      <path
        d="M38.6 1.2c.5 3 1.7 4.2 4.7 4.8-3 .6-4.2 1.8-4.7 4.8-.5-3-1.7-4.2-4.7-4.8 3-.6 4.2-1.8 4.7-4.8Z"
        fill="currentColor"
      />
      <path d="M0 6h31.6" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ---------- Hero ---------- */

export function AboutBadgeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3" />
        <path d="m5.4 5.4 2.1 2.1M16.5 16.5l2.1 2.1M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1" />
      </g>
    </svg>
  );
}

export function HeroDividerDiamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 380 10" fill="none" aria-hidden="true" className={className}>
      <path d="M0 5h172" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <path d="M190 0.6 194.6 5 190 9.4 185.4 5Z" fill="currentColor" />
      <path d="M208 5h172" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
    </svg>
  );
}

/* ---------- Tab bar ---------- */

export function TabJourneyIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="4" y="3.4" width="16" height="17.2" rx="2.2" />
      <path d="M12 7.2c1.6 1.3 2.4 2.6 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1.4.8-2.7 2.4-4Z" />
      <path d="M7.4 17.4h9.2" />
    </svg>
  );
}

export function TabExperienceIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 3.2 13.5 6l3.1.4-2.3 2.2.6 3.1L12 10.3 9.1 11.7l.6-3.1L7.4 6.4 10.5 6Z" />
      <path d="M6.6 13.8 4.4 20.6l3.4-1.6 2.2 1.6M17.4 13.8l2.2 6.8-3.4-1.6-2.2 1.6" />
    </svg>
  );
}

export function TabCertificationsIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="4.2" y="3.4" width="15.6" height="17.2" rx="2" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M10.2 12.6 9.4 17l2.6-1.3 2.6 1.3-.8-4.4" />
    </svg>
  );
}

export function TabAchievementsIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="4.2" y="3.4" width="15.6" height="17.2" rx="2" />
      <path d="M8.6 7h6.8v3.2a3.4 3.4 0 0 1-6.8 0Z" />
      <path d="M12 13.6V16M9.6 17.6h4.8" />
    </svg>
  );
}

export function TabMediaIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2" />
      <circle cx="8.4" cy="9.6" r="1.6" />
      <path d="m4.6 17.2 4.6-4.6 3.4 3.2 3-2.6 3.8 4" />
    </svg>
  );
}

export function TabStoriesIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2" />
      <path d="M7.6 8.4h8.8M7.6 11.6h8.8M7.6 14.8h5.4" />
    </svg>
  );
}

export function TabDrivesIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2" />
      <path d="M12 17.2s-4-2.4-4-5.4a2.4 2.4 0 0 1 4-1.7 2.4 2.4 0 0 1 4 1.7c0 3-4 5.4-4 5.4Z" />
    </svg>
  );
}

/* ---------- Journey timeline ---------- */

export function JourneyLotusIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 6.4c1.5 1.4 2.3 2.9 2.3 4.5 0 .8-.2 1.6-.5 2.3h-3.6a5.7 5.7 0 0 1-.5-2.3c0-1.6.8-3.1 2.3-4.5Z" />
      <path d="M5.4 9.6c1.9.4 3.3 1.3 4.2 2.6.3.4.5.9.7 1.4H6.9a5.5 5.5 0 0 1-1.5-4ZM18.6 9.6a5.5 5.5 0 0 1-1.5 4h-3.4c.2-.5.4-1 .7-1.4.9-1.3 2.3-2.2 4.2-2.6Z" />
      <path d="M4 14.4h16c-1.4 2.4-4.4 3.9-8 3.9s-6.6-1.5-8-3.9Z" />
    </svg>
  );
}

export function JourneySearchIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="11" cy="10.6" r="5.4" />
      <path d="m15.2 14.8 4 4" strokeWidth={1.8} />
    </svg>
  );
}

export function JourneyBookIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 7.4C10.4 6 8.2 5.4 4.6 5.6v10.6c3.6-.2 5.8.4 7.4 1.8 1.6-1.4 3.8-2 7.4-1.8V5.6c-3.6-.2-5.8.4-7.4 1.8Z" />
      <path d="M12 7.4v10.6" />
    </svg>
  );
}

export function JourneyButterflyIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 7.6v9.2" />
      <path d="M12 8.4c-.8-2-2.4-3.4-4.2-3.4-1.7 0-2.9 1.3-2.9 3 0 2.2 2.4 3.6 4.4 4.2-2 .6-4.4 1.6-4.4 3.6 0 1.4 1.1 2.4 2.6 2.4 2 0 4-1.9 4.5-4.4" />
      <path d="M12 8.4c.8-2 2.4-3.4 4.2-3.4 1.7 0 2.9 1.3 2.9 3 0 2.2-2.4 3.6-4.4 4.2 2 .6 4.4 1.6 4.4 3.6 0 1.4-1.1 2.4-2.6 2.4-2 0-4-1.9-4.5-4.4" />
      <path d="m12 7.6-1.2-1.8M12 7.6l1.2-1.8" />
    </svg>
  );
}

export function JourneyUsersIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="12" cy="8" r="2.6" />
      <path d="M8 17.4a4 4 0 0 1 8 0" />
      <circle cx="5.6" cy="9.6" r="2" />
      <path d="M2.4 16.6a3.3 3.3 0 0 1 3.2-3.4" />
      <circle cx="18.4" cy="9.6" r="2" />
      <path d="M21.6 16.6a3.3 3.3 0 0 0-3.2-3.4" />
    </svg>
  );
}

export function JourneyStarIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="m12 5.4 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7Z" />
    </svg>
  );
}

export function DashedConnector({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 8" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 4h108"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1 5"
      />
      <path
        d="m110 1 4 3-4 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Expertise ---------- */

export function StatMedalIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="12" cy="12.6" r="5.6" />
      <circle cx="12" cy="12.6" r="2.4" />
      <path d="m8.4 6.4-2-3.2M15.6 6.4l2-3.2" />
    </svg>
  );
}

export function StatLotusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 5.6c1.6 1.6 2.5 3.2 2.5 4.9 0 .9-.2 1.8-.6 2.6h-3.8a6.2 6.2 0 0 1-.6-2.6c0-1.7.9-3.3 2.5-4.9Z" />
      <path d="M4.6 9.4c2.1.5 3.7 1.5 4.7 3 .3.5.6 1 .8 1.6H6.4a6 6 0 0 1-1.8-4.6ZM19.4 9.4a6 6 0 0 1-1.8 4.6h-3.7c.2-.6.5-1.1.8-1.6 1-1.5 2.6-2.5 4.7-3Z" />
      <path d="M3.2 15.2h17.6c-1.5 2.7-4.8 4.4-8.8 4.4s-7.3-1.7-8.8-4.4Z" />
    </svg>
  );
}

export function StatUsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="8.2" r="2.9" />
      <path d="M12 12.4a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5Z" />
      <circle cx="5.2" cy="9.8" r="2.1" />
      <path d="M5.2 13.2A3.9 3.9 0 0 0 1.6 17.4h3.3a6.9 6.9 0 0 1 1.6-4.1 4 4 0 0 0-1.3-.1Z" />
      <circle cx="18.8" cy="9.8" r="2.1" />
      <path d="M18.8 13.2a3.9 3.9 0 0 1 3.6 4.2h-3.3a6.9 6.9 0 0 0-1.6-4.1 4 4 0 0 1 1.3-.1Z" />
    </svg>
  );
}

export function StatStarIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="m12 4.2 2.5 5.1 5.6.8-4.1 3.9.97 5.6L12 17l-5 2.6.97-5.6L3.9 10.1l5.6-.8Z" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="m8 12.2 2.7 2.7L16.2 9.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Mission / Vision ---------- */

export function MissionLotusIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="M12 3.4c1.7 1.8 2.6 3.5 2.6 5.2 0 1-.3 2-.8 2.9h-3.6a6.4 6.4 0 0 1-.8-2.9c0-1.7.9-3.4 2.6-5.2Z" />
      <path d="M4.4 8c2.2.5 3.9 1.6 5 3.2.3.5.6 1 .8 1.5H6.4A6.3 6.3 0 0 1 4.4 8ZM19.6 8a6.3 6.3 0 0 1-2 4.7h-3.8c.2-.5.5-1 .8-1.5 1.1-1.6 2.8-2.7 5-3.2Z" />
      <path d="M3 14.4h18c-1.6 2.9-5 4.7-9 4.7s-7.4-1.8-9-4.7Z" />
    </svg>
  );
}

export function VisionEyeIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="M2.8 14.4c2.4-3.2 5.5-4.8 9.2-4.8s6.8 1.6 9.2 4.8c-2.4 3.2-5.5 4.8-9.2 4.8s-6.8-1.6-9.2-4.8Z" />
      <circle cx="12" cy="14.4" r="2.6" />
      <path d="M12 3.2v1.6M6.6 4.4l.6 1.5M17.4 4.4l-.6 1.5M3 6.6l1.2 1M21 6.6l-1.2 1" strokeWidth={1.2} />
    </svg>
  );
}

/* ---------- Impact ---------- */

export function ImpactHandsHeartIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 10.6s-2.6-1.6-2.6-3.5a1.7 1.7 0 0 1 2.6-1.3 1.7 1.7 0 0 1 2.6 1.3c0 1.9-2.6 3.5-2.6 3.5Z" />
      <path d="M3.6 12.4c1.6 0 2.6 1 3.2 2.2l1.8 3.4M20.4 12.4c-1.6 0-2.6 1-3.2 2.2l-1.8 3.4" />
      <path d="M8.6 18v2.4M15.4 18v2.4" />
    </svg>
  );
}

export function ImpactMeditateIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="5.6" r="2.2" />
      <path d="M12 8.6c-2 0-3.4 1.6-3.4 3.6v2.2" />
      <path d="M8.6 14.4c-2.2.5-4 1.6-4 2.8 0 1.6 3.3 2.8 7.4 2.8s7.4-1.2 7.4-2.8c0-1.2-1.8-2.3-4-2.8" />
      <path d="M12 8.6c2 0 3.4 1.6 3.4 3.6v2.2" />
    </svg>
  );
}

export function ImpactEnergyIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="12.4" r="5.4" />
      <circle cx="12" cy="12.4" r="1.9" />
      <path d="M12 2.6v2.6M12 19.4v2M6.2 6.2 7.8 7.8M16.2 17 17.8 18.6M6.2 18.6 7.8 17M16.2 7.8 17.8 6.2" />
    </svg>
  );
}

export function ImpactLotusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3.6c1.9 1.9 2.9 3.9 2.9 6 0 1.2-.3 2.3-.8 3.3h-4.2a7.2 7.2 0 0 1-.8-3.3c0-2.1 1-4.1 2.9-6Z" />
      <path d="M3.6 8.6c2.5.6 4.4 1.9 5.6 3.7.4.6.7 1.2 1 1.9H6a7 7 0 0 1-2.4-5.6ZM20.4 8.6A7 7 0 0 1 18 14.2h-4.2c.3-.7.6-1.3 1-1.9 1.2-1.8 3.1-3.1 5.6-3.7Z" />
      <path d="M2.4 15.6h19.2c-1.7 3.1-5.4 5-9.6 5s-7.9-1.9-9.6-5Z" />
    </svg>
  );
}

/* ---------- Carousel ---------- */

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.6} {...props}>
      <path d="m14 5.5-7 6.5 7 6.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.6} {...props}>
      <path d="m10 5.5 7 6.5-7 6.5" />
    </svg>
  );
}

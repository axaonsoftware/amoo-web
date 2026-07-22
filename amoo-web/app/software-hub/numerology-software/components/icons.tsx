import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* ---------- "Why choose" card icons ---------- */

/** Two people — "For Professionals". */
export function ProfessionalsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.2" cy="7.4" r="3.6" />
      <path d="M2.8 20.4a6.4 6.4 0 0 1 12.8 0" />
      <path d="M16.4 4.4a3.6 3.6 0 0 1 0 6.9" />
      <path d="M17.8 14.4a6.4 6.4 0 0 1 3.4 6" />
    </svg>
  );
}

/** Tablet / phone — "Access Anywhere". */
export function DeviceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6.4" y="2.6" width="11.2" height="18.8" rx="2.2" />
      <path d="M10.4 5.4h3.2" />
      <circle cx="12" cy="18.2" r="1" />
    </svg>
  );
}

/* ---------- Sample report row icons ---------- */

/** Winding path with a marker — "Life Path Number". */
export function LifePathIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <path d="M5.4 20.6c0-3.4 3.2-4.2 6-4.6 2.8-.4 5.6-1.2 5.6-4" />
      <circle cx="17" cy="8.2" r="2.6" />
      <path d="M17 3.4v2.2M17 10.8V13" />
      <circle cx="5.4" cy="20.6" r="1.4" />
    </svg>
  );
}

/** Standing figure reaching upward — "Destiny Number". */
export function DestinyIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <circle cx="12" cy="4.4" r="2" />
      <path d="M12 6.4v7.2" />
      <path d="M12 8.4 8.2 6.6M12 8.4l3.8-1.8" />
      <path d="m12 13.6-2.8 6.8M12 13.6l2.8 6.8" />
    </svg>
  );
}

/** Seated figure in meditation — "Soul Urge Number". */
export function SoulUrgeIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <circle cx="12" cy="4.8" r="2.2" />
      <path d="M12 7v4.4" />
      <path d="M12 9.4 7.4 12.6M12 9.4l4.6 3.2" />
      <path d="M6.4 17.4c1.4-2 3.4-3 5.6-3s4.2 1 5.6 3" />
      <path d="M5.2 20.2h13.6" />
    </svg>
  );
}

/** Person bust with an outline — "Personality Number". */
export function PersonalityIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <circle cx="12" cy="7.6" r="3.8" />
      <path d="M4.6 20.6a7.4 7.4 0 0 1 14.8 0" />
      <path d="M8.4 4.6 6.6 2.8M15.6 4.6l1.8-1.8" />
    </svg>
  );
}

/** Calendar — "Birth Date Analysis". */
export function BirthDateIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="2" />
      <path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6" />
      <path d="M7.8 13h2.2M14 13h2.2M7.8 16.6h2.2M14 16.6h2.2" />
    </svg>
  );
}

/* ---------- Section heading marks ---------- */

/** Small gold flourish beside "Powerful Features". */
export function LotusMarkIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <path d="M12 3.6c1.9 2 2.8 4 2.8 6.2S13.9 14 12 15.6c-1.9-1.6-2.8-3.6-2.8-5.8S10.1 5.6 12 3.6Z" />
      <path d="M12 15.6c-2.5 0-4.6-1-6.2-3 .5-1.9 1.5-3.2 3-4" />
      <path d="M12 15.6c2.5 0 4.6-1 6.2-3-.5-1.9-1.5-3.2-3-4" />
      <path d="M4.4 17.4c2 2.1 4.5 3.1 7.6 3.1s5.6-1 7.6-3.1" />
    </svg>
  );
}

/** Small gold report mark beside "Sample Numerology Report". */
export function ReportMarkIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <path d="M14 2.8H6.6a1.6 1.6 0 0 0-1.6 1.6v15.2a1.6 1.6 0 0 0 1.6 1.6h10.8a1.6 1.6 0 0 0 1.6-1.6V7.8Z" />
      <path d="M14 2.8v5h5" />
      <path d="M8.6 13.4v4M12 11.2v6.2M15.4 14.8v2.6" />
    </svg>
  );
}

/* ---------- Testimonial icons ---------- */

/** Decorative opening quote used on the testimonial cards. */
export function QuoteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.4 5.6c-3 1.3-4.8 3.7-4.8 6.6 0 .5.1 1 .2 1.4a3.1 3.1 0 1 0 3-3.7c.4-1.3 1.4-2.4 2.9-3.1Zm9.6 0c-3 1.3-4.8 3.7-4.8 6.6 0 .5.1 1 .2 1.4a3.1 3.1 0 1 0 3-3.7c.4-1.3 1.4-2.4 2.9-3.1Z" />
    </svg>
  );
}

/** Placeholder avatar shown beside a testimonial name. */
export function AvatarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="8.4" r="3.8" />
      <path d="M4.6 21a7.4 7.4 0 0 1 14.8 0Z" />
    </svg>
  );
}

/* ---------- UI ---------- */

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="M15 5.5 8.5 12l6.5 6.5" />
    </svg>
  );
}

/** Heart used in the footer credit line. */
export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
    </svg>
  );
}

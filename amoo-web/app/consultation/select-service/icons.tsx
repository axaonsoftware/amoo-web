import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* ───────────── Toolbar / misc ───────────── */

export function SearchIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.8} {...props}>
      <circle cx="10.6" cy="10.6" r="6.8" />
      <path d="m20 20-4.4-4.4" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={2} {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function StarFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2.4 2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.47l-5.9 3.1 1.13-6.57L2.45 9.34l6.6-.96Z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={2.6} {...props}>
      <path d="m5 12.6 4.4 4.4L19 7" />
    </svg>
  );
}

export function CheckCircleFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path
        d="m7.6 12.2 2.8 2.8 6-6.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16.02 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.56-1.7a12.74 12.74 0 0 0 6.26 1.6h.01c7.05 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.05-3.65Zm0 23.34h-.01c-1.9 0-3.76-.51-5.38-1.47l-.39-.23-4 1.05 1.07-3.9-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.87 4.78-10.64 10.65-10.64 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.12 7.53c0 5.87-4.78 10.6-10.7 10.6Zm5.84-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.63 9.63 0 0 1-1.78-2.21c-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.73-.98-2.36-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.57 1.14 3.08 1.3 3.29.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/* ───────────── Sidebar category icons ───────────── */

export function NumerologyIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3" />
      <path
        d="M9 8v8M8 9l1-1M15 8h-2v3.4h1.6a1.6 1.6 0 1 1 0 3.2H13"
        strokeWidth={1.4}
      />
    </svg>
  );
}

export function LotusLineIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="M12 4.6c1.7 1.6 2.6 3.4 2.6 5.5 0 1-.2 2-.6 2.9-.7-.5-1.4-1.2-2-2-.6.8-1.3 1.5-2 2a7.2 7.2 0 0 1-.6-2.9c0-2.1.9-3.9 2.6-5.5Z" />
      <path d="M5 10c1.9.3 3.4 1.2 4.5 2.6.5.6.8 1.3 1 2-.9.2-1.8.2-2.6 0-.1 1-.4 1.8-.8 2.6a6.6 6.6 0 0 1-2.1-7.2ZM19 10a6.6 6.6 0 0 1-2.1 7.2c-.4-.8-.7-1.6-.8-2.6-.8.2-1.7.2-2.6 0 .2-.7.5-1.4 1-2C15.6 11.2 17.1 10.3 19 10Z" />
      <path d="M4.6 15.8c1.7 2.2 4.4 3.6 7.4 3.6s5.7-1.4 7.4-3.6" />
    </svg>
  );
}

export function CardsIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <rect
        x="3.4"
        y="6.4"
        width="9.2"
        height="13.4"
        rx="1.8"
        transform="rotate(-9 8 13)"
      />
      <rect
        x="11.4"
        y="4.6"
        width="9.2"
        height="13.4"
        rx="1.8"
        transform="rotate(9 16 11)"
      />
      <path d="M16 8.6v4M14 10.6h4" strokeWidth={1.3} />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m15.4 8.6-2 5.4-5.4 2 2-5.4Z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChakraFlowerIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v3.6M12 17.4V21M3 12h3.6M17.4 12H21M5.6 5.6l2.6 2.6M15.8 15.8l2.6 2.6M18.4 5.6l-2.6 2.6M8.2 15.8l-2.6 2.6" />
    </svg>
  );
}

export function LinkedCirclesIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <circle cx="8.4" cy="12" r="5.4" />
      <circle cx="15.6" cy="12" r="5.4" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="M12 3c.7 2.9 2.1 4.3 5 5-2.9.7-4.3 2.1-5 5-.7-2.9-2.1-4.3-5-5 2.9-.7 4.3-2.1 5-5Z" />
      <path
        d="M18.4 14.6c.35 1.4 1 2.1 2.4 2.4-1.4.35-2.05 1-2.4 2.4-.35-1.4-1-2.05-2.4-2.4 1.4-.35 2.05-1 2.4-2.4Z"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <rect x="2.8" y="4.4" width="18.4" height="12.4" rx="2" />
      <path d="M9 20.4h6M12 16.8v3.6" />
    </svg>
  );
}

/* ───────────── Service-card icons ───────────── */

export function ReikiHandsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M12 3.4c1.5 1.5 2.3 3.1 2.3 4.9 0 .9-.2 1.8-.6 2.6-.6-.4-1.2-1-1.7-1.8-.5.8-1.1 1.4-1.7 1.8a6.4 6.4 0 0 1-.6-2.6c0-1.8.8-3.4 2.3-4.9Z"
        fill="currentColor"
      />
      <path
        d="M4.4 13.6c.8-.5 1.6-.2 2.4.3l3.1 2h1.3c.6 0 .9.7.4 1.1M19.6 13.6c-.8-.5-1.6-.2-2.4.3l-1.5 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.2 14.4v4.2c0 .6.4 1 1 1h4.5l3.3 1.4h3.4c1 0 1.6-.5 2.1-1.2l2.1-3.1c.5-.7.3-1.4-.4-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TarotCardsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect
        x="3.2"
        y="6.4"
        width="8.6"
        height="12.6"
        rx="1.6"
        transform="rotate(-10 7.5 12.7)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.2"
        y="4.6"
        width="8.6"
        height="12.6"
        rx="1.6"
        transform="rotate(10 15.5 10.9)"
        fill="currentColor"
      />
      <path
        d="M15.6 8.2 16.4 10l1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2Z"
        fill="#fff"
      />
    </svg>
  );
}

export function KundaliWheelIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"
        strokeWidth={1.2}
      />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  );
}

export function HeartFillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 20.6 4.3 13a4.7 4.7 0 0 1 6.6-6.6l1.1 1.1 1.1-1.1a4.7 4.7 0 0 1 6.6 6.6Z" />
    </svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.6} {...props}>
      <rect x="3" y="7.4" width="18" height="12.2" rx="2.2" />
      <path d="M8.4 7.4V6a2 2 0 0 1 2-2h3.2a2 2 0 0 1 2 2v1.4" />
      <path d="M3 12.4h18M10.4 12.4h3.2v2h-3.2Z" />
    </svg>
  );
}

export function RupeeCoinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path
        d="M9.2 7.4h5.6M9.2 10h5.6M13.4 7.4c1.5 0 2.2 1 2.2 2.1s-.8 2.1-2.6 2.1H9.2l4.5 5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MeditationIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="5.2" r="2.4" fill="currentColor" />
      <path
        d="M12 8.4c-1.4 1.2-2.2 2.8-2.4 4.7l-4.2 2.4c-.7.4-.4 1.5.4 1.5h2.6M12 8.4c1.4 1.2 2.2 2.8 2.4 4.7l4.2 2.4c.7.4.4 1.5-.4 1.5h-2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 17.6c1 1.4 2.7 2.3 4.6 2.3s3.6-.9 4.6-2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────────── Featured / trust icons ───────────── */

export function LotusSolidIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3.8c1.9 1.9 2.9 3.9 2.9 6.1 0 1.3-.3 2.5-.9 3.6h-4c-.6-1.1-.9-2.3-.9-3.6 0-2.2 1-4.2 2.9-6.1Z" />
      <path d="M3.8 9.2c2.3.5 4 1.6 5.2 3.3.4.6.7 1.2.9 1.9H5.7A6.5 6.5 0 0 1 3.8 9.2ZM20.2 9.2a6.5 6.5 0 0 1-1.9 5.2h-4.2c.2-.7.5-1.3.9-1.9 1.2-1.7 2.9-2.8 5.2-3.3Z" />
      <path d="M2.4 15.4h19.2c-1.6 3-5.2 4.8-9.6 4.8s-8-1.8-9.6-4.8Z" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.6} {...props}>
      <rect x="4.8" y="10.4" width="14.4" height="10.2" rx="2.2" />
      <path d="M8.2 10.4V7a3.8 3.8 0 0 1 7.6 0v3.4" />
      <path d="M12 14.4v2.4" />
    </svg>
  );
}

export function ShieldStarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.4 4.4 5.6v5.8c0 4.7 3.2 9.1 7.6 10.2 4.4-1.1 7.6-5.5 7.6-10.2V5.6Z" />
      <path
        d="m12 7.6 1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4Z"
        fill="#fff"
      />
    </svg>
  );
}

export function BadgeCheckIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="m12 2.6 2.3 1.7 2.8-.2.9 2.7 2.3 1.6-.8 2.7.8 2.7-2.3 1.6-.9 2.7-2.8-.2L12 21.4l-2.3-1.7-2.8.2-.9-2.7-2.3-1.6.8-2.7-.8-2.7 2.3-1.6.9-2.7 2.8.2Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" strokeWidth={1.7} />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="2.2" />
      <path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6" />
    </svg>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.5} {...props}>
      <path d="M4 18v-6a8 8 0 0 1 16 0v6" />
      <path d="M4 17.4h1.6a1.8 1.8 0 0 1 1.8 1.8v2.2a1.8 1.8 0 0 1-1.8 1.8H4.4a1.8 1.8 0 0 1-1.8-1.8v-3a1.8 1.8 0 0 1 1.4-.8ZM20 17.4h-1.6a1.8 1.8 0 0 0-1.8 1.8v2.2a1.8 1.8 0 0 0 1.8 1.8h1.2a1.8 1.8 0 0 0 1.8-1.8v-3" />
    </svg>
  );
}

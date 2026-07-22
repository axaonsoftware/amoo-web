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

/* ---------- Time-of-day tab icons ---------- */

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.6v2.6M12 18.8v2.6M4.4 4.4l1.9 1.9M17.7 17.7l1.9 1.9M2.6 12h2.6M18.8 12h2.6M4.4 19.6l1.9-1.9M17.7 6.3l1.9-1.9" />
    </svg>
  );
}

export function SunsetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.6 15.4a5.4 5.4 0 0 1 10.8 0" />
      <path d="M2.6 15.4h2.4M19 15.4h2.4M5.4 9.2l1.7 1.7M16.9 10.9l1.7-1.7M12 5.6v2.4" />
      <path d="M3 19h18" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11Z" />
    </svg>
  );
}

/* ---------- Card / row icons ---------- */

export function CalendarLineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.4" y="5" width="17.2" height="15.6" rx="2.2" />
      <path d="M3.4 9.6h17.2M8.2 3.2v3.6M15.8 3.2v3.6" />
    </svg>
  );
}

export function ClockLineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </svg>
  );
}

export function VideoLineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.8" y="6.4" width="12.6" height="11.2" rx="2.2" />
      <path d="m15.4 11 5.8-3.2v8.4L15.4 13Z" />
    </svg>
  );
}

export function HourglassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3.2c0 1.5 1.1 2.6 2.4 3.6l1.6 1.2 1.6-1.2C15 8.8 16 7.7 16 6.2V3" />
      <path d="M8 21v-3.2c0-1.5 1.1-2.6 2.4-3.6L12 13l1.6 1.2c1.4 1 2.4 2.1 2.4 3.6V21" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.4s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </svg>
  );
}

export function ShieldTickIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.6 4.6 5.8v5.6c0 4.6 3.1 8.9 7.4 10 4.3-1.1 7.4-5.4 7.4-10V5.8Z" />
      <path d="m8.8 11.9 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.4 12.2 2.4 2.4 4.8-5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.8" y="10.6" width="14.4" height="10.2" rx="2.2" />
      <path d="M8.2 10.6V7.2a3.8 3.8 0 0 1 7.6 0v3.4" />
      <path d="M12 14.6v2.4" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="M15 5.5 8.5 12l6.5 6.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="m9 5.5 6.5 6.5L9 18.5" />
    </svg>
  );
}

/* ---------- Trust strip illustrations ---------- */

export function TrustShieldIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.2} viewBox="0 0 48 48" {...props}>
      <path d="M24 4 8 10.4v11.2C8 32 14.8 41 24 44c9.2-3 16-12 16-22.4V10.4Z" />
      <path d="M24 8.6 12.2 13.3v8.3c0 8.3 5.2 15.5 11.8 18 6.6-2.5 11.8-9.7 11.8-18v-8.3Z" />
      <path d="m18.2 24.2 4.2 4.2 8-8.4" />
    </svg>
  );
}

export function TrustExpertIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.2} viewBox="0 0 48 48" {...props}>
      <path d="M24 6c-4.4 0-8 3.4-8 7.6 0 1.5.5 2.9 1.3 4.1" />
      <path d="M24 6c4.4 0 8 3.4 8 7.6 0 1.5-.5 2.9-1.3 4.1" />
      <circle cx="24" cy="20.6" r="6.4" />
      <path d="M12 43v-3.2c0-4.7 3.9-8.6 8.6-8.6h6.8c4.7 0 8.6 3.9 8.6 8.6V43" />
      <path d="M15.6 13.6h16.8" />
      <path d="M20.8 20h.05M27.2 20h.05" strokeWidth={2.2} />
      <path d="M24 31.2v6M20 31.6l4 4 4-4" />
    </svg>
  );
}

export function TrustCalendarIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.2} viewBox="0 0 48 48" {...props}>
      <rect x="6" y="9.6" width="36" height="32.4" rx="4" />
      <path d="M6 19.2h36M15.6 5v9.2M32.4 5v9.2" />
      <path d="m17.2 30.4 4.4 4.4 9.2-9.6" />
      <path d="M11.6 24.4h3.2M33.2 24.4h3.2M11.6 36h3.2M33.2 36h3.2" />
    </svg>
  );
}

export function TrustHeadsetIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.2} viewBox="0 0 48 48" {...props}>
      <path d="M8.8 32V24a15.2 15.2 0 0 1 30.4 0v8" />
      <path d="M8.8 30.4h2.8a3.2 3.2 0 0 1 3.2 3.2v4.8a3.2 3.2 0 0 1-3.2 3.2H8.8a3.2 3.2 0 0 1-3.2-3.2v-4.8a3.2 3.2 0 0 1 3.2-3.2ZM39.2 30.4h-2.8a3.2 3.2 0 0 0-3.2 3.2v4.8a3.2 3.2 0 0 0 3.2 3.2h2.8a3.2 3.2 0 0 0 3.2-3.2v-4.8a3.2 3.2 0 0 0-3.2-3.2Z" />
      <path d="M39.2 41.6c0 2.4-2.4 4.4-6 4.8" />
      <path d="M28 46.4h-3.6" />
    </svg>
  );
}

export function TrustLotusIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.2} viewBox="0 0 48 48" {...props}>
      <path d="M24 8.4c-3.4 3.6-5.2 7.6-5.2 11.8 0 4.2 2 8 5.2 10.6 3.2-2.6 5.2-6.4 5.2-10.6 0-4.2-1.8-8.2-5.2-11.8Z" />
      <path d="M18.8 20.2c-3.8-1.8-7.6-2-11.2-.6 1 5.2 4.4 9.4 9.4 11.4a17 17 0 0 0 7 1.4" />
      <path d="M29.2 20.2c3.8-1.8 7.6-2 11.2-.6-1 5.2-4.4 9.4-9.4 11.4a17 17 0 0 1-7 1.4" />
      <path d="M4 32.4c4 5.2 11.2 8.4 20 8.4s16-3.2 20-8.4" />
    </svg>
  );
}

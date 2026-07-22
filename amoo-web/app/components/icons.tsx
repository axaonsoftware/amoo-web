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

/* ---------- Feature / hero icons ---------- */

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3" />
    </svg>
  );
}

export function DocIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 2.8H6.6a1.6 1.6 0 0 0-1.6 1.6v15.2a1.6 1.6 0 0 0 1.6 1.6h10.8a1.6 1.6 0 0 0 1.6-1.6V7.8Z" />
      <path d="M14 2.8v5h5" />
      <path d="M8.4 12.4h7.2M8.4 15.6h7.2M8.4 18.4h4.4" />
    </svg>
  );
}

export function DocCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 2.8H6.6a1.6 1.6 0 0 0-1.6 1.6v15.2a1.6 1.6 0 0 0 1.6 1.6h10.8a1.6 1.6 0 0 0 1.6-1.6V7.8Z" />
      <path d="M14 2.8v5h5" />
      <path d="M8.2 12.2h4.4M8.2 15.2h3" />
      <circle cx="16" cy="16.4" r="3.4" />
      <path d="m14.6 16.4 1 1 1.9-2" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.6 4.6 5.8v5.6c0 4.6 3.1 8.9 7.4 10 4.3-1.1 7.4-5.4 7.4-10V5.8Z" />
      <path d="m12 8.2 1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4Z" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.6 4.6 5.8v5.6c0 4.6 3.1 8.9 7.4 10 4.3-1.1 7.4-5.4 7.4-10V5.8Z" />
      <path d="m8.8 11.9 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7.2" />
      <circle cx="11" cy="11" r="3" />
      <path d="M11 2.2v2.4M11 17.4v2.4M2.2 11h2.4M17.4 11h2.4" />
      <path d="m16.4 16.4 4.4 4.4" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.4 2.4 4.8 13.4h6L9.9 21.6l8.9-11.2h-6.2Z" />
    </svg>
  );
}

export function SmileIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.4 14.2a4.4 4.4 0 0 0 7.2 0" />
      <path d="M9 9.4h.01M15 9.4h.01" strokeWidth={2.2} />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 2.8 2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17.4l-5.9 3.3 1.4-6.6-5-4.5 6.7-.7Z" />
    </svg>
  );
}

/* ---------- Report row icons ---------- */

export function ChartLagnaIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="5.2" r="2.2" />
      <circle cx="5" cy="17.4" r="2.2" />
      <circle cx="19" cy="17.4" r="2.2" />
      <path d="M10.4 7 6.4 15.4M13.6 7l4 8.4M7.2 17.4h9.6" />
    </svg>
  );
}

export function ChartGridIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3.4" width="16" height="17.2" rx="1.6" />
      <path d="M4 8.6h16M12 8.6v12" />
      <path d="M6.6 12h2.8M6.6 15.4h2.8M14.6 12h2.8M14.6 15.4h2.8" />
    </svg>
  );
}

export function ChartHouseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.4" />
      <path d="M3.6 3.6 20.4 20.4M20.4 3.6 3.6 20.4" />
      <path d="M12 3.6 3.6 12l8.4 8.4L20.4 12Z" />
    </svg>
  );
}

export function ChartYogaIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3.4v17.2M3.4 12h17.2M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChartDashaIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3.4" width="16" height="17.2" rx="1.6" />
      <path d="M8 3.4v17.2M4 9h16M4 15h16" />
      <path d="M5.6 6.2h1M5.6 12.2h1M5.6 18.2h1" strokeWidth={2} />
    </svg>
  );
}

/* ---------- UI icons ---------- */

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.6} {...props}>
      <path d="m5 12.6 4.4 4.4L19 7" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="m6 9.5 6 6 6-6" />
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

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.6 10.4 12 3.6l8.4 6.8v8.4a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6Z" />
      <path d="M9.4 20.4v-7h5.2v7" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.2 7.4 16.4 12l-7.2 4.6Z" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="2" />
      <path d="M3.6 9.6h16.8M8.4 3.2v3.6M15.6 3.2v3.6" />
      <path d="M7.6 13h2M11 13h2M14.4 13h2M7.6 16.6h2M11 16.6h2" strokeWidth={1.4} />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.4 3.6h3l1.5 3.7-2 1.3a11 11 0 0 0 5 5l1.3-2 3.7 1.5v3a1.7 1.7 0 0 1-1.9 1.7A15.6 15.6 0 0 1 4.7 5.5a1.7 1.7 0 0 1 1.7-1.9Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2" />
      <path d="m3.4 6.4 8.6 6.2 8.6-6.2" />
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

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.02 1.46-4.02 4.13V9.9H7.55V13h2.72v8Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 8.1a2.5 2.5 0 0 0-1.75-1.77C18.3 5.9 12 5.9 12 5.9s-6.3 0-7.85.43A2.5 2.5 0 0 0 2.4 8.1 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.9 2.5 2.5 0 0 0 1.75 1.77C5.7 18.1 12 18.1 12 18.1s6.3 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.9ZM10.1 14.9V9.1L15.1 12Z" />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.02 2.4c-5.3 0-8 3.6-8 6.9 0 2 .76 3.77 2.4 4.44.27.11.5 0 .58-.29l.24-.9c.08-.29.05-.4-.17-.65a3.6 3.6 0 0 1-.85-2.44c0-3.16 2.4-5.98 6.24-5.98 3.4 0 5.27 2.05 5.27 4.8 0 3.6-1.62 6.64-4.03 6.64a1.96 1.96 0 0 1-2.01-2.44c.37-1.55 1.09-3.23 1.09-4.35 0-1-.55-1.84-1.68-1.84-1.33 0-2.4 1.35-2.4 3.16 0 1.16.4 1.94.4 1.94l-1.58 6.6c-.47 1.96-.07 4.37-.04 4.61.02.15.21.19.3.08.12-.16 1.68-2.05 2.21-3.94.15-.53.86-3.3.86-3.3.43.8 1.68 1.5 3 1.5 3.95 0 6.63-3.55 6.63-8.3 0-3.6-3.07-6.94-7.73-6.94Z" />
    </svg>
  );
}

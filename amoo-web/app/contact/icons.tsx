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

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.6 4.6 5.8v5.6c0 4.6 3.1 8.9 7.4 10 4.3-1.1 7.4-5.4 7.4-10V5.8Z" />
      <path d="m8.8 11.9 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.4 2.4 4.8 13.4h6L9.9 21.6l8.9-11.2h-6.2Z" />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2.5 18h19l-2.4-11L12 14l-7.1-7L2.5 18Z" />
      <path d="M2.5 18a1 1 0 0 1 1-1h17a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-1Z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5.4 20.4a6.6 6.6 0 0 1 13.2 0" />
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

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.4 3.6h3l1.5 3.7-2 1.3a11 11 0 0 0 5 5l1.3-2 3.7 1.5v3a1.7 1.7 0 0 1-1.9 1.7A15.6 15.6 0 0 1 4.7 5.5a1.7 1.7 0 0 1 1.7-1.9Z" />
    </svg>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M17 3.4a2.4 2.4 0 0 1 3.4 3.4L7.6 19.6l-4.4 1 1-4.4Z" />
      <path d="m14.8 5.6 3.4 3.4" />
    </svg>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12.4 3.6c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4l-.9 3.7a.5.5 0 0 0 .75.55l4-2.35c.5.08 1.02.12 1.55.12 4.7 0 8.5-3.1 8.5-7s-3.8-7.4-8.5-7.4Z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
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

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" />
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

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 8.1a2.5 2.5 0 0 0-1.75-1.77C18.3 5.9 12 5.9 12 5.9s-6.3 0-7.85.43A2.5 2.5 0 0 0 2.4 8.1 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.9 2.5 2.5 0 0 0 1.75 1.77C5.7 18.1 12 18.1 12 18.1s6.3 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.9ZM10.1 14.9V9.1L15.1 12Z" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function PhoneCallIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7.2 3.4h2.4l1.5 3.9-1.9 1.3a10.6 10.6 0 0 0 4.6 4.6l1.3-1.9 3.9 1.5v2.4a2 2 0 0 1-2.2 2A15.2 15.2 0 0 1 5.2 5.6a2 2 0 0 1 2-2.2Z" />
      <path
        d="M15.2 4.6a5.6 5.6 0 0 1 4 4M14.6 7.4a2.9 2.9 0 0 1 2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.4 3.6c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4l-.9 3.7a.5.5 0 0 0 .75.55l4-2.35c.5.08 1.02.12 1.55.12 4.7 0 8.5-3.1 8.5-7s-3.8-7.4-8.5-7.4Z" />
    </svg>
  );
}

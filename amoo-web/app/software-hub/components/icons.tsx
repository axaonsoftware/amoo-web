type IconProps = { className?: string };

/* ---------------- Navbar icons ---------------- */

export function NavHomeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M11.35 2.72a1 1 0 0 1 1.3 0l8.02 6.86a1 1 0 0 1 .35.76V20a1.4 1.4 0 0 1-1.4 1.4h-4.3a.9.9 0 0 1-.9-.9v-4.03a.9.9 0 0 0-.9-.9h-3.04a.9.9 0 0 0-.9.9V20.5a.9.9 0 0 1-.9.9H4.38A1.4 1.4 0 0 1 2.98 20v-9.66a1 1 0 0 1 .35-.76l8.02-6.86Z" />
    </svg>
  );
}

export function NavUserIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

/** Ornate lotus/mandala mark used beside "Services". */
export function NavLotusIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3.2c1.5 1.6 2.2 3.3 2.2 5.2 0 1.9-.7 3.6-2.2 5.2-1.5-1.6-2.2-3.3-2.2-5.2 0-1.9.7-3.6 2.2-5.2Z" />
      <path d="M12 13.6C10.2 12.5 8.4 12 6.6 12c-1.2 0-2.3.2-3.4.7 1 1.9 2.3 3.2 3.9 4 1.6.8 3.2 1 4.9.8" />
      <path d="M12 13.6c1.8-1.1 3.6-1.6 5.4-1.6 1.2 0 2.3.2 3.4.7-1 1.9-2.3 3.2-3.9 4-1.6.8-3.2 1-4.9.8" />
      <path d="M12 13.6c-.6-2-1.7-3.5-3.2-4.6M12 13.6c.6-2 1.7-3.5 3.2-4.6" />
      <path d="M4.6 17.6c2 1.9 4.5 2.9 7.4 2.9s5.4-1 7.4-2.9" />
    </svg>
  );
}

export function NavStarIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m12 3 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.56l-5.7 3-1.09-6.35-4.62-4.5 6.38-.93L12 3Z" />
    </svg>
  );
}

export function NavTagIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.6 13.1 13 20.7a1.6 1.6 0 0 1-2.3 0l-7.4-7.4a1.6 1.6 0 0 1-.5-1.1V4.9a1.6 1.6 0 0 1 1.6-1.6h7.3c.4 0 .8.2 1.1.5l7.4 7.4a1.6 1.6 0 0 1 0 2.3Z" />
      <circle cx="7.6" cy="7.6" r="1.4" />
    </svg>
  );
}

/** Gold hexagon software mark shown inside the active "Software Hub" pill. */
export function NavSoftwareIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.4 20.5 7v10L12 21.6 3.5 17V7L12 2.4Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect
        x="8.2"
        y="8.6"
        width="7.6"
        height="6.8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M8.2 11.2h7.6M12 8.6v2.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5v-.5c-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3ZM12 21.5a9.4 9.4 0 0 1-4.8-1.3l-.4-.2-3.6.9.9-3.5-.2-.4A9.5 9.5 0 1 1 12 21.5Z" />
    </svg>
  );
}

export function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01M16.5 17.5h.01" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m5 8.5 7 7 7-7" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 12h15M13.5 6l6 6-6 6" />
    </svg>
  );
}

/* ---------------- Hero badge icons (gold, scalloped) ---------------- */

const SCALLOP =
  "M12 1.6l2.1 1.6 2.6-.6 1.2 2.4 2.5 1-.3 2.7 1.7 2.1-1.7 2.1.3 2.7-2.5 1-1.2 2.4-2.6-.6L12 22.4l-2.1-1.6-2.6.6-1.2-2.4-2.5-1 .3-2.7L2.2 12l1.7-2.1-.3-2.7 2.5-1 1.2-2.4 2.6.6L12 1.6Z";

export function BadgeAccurateIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={SCALLOP} />
      <path
        d="m8.6 12.4 2.1 2.1 4.9-4.9"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BadgeEasyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3.2 21.2 20H2.8L12 3.2Z" />
      <path d="M12 8.2v11.6M6.6 15.4h10.8" />
    </svg>
  );
}

export function BadgeUpdatesIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={SCALLOP} />
      <circle cx="12" cy="11.4" r="2.9" strokeWidth="1.4" />
      <path d="M12 15.2v3.1" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BadgeTrustedIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={SCALLOP} />
      <circle cx="12" cy="12" r="2.2" strokeWidth="1.4" />
    </svg>
  );
}

/* ---------------- Card icons ---------------- */

/** Gold circled check used on every feature row of the software cards. */
export function CheckCircleIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9.4" />
      <path d="m8 12.2 2.6 2.6L16.4 9" />
    </svg>
  );
}

/* ---------------- Trust bar icons ---------------- */

export function TrustLotusIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 4.6c1.9 2 2.9 4 2.9 6.1 0 2-1 4-2.9 5.9-1.9-1.9-2.9-3.9-2.9-5.9 0-2.1 1-4.1 2.9-6.1Z" />
      <path d="M12 16.6c-1.1-2.3-2.7-4-4.8-5.1-.6 2.3-.4 4.4.6 6.1" />
      <path d="M12 16.6c1.1-2.3 2.7-4 4.8-5.1.6 2.3.4 4.4-.6 6.1" />
      <path d="M12 16.7c-2.2-1.7-4.5-2.4-6.9-2.2-1 .1-2 .4-2.9.8 1.6 2 3.4 3.4 5.4 4.1 1.4.5 2.9.7 4.4.6" />
      <path d="M12 16.7c2.2-1.7 4.5-2.4 6.9-2.2 1 .1 2 .4 2.9.8-1.6 2-3.4 3.4-5.4 4.1-1.4.5-2.9.7-4.4.6" />
    </svg>
  );
}

export function TrustInstallIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.6 20 5.2v6.1c0 4.4-3.2 8.4-8 10.1-4.8-1.7-8-5.7-8-10.1V5.2l8-2.6Z" />
      <path d="M12 7.6v6.6M9 11.4l3 3 3-3" />
    </svg>
  );
}

export function TrustUpdatesIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.4 11.2a8.4 8.4 0 0 0-14.3-4.6L3.6 9" />
      <path d="M3.6 4.4V9h4.6" />
      <path d="M3.6 12.8a8.4 8.4 0 0 0 14.3 4.6l2.5-2.4" />
      <path d="M20.4 19.6V15h-4.6" />
    </svg>
  );
}

export function TrustSupportIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="1.8" y="13.4" width="4.2" height="5.6" rx="1.6" />
      <rect x="18" y="13.4" width="4.2" height="5.6" rx="1.6" />
      <path d="M20.1 19v.6a2.4 2.4 0 0 1-2.4 2.4H13" />
      <circle cx="11.6" cy="22" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrustSecureIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.6 20 5.2v6.1c0 4.4-3.2 8.4-8 10.1-4.8-1.7-8-5.7-8-10.1V5.2l8-2.6Z" />
      <path d="m8.6 11.9 2.3 2.3 4.5-4.5" />
    </svg>
  );
}

export function TrustWindowsIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.2" y="3.6" width="19.6" height="13.2" rx="1.8" />
      <path d="M8 20.4h8M12 16.8v3.6" />
      <path d="M6.2 13.4l2.6-3 2.2 2 2.4-3.4 4.4 4.4" />
      <circle cx="7.6" cy="7.4" r="1.1" />
    </svg>
  );
}

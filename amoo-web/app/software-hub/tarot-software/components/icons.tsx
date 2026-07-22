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

/* ---------- Hero / feature icons ---------- */

/** Stack of tarot cards with a star — "78 Cards Digital Library". */
export function TarotCardsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8.4" y="3.2" width="11" height="17.6" rx="1.8" />
      <path d="M6.2 5.4A1.8 1.8 0 0 0 4.6 7.2v12a1.8 1.8 0 0 0 1.8 1.8h8.2" />
      <path d="m13.9 8.6 1.1 2.4 2.5.3-1.9 1.8.5 2.5-2.2-1.3-2.2 1.3.5-2.5-1.9-1.8 2.5-.3Z" />
    </svg>
  );
}

/** Cross layout of cards — "Multiple Spreads & Layouts". */
export function SpreadsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9.4" y="2.8" width="5.2" height="7" rx="1" />
      <rect x="9.4" y="14.2" width="5.2" height="7" rx="1" />
      <rect x="2.6" y="8.5" width="5.2" height="7" rx="1" />
      <rect x="16.2" y="8.5" width="5.2" height="7" rx="1" />
    </svg>
  );
}

/** Chip with pins — "AI Interpretation & Insights". */
export function AiChipIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="2" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="0.8" />
      <path d="M9.6 6.2V3.4M14.4 6.2V3.4M9.6 20.6v-2.8M14.4 20.6v-2.8M6.2 9.6H3.4M6.2 14.4H3.4M20.6 9.6h-2.8M20.6 14.4h-2.8" />
    </svg>
  );
}

/** Document with a pen — "Detailed Reports & Save". */
export function ReportPenIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.6 2.8H6.4a1.6 1.6 0 0 0-1.6 1.6v15.2a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6v-8" />
      <path d="M13.6 2.8v5h5" />
      <path d="M8 12.6h4.6M8 16h3.2" />
      <path d="m18.9 10.4 2.3 2.3-3.9 3.9-2.9.6.6-2.9Z" />
    </svg>
  );
}

/** Person with a check — "Client Management Made Easy". */
export function ClientsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11.4" cy="7.6" r="4" />
      <path d="M3.8 20.6a7.6 7.6 0 0 1 12.6-5.7" />
      <path d="m15.4 18.6 1.8 1.8 3.4-3.8" />
    </svg>
  );
}

/* ---------- "Why choose" card icons ---------- */

/** Notebook with a pen — "Custom Notes & Journaling". */
export function NotesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.6 2.8h10.4a1.6 1.6 0 0 1 1.6 1.6v15.2a1.6 1.6 0 0 1-1.6 1.6H6.6a1.6 1.6 0 0 1-1.6-1.6V4.4a1.6 1.6 0 0 1 1.6-1.6Z" />
      <path d="M8.4 7.4h5.4M8.4 10.8h3.6" />
      <path d="m16.3 12.6 1.9 1.9-4 4-2.4.5.5-2.4Z" />
    </svg>
  );
}

/** Badge with a star — "Brand & Report Customization". */
export function BrandBadgeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3" />
      <path d="m12 7.6 1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5Z" />
    </svg>
  );
}

/* ---------- Popular spread tiles ---------- */

export function CelticSpreadIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <rect x="8.6" y="9.4" width="4.2" height="5.2" rx="0.7" />
      <rect x="3" y="9.4" width="3.6" height="5.2" rx="0.7" />
      <rect x="14.8" y="9.4" width="3.6" height="5.2" rx="0.7" />
      <rect x="8.6" y="2.8" width="4.2" height="4.6" rx="0.7" />
      <rect x="8.6" y="16.6" width="4.2" height="4.6" rx="0.7" />
      <rect x="20" y="6.4" width="2" height="11.2" rx="0.7" />
    </svg>
  );
}

export function ThreeCardSpreadIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <rect x="2.6" y="5.6" width="5" height="12.8" rx="1" />
      <rect x="9.5" y="5.6" width="5" height="12.8" rx="1" />
      <rect x="16.4" y="5.6" width="5" height="12.8" rx="1" />
    </svg>
  );
}

export function RelationshipSpreadIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <rect x="3" y="7.4" width="5.2" height="9.2" rx="1" />
      <rect x="15.8" y="7.4" width="5.2" height="9.2" rx="1" />
      <rect x="9.4" y="3.4" width="5.2" height="7.2" rx="1" />
      <rect x="9.4" y="13.4" width="5.2" height="7.2" rx="1" />
    </svg>
  );
}

export function CareerSpreadIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <rect x="9.6" y="2.8" width="4.8" height="6" rx="0.8" />
      <rect x="3.2" y="9.6" width="4.8" height="6" rx="0.8" />
      <rect x="9.6" y="9.6" width="4.8" height="6" rx="0.8" />
      <rect x="16" y="9.6" width="4.8" height="6" rx="0.8" />
      <rect x="9.6" y="16.4" width="4.8" height="4.8" rx="0.8" />
    </svg>
  );
}

export function YearAheadSpreadIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.4} {...props}>
      <rect x="2.8" y="3.2" width="4" height="5.6" rx="0.7" />
      <rect x="7.9" y="3.2" width="4" height="5.6" rx="0.7" />
      <rect x="13" y="3.2" width="4" height="5.6" rx="0.7" />
      <rect x="18.1" y="3.2" width="3.1" height="5.6" rx="0.7" />
      <rect x="2.8" y="10.2" width="4" height="5.6" rx="0.7" />
      <rect x="7.9" y="10.2" width="4" height="5.6" rx="0.7" />
      <rect x="13" y="10.2" width="4" height="5.6" rx="0.7" />
      <rect x="18.1" y="10.2" width="3.1" height="5.6" rx="0.7" />
      <rect x="2.8" y="17.2" width="4" height="3.8" rx="0.7" />
      <rect x="7.9" y="17.2" width="4" height="3.8" rx="0.7" />
      <rect x="13" y="17.2" width="4" height="3.8" rx="0.7" />
      <rect x="18.1" y="17.2" width="3.1" height="3.8" rx="0.7" />
    </svg>
  );
}

/* ---------- Stats icons ---------- */

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="7.6" r="3.6" />
      <path d="M2.8 20.4a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16 4.4a3.6 3.6 0 0 1 0 6.9" />
      <path d="M17.6 14.6a6.2 6.2 0 0 1 3.6 5.8" />
    </svg>
  );
}

export function UserRatingIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.4" cy="7.4" r="3.8" />
      <path d="M3.4 20.6a7 7 0 0 1 11.2-5.6" />
      <path d="m18.2 13.8 1.1 2.2 2.5.4-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.4Z" />
    </svg>
  );
}

/* ---------- Misc ---------- */

/** Small gold flourish shown beside the "Powerful Features" heading. */
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

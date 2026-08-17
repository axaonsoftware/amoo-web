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

/* ---------- ornaments ---------- */

/** Gold arrow + line + diamond flourish flanking the section headings. */
export function ArrowFlourish({
  flip = false,
  className = "",
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`hidden items-center gap-1.5 text-gold sm:flex ${
        flip ? "flex-row-reverse" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 14 12"
        fill="currentColor"
        className="h-[10px] w-[12px] shrink-0"
      >
        <path d="M0 6h9.4L6.1 2.5 7 1.5 12.5 6 7 10.5l-.9-1 3.3-3.5H0Z" />
      </svg>
      <span className="block h-px w-[44px] bg-gold/70" />
      <span className="block h-[6px] w-[6px] rotate-45 bg-gold/80" />
      <span className="block h-px w-[10px] bg-gold/70" />
    </span>
  );
}

/** Small gold lotus flourish sitting under the "Why Choose" heading. */
export function LotusFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 7h26"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      <path
        d="M68 7h26"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      <path
        d="M33.6 4.6 36.4 7l-2.8 2.4L30.8 7Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M62.4 4.6 65.2 7l-2.8 2.4L59.6 7Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M48 2.2c1.5 1.6 2.2 3 2.2 4.4 0 .8-.2 1.5-.5 2.2h-3.4a5 5 0 0 1-.5-2.2c0-1.4.7-2.8 2.2-4.4Z"
        fill="currentColor"
      />
      <path
        d="M41.4 5.2c1.9.4 3.2 1.2 4.1 2.4.2.4.4.7.6 1.1h-3.4a4.7 4.7 0 0 1-1.3-3.5ZM54.6 5.2a4.7 4.7 0 0 1-1.3 3.5h-3.4c.2-.4.4-.7.6-1.1.9-1.2 2.2-2 4.1-2.4Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M40.6 9.5h14.8c-1.3 1.7-4 2.7-7.4 2.7s-6.1-1-7.4-2.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Line — diamond — lotus — diamond — line divider under the hero copy. */
export function HeroLotusDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 330 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0 10h108"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path
        d="M222 10h108"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path
        d="M112 10h9.6l-2.6-2.8.8-.8 4.4 3.6-4.4 3.6-.8-.8 2.6-2.8H112Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path
        d="M218 10h-9.6l2.6-2.8-.8-.8-4.4 3.6 4.4 3.6.8-.8-2.6-2.8H218Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path
        d="M131.6 6.6 134.8 10l-3.2 3.4-3.2-3.4Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M198.4 6.6 201.6 10l-3.2 3.4-3.2-3.4Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M165 2.4c2.2 2.3 3.3 4.4 3.3 6.4 0 1.1-.3 2.2-.8 3.2h-5c-.5-1-.8-2.1-.8-3.2 0-2 1.1-4.1 3.3-6.4Z"
        fill="currentColor"
      />
      <path
        d="M155.2 6.6c2.7.6 4.6 1.8 5.9 3.5.3.5.6 1 .8 1.6h-5a6.8 6.8 0 0 1-1.7-5.1ZM174.8 6.6a6.8 6.8 0 0 1-1.7 5.1h-5c.2-.6.5-1.1.8-1.6 1.3-1.7 3.2-2.9 5.9-3.5Z"
        fill="currentColor"
        fillOpacity="0.92"
      />
      <path
        d="M154 12.8h22c-1.9 2.5-5.9 4-11 4s-9.1-1.5-11-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Thin gold mandala ring behind the guru portrait in the hero. */
export function MandalaRing({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 24 }, (_, i) => i * 15);
  const ticks = Array.from({ length: 48 }, (_, i) => i * 7.5);

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="200"
        cy="200"
        r="196"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      <circle
        cx="200"
        cy="200"
        r="176"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />
      <circle
        cx="200"
        cy="200"
        r="140"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />
      <circle
        cx="200"
        cy="200"
        r="104"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.25"
      />
      <circle
        cx="200"
        cy="200"
        r="158"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.35"
        strokeDasharray="2 7"
      />
      {ticks.map((angle) => (
        <line
          key={`t-${angle}`}
          x1="200"
          y1="24"
          x2="200"
          y2="34"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          transform={`rotate(${angle} 200 200)`}
        />
      ))}
      {petals.map((angle) => (
        <path
          key={`p-${angle}`}
          d="M200 44c7 9 10.5 17 10.5 24 0 6.5-4.7 11.5-10.5 11.5S189.5 74.5 189.5 68c0-7 3.5-15 10.5-24Z"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.3"
          transform={`rotate(${angle} 200 200)`}
        />
      ))}
    </svg>
  );
}

/* ---------- hero eyebrow ---------- */

export function BreadcrumbSlash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.6 1 1.4 15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- service card bullets ---------- */

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m7.6 12.3 2.9 2.9 5.9-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- stats band ---------- */

export function StatUsersIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="9.4" cy="7.4" r="3.2" />
      <path d="M3.2 19.2a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16.2 5a2.9 2.9 0 0 1 0 5.6M17.8 13.2a5.2 5.2 0 0 1 3.2 4.6" />
    </svg>
  );
}

export function StatStarIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="m12 3.2 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 10l6.5-.9Z" />
    </svg>
  );
}

export function StatAwardIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="8.6" r="5.4" />
      <path
        d="M12 5.9l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2L9.1 8l2-.3Z"
        strokeWidth={1}
      />
      <path d="M8.4 13.2 6.6 21.4l5.4-2.8 5.4 2.8-1.8-8.2" />
    </svg>
  );
}

export function StatLotusIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 4c2 2.1 3 4 3 5.9 0 1.1-.3 2.1-.8 3.1h-4.4c-.5-1-.8-2-.8-3.1C9 8 10 6.1 12 4Z" />
      <path d="M4.2 9.6c2.4.5 4.2 1.7 5.4 3.4H5.9a6.8 6.8 0 0 1-1.7-3.4ZM19.8 9.6a6.8 6.8 0 0 1-1.7 3.4h-3.7c1.2-1.7 3-2.9 5.4-3.4Z" />
      <path d="M3 14.6h18c-1.7 3.2-5.4 5.2-9 5.2s-7.3-2-9-5.2Z" />
    </svg>
  );
}

export function StatGlobeIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M3.2 12h17.6" />
      <path d="M12 3.2c2.3 2.4 3.5 5.4 3.5 8.8s-1.2 6.4-3.5 8.8c-2.3-2.4-3.5-5.4-3.5-8.8S9.7 5.6 12 3.2Z" />
      <path d="M5.2 6.6a12.6 12.6 0 0 0 13.6 0M5.2 17.4a12.6 12.6 0 0 1 13.6 0" />
    </svg>
  );
}

/* ---------- why choose ---------- */

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M12 2.8 4.8 5.6v5.6c0 4.4 3 8.3 7.2 9.6 4.2-1.3 7.2-5.2 7.2-9.6V5.6Z" />
      <path d="m8.8 11.8 2.2 2.2 4.2-4.4" strokeWidth={1.5} />
    </svg>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="7.6" r="3.8" />
      <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <rect x="4.6" y="10.2" width="14.8" height="10.6" rx="2.2" />
      <path d="M8 10.2V7.6a4 4 0 0 1 8 0v2.6" />
      <circle cx="12" cy="15.4" r="1.5" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <path d="M20 4.2c0 8.4-4.2 12.6-10.4 12.6a5.6 5.6 0 0 1-5.6-5.6C4 6 8.2 4.2 20 4.2Z" />
      <path d="M4.8 20.4C6.6 14.6 10.4 10.6 16 8.6" />
    </svg>
  );
}

export function ClockOutlineIcon(props: IconProps) {
  return (
    <svg {...line} strokeWidth={1.3} {...props}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 6.8V12l3.4 2" />
    </svg>
  );
}

/* ---------- footer socials ---------- */

export function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 6.1a7.6 7.6 0 0 1-2.2.6 3.8 3.8 0 0 0 1.7-2.1c-.8.4-1.6.8-2.5 1a3.8 3.8 0 0 0-6.6 2.6c0 .3 0 .6.1.9a10.9 10.9 0 0 1-7.9-4 3.8 3.8 0 0 0 1.2 5.1c-.6 0-1.2-.2-1.7-.5a3.8 3.8 0 0 0 3 3.8c-.5.2-1.1.2-1.7.1a3.8 3.8 0 0 0 3.6 2.6A7.7 7.7 0 0 1 2 18a10.9 10.9 0 0 0 5.9 1.7c7 0 10.9-5.9 10.9-11v-.5c.7-.5 1.3-1.2 1.8-2Z" />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.4a9.6 9.6 0 0 0-3.5 18.5c-.1-.8-.1-2 .1-2.8l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.5-.2 1 .5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.1-3.8a4.7 4.7 0 0 0-4.9 4.7c0 .9.3 1.5.7 2 .2.2.2.3.1.5l-.2.8c-.1.3-.3.4-.5.2-1.2-.5-1.8-1.9-1.8-3.5 0-2.6 2.2-5.7 6.5-5.7 3.5 0 5.8 2.5 5.8 5.2 0 3.6-2 6.3-4.9 6.3-1 0-1.9-.5-2.2-1.1l-.6 2.4c-.2.8-.7 1.7-1.1 2.3a9.6 9.6 0 0 0 12-9.2A9.6 9.6 0 0 0 12 2.4Z" />
    </svg>
  );
}

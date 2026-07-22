import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function SunGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="5.4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 1.6v2.6M12 19.8v2.6M1.6 12h2.6M19.8 12h2.6M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M19.4 4.6l-1.9 1.9M6.5 17.5l-1.9 1.9" />
    </svg>
  );
}

export function MoonGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19.4 16.4A8.6 8.6 0 0 1 8.9 3.3a9.4 9.4 0 1 0 10.5 13.1Z" />
    </svg>
  );
}

export function MarsGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.4" cy="14.6" r="5.6" />
      <path d="M13.6 10.5 20 4.1" />
      <path d="M14.6 3.9H20v5.4" />
    </svg>
  );
}

export function MercuryGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 2.4a5 5 0 0 0 8 0" />
      <circle cx="12" cy="11" r="4.6" />
      <path d="M12 15.6v6M9 18.8h6" />
    </svg>
  );
}

export function JupiterGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.4 6.2a3.4 3.4 0 0 1 6.7.7c0 3.6-6.1 6.4-6.1 13" />
      <path d="M4.6 19.9h11" />
      <path d="M15 8.4v11.5" />
    </svg>
  );
}

export function VenusGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.2" r="5.3" />
      <path d="M12 13.5v8.1M8.6 17.8h6.8" />
    </svg>
  );
}

export function SaturnGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.4 6.6h6" />
      <path d="M8.7 2.6v10.1c0 4.4 1.7 7.1 4.4 7.1 2.4 0 4-1.8 4-4.2 0-2.3-1.5-4-3.6-4-1.1 0-2.1.4-2.9 1.2" />
    </svg>
  );
}

export function RahuGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.6 19.4v-6.2a6.4 6.4 0 0 1 12.8 0v6.2" />
      <circle cx="5.6" cy="20.2" r="1.9" />
      <circle cx="18.4" cy="20.2" r="1.9" />
    </svg>
  );
}

export function KetuGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.6 4.6v6.2a6.4 6.4 0 0 0 12.8 0V4.6" />
      <circle cx="5.6" cy="3.8" r="1.9" />
      <circle cx="18.4" cy="3.8" r="1.9" />
    </svg>
  );
}

export function LotusGlyph(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.2c1.9 1.9 2.9 4 2.9 6.4 0 2.4-1 4.5-2.9 6.3-1.9-1.8-2.9-3.9-2.9-6.3 0-2.4 1-4.5 2.9-6.4Z" />
      <path d="M12 16.9c-2.6.6-5-.1-7.2-2.1-1.1-1-1.8-2.3-2.1-3.8 2.2-.7 4.3-.4 6.2.9" />
      <path d="M12 16.9c2.6.6 5-.1 7.2-2.1 1.1-1 1.8-2.3 2.1-3.8-2.2-.7-4.3-.4-6.2.9" />
      <path d="M12 16.9c-3 1.6-6 1.6-9-.1 1.6 3 4.6 4.6 9 4.6s7.4-1.6 9-4.6c-3 1.7-6 1.7-9 .1Z" />
    </svg>
  );
}

export const PLANET_GLYPHS = {
  Sun: SunGlyph,
  Moon: MoonGlyph,
  Mars: MarsGlyph,
  Mercury: MercuryGlyph,
  Jupiter: JupiterGlyph,
  Venus: VenusGlyph,
  Saturn: SaturnGlyph,
  Rahu: RahuGlyph,
  Ketu: KetuGlyph,
} as const;

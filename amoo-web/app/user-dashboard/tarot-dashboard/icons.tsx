import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const GOLD = "#e3b459";
const CARD_FILL = "#271249";

/* ---------- sparkle / star helpers ---------- */

function sparkle(cx: number, cy: number, R: number, key?: string | number) {
  const r = R * 0.36;
  const d = `M${cx} ${cy - R} L${cx + r} ${cy - r} L${cx + R} ${cy} L${cx + r} ${cy + r} L${cx} ${cy + R} L${cx - r} ${cy + r} L${cx - R} ${cy} L${cx - r} ${cy - r} Z`;
  return <path key={key} d={d} fill={GOLD} />;
}

function tarotCard(
  key: string | number,
  x: number,
  y: number,
  w: number,
  h: number,
  rot = 0,
) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g key={key} transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={2.6}
        fill={CARD_FILL}
        stroke={GOLD}
        strokeWidth={1}
      />
      <rect
        x={x + 2}
        y={y + 2}
        width={w - 4}
        height={h - 4}
        rx={1.8}
        fill="none"
        stroke={GOLD}
        strokeWidth={0.55}
        strokeOpacity={0.55}
      />
      {sparkle(cx, cy, Math.min(w, h) * 0.24)}
    </g>
  );
}

/* faint concentric guide circles behind a spread */
function guides(cx: number, cy: number, radii: number[]) {
  return radii.map((r) => (
    <circle
      key={r}
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="#b79ce0"
      strokeWidth={0.7}
      strokeOpacity={0.35}
    />
  ));
}

/* ---------- Popular spread artworks ---------- */

export function DailyGuidanceArt(props: IconProps) {
  return (
    <svg viewBox="0 0 130 138" fill="none" aria-hidden="true" {...props}>
      {guides(65, 69, [50, 34])}
      {tarotCard("c", 43, 30, 44, 78)}
    </svg>
  );
}

export function PastPresentFutureArt(props: IconProps) {
  return (
    <svg viewBox="0 0 130 138" fill="none" aria-hidden="true" {...props}>
      {guides(65, 69, [52])}
      {tarotCard(0, 15, 40, 30, 58)}
      {tarotCard(1, 50, 40, 30, 58)}
      {tarotCard(2, 85, 40, 30, 58)}
    </svg>
  );
}

export function LoveSpreadArt(props: IconProps) {
  return (
    <svg viewBox="0 0 130 138" fill="none" aria-hidden="true" {...props}>
      {guides(65, 69, [56, 40])}
      {tarotCard("t", 52, 12, 26, 38)}
      {tarotCard("l", 16, 50, 26, 38)}
      {tarotCard("c", 52, 50, 26, 38)}
      {tarotCard("r", 88, 50, 26, 38)}
      {tarotCard("b", 52, 88, 26, 38)}
    </svg>
  );
}

export function CareerPathArt(props: IconProps) {
  return (
    <svg viewBox="0 0 130 138" fill="none" aria-hidden="true" {...props}>
      {guides(65, 69, [52])}
      {tarotCard("top", 50, 16, 30, 46)}
      {tarotCard("l", 22, 70, 30, 46)}
      {tarotCard("r", 78, 70, 30, 46)}
    </svg>
  );
}

export function CelticCrossArt(props: IconProps) {
  return (
    <svg viewBox="0 0 130 138" fill="none" aria-hidden="true" {...props}>
      {guides(50, 69, [44, 30])}
      {/* cross cluster */}
      {tarotCard("center", 39, 55, 22, 30)}
      {tarotCard("cross", 39, 55, 22, 30, 90)}
      {tarotCard("top", 39, 20, 22, 30)}
      {tarotCard("bottom", 39, 90, 22, 30)}
      {tarotCard("left", 8, 55, 20, 28)}
      {tarotCard("right", 70, 55, 20, 28)}
      {/* staff of four */}
      {tarotCard("s1", 100, 12, 20, 26)}
      {tarotCard("s2", 100, 42, 20, 26)}
      {tarotCard("s3", 100, 72, 20, 26)}
      {tarotCard("s4", 100, 102, 20, 26)}
    </svg>
  );
}

/* ---------- page header glyph: fanned tarot cards with star ---------- */

export function TarotFanGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
        <rect
          x="7"
          y="12"
          width="12"
          height="19"
          rx="2"
          transform="rotate(-16 13 21)"
        />
        <rect
          x="21"
          y="12"
          width="12"
          height="19"
          rx="2"
          transform="rotate(16 27 21)"
        />
        <rect x="14" y="9" width="12" height="20" rx="2" fill="none" />
      </g>
      <path
        d="M20 13.6l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------- small stat / action card glyphs ---------- */

export function TarotStackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="8.4"
        y="3.4"
        width="10.4"
        height="17.2"
        rx="1.8"
        stroke="currentColor"
        strokeWidth={1.6}
      />
      <path
        d="M6.2 5.6A1.8 1.8 0 0 0 4.6 7.4v11.8A1.8 1.8 0 0 0 6.2 21h7.6"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m13.6 8.8 1.05 2.3 2.45.3-1.85 1.75.5 2.45-2.2-1.25-2.2 1.25.5-2.45-1.85-1.75 2.45-.3z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OneCardActionIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="6.6"
        y="3.4"
        width="10.8"
        height="17.2"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.6}
      />
      <path
        d="m12 7.4 1.2 2.6 2.8.35-2.05 1.95.55 2.8L12 16.4l-2.5 1.4.55-2.8-2.05-1.95 2.8-.35z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThreeCardActionIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
        <rect x="2.6" y="6.2" width="5.4" height="11.6" rx="1.1" />
        <rect x="9.3" y="6.2" width="5.4" height="11.6" rx="1.1" />
        <rect x="16" y="6.2" width="5.4" height="11.6" rx="1.1" />
      </g>
    </svg>
  );
}

export function DailyDrawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="5"
        y="4.4"
        width="9.6"
        height="15.2"
        rx="1.8"
        transform="rotate(-10 9.8 12)"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle
        cx="16.4"
        cy="8"
        r="2.4"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M16.4 3.6v1.3M16.4 11.1v1.3M20.8 8h-1.3M13.3 8H12M19.5 4.9l-.9.9M14.3 11.1l-.9.9M19.5 11.1l-.9-.9M14.3 4.9l-.9-.9"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- decorative starburst / fireball for header banner ---------- */

export function StarBurstGlow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="tb-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3d6" />
          <stop offset="35%" stopColor="#f6b64a" />
          <stop offset="70%" stopColor="#d9741f" />
          <stop offset="100%" stopColor="#d9741f" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="60"
          y1="6"
          x2="60"
          y2="114"
          stroke="#f2a63c"
          strokeWidth={i % 2 ? 1 : 2}
          strokeOpacity={0.5}
          transform={`rotate(${i * 7.5} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="30" fill="url(#tb-core)" />
      <circle cx="60" cy="60" r="15" fill="#fff6e0" fillOpacity="0.9" />
    </svg>
  );
}

/* ---------- infinity glyph for the AMOO wordmark ---------- */

export function InfinityMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 28"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M26 14C21 5.5 8 5.5 8 14s13 8.5 18 0c5-8.5 18-8.5 18 0s-13 8.5-18 0Z"
        stroke="url(#amoo-inf)"
        strokeWidth="5.4"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient
          id="amoo-inf"
          x1="0"
          y1="0"
          x2="0"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f8e2a8" />
          <stop offset="0.55" stopColor="#e9b85c" />
          <stop offset="1" stopColor="#c08c2c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* small 4-point sparkle used around the "Tarot Software" label */
export function MiniSparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 1.5 9 6.5 14 8 9 9.5 8 14.5 7 9.5 2 8 7 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

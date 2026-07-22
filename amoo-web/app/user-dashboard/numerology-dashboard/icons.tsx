export function FlowerGlyph({
  className = "",
  strokeWidth = 1.4,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeOpacity=".5"
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="16"
          cy="10"
          rx="3.6"
          ry="6"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          transform={`rotate(${i * 45} 16 16)`}
        />
      ))}
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Mandala({
  rings,
  spokes,
  className = "",
}: {
  rings: number[];
  spokes: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      {rings.map((r) => (
        <circle key={r} cx="60" cy="60" r={r} stroke="currentColor" strokeWidth="1" />
      ))}
      {Array.from({ length: spokes }).map((_, i) => (
        <line
          key={i}
          x1="60"
          y1="2"
          x2="60"
          y2="118"
          stroke="currentColor"
          strokeWidth="0.7"
          transform={`rotate(${(i * 180) / spokes} 60 60)`}
        />
      ))}
    </svg>
  );
}

export function SunBurst({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="1" strokeOpacity=".5" />
      <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="1" strokeOpacity=".6" />
      <circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="1" strokeOpacity=".7" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity=".8" />
      {Array.from({ length: 36 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="6"
          x2="100"
          y2="194"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity=".55"
          transform={`rotate(${i * 5} 100 100)`}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={i}
          cx="100"
          cy="70"
          rx="9"
          ry="26"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeOpacity=".75"
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity=".55" />
    </svg>
  );
}

export function LifePathWheel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" className={className} aria-hidden="true">
      <circle cx="110" cy="110" r="106" stroke="currentColor" strokeWidth="1" strokeOpacity=".45" />
      <circle
        cx="110"
        cy="110"
        r="98"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity=".6"
        strokeDasharray="2 5"
      />
      <circle cx="110" cy="110" r="74" stroke="currentColor" strokeWidth="1" strokeOpacity=".55" />
      <circle cx="110" cy="110" r="58" stroke="currentColor" strokeWidth="1" strokeOpacity=".7" />

      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={`s-${i}`}
          x1="110"
          y1="12"
          x2="110"
          y2="208"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeOpacity=".35"
          transform={`rotate(${i * 7.5} 110 110)`}
        />
      ))}

      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={`p-${i}`}
          cx="110"
          cy="76"
          rx="11"
          ry="32"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeOpacity=".7"
          transform={`rotate(${i * 30} 110 110)`}
        />
      ))}

      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={`q-${i}`}
          cx="110"
          cy="88"
          rx="7"
          ry="20"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity=".55"
          transform={`rotate(${i * 45 + 22.5} 110 110)`}
        />
      ))}

      <circle cx="110" cy="110" r="40" stroke="currentColor" strokeWidth="1" strokeOpacity=".55" />
    </svg>
  );
}

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
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {rings.map((r) => (
        <circle
          key={r}
          cx="60"
          cy="60"
          r={r}
          stroke="currentColor"
          strokeWidth="1"
        />
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

export function LotusGlyph({
  className = "",
  strokeWidth = 1.5,
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
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer leaves */}
        <path d="M16 23.2 C 10.5 23.4 5 21.4 2.8 16.5 C 8.4 16.8 13.4 19 16 23.2 Z" />
        <path d="M16 23.2 C 21.5 23.4 27 21.4 29.2 16.5 C 23.6 16.8 18.6 19 16 23.2 Z" />
        {/* Side petals */}
        <path d="M16 23.2 C 11.4 20.6 8 16.5 7.8 10.5 C 12.8 13.2 15.4 17.6 16 23.2 Z" />
        <path d="M16 23.2 C 20.6 20.6 24 16.5 24.2 10.5 C 19.2 13.2 16.6 17.6 16 23.2 Z" />
        {/* Center petal */}
        <path d="M16 23.2 C 11.6 19 11.6 12.4 16 7.6 C 20.4 12.4 20.4 19 16 23.2 Z" />
        {/* Base */}
        <path d="M8.5 25.4 C 11 28.6 21 28.6 23.5 25.4" />
      </g>
    </svg>
  );
}

export function HealingHands({
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
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cupped hands */}
        <path d="M16 28.6 C 12.9 28.6 10.1 26.8 8.8 24.1 L 5.9 18.1 C 5.4 17 5.8 15.7 6.9 15.2 C 8 14.7 9.3 15.1 9.8 16.2 L 11.6 19.9 C 12.3 21.4 13.6 22.5 15.2 22.9 L 16 23.1 Z" />
        <path d="M16 28.6 C 19.1 28.6 21.9 26.8 23.2 24.1 L 26.1 18.1 C 26.6 17 26.2 15.7 25.1 15.2 C 24 14.7 22.7 15.1 22.2 16.2 L 20.4 19.9 C 19.7 21.4 18.4 22.5 16.8 22.9 L 16 23.1 Z" />
        {/* Floating spark */}
        <path d="M16 4.6 C 16.7 7.2 17.8 8.3 20.4 9 C 17.8 9.7 16.7 10.8 16 13.4 C 15.3 10.8 14.2 9.7 11.6 9 C 14.2 8.3 15.3 7.2 16 4.6 Z" />
        {/* Radiating rays */}
        <path d="M10.2 3.2 L 11.4 4.4" />
        <path d="M21.8 3.2 L 20.6 4.4" />
        <path d="M8.6 9 L 10.4 9" />
        <path d="M23.4 9 L 21.6 9" />
      </g>
    </svg>
  );
}

export function ChakraGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity=".55"
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="12"
          cy="7.4"
          rx="2.5"
          ry="4.2"
          stroke="currentColor"
          strokeWidth="1.1"
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function DiyaGlyph({
  className = "",
  strokeWidth = 1.5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Flame */}
        <path d="M12 2.8 C 10.3 5.1 9.4 6.9 9.4 8.2 C 9.4 9.6 10.6 10.8 12 10.8 C 13.4 10.8 14.6 9.6 14.6 8.2 C 14.6 6.9 13.7 5.1 12 2.8 Z" />
        {/* Wick */}
        <path d="M12 11 L 12 13.6" />
        {/* Bowl */}
        <path d="M4.6 13.9 C 5.5 17.3 8.5 19.7 12 19.7 C 15.5 19.7 18.5 17.3 19.4 13.9 Z" />
        {/* Base */}
        <path d="M8.6 21.6 L 15.4 21.6" />
      </g>
    </svg>
  );
}

export function MeditationGlyph({
  className = "",
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
      {/* Head */}
      <circle cx="16" cy="6.6" r="3.6" fill="currentColor" />
      {/* Torso */}
      <path
        d="M16 10.8 C 12.9 10.8 10.5 13.2 10.5 16.2 C 10.5 18.4 11.4 20.6 12.6 22.2 L 19.4 22.2 C 20.6 20.6 21.5 18.4 21.5 16.2 C 21.5 13.2 19.1 10.8 16 10.8 Z"
        fill="currentColor"
      />
      {/* Arms */}
      <path
        d="M10.7 13 C 8.3 14.9 6.6 17.7 6.1 20.9 C 5.9 22.2 6.7 23.5 8 23.8 C 8.9 24 9.7 23.6 10.2 23 C 9.6 20 9.7 16.8 10.7 13 Z"
        fill="currentColor"
      />
      <path
        d="M21.3 13 C 23.7 14.9 25.4 17.7 25.9 20.9 C 26.1 22.2 25.3 23.5 24 23.8 C 23.1 24 22.3 23.6 21.8 23 C 22.4 20 22.3 16.8 21.3 13 Z"
        fill="currentColor"
      />
      {/* Crossed legs */}
      <path
        d="M16 21.4 C 12.4 21.4 8.6 22.6 6 24.3 C 4.3 25.4 3.8 26.9 4.6 27.9 C 5.1 28.5 6 28.6 7 28.6 L 25 28.6 C 26 28.6 26.9 28.5 27.4 27.9 C 28.2 26.9 27.7 25.4 26 24.3 C 23.4 22.6 19.6 21.4 16 21.4 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SparkleGlyph({
  className = "",
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 0 C 8.9 4.3 11.7 7.1 16 8 C 11.7 8.9 8.9 11.7 8 16 C 7.1 11.7 4.3 8.9 0 8 C 4.3 7.1 7.1 4.3 8 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

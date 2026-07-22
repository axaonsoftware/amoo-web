export function Mandala({ className }: { className?: string }) {
  const outerPetals = Array.from({ length: 12 }, (_, i) => i * 30);
  const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(100 100)"
      >
        <circle r="94" />
        <circle r="86" strokeWidth="0.8" />
        <circle r="40" strokeWidth="0.8" />
        <circle r="18" />
        {outerPetals.map((a) => (
          <path
            key={`o-${a}`}
            d="M0 -40 C 20 -54, 22 -72, 0 -86 C -22 -72, -20 -54, 0 -40 Z"
            transform={`rotate(${a})`}
          />
        ))}
        {innerPetals.map((a) => (
          <path
            key={`i-${a}`}
            d="M0 -18 C 10 -24, 11 -32, 0 -40 C -11 -32, -10 -24, 0 -18 Z"
            strokeWidth="0.8"
            transform={`rotate(${a})`}
          />
        ))}
      </g>
    </svg>
  );
}

export function EyeMandala({ className }: { className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => i * 22.5);

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        transform="translate(60 60)"
      >
        <circle r="56" />
        <circle r="44" strokeWidth="0.9" />
        {rays.map((a) => (
          <line key={a} x1="0" y1="-44" x2="0" y2="-56" transform={`rotate(${a})`} />
        ))}
        <path d="M-30 0 C -16 -20, 16 -20, 30 0 C 16 20, -16 20, -30 0 Z" />
        <circle r="11" />
        <circle r="4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function Lotus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M32 12c5 6 7 12 7 18 0 6-3 11-7 15-4-4-7-9-7-15 0-6 2-12 7-18Z" />
        <path d="M39 30c6-2 12-1 17 2-1 7-5 12-11 15-4 2-9 2-13-2" />
        <path d="M25 30c-6-2-12-1-17 2 1 7 5 12 11 15 4 2 9 2 13-2" />
        <path d="M10 47c6 5 14 8 22 8s16-3 22-8" />
        <circle cx="32" cy="8" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function StarBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mr-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8dd9c" />
          <stop offset="45%" stopColor="#e5aa45" />
          <stop offset="100%" stopColor="#c07f26" />
        </linearGradient>
      </defs>
      <path
        d="M17 30 13 45l7-3 4 5 4-5 7 3-4-15Z"
        fill="#e5aa45"
        stroke="#c07f26"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="20" r="17" fill="url(#mr-badge)" stroke="#f3d491" strokeWidth="1.4" />
      <circle cx="24" cy="20" r="13" fill="none" stroke="#fbeecb" strokeWidth="0.9" opacity="0.75" />
      <path
        d="M24 11.5l3 6.1 6.7 1-4.8 4.7 1.1 6.7L24 26.8l-6 3.2 1.1-6.7-4.8-4.7 6.7-1Z"
        fill="#fff8e6"
      />
    </svg>
  );
}

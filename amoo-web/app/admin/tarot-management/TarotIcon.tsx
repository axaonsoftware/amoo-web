export default function TarotIcon({
  size = 24,
  className = "",
  strokeWidth = 1.5,
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3.4"
          y="6"
          width="6.6"
          height="12"
          rx="1.3"
          transform="rotate(-14 6.7 12)"
        />
        <rect
          x="14"
          y="6"
          width="6.6"
          height="12"
          rx="1.3"
          transform="rotate(14 17.3 12)"
        />
        <rect x="8.5" y="4.4" width="7" height="15.2" rx="1.4" />
        <path d="M12 8.5 L12.85 10.25 L14.8 10.53 L13.4 11.9 L13.73 13.83 L12 12.92 L10.27 13.83 L10.6 11.9 L9.2 10.53 L11.15 10.25 Z" />
      </g>
    </svg>
  );
}

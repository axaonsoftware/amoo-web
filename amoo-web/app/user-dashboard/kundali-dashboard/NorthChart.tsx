type Label = {
  x: number;
  y: number;
  lines: string[];
  number?: string;
};

/* Positions are fractions of the chart square, matching the reference. */
const labels: Label[] = [
  { x: 24.6, y: 11.3, lines: ["Ra"] },
  { x: 50, y: 16, lines: ["Me Su", "Ve"], number: "4" },
  { x: 78.5, y: 11.3, lines: ["Ma"] },
  { x: 10.4, y: 24.1, lines: [], number: "7" },
  { x: 78.5, y: 24.1, lines: [], number: "2" },
  { x: 50, y: 40.1, lines: ["La"], number: "1" },
  { x: 25, y: 49.4, lines: [], number: "8" },
  { x: 74.6, y: 49.4, lines: [], number: "3" },
  { x: 10, y: 70, lines: ["Ju"], number: "9" },
  { x: 89.2, y: 70, lines: ["Sa"], number: "12" },
  { x: 50, y: 80.5, lines: ["Mo"], number: "10" },
  { x: 10, y: 88.7, lines: ["Ke"] },
  { x: 74.6, y: 88.7, lines: [], number: "11" },
];

export default function NorthChart() {
  return (
    <div className="relative aspect-square w-full max-w-[262px] border border-[#d9cfe6] bg-white">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-[#d9cfe6]"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <polygon
          points="50,0 100,50 50,100 0,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {labels.map((l, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center leading-[1.25]"
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
        >
          {l.lines.map((line) => (
            <span key={line} className="block text-[11px] font-semibold text-[#2b0f47]">
              {line}
            </span>
          ))}
          {l.number ? (
            <span className="block text-[11px] font-medium text-[#8b8697]">{l.number}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

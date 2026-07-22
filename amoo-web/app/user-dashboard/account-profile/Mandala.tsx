const SPOKES = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  return {
    x1: 50 + Math.cos(a) * 30,
    y1: 50 + Math.sin(a) * 30,
    x2: 50 + Math.cos(a) * 41,
    y2: 50 + Math.sin(a) * 41,
  };
});

const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return {
    x1: 50 + Math.cos(a) * 14,
    y1: 50 + Math.sin(a) * 14,
    x2: 50 + Math.cos(a) * 30,
    y2: 50 + Math.sin(a) * 30,
  };
});

export default function Mandala({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="49" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="42" strokeWidth="1" />
      <circle cx="50" cy="50" r="40.5" strokeWidth="0.35" />
      <circle cx="50" cy="50" r="30" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="14" strokeWidth="0.7" />
      {SPOKES.map((s, i) => (
        <line key={`s${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth="0.4" />
      ))}
      {TICKS.map((t, i) => (
        <line key={`t${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth="0.35" />
      ))}
      <circle cx="50" cy="50" r="4.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

const tabs = [
  { label: "Upcoming", active: true },
  { label: "Requests", badge: "2" },
  { label: "History" },
  { label: "Cancelled" },
  { label: "Completed" },
];

function Mandala({ className }: { className?: string }) {
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

export default function PageHeader() {
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#efe6d6] bg-white shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      {/* Mandala decoration */}
      <Mandala className="pointer-events-none absolute -right-3 -top-9 h-[172px] w-[172px] text-[#d9a441] opacity-45" />

      <div className="relative flex flex-wrap items-center gap-4 px-6 pb-5 pt-6">
        <span className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[16px] bg-[#f3ecfb]">
          <CalendarDays className="h-[28px] w-[28px] text-[#5b21a8]" strokeWidth={1.8} />
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-[30px] font-bold leading-[1.15] text-[#4c1d95]">
            My Consultations
          </h1>
          <p className="mt-1 text-[13px] text-[#6c6b78]">
            Book, manage and join your consultations easily
          </p>
        </div>

        <Link
          href="/consultation/consultation-booking"
          className="ml-auto inline-flex h-[48px] items-center justify-center gap-2.5 rounded-[12px] bg-gradient-to-b from-[#f3cd7c] to-[#e0a63f] px-6 text-[14px] font-semibold text-[#3d1a04] shadow-[0_6px_18px_rgba(224,166,63,.35)]"
        >
          Book New Consultation
          <Plus className="h-[17px] w-[17px]" strokeWidth={2.4} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="relative border-b border-[#efe6d6]">
        <nav className="flex items-center gap-8 overflow-x-auto px-6">
          {tabs.map(({ label, badge, active }) => (
            <button
              key={label}
              type="button"
              className={
                active
                  ? "relative flex items-center gap-2 py-[14px] text-[14px] font-semibold text-[#5b21a8]"
                  : "relative flex items-center gap-2 py-[14px] text-[14px] font-normal text-[#7a7686] transition-colors hover:text-[#5b21a8]"
              }
            >
              <span>{label}</span>
              {badge ? (
                <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#e9b85c] px-1 text-[10px] font-bold text-[#2a1148]">
                  {badge}
                </span>
              ) : null}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#5b21a8]" />
              ) : null}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

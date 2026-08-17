import { FileText, Crown } from "lucide-react";
import { StarBadge } from "./icons";

const tabs = [
  { label: "All Reports", active: true },
  { label: "Numerology" },
  { label: "Tarot Reading" },
  { label: "Kundli" },
  { label: "Vastu" },
  { label: "Reiki Healing" },
];

export default function PageHeader() {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-5">
        <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-[#f3ecfb]">
          <FileText
            className="h-[26px] w-[26px] text-[#6d28d9]"
            strokeWidth={1.7}
          />
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-[30px] font-bold leading-[1.15] text-[#4c1d95]">
            My Reports
          </h1>
          <p className="mt-[5px] text-[13px] text-[#6c6b78]">
            Access and manage all your spiritual reports in one place.
          </p>
        </div>

        {/* Premium banner */}
        <div className="relative ml-auto flex h-[78px] w-full max-w-[448px] items-center overflow-hidden rounded-[14px] border border-[#6b3fa0]/40 bg-gradient-to-r from-[#28093f] via-[#43156e] to-[#280940] px-[24px] shadow-[0_8px_24px_rgba(43,15,71,.28)]">
          <div className="stars pointer-events-none absolute inset-0 opacity-50" />

          <Crown
            className="relative h-[28px] w-[28px] shrink-0 text-[#e9b85c]"
            strokeWidth={1.7}
          />

          <div className="relative ml-[16px] min-w-0">
            <p className="text-[15px] font-semibold leading-none text-[#f3c76e]">
              You&apos;re a Premium User
            </p>
            <p className="mt-[8px] text-[11.5px] leading-none text-white/70">
              Enjoy unlimited access to all premium reports.
            </p>
          </div>

          <StarBadge className="relative ml-auto h-[44px] w-[44px] shrink-0" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-[28px] border-b border-[#eee4d4]">
        <nav className="flex items-center gap-[92px] overflow-x-auto pl-[14px]">
          {tabs.map(({ label, active }) => (
            <button
              key={label}
              type="button"
              className={
                active
                  ? "relative shrink-0 py-[13px] text-[14px] font-semibold text-[#5b21a8]"
                  : "relative shrink-0 py-[13px] text-[14px] font-normal text-[#7a7686] transition-colors hover:text-[#5b21a8]"
              }
            >
              <span>{label}</span>
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

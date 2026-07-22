import { ChevronRight, Upload, Plus } from "lucide-react";

function MandalaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[25px] w-[25px]" aria-hidden="true">
      <g
        fill="none"
        stroke="#EFEAFB"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="2.6" />
        <circle cx="12" cy="12" r="5.6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path
            key={a}
            d="M12 6.4 L13.7 3.4 L12 1.2 L10.3 3.4 Z"
            transform={`rotate(${a} 12 12)`}
          />
        ))}
      </g>
    </svg>
  );
}

export default function PageHeader() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-[13px] text-[12px] leading-[15px]">
        <span className="text-[#6E6A85]">Dashboard</span>
        <ChevronRight size={13} className="text-[#A9A6BA]" />
        <span className="text-[#6E6A85]">Kundali Management</span>
        <ChevronRight size={13} className="text-[#A9A6BA]" />
        <span className="font-semibold text-[#14133F]">Kundali Reports</span>
      </nav>

      {/* Title row */}
      <div className="mt-[18px] flex flex-col gap-5 md:flex-row md:items-start">
        <div className="flex min-w-0 items-start">
          <div className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#3A0F8F] to-[#26046B]">
            <MandalaIcon />
          </div>

          <div className="ml-[18px] min-w-0 pt-[4px]">
            <h1 className="font-[family-name:var(--font-playfair)] text-[22px] font-bold leading-[26px] text-[#0B0620]">
              Kundali Management
            </h1>
            <p className="mt-[8px] text-[11px] leading-[15px] text-[#6E6A85]">
              Manage kundali generations, analysis, doshas and astrological
              reports.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-[14px] pt-[4px] md:ml-auto md:pr-[58px]">
          <button
            type="button"
            className="inline-flex h-[31px] w-[117px] items-center justify-center gap-[8px] rounded-[8px] border border-[#C4AEF0] bg-white text-[11.5px] font-semibold text-[#4A12C7]"
          >
            <Upload size={14} />
            Export Report
          </button>

          <button
            type="button"
            className="inline-flex h-[31px] w-[160px] items-center justify-center gap-[8px] rounded-[8px] bg-gradient-to-b from-[#3F0AA0] to-[#2B0179] text-[11.5px] font-semibold text-white shadow-[0_4px_12px_rgba(43,1,121,.25)]"
          >
            <Plus size={15} strokeWidth={2.6} />
            Generate New Kundali
          </button>
        </div>
      </div>
    </>
  );
}

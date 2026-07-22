import { ChevronRight, Upload, Plus } from "lucide-react";
import TarotIcon from "./TarotIcon";

export default function PageHeader() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-[13px] text-[12px] leading-[15px]">
        <span className="text-[#6E6A85]">Dashboard</span>
        <ChevronRight size={13} className="text-[#A9A6BA]" />
        <span className="text-[#6E6A85]">Tarot Management</span>
        <ChevronRight size={13} className="text-[#A9A6BA]" />
        <span className="font-semibold text-[#14133F]">Tarot Readings</span>
      </nav>

      {/* Title row */}
      <div className="mt-[18px] flex items-start">
        <div className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#3A0F8F] to-[#26046B]">
          <TarotIcon
            size={25}
            strokeWidth={1.15}
            className="text-[#EFEAFB]"
          />
        </div>

        <div className="ml-[18px] min-w-0 pt-[4px]">
          <h1 className="font-[family-name:var(--font-playfair)] text-[22px] font-bold leading-[26px] text-[#0B0620]">
            Tarot Management
          </h1>
          <p className="mt-[8px] text-[11px] leading-[15px] text-[#6E6A85]">
            Manage tarot readings, spreads, decks and card interpretations.
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-[14px] pr-[58px] pt-[4px]">
          <button
            type="button"
            className="inline-flex h-[31px] w-[117px] items-center justify-center gap-[8px] rounded-[8px] border border-[#C4AEF0] bg-white text-[11.5px] font-semibold text-[#4A12C7]"
          >
            <Upload size={14} />
            Export Report
          </button>

          <button
            type="button"
            className="inline-flex h-[31px] w-[145px] items-center justify-center gap-[8px] rounded-[8px] bg-gradient-to-b from-[#3F0AA0] to-[#2B0179] text-[11.5px] font-semibold text-white shadow-[0_4px_12px_rgba(43,1,121,.25)]"
          >
            <Plus size={15} strokeWidth={2.6} />
            Add New Reading
          </button>
        </div>
      </div>
    </>
  );
}

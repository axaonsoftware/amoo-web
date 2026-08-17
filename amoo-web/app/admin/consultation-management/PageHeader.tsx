import Link from "next/link";
import { ChevronRight, UsersRound, Upload, Plus } from "lucide-react";

export default function PageHeader() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-[6px] text-[11.5px] text-[#8B879C]">
        <Link href="/admin/admin-dashboard" className="hover:text-[#5B2497]">
          Dashboard
        </Link>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <Link
          href="/admin/consultation-management"
          className="hover:text-[#5B2497]"
        >
          Consultation Management
        </Link>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <span className="font-medium text-[#2E2A3B]">All Consultations</span>
      </nav>

      {/* Title row */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#4E1C8E] to-[#7A34C4] text-white shadow-[0_6px_16px_rgba(91,36,151,.28)]">
          <UsersRound size={24} />
        </span>

        <div className="min-w-0">
          <h1 className="font-[var(--font-playfair)] text-[25px] font-bold leading-[1.15] text-[#1D1630]">
            Consultation Management
          </h1>
          <p className="mt-[3px] text-[12px] text-[#7C7890]">
            View, manage and monitor all consultations across the platform.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#C9B6E6] bg-white px-[18px] text-[12.5px] font-semibold text-[#5B2497] hover:bg-[#FAF7FE]"
          >
            <Upload size={15} />
            Export Report
          </button>

          <button
            type="button"
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] px-[18px] text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(91,36,151,.25)]"
          >
            <Plus size={16} />
            New Consultation
          </button>
        </div>
      </div>
    </>
  );
}

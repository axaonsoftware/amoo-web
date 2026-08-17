"use client";

import { useRef } from "react";
import { ChevronRight, Tag, Upload, Plus } from "lucide-react";
import StatsRow from "./StatsRow";
import PricingPanel from "./PricingPanel";
import RightRail from "./RightRail";

export default function PricingManagementPage() {
  const panelFns = useRef<{
    openCreate: () => void;
    exportData: () => void;
  } | null>(null);

  return (
    <main id="main-content" className="flex-1 px-6 pb-8 pt-[18px]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-[6px] text-[10.5px]">
        <span className="text-[#8B879C]">Dashboard</span>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <span className="font-medium text-[#3D3752]">Pricing Management</span>
      </nav>

      {/* Page header */}
      <div className="mt-[14px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[14px]">
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] shadow-[0_6px_16px_rgba(109,40,217,.25)]">
            <Tag size={24} strokeWidth={1.8} className="text-white" />
          </span>

          <div>
            <h1 className="font-display text-[26px] font-bold leading-none text-[#231640]">
              Pricing Management
            </h1>
            <p className="mt-[7px] text-[11px] text-[#8B879C]">
              Manage pricing plans, packages and offers for all services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => panelFns.current?.exportData()}
            className="flex h-[38px] items-center gap-[7px] rounded-[9px] border border-[#7C3AED] bg-white px-[15px] text-[11.5px] font-medium text-[#6D28D9] hover:bg-[#FAF7FF]"
          >
            <Upload size={14} strokeWidth={2} />
            Export Pricing
          </button>

          <button
            type="button"
            onClick={() => panelFns.current?.openCreate()}
            className="flex h-[38px] items-center gap-[7px] rounded-[9px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[15px] text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(109,40,217,.25)]"
          >
            <Plus size={15} strokeWidth={2.4} />
            Add New Plan
          </button>
        </div>
      </div>

      <StatsRow />

      <div className="mt-5 flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <PricingPanel
            onReady={(fns) => {
              panelFns.current = fns;
            }}
          />
        </div>
        <RightRail />
      </div>
    </main>
  );
}

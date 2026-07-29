"use client";

import { ChevronRight, Wallet, CalendarDays, Download } from "lucide-react";

function fmt(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PageHeader() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <div>
      <nav className="flex items-center gap-[6px] text-[11.5px] text-[#8B879C]">
        <span>Dashboard</span>
        <ChevronRight size={12} className="text-[#B9B6C6]" />
        <span className="font-medium text-[#4A3B63]">Payments &amp; Finance</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#4C1D95] to-[#2E1065]">
          <Wallet size={24} className="text-white" />
        </div>

        <div className="min-w-0">
          <h1 className="text-[25px] font-semibold leading-[32px] tracking-[-0.01em] text-[#1B1630]">
            Payments &amp; Finance
          </h1>
          <p className="mt-[2px] text-[12px] text-[#8B879C]">
            Track transactions, manage payouts, invoices and financial reports.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-[42px] items-center gap-[10px] rounded-[10px] border border-[#E3E0EC] bg-white px-4 text-[12.5px] font-medium text-[#2E2A3B] shadow-[0_1px_2px_rgba(16,12,40,0.04)] hover:bg-[#FAF9FC]"
          >
            <span>{fmt(startOfMonth)}</span>
            <span className="text-[#B9B6C6]">·</span>
            <span>{fmt(now)}</span>
            <CalendarDays size={15} className="text-[#7C3AED]" />
          </button>

          <button
            type="button"
            className="inline-flex h-[42px] items-center gap-[6px] rounded-[10px] bg-gradient-to-r from-[#3B1078] to-[#6D28D9] px-4 text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(76,29,149,0.28)]"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

/**
 * Breadcrumb + title block shared by the admin pages.
 *
 * The existing pages each inlined ~30 lines of identical markup for this. New
 * pages use the shared version so the header cannot drift between them.
 */
export default function AdminPageHeader({
  title,
  description,
  Icon,
  action,
}: {
  title: string;
  description: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  action?: ReactNode;
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-[6px] text-[10.5px]">
        <span className="text-[#8B879C]">Dashboard</span>
        <ChevronRight size={12} className="text-[#B7B3C4]" aria-hidden="true" />
        <span className="font-medium text-[#3D3752]" aria-current="page">{title}</span>
      </nav>

      <div className="mt-[14px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[14px]">
          <span
            aria-hidden="true"
            className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] shadow-[0_6px_16px_rgba(109,40,217,.25)]"
          >
            <Icon size={24} strokeWidth={1.8} className="text-white" />
          </span>
          <div>
            <h1 className="font-display text-[26px] font-bold leading-none text-[#231640]">{title}</h1>
            <p className="mt-[7px] text-[11px] text-[#8B879C]">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </>
  );
}

/** The four-up counter strip every admin list page carries. */
export function AdminStats({ stats }: { stats: { label: string; value: ReactNode }[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-[12px] border border-[#E5E1F0] bg-white p-4">
          <p className="text-[11px] text-[#8B879C]">{s.label}</p>
          <p className="mt-1 font-display text-[22px] font-bold text-[#231640]">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

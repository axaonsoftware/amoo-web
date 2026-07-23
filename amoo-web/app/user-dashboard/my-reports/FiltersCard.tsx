"use client";

import { ChevronDown, Calendar, Loader2 } from "lucide-react";
import { useApiList } from "@/lib/useApi";
import { api } from "@/lib/api";

const sortOptions = ["Newest First", "Oldest First", "A – Z", "Z – A"];

const fieldBase =
  "h-[42px] w-full appearance-none rounded-[10px] border border-[#e7ddcb] bg-white pl-[14px] pr-[38px] text-[13px] text-[#2b0f47] focus:outline-none";

export default function FiltersCard() {
  // /api/services is paginated -> `{ data, meta }`, never a bare array.
  const { items: services, loading, error } = useApiList<any>(() => api.getServices());
  const typeSet = new Set<string>();
  services.forEach((s: any) => {
    const cat = s.category || s.type;
    if (cat) typeSet.add(cat);
  });
  const reportTypes = ["All Types", ...Array.from(typeSet)];
  return (
    <section className="rounded-[16px] border border-[#f0e7d8] bg-white px-[20px] pb-[20px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[18px] font-bold leading-none text-[#4c1d95]">Filters</h2>
        <button type="button" className="text-[12px] font-medium text-[#7c3aed]">
          Clear All
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading filters...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : (
        <>
          {/* Report Type */}
          <p className="mt-[18px] text-[12.5px] font-medium leading-none text-[#4a4458]">Report Type</p>
          <div className="relative mt-[8px]">
            <select aria-label="Report Type" className={fieldBase} defaultValue="All Types">
              {reportTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-[13px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#6b6577]"
              strokeWidth={2}
            />
          </div>

          {/* Dates */}
          <div className="mt-[16px] grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div>
              <p className="text-[12.5px] font-medium leading-none text-[#4a4458]">Date From</p>
              <div className="relative mt-[8px]">
                <input
                  type="text"
                  aria-label="Date From"
                  placeholder="Select date"
                  className={`${fieldBase} placeholder:text-[#a09aab]`}
                />
                <Calendar
                  className="pointer-events-none absolute right-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#8b8697]"
                  strokeWidth={1.8}
                />
              </div>
            </div>

            <div>
              <p className="text-[12.5px] font-medium leading-none text-[#4a4458]">Date To</p>
              <div className="relative mt-[8px]">
                <input
                  type="text"
                  aria-label="Date To"
                  placeholder="Select date"
                  className={`${fieldBase} placeholder:text-[#a09aab]`}
                />
                <Calendar
                  className="pointer-events-none absolute right-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#8b8697]"
                  strokeWidth={1.8}
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <p className="mt-[16px] text-[12.5px] font-medium leading-none text-[#4a4458]">Sort By</p>
          <div className="relative mt-[8px]">
            <select aria-label="Sort By" className={fieldBase} defaultValue="Newest First">
              {sortOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-[13px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#6b6577]"
              strokeWidth={2}
            />
          </div>
        </>
      )}

      <button
        type="button"
        className="mt-[18px] flex h-[46px] w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-[#7c3aed] to-[#4c1d95] text-[14px] font-semibold text-white shadow-[0_6px_18px_rgba(92,33,168,.28)]"
      >
        Apply Filters
      </button>
    </section>
  );
}

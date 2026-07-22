"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const TYPE_META: Record<string, { tag: string; tagClass: string; subtitle: string; image: string }> = {
  numerology: { tag: "Numerology", tagClass: "bg-[#f3ecfb] text-[#7c3aed]", subtitle: "Full Name Analysis", image: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=140&q=80" },
  kundli: { tag: "Kundli", tagClass: "bg-[#fde8ee] text-[#e0507f]", subtitle: "Detailed Horoscope", image: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=140&q=80" },
  tarot: { tag: "Tarot Reading", tagClass: "bg-[#fdf0e2] text-[#c2762a]", subtitle: "Card Spread", image: "https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=140&q=80" },
  vastu: { tag: "Vastu", tagClass: "bg-[#e7f8ee] text-[#2f9e63]", subtitle: "Home Vastu Analysis", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=140&q=80" },
  reiki: { tag: "Reiki Healing", tagClass: "bg-[#f3ecfb] text-[#7c3aed]", subtitle: "Chakra Analysis", image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=140&q=80" },
};

type Report = { id: number; title: string; type: string; created_at: string };

export default function RecentReports() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() => api.getReports(), [], 10000);
  const rows: Report[] = (data?.data ?? []).slice(0, 5);

  return (
    <section className="rounded-[16px] border border-[#f0e7d8] bg-white px-[22px] pb-[20px] pt-[20px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[19px] font-bold leading-none text-[#4c1d95]">Recent Reports</h2>
        <Link href="/user-dashboard/my-reports" className="inline-flex items-center gap-[6px] text-[12.5px] font-medium text-[#7c3aed]">
          View All Reports
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reports...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">No reports generated yet.</p>
      ) : (
        <ul className="mt-[14px] flex flex-col">
          {rows.map((r) => {
            const meta = TYPE_META[String(r.type).toLowerCase()] ?? TYPE_META.numerology;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-x-[16px] gap-y-3 py-[13px]">
                <span className="relative block h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[12px]">
                  <Image src={meta.image} alt="" fill sizes="70px" aria-hidden="true" className="object-cover" />
                </span>
                <div className="min-w-[150px] flex-1">
                  <p className="text-[14.5px] font-semibold leading-none text-[#2b0f47]">{r.title}</p>
                  <p className="mt-[7px] text-[12px] leading-none text-[#8b8697]">{meta.subtitle}</p>
                  <span className={`mt-[9px] inline-flex items-center rounded-[6px] px-[9px] py-[4px] text-[10.5px] font-medium leading-none ${meta.tagClass}`}>{meta.tag}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11.5px] leading-none text-[#a09aab]">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <div className="mt-[18px] flex items-center gap-[10px]">
                    <Link href="/user-dashboard/my-reports" className="inline-flex h-[34px] items-center justify-center rounded-[8px] border border-[#e2d5f4] bg-white px-[18px] text-[12.5px] font-medium text-[#6d28d9]">
                      View
                    </Link>
                    <button type="button" aria-label={`Download ${r.title}`} className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e2d5f4] bg-white text-[#6d28d9]">
                      <Download className="h-[15px] w-[15px]" strokeWidth={1.9} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-[10px] flex justify-center">
        <Link href="/user-dashboard/my-reports" className="inline-flex h-[38px] items-center gap-[7px] rounded-full border border-[#e8dcc8] bg-white px-[20px] text-[12.5px] font-medium text-[#4c1d95] shadow-[0_1px_2px_rgba(38,17,66,.05)]">
          View All Reports
          <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}

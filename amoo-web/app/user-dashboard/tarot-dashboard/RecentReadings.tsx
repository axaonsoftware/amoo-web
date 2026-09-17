"use client";

import Image from "next/image";
import { ArrowRight, Heart, Globe, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const CHIP_MAP: Record<
  string,
  { label: string; bg: string; color: string; Icon?: typeof Heart }
> = {
  love: {
    label: "Love",
    bg: "bg-[#fde8f0]",
    color: "text-[#e0567f]",
    Icon: Heart,
  },
  career: {
    label: "Career",
    bg: "bg-[#e7effb]",
    color: "text-[#3b78cc]",
    Icon: Heart,
  },
  daily: {
    label: "Daily",
    bg: "bg-[#e6f6ea]",
    color: "text-[#2f9e56]",
  },
  general: {
    label: "General",
    bg: "bg-[#f0eef4]",
    color: "text-[#6c6b78]",
    Icon: Globe,
  },
};

type Report = {
  id: number;
  user_id?: number;
  service_id?: number | null;
  type: string;
  title: string;
  content?: string | null;
  file_url?: string | null;
  status?: string;
  is_favorite?: boolean;
  downloaded?: boolean;
  chakra_data?: unknown;
  deleted_at?: string | null;
  created_at: string;
};

export default function RecentReadings() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loadingReportId, setLoadingReportId] = useState<number | null>(null);

  const reports: Report[] = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase() === "tarot",
  );

  const handleView = async (id: number) => {
    setLoadingReportId(id);

    try {
      const report = await api.getReport(id);
      setSelectedReport(report as Report);
    } catch (e) {
      console.error("Failed to fetch report:", e);
    } finally {
      setLoadingReportId(null);
    }
  };

  return (
    <>
      <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
            Recent Readings
          </h2>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
          >
            View All Readings
            <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
          </button>
        </div>

        {loading ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#8b8697]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading readings...
          </div>
        ) : error ? (
          <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
        ) : reports.length === 0 ? (
          <p className="mt-4 text-[12.5px] text-[#8b8697]">
            No tarot readings found.
          </p>
        ) : (
          <ul className="mt-2">
            {reports.map((r, i) => {
              const typeKey =
                (r.type || "").toLowerCase().replace("tarot", "").trim() ||
                "general";

              const chip = CHIP_MAP[typeKey] || CHIP_MAP.general;
              const ChipIcon = chip.Icon;

              const created = new Date(r.created_at);

              const dateStr = created.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const timeStr = created.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <li
                  key={r.id}
                  className={`flex items-center gap-3.5 py-[11px] ${
                    i === 0 ? "" : "border-t border-[#f4f1f8]"
                  }`}
                >
                  <span className="relative block h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px]">
                    <Image
                      src="https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=104&q=80"
                      alt={r.title}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-[#2b0f47]">
                      {r.title}
                    </p>

                    <p className="mt-[3px] text-[11.5px] capitalize text-[#8b8697]">
                      {r.type}
                    </p>

                    <p className="mt-[3px] text-[11px] text-[#a09aab]">
                      {dateStr}
                      <span className="ml-3">{timeStr}</span>
                    </p>
                  </div>

                  <span
                    className={`hidden items-center gap-1 rounded-full px-2.5 py-[4px] text-[11px] font-medium sm:inline-flex ${chip.bg} ${chip.color}`}
                  >
                    {ChipIcon ? (
                      <ChipIcon className="h-[12px] w-[12px]" strokeWidth={2} />
                    ) : null}
                    {chip.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleView(r.id)}
                    disabled={loadingReportId === r.id}
                    className="inline-flex h-[32px] items-center justify-center rounded-[8px] border border-[#e2d9f0] px-4 text-[12px] font-medium text-[#7a3fc0] cursor-pointer disabled:opacity-60"
                  >
                    {loadingReportId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "View"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {selectedReport ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-[16px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#ece9f3] px-5 py-4">
              <div className="min-w-0 pr-4">
                <h3 className="font-display text-[19px] font-bold text-[#2b0f47]">
                  {selectedReport.title}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-[#f1e9fc] px-2.5 py-1 text-[11px] font-medium capitalize text-[#7a3fc0]">
                    {selectedReport.type}
                  </span>

                  {selectedReport.status ? (
                    <span className="rounded-full bg-[#e6f6ea] px-2.5 py-1 text-[11px] font-medium capitalize text-[#2f9e56]">
                      {selectedReport.status}
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f1f8] text-[#6c6b78] transition hover:bg-[#ece7f3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-5">
              <div className="rounded-[12px] border border-[#ece9f3] bg-[#fcfbfe] p-4">
                <p className="mb-2 text-[12px] font-semibold text-[#2b0f47]">
                  Report Details
                </p>

                <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#5f5a68]">
                  {selectedReport.content || "No report content available."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] bg-[#f8f5fb] p-3">
                  <p className="text-[10px] text-[#8b8697]">Report ID</p>
                  <p className="mt-1 text-[12px] font-semibold text-[#2b0f47]">
                    #{selectedReport.id}
                  </p>
                </div>

                <div className="rounded-[10px] bg-[#f8f5fb] p-3">
                  <p className="text-[10px] text-[#8b8697]">Created</p>
                  <p className="mt-1 text-[12px] font-semibold text-[#2b0f47]">
                    {new Date(selectedReport.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>

                <div className="rounded-[10px] bg-[#f8f5fb] p-3">
                  <p className="text-[10px] text-[#8b8697]">Favorite</p>
                  <p className="mt-1 text-[12px] font-semibold capitalize text-[#2b0f47]">
                    {selectedReport.is_favorite ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#ece9f3] px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-[9px] cursor-pointer bg-[#4c1d95] px-5 py-2 text-[12px] font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

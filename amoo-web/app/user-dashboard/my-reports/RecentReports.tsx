"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { sanitize } from "../../../lib/sanitize";
import PageHeader, { type ReportTab } from "./PageHeader";

const TYPE_META: Record<
  string,
  { tag: string; tagClass: string; subtitle: string; image: string }
> = {
  numerology: {
    tag: "Numerology",
    tagClass: "bg-[#f3ecfb] text-[#7c3aed]",
    subtitle: "Full Name Analysis",
    image:
      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=140&q=80",
  },
  kundli: {
    tag: "Kundli",
    tagClass: "bg-[#fde8ee] text-[#e0507f]",
    subtitle: "Detailed Horoscope",
    image:
      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=140&q=80",
  },
  kundali: {
    tag: "Kundli",
    tagClass: "bg-[#fde8ee] text-[#e0507f]",
    subtitle: "Detailed Horoscope",
    image:
      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=140&q=80",
  },
  tarot: {
    tag: "Tarot Reading",
    tagClass: "bg-[#fdf0e2] text-[#c2762a]",
    subtitle: "Card Spread",
    image:
      "https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=140&q=80",
  },
  vastu: {
    tag: "Vastu",
    tagClass: "bg-[#e7f8ee] text-[#2f9e63]",
    subtitle: "Home Vastu Analysis",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=140&q=80",
  },
  reiki: {
    tag: "Reiki Healing",
    tagClass: "bg-[#f3ecfb] text-[#7c3aed]",
    subtitle: "Chakra Analysis",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?w=140&q=80",
  },
};

type Report = {
  id: number;
  user_id: number;
  service_id: number | null;
  type: string;
  title: string;
  content: string | null;
  file_url: string | null;
  status: string;
  is_favorite: boolean;
  downloaded: boolean;
  chakra_data?: unknown;
  deleted_at: string | null;
  created_at: string;
};

export default function RecentReports({ activeTab }: { activeTab: ReportTab }) {
  const { data, loading, error } = useApi<{ data: Report[] }>(
    () => api.getReports(),
    [],
    10000,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [downloadMessage, setDownloadMessage] = useState("");

  const reports = data?.data ?? [];

  const filteredReports =
    activeTab === "All Reports"
      ? reports
      : reports.filter((report) => {
          const type = String(report.type).toLowerCase();

          switch (activeTab) {
            case "Numerology":
              return type === "numerology";

            case "Tarot Reading":
              return type === "tarot";

            case "Kundli":
              return type === "kundli" || type === "kundali";

            case "Vastu":
              return type === "vastu";

            case "Reiki Healing":
              return type === "reiki";

            default:
              return true;
          }
        });

  const pageSize = 6;
  const totalPages = Math.ceil(filteredReports.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const rows = filteredReports.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
  setCurrentPage(1);
  setSelectedReport(null);
  setDownloadMessage("");
}, [activeTab]);

  const handleDownload = (report: Report) => {
    setDownloadMessage("");

    if (!report.file_url) {
      setDownloadMessage("Download file is not available for this report.");
      return;
    }

    const link = document.createElement("a");
    link.href = report.file_url;
    link.download = report.title || "report";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedReport(null);
    setDownloadMessage("");
  };

  return (
    <>
      <section className="rounded-[16px] border border-[#f0e7d8] bg-white px-[22px] pb-[20px] pt-[20px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-[19px] font-bold leading-none text-[#4c1d95]">
            Recent Reports
          </h2>

          <Link
            href="/user-dashboard/my-reports"
            className="inline-flex items-center gap-[6px] text-[12.5px] font-medium text-[#7c3aed]"
          >
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
        ) : filteredReports.length === 0 ? (
          <p className="mt-4 text-[12.5px] text-[#8b8697]">
            No reports generated yet.
          </p>
        ) : (
          <>
            <ul className="mt-[14px] flex flex-col">
              {rows.map((r) => {
                const meta =
                  TYPE_META[String(r.type).toLowerCase()] ??
                  TYPE_META.numerology;

                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center gap-x-[16px] gap-y-3 border-b border-[#f3eee7] py-[13px] last:border-b-0"
                  >
                    <span className="relative block h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[12px]">
                      <Image
                        src={meta.image}
                        alt=""
                        fill
                        sizes="70px"
                        aria-hidden="true"
                        className="object-cover"
                      />
                    </span>

                    <div className="min-w-[150px] flex-1">
                      <p className="text-[14.5px] font-semibold leading-none text-[#2b0f47]">
                        {sanitize(r.title)}
                      </p>

                      <p className="mt-[7px] text-[12px] leading-none text-[#8b8697]">
                        {meta.subtitle}
                      </p>

                      <span
                        className={`mt-[9px] inline-flex items-center rounded-[6px] px-[9px] py-[4px] text-[10.5px] font-medium leading-none ${meta.tagClass}`}
                      >
                        {meta.tag}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11.5px] leading-none text-[#a09aab]">
                        {new Date(r.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <div className="mt-[18px] flex items-center gap-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(r);
                            setDownloadMessage("");
                          }}
                          className="inline-flex h-[34px] items-center justify-center rounded-[8px] border border-[#e2d5f4] bg-white px-[18px] text-[12.5px] font-medium text-[#6d28d9] cursor-pointer"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(r)}
                          aria-label={`Download ${r.title}`}
                          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e2d5f4] bg-white text-[#6d28d9] cursor-pointer"
                        >
                          <Download
                            className="h-[15px] w-[15px]"
                            strokeWidth={1.9}
                          />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {downloadMessage && (
              <p className="mt-[12px] text-center text-[12px] text-[#c2762a]">
                {downloadMessage}
              </p>
            )}

            {totalPages > 1 && (
              <div className="mt-[18px] flex items-center justify-center gap-[6px]">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e8dcc8] bg-white text-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-[14px] w-[14px]" />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-[8px] border px-[10px] text-[12px] font-medium ${
                      currentPage === page
                        ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                        : "border-[#e8dcc8] bg-white text-[#6d28d9]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e8dcc8] bg-white text-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="h-[14px] w-[14px]" />
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-[10px] flex justify-center">
          <Link
            href="/user-dashboard/my-reports"
            className="inline-flex h-[38px] items-center gap-[7px] rounded-full border border-[#e8dcc8] bg-white px-[20px] text-[12.5px] font-medium text-[#4c1d95] shadow-[0_1px_2px_rgba(38,17,66,.05)]"
          >
            View All Reports
            <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[700px] overflow-y-auto rounded-[16px] bg-white p-[24px] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[19px] font-semibold text-[#2b0f47]">
                  {sanitize(selectedReport.title)}
                </h3>

                <p className="mt-2 text-[12px] text-[#8b8697]">
                  {selectedReport.type} ·{" "}
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

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e8dcc8] text-[#6d28d9]"
                aria-label="Close"
              >
                <X className="h-[16px] w-[16px]" />
              </button>
            </div>

            <div className="mt-[20px] rounded-[12px] bg-[#faf8fc] p-[18px]">
              <p className="mb-[8px] text-[12px] font-semibold text-[#4c1d95]">
                Status
              </p>
              <p className="text-[13px] text-[#5f5969]">
                {selectedReport.status}
              </p>
            </div>

            {selectedReport.content ? (
              <div className="mt-[14px] rounded-[12px] border border-[#eee7f5] p-[18px]">
                <p className="mb-[8px] text-[12px] font-semibold text-[#4c1d95]">
                  Report Details
                </p>

                <div className="whitespace-pre-wrap text-[13px] leading-6 text-[#5f5969]">
                  {sanitize(selectedReport.content)}
                </div>
              </div>
            ) : (
              <div className="mt-[14px] rounded-[12px] border border-[#eee7f5] p-[18px] text-[13px] text-[#8b8697]">
                Report content is not available yet.
              </div>
            )}

            {selectedReport.file_url && (
              <button
                type="button"
                onClick={() => handleDownload(selectedReport)}
                className="mt-[16px] inline-flex h-[38px] items-center gap-[7px] rounded-[8px] bg-[#7c3aed] px-[16px] text-[12.5px] font-medium text-white"
              >
                <Download className="h-[15px] w-[15px]" />
                Download Report
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

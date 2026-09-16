"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  X,
} from "lucide-react";

import { statusStyles, type StatusKey } from "./data";
import { api, type PageMeta } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";

type RawReport = {
  id: number;
  user_id?: number | null;
  service_id?: number | null;
  type?: string;
  title?: string | null;
  content?: string | null;
  duration?: string | null;
  status?: string | null;
  file_url?: string | null;
  is_favorite?: boolean;
  downloaded?: boolean;
  chakra_data?: unknown;
  deleted_at?: string | null;
  created_at: string;
};

type ListResponse<T> = {
  data?: T[];
  meta?: PageMeta;
};

type ReadingView = {
  id: string;
  rawId: number;
  userId?: number | null;
  serviceId?: number | null;
  title: string;
  content: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  fileUrl?: string | null;
  isFavorite: boolean;
  downloaded: boolean;
};

function fmtDate(iso: string) {
  if (!iso) return { date: "", time: "" };

  const d = new Date(iso);

  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

const tabs = [
  { label: "All Readings", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const headers: { label: string; cls: string }[] = [
  { label: "Reading ID", cls: "w-[82px] text-left" },
  { label: "Reading Details", cls: "w-[180px] text-left" },
  { label: "Type", cls: "w-[125px] text-left" },
  { label: "Date & Time", cls: "w-[100px] text-left" },
  { label: "Duration", cls: "w-[75px] text-left" },
  { label: "Status", cls: "w-[80px] text-center" },
  { label: "Image File", cls: "w-[100px] text-center" },
];

function Checkbox() {
  return (
    <span className="block h-[11px] w-[11px] rounded-[3px] border border-[#CFCBDB] bg-white" />
  );
}

function normalizeStatus(status?: string | null) {
  const value = (status || "").toLowerCase().trim();

  if (
    value === "ready" ||
    value === "completed" ||
    value === "complete" ||
    value === "done"
  ) {
    return "completed";
  }

  if (value === "cancelled" || value === "canceled" || value === "cancel") {
    return "cancelled";
  }

  if (value === "upcoming" || value === "scheduled" || value === "pending") {
    return "upcoming";
  }

  return value || "upcoming";
}

function getStatusLabel(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "completed") return "Completed";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "upcoming") return "Upcoming";

  return status || "—";
}

export default function ReadingsPanel() {
  const [list, setList] = useState<ReadingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPageSize, setShowPageSize] = useState(false);

  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedReading, setSelectedReading] = useState<ReadingView | null>(
    null,
  );

  const load = useCallback(() => {
    setError("");

    api.admin
      .getReports()
      .then((data: ListResponse<RawReport> | RawReport[]) => {
        const items: RawReport[] = Array.isArray(data)
          ? data
          : (data?.data ?? []);

        const tarotRows = items.filter(
          (r) => (r.type || "").toLowerCase() === "tarot",
        );

        setList(
          tarotRows.map((r) => {
            const { date, time } = fmtDate(r.created_at);

            return {
              id: `TAROT-${r.id}`,
              rawId: r.id,
              userId: r.user_id,
              serviceId: r.service_id,
              title: r.title || "Tarot Reading",
              content: r.content || "",
              type: r.type || "tarot",
              date,
              time,
              duration: r.duration || "N/A",
              status: r.status || "upcoming",
              fileUrl: r.file_url,
              isFavorite: Boolean(r.is_favorite),
              downloaded: Boolean(r.downloaded),
            };
          }),
        );
      })
      .catch((e) => setError(e.message || "Failed to load tarot readings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { isRefreshing } = useAutoRefresh(load);
  const { start, stop } = useAutoRefreshTracking();

  useEffect(() => {
    if (isRefreshing) start();
    else stop();
  }, [isRefreshing, start, stop]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return list.filter((reading) => {
      const normalizedStatus = normalizeStatus(reading.status);

      const matchesTab = activeTab === "all" || normalizedStatus === activeTab;

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        reading.type.toLowerCase() === typeFilter.toLowerCase();

      if (!matchesTab || !matchesStatus || !matchesType) return false;

      if (!query) return true;

      return (
        reading.id.toLowerCase().includes(query) ||
        reading.title.toLowerCase().includes(query) ||
        reading.type.toLowerCase().includes(query) ||
        reading.content.toLowerCase().includes(query)
      );
    });
  }, [list, activeTab, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const safePage = Math.min(page, totalPages);

  const readingRows = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;

    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, pageSize, statusFilter, typeFilter]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  }, [totalPages]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <svg
          className="h-6 w-6 animate-spin text-[#7C3AED]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="32"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-10 text-[13px] text-[#EF4444]">
        {error}
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center overflow-x-auto pl-[8px]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 whitespace-nowrap border-b-[3px] px-[18px] pb-[12px] pt-[20px] text-[12px] leading-[18px] ${
              activeTab === tab.value
                ? "border-[#4208D1] font-semibold text-[#3A0FD1]"
                : "border-transparent font-medium text-[#2B2B55] hover:text-[#3A0FD1]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-[12px] border border-[#F0F1F5] bg-white shadow-[0_1px_2px_rgba(24,20,40,.03)]">
        <div className="relative flex flex-wrap items-center gap-[13px] overflow-visible px-[13px] pt-[24px]">
          <div className="flex h-[33px] w-[250px] shrink-0 items-center gap-[6px] rounded-[8px] border border-[#ECEEF3] bg-white pl-[13px] pr-[12px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reading title, type..."
              className="h-full w-full bg-transparent text-[10px] text-[#2E2A3B] outline-none placeholder:text-[#9B9AAC]"
            />

            <Search size={15} className="shrink-0 text-[#1E1B5C]" />
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowStatusFilter((v) => !v);
                setShowTypeFilter(false);
              }}
              className="flex h-[33px] w-[125px] items-center justify-between rounded-[8px] border border-[#ECEEF3] bg-white px-[11px] text-[10px] font-semibold text-[#14134A]"
            >
              <span>
                {statusFilter === "all"
                  ? "Status"
                  : getStatusLabel(statusFilter)}
              </span>

              <ChevronDown size={14} className="shrink-0 text-[#6D28D9]" />
            </button>

            {showStatusFilter && (
              <div className="absolute left-0 top-[38px] z-50 w-[125px] overflow-hidden rounded-[8px] border border-[#ECEEF3] bg-white shadow-lg">
                {[
                  { label: "All Status", value: "all" },
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowStatusFilter(false);
                      setPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-[10px] hover:bg-[#FAF9FC] ${
                      statusFilter === option.value
                        ? "font-semibold text-[#3D17C9]"
                        : "text-[#14134A]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowTypeFilter((v) => !v);
                setShowStatusFilter(false);
              }}
              className="flex h-[33px] w-[115px] items-center justify-between rounded-[8px] border border-[#ECEEF3] bg-white px-[11px] text-[10px] font-semibold text-[#14134A]"
            >
              <span>{typeFilter === "all" ? "Type" : "Tarot"}</span>

              <ChevronDown size={14} className="shrink-0 text-[#6D28D9]" />
            </button>

            {showTypeFilter && (
              <div className="absolute left-0 top-[38px] z-50 w-[115px] overflow-hidden rounded-[8px] border border-[#ECEEF3] bg-white shadow-lg">
                {[
                  { label: "All Types", value: "all" },
                  { label: "Tarot", value: "tarot" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTypeFilter(option.value);
                      setShowTypeFilter(false);
                      setPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-[10px] hover:bg-[#FAF9FC] ${
                      typeFilter === option.value
                        ? "font-semibold text-[#3D17C9]"
                        : "text-[#14134A]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Filter */}
          <button
            type="button"
            className="flex h-[33px] w-[162px] shrink-0 items-center justify-between whitespace-nowrap rounded-[8px] border border-[#ECEEF3] bg-white pl-[11px] pr-[9px] text-[10px] font-semibold text-[#14134A]"
          >
            <span>01 May 2025&nbsp;&nbsp;·&nbsp;&nbsp;18 May 2025</span>

            <Calendar size={14} className="shrink-0 text-[#6D28D9]" />
          </button>
        </div>

        <div className="mt-[20px] overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[45px]" />
              <col className="w-[82px]" />
              <col className="w-[180px]" />
              <col className="w-[125px]" />
              <col className="w-[100px]" />
              <col className="w-[75px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-[60px]" />
            </colgroup>

            <thead>
              <tr className="h-[45px] bg-[#FBFBFD]">
                <th className="pl-[18px] text-left align-middle">
                  <Checkbox />
                </th>

                {headers.map((h) => (
                  <th
                    key={h.label}
                    className={`whitespace-nowrap align-middle text-[10.5px] font-semibold text-[#14134A] ${h.cls}`}
                  >
                    {h.label}
                  </th>
                ))}

                <th className="pr-[20px] text-center align-middle text-[10.5px] font-semibold text-[#14134A]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {readingRows.length ? (
                readingRows.map((r) => {
                  const normalizedStatus = normalizeStatus(r.status);

                  const st = statusStyles[normalizedStatus as StatusKey] ?? {
                    label: getStatusLabel(r.status),
                    bg: "bg-[#F5F4F9]",
                    text: "text-[#6B6480]",
                  };

                  return (
                    <tr
                      key={r.id}
                      className="h-[67px] border-b border-[#F4F4F8]"
                    >
                      <td className="pl-[18px] align-middle">
                        <Checkbox />
                      </td>

                      <td className="whitespace-nowrap align-middle text-[11px] font-semibold text-[#3D17C9]">
                        {r.id}
                      </td>

                      <td className="align-middle">
                        <p className="max-w-[170px] truncate text-[11px] font-bold leading-[16px] text-[#14134A]">
                          {sanitize(r.title)}
                        </p>

                        <p className="text-[10px] leading-[15px] text-[#8B879C]">
                          Report #{r.rawId}
                        </p>
                      </td>

                      <td className="align-middle">
                        <p className="whitespace-nowrap text-[11px] font-semibold leading-[16px] text-[#14134A]">
                          Tarot Reading
                        </p>

                        <p className="whitespace-nowrap text-[10px] leading-[15px] text-[#8B879C]">
                          {r.type}
                        </p>
                      </td>

                      <td className="align-middle">
                        <p className="whitespace-nowrap text-[11px] leading-[16px] text-[#2E2A3B]">
                          {r.date}
                        </p>

                        <p className="whitespace-nowrap text-[11px] leading-[16px] text-[#2E2A3B]">
                          {r.time}
                        </p>
                      </td>

                      <td className="align-middle">
                        <p className="whitespace-nowrap text-[11px] leading-[16px] text-[#2E2A3B]">
                          {r.duration}
                        </p>
                      </td>

                      <td className="text-center align-middle">
                        <span
                          className={`inline-flex h-[17px] items-center whitespace-nowrap rounded-[6px] px-[8px] text-[9.5px] font-medium ${st.bg} ${st.text}`}
                        >
                          {getStatusLabel(r.status)}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        {r.fileUrl ? (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-[#3D17C9] hover:underline"
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#8B879C]">
                            No File
                          </span>
                        )}
                      </td>

                      <td className="pr-[20px] align-middle">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            aria-label="View"
                            onClick={() => setSelectedReading(r)}
                            className="grid h-[22px] w-[24px] place-items-center rounded-[6px] border border-[#ECEEF3] bg-white text-[#4A5085] hover:bg-[#FAF9FC]"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-[45px] text-center text-[12px] text-[#8B879C]"
                  >
                    No tarot readings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-[20px] py-[13px]">
          <p className="text-[12px] font-semibold text-[#14133F]">
            {filteredRows.length
              ? `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(
                  safePage * pageSize,
                  filteredRows.length,
                )} of ${filteredRows.length} readings`
              : "Showing 0 readings"}
          </p>

          <div className="mx-auto flex items-center gap-[6px]">
            <button
              type="button"
              aria-label="Previous"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[#4A4869] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] text-[11.5px] font-medium ${
                  safePage === pageNumber
                    ? "bg-gradient-to-b from-[#350687] to-[#2B0372] text-white"
                    : "border border-[#ECEEF3] bg-white text-[#14134A]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              aria-label="Next"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[#4A4869] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPageSize((v) => !v)}
              className="flex h-[30px] w-[101px] items-center justify-between rounded-[8px] border border-[#ECEEF3] bg-white pl-[12px] pr-[10px] text-[11.5px] font-semibold text-[#14134A]"
            >
              {pageSize} / page
              <ChevronDown size={15} className="shrink-0 text-[#6E6A85]" />
            </button>

            {showPageSize && (
              <div className="absolute bottom-[36px] right-0 z-20 w-[101px] overflow-hidden rounded-[8px] border border-[#ECEEF3] bg-white shadow-lg">
                {[10, 20, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setPage(1);
                      setShowPageSize(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-[11px] hover:bg-[#FAF9FC]"
                  >
                    {size} / page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedReading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedReading(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[720px] overflow-hidden rounded-[14px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0F1F5] px-5 py-4">
              <div>
                <p className="text-[15px] font-bold text-[#14134A]">
                  {sanitize(selectedReading.title)}
                </p>

                <p className="mt-1 text-[11px] text-[#8B879C]">
                  {selectedReading.id} · {selectedReading.date} ·{" "}
                  {selectedReading.time}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedReading(null)}
                className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] text-[#6E6A85] hover:bg-[#FAF9FC]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-5 py-5">
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[8px] bg-[#FAF9FC] p-3">
                  <p className="text-[9px] text-[#8B879C]">Type</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#14134A]">
                    {selectedReading.type}
                  </p>
                </div>

                <div className="rounded-[8px] bg-[#FAF9FC] p-3">
                  <p className="text-[9px] text-[#8B879C]">Status</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#14134A]">
                    {getStatusLabel(selectedReading.status)}
                  </p>
                </div>

                <div className="rounded-[8px] bg-[#FAF9FC] p-3">
                  <p className="text-[9px] text-[#8B879C]">Duration</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#14134A]">
                    {selectedReading.duration}
                  </p>
                </div>

                <div className="rounded-[8px] bg-[#FAF9FC] p-3">
                  <p className="text-[9px] text-[#8B879C]">Report ID</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#14134A]">
                    #{selectedReading.rawId}
                  </p>
                </div>
              </div>

              <div className="rounded-[10px] border border-[#ECEEF3] bg-white p-4">
                <p className="mb-3 text-[12px] font-bold text-[#14134A]">
                  Tarot Report
                </p>

                <div className="whitespace-pre-wrap text-[12px] leading-[1.8] text-[#4A4869]">
                  {sanitize(selectedReading.content)}
                </div>
              </div>

              {selectedReading.fileUrl && (
                <div className="mt-4">
                  <a
                    href={selectedReading.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-[#3D17C9] hover:underline"
                  >
                    Open report file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

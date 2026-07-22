"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Eye,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { reportTypeStyles, statusStyles } from "./data";
import { api } from "../../../lib/api";

const tabs = [
  { label: "All Reports", active: true },
  { label: "Today's Reports" },
  { label: "Name Corrections" },
  { label: "Name Suggestions" },
  { label: "Custom Reports" },
  { label: "Archived" },
];

const selects = ["All Services", "All Report Types", "All Status"];

function fmt(iso: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

export default function ReportsPanel() {
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.admin
      .getReports()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (data?.meta?.total) setTotal(data.meta.total);
        if (Array.isArray(items) && items.length) {
          setList(
            items.map((r: any) => {
              const { date, time } = fmt(r.created_at);
              return {
                id: `RPT-${r.id}`,
                client: { name: r.title || "Client", email: "", phone: "" },
                subject: { name: r.type || "Numerology", birth: "" },
                master: { name: "System", role: "Auto-generated" },
                type: (r.type as any) || "full",
                date,
                time,
                status: "Completed",
                amount: "-",
              };
            })
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const reportRows = list || [];

  if (loading) return <div className="flex justify-center py-10"><svg className="h-6 w-6 animate-spin text-[#7C3AED]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /></svg></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#EFEDF4] bg-white shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      {/* Tabs */}
      <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-[#EFEDF4] px-4">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`relative flex shrink-0 items-center gap-[6px] whitespace-nowrap py-[14px] text-[12px] ${
              t.active
                ? "font-semibold text-[#5B21B6]"
                : "font-medium text-[#8B879C]"
            }`}
          >
            {t.label}
            {t.active ? (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#5B21B6]" />
            ) : null}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-[10px] px-4 py-[14px]">
        <div className="flex h-[36px] w-full max-w-[204px] items-center rounded-[8px] border border-[#E7E5EF] bg-white px-3">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={14} className="shrink-0 text-[#4A3B63]" />
        </div>

        {selects.map((s) => (
          <button
            key={s}
            type="button"
            className="flex h-[36px] w-[112px] items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
          >
            {s}
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        ))}

        <button
          type="button"
          className="flex h-[36px] items-center gap-3 rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
        >
          01 May 2025 &nbsp;-&nbsp; 18 May 2025
          <Calendar size={14} className="text-[#8B879C]" />
        </button>

        <button
          type="button"
          className="flex h-[36px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
        >
          <SlidersHorizontal size={13} className="text-[#4A3B63]" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse">
          <thead>
            <tr className="border-y border-[#EFEDF4] bg-[#FBFAFD]">
              <th className="w-[38px] py-[11px] pl-4 text-left">
                <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#D6D3E0] bg-white" />
              </th>
              {[
                "Report ID",
                "Client Details",
                "Report Type",
                "Name / Birth Details",
                "Generated By",
                "Date & Time",
                "Status",
                "Amount",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap py-[11px] pr-4 text-left text-[11px] font-semibold text-[#4A4557]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {reportRows.map((r) => {
              const type = reportTypeStyles[r.type as keyof typeof reportTypeStyles] || reportTypeStyles.full;
              return (
                <tr
                  key={r.id}
                  className="border-b border-[#F2F0F7] last:border-b-0 hover:bg-[#FCFBFE]"
                >
                  <td className="py-[13px] pl-4 align-middle">
                    <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#D6D3E0] bg-white" />
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11.5px] font-semibold text-[#6D28D9]">
                    {r.id}
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#1B1630]">
                      {r.client.name}
                    </p>
                    <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {r.client.email}
                    </p>
                    <p className="whitespace-nowrap text-[10px] text-[#8B879C]">
                      {r.client.phone}
                    </p>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-[6px] border px-[8px] py-[4px] text-[10.5px] font-medium ${type.className}`}
                    >
                      {type.label}
                    </span>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <p className="whitespace-nowrap text-[11.5px] font-medium text-[#1B1630]">
                      {r.subject.name}
                    </p>
                    <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {r.subject.birth}
                    </p>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <p className="whitespace-nowrap text-[11.5px] font-medium text-[#1B1630]">
                      {r.master.name}
                    </p>
                    <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {r.master.role}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <p className="text-[11px] font-medium text-[#1B1630]">
                      {r.date}
                    </p>
                    <p className="mt-[1px] text-[10px] text-[#8B879C]">
                      {r.time}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <span
                      className={`inline-flex items-center justify-center rounded-[6px] px-[10px] py-[5px] text-[10.5px] font-semibold ${
                        statusStyles[r.status]
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11.5px] font-semibold text-[#1B1630]">
                    {r.amount}
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <div className="flex items-center gap-[6px]">
                      <button
                        type="button"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63]"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63]"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        type="button"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63]"
                      >
                        <MoreVertical size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#EFEDF4] px-4 py-[14px]">
        <p className="text-[11.5px] text-[#8B879C]">
          Showing 1 to 10 of {(total || reportRows.length).toLocaleString("en-IN")} reports
        </p>

        <div className="ml-auto flex items-center gap-[6px]">
          <button
            type="button"
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#8B879C]"
          >
            <ChevronLeft size={14} />
          </button>

          {["1", "2", "3", "4", "5"].map((p) => (
            <button
              key={p}
              type="button"
              className={`grid h-[28px] w-[28px] place-items-center rounded-[6px] border text-[11px] font-medium ${
                p === "1"
                  ? "border-[#4C1D95] bg-[#4C1D95] text-white"
                  : "border-[#E7E5EF] bg-white text-[#4A4557]"
              }`}
            >
              {p}
            </button>
          ))}

          <span className="px-[2px] text-[11px] text-[#8B879C]">...</span>

          <button
            type="button"
            className="grid h-[28px] w-[34px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[11px] font-medium text-[#4A4557]"
          >
            257
          </button>

          <button
            type="button"
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A4557]"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <button
          type="button"
          className="flex h-[30px] w-[104px] items-center justify-between rounded-[6px] border border-[#E7E5EF] bg-white px-[10px] text-[11px] font-medium text-[#4A4557]"
        >
          10 / page
          <ChevronDown size={13} className="text-[#8B879C]" />
        </button>
      </div>
    </section>
  );
}

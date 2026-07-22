"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Eye,
  Pencil,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { sessionTypeStyles, statusStyles, paymentStyles } from "./data";
import { api } from "../../../lib/api";

const tabs = [
  { label: "All Sessions", active: true },
  { label: "Upcoming" },
  { label: "Ongoing" },
  { label: "Completed" },
  { label: "Distance Healing" },
  { label: "Cancelled" },
];

const selects = ["All Reiki Masters", "All Session Types", "All Status"];

function fmtRK(iso: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

export default function SessionsPanel() {
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.admin
      .getReports()
      .then((data: any) => {
        const items = data?.data ?? data ?? [];
        if (data?.meta?.total) setTotal(data.meta.total);
        const rows = items.filter((r: any) =>
          (r.type || "").toLowerCase().includes("reiki")
        );
        const src = rows.length ? rows : items;
        if (src.length) {
          setList(
            src.map((r: any) => {
              const { date, time } = fmtRK(r.created_at);
              return {
                id: `REIKI-${r.id}`,
                client: { name: r.title || "Client", email: "", phone: "" },
                master: { name: "Reiki Master", role: "Healer" },
                type: "distance" as const,
                date,
                time,
                duration: "45 mins",
                status: "Completed" as const,
                amount: "-",
                payment: "Paid" as const,
              };
            })
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sessionRows = list || [];

  if (loading) return <div className="flex justify-center py-10"><svg className="h-6 w-6 animate-spin text-[#7C3AED]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /></svg></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;

  return (
    <section className="overflow-hidden rounded-[12px] border border-[#EFEDF4] bg-white shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-[#EFEDF4] px-4">
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
            className="flex h-[36px] w-[128px] items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
          >
            {s}
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        ))}

        <button
          type="button"
          className="flex h-[36px] items-center gap-[10px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
        >
          <SlidersHorizontal size={13} className="text-[#4A3B63]" />
          01 May 2025 &nbsp;-&nbsp; 18 May 2025
          <Calendar size={14} className="text-[#8B879C]" />
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
                "Session ID",
                "Client Details",
                "Reiki Master",
                "Session Type",
                "Date & Time",
                "Duration",
                "Status",
                "Payment",
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
            {sessionRows.map((s) => {
              const type = sessionTypeStyles[s.type];
              return (
                <tr
                  key={s.id}
                  className="border-b border-[#F2F0F7] last:border-b-0 hover:bg-[#FCFBFE]"
                >
                  <td className="py-[13px] pl-4 align-middle">
                    <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#D6D3E0] bg-white" />
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11.5px] font-semibold text-[#6D28D9]">
                    {s.id}
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#1B1630]">
                      {s.client.name}
                    </p>
                    <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {s.client.email}
                    </p>
                    <p className="whitespace-nowrap text-[10px] text-[#8B879C]">
                      {s.client.phone}
                    </p>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <div className="flex items-center gap-[8px]">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        alt={s.master.name}
                        width={28}
                        height={28}
                        className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-[11.5px] font-medium text-[#1B1630]">
                          {s.master.name}
                        </p>
                        <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                          {s.master.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-[6px] border px-[8px] py-[4px] text-[10.5px] font-medium ${type.className}`}
                    >
                      {type.label}
                    </span>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <p className="text-[11px] font-medium text-[#1B1630]">
                      {s.date}
                    </p>
                    <p className="mt-[1px] text-[10px] text-[#8B879C]">
                      {s.time}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11px] font-medium text-[#4A4557]">
                    {s.duration}
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <span
                      className={`inline-flex items-center justify-center rounded-[6px] px-[10px] py-[5px] text-[10.5px] font-semibold ${
                        statusStyles[s.status]
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <p className="text-[11.5px] font-semibold text-[#1B1630]">
                      {s.amount}
                    </p>
                    <p
                      className={`mt-[1px] text-[10px] font-medium ${
                        paymentStyles[s.payment]
                      }`}
                    >
                      {s.payment}
                    </p>
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
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63]"
                      >
                        <EllipsisVertical size={13} />
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
          Showing 1 to 8 of {(total || sessionRows.length).toLocaleString("en-IN")} sessions
        </p>

        <div className="ml-auto flex items-center gap-[6px]">
          <button
            type="button"
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#8B879C]"
          >
            <ChevronLeft size={14} />
          </button>

          {["1", "2", "3", "4"].map((p) => (
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
            156
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

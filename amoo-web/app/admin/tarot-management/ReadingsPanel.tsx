"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  Eye,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { statusStyles, type StatusKey } from "./data";
import { api } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";

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
  { label: "All Readings", active: true },
  { label: "Upcoming" },
  { label: "Completed" },
  { label: "Cancelled" },
  { label: "Popular Readings" },
  { label: "Decks" },
  { label: "Spreads" },
];

const selects = [
  { value: "All Tarot Masters", w: "w-[126px]" },
  { value: "All Spreads", w: "w-[108px]" },
  { value: "All Status", w: "w-[108px]" },
];

const headers: { label: string; cls: string }[] = [
  { label: "Reading ID", cls: "w-[72px] text-left" },
  { label: "Client Details", cls: "w-[128px] text-left" },
  { label: "Tarot Master", cls: "w-[131px] text-left" },
  { label: "Spread / Type", cls: "w-[118px] text-left" },
  { label: "Date & Time", cls: "w-[78px] text-left" },
  { label: "Duration", cls: "w-[55px] text-left" },
  { label: "Status", cls: "w-[70px] text-center" },
  { label: "Amount", cls: "w-[63px] text-left" },
];

function Checkbox() {
  return (
    <span className="block h-[11px] w-[11px] rounded-[3px] border border-[#CFCBDB] bg-white" />
  );
}

export default function ReadingsPanel() {
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
          (r.type || "").toLowerCase().includes("tarot"),
        );
        const src = rows.length ? rows : items;
        if (src.length) {
          setList(
            src.map((r: any) => {
              const { date, time } = fmtDate(r.created_at);
              return {
                id: `TAROT-${r.id}`,
                client: { name: r.title || "Client", email: "", phone: "" },
                master: {
                  name: "Tarot Master",
                  role: "Astrologer",
                  avatar: "",
                },
                spread: "Celtic Cross",
                type: r.type || "Full Reading",
                date,
                time,
                duration: "60 mins",
                status: "completed",
                amount: "-",
                payment: "Paid",
              };
            }),
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const readingRows = list || [];

  if (loading)
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
  if (error)
    return (
      <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">
        {error}
      </div>
    );

  return (
    <section>
      {/* Tabs */}
      <div className="flex items-center overflow-x-auto pl-[8px]">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`shrink-0 whitespace-nowrap border-b-[3px] px-[18px] pb-[12px] pt-[20px] text-[12px] leading-[18px] ${
              t.active
                ? "border-[#4208D1] font-semibold text-[#3A0FD1]"
                : "border-transparent font-medium text-[#2B2B55] hover:text-[#3A0FD1]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-[12px] border border-[#F0F1F5] bg-white shadow-[0_1px_2px_rgba(24,20,40,.03)]">
        {/* Filters */}
        <div className="flex flex-nowrap items-center gap-[13px] overflow-x-auto px-[13px] pt-[24px]">
          <div className="flex h-[33px] w-[198px] shrink-0 items-center gap-[6px] rounded-[8px] border border-[#ECEEF3] bg-white pl-[13px] pr-[12px]">
            <input
              type="text"
              placeholder="Search by client name, email..."
              className="h-full w-full bg-transparent text-[10px] text-[#2E2A3B] outline-none placeholder:text-[#9B9AAC]"
            />
            <Search size={15} className="shrink-0 text-[#1E1B5C]" />
          </div>

          {selects.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`flex h-[33px] ${s.w} shrink-0 items-center justify-between whitespace-nowrap rounded-[8px] border border-[#ECEEF3] bg-white pl-[11px] pr-[9px] text-[10px] font-semibold text-[#14134A]`}
            >
              {s.value}
              <ChevronDown size={14} className="shrink-0 text-[#6E6A85]" />
            </button>
          ))}

          <button
            type="button"
            className="flex h-[33px] w-[162px] shrink-0 items-center justify-between whitespace-nowrap rounded-[8px] border border-[#ECEEF3] bg-white pl-[11px] pr-[9px] text-[10px] font-semibold text-[#14134A]"
          >
            <span>01 May 2025&nbsp;&nbsp;·&nbsp;&nbsp;18 May 2025</span>
            <Calendar size={14} className="shrink-0 text-[#6D28D9]" />
          </button>

          <button
            type="button"
            className="inline-flex h-[33px] w-[66px] shrink-0 items-center justify-center gap-[6px] rounded-[8px] border border-[#ECEEF3] bg-white text-[10.5px] font-semibold text-[#14134A]"
          >
            <SlidersHorizontal size={13} className="text-[#4A4869]" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="mt-[20px] overflow-x-auto">
          <table className="w-full min-w-[858px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[45px]" />
              <col className="w-[72px]" />
              <col className="w-[128px]" />
              <col className="w-[131px]" />
              <col className="w-[118px]" />
              <col className="w-[78px]" />
              <col className="w-[55px]" />
              <col className="w-[70px]" />
              <col className="w-[63px]" />
              <col className="w-[98px]" />
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
              {readingRows.map((r) => {
                const st = statusStyles[r.status as StatusKey] ?? {
                  label: r.status ?? "—",
                  bg: "bg-[#F5F4F9]",
                  text: "text-[#6B6480]",
                };

                return (
                  <tr key={r.id} className="h-[67px] border-b border-[#F4F4F8]">
                    <td className="pl-[18px] align-middle">
                      <Checkbox />
                    </td>

                    <td className="whitespace-nowrap align-middle text-[11px] font-semibold text-[#3D17C9]">
                      {r.id}
                    </td>

                    <td className="align-middle">
                      <p className="whitespace-nowrap text-[11px] font-bold leading-[15.5px] text-[#14134A]">
                        {sanitize(r.client.name)}
                      </p>
                      <p className="whitespace-nowrap text-[10px] leading-[15.5px] text-[#8B879C]">
                        {sanitize(r.client.email)}
                      </p>
                      <p className="whitespace-nowrap text-[10px] leading-[15.5px] text-[#8B879C]">
                        {sanitize(r.client.phone)}
                      </p>
                    </td>

                    <td className="align-middle">
                      <div className="flex items-center gap-[10px]">
                        <Image
                          src={r.master.avatar}
                          alt={sanitize(r.master.name)}
                          width={26}
                          height={26}
                          className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
                        />
                        <div>
                          <p className="whitespace-nowrap text-[11px] font-bold leading-[16px] text-[#14134A]">
                            {sanitize(r.master.name)}
                          </p>
                          <p className="whitespace-nowrap text-[10px] leading-[15px] text-[#8B879C]">
                            {sanitize(r.master.role)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="align-middle">
                      <p className="whitespace-nowrap text-[11px] font-semibold leading-[16px] text-[#14134A]">
                        {r.spread}
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
                        {st.label}
                      </span>
                    </td>

                    <td className="align-middle">
                      <p className="whitespace-nowrap text-[11px] font-bold leading-[16px] text-[#14134A]">
                        {r.amount}
                      </p>
                      <p
                        className={`whitespace-nowrap text-[10px] font-medium leading-[15px] ${
                          r.payment === "Paid"
                            ? "text-[#16A34A]"
                            : "text-[#F28C1E]"
                        }`}
                      >
                        {r.payment}
                      </p>
                    </td>

                    <td className="pr-[20px] align-middle">
                      <div className="flex items-center justify-center gap-[3px]">
                        <button
                          type="button"
                          aria-label="View"
                          className="grid h-[22px] w-[24px] place-items-center rounded-[6px] border border-[#ECEEF3] bg-white text-[#4A5085] hover:bg-[#FAF9FC]"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit"
                          className="grid h-[22px] w-[24px] place-items-center rounded-[6px] border border-[#ECEEF3] bg-white text-[#4A5085] hover:bg-[#FAF9FC]"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          aria-label="More"
                          className="grid h-[22px] w-[24px] place-items-center rounded-[6px] border border-[#ECEEF3] bg-white text-[#4A5085] hover:bg-[#FAF9FC]"
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
        <div className="flex flex-wrap items-center gap-4 px-[20px] py-[13px]">
          <p className="text-[12px] font-semibold text-[#14133F]">
            Showing 1 to 8 of{" "}
            {(total || readingRows.length).toLocaleString("en-IN")} readings
          </p>

          <div className="mx-auto flex items-center gap-[6px]">
            <button
              type="button"
              aria-label="Previous"
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[#4A4869]"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] bg-gradient-to-b from-[#350687] to-[#2B0372] text-[11.5px] font-semibold text-white"
            >
              1
            </button>

            {["2", "3", "4", "5"].map((p) => (
              <button
                key={p}
                type="button"
                className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[11.5px] font-medium text-[#14134A]"
              >
                {p}
              </button>
            ))}

            <span className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[11.5px] text-[#8B879C]">
              ...
            </span>

            <button
              type="button"
              className="grid h-[30px] w-[38px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[11.5px] font-medium text-[#14134A]"
            >
              406
            </button>

            <button
              type="button"
              aria-label="Next"
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#ECEEF3] bg-white text-[#4A4869]"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            type="button"
            className="flex h-[30px] w-[101px] items-center justify-between rounded-[8px] border border-[#ECEEF3] bg-white pl-[12px] pr-[10px] text-[11.5px] font-semibold text-[#14134A]"
          >
            10 / page
            <ChevronDown size={15} className="shrink-0 text-[#6E6A85]" />
          </button>
        </div>
      </div>
    </section>
  );
}

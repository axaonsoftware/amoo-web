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
  MoreVertical,
  Grid2x2,
  Layers,
  Hash,
  Compass,
  Heart,
  Briefcase,
  SpellCheck,
} from "lucide-react";
import {
  statusStyles,
  typeStyles,
  type TypeKey,
} from "./data";
import { api } from "../../../lib/api";

const tabs = [
  { label: "All Consultations", active: true },
  { label: "Upcoming" },
  { label: "Pending Requests", badge: "12" },
  { label: "Completed" },
  { label: "Cancelled / Refunds" },
];

const selects = [
  { label: "Expert", value: "All Experts", w: "w-[128px]" },
  { label: "Consultation Type", value: "All Types", w: "w-[128px]" },
  { label: "Status", value: "All Status", w: "w-[122px]" },
];

const typeIcons: Record<TypeKey, React.ComponentType<{ size?: number }>> = {
  "kundli-reading": Grid2x2,
  "tarot-reading": Layers,
  numerology: Hash,
  vastu: Compass,
  "kundli-matching": Heart,
  "career-guidance": Briefcase,
  "name-correction": SpellCheck,
};

const serviceToType: Record<string, TypeKey> = {
  "Kundli Reading": "kundli-reading",
  "Tarot Reading": "tarot-reading",
  Numerology: "numerology",
  "Vastu Consultation": "vastu",
  "Kundli Matching": "kundli-matching",
  "Career Guidance": "career-guidance",
  "Name Correction": "name-correction",
};

export default function ConsultationsPanel() {
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.admin
      .getBookings()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (data?.meta?.total) setTotal(data.meta.total);
        if (Array.isArray(items) && items.length) {
          setList(
            items.map((b: any) => {
              const type = serviceToType[b.service_name] || "numerology";
              return {
                id: b.booking_ref,
                user: b.user_name,
                phone: "",
                expert: b.expert_name || "Unassigned",
                expertRole: "",
                type,
                date: b.date,
                time: b.time,
                amount: `₹ ${Number(b.amount).toLocaleString("en-IN")}`,
                status:
                  b.status === "upcoming"
                    ? "upcoming"
                    : b.status === "completed"
                    ? "completed"
                    : b.status === "cancelled"
                    ? "cancelled"
                    : "upcoming",
              };
            })
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = list || [];

  if (loading) return <div className="flex justify-center py-10"><svg className="h-6 w-6 animate-spin text-[#6D28D9]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /></svg></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;

  return (
    <section className="rounded-[14px] border border-[#EDECF3] bg-white shadow-[0_1px_2px_rgba(24,20,40,.04)]">
      {/* Tabs */}
      <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-[#EFEEF4] px-5">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`flex shrink-0 items-center gap-[6px] whitespace-nowrap border-b-2 py-[14px] text-[12.5px] ${
              t.active
                ? "border-[#6D28D9] font-semibold text-[#6D28D9]"
                : "border-transparent font-normal text-[#7C7890] hover:text-[#2E2A3B]"
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="grid h-[16px] min-w-[16px] place-items-center rounded-full bg-[#F59E0B] px-[5px] text-[9px] font-bold text-white">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-[18px]">
        <div className="flex h-[38px] w-full items-center rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] sm:w-[230px]">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="h-full w-full bg-transparent text-[11.5px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={15} className="shrink-0 text-[#8B879C]" />
        </div>

        {selects.map((s) => (
          <div key={s.label} className={`relative ${s.w}`}>
            <span className="absolute -top-[7px] left-[9px] bg-white px-[4px] text-[9.5px] text-[#9C98AC]">
              {s.label}
            </span>
            <button
              type="button"
              className="flex h-[38px] w-full items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] text-[11.5px] text-[#2E2A3B]"
            >
              {s.value}
              <ChevronDown size={15} className="shrink-0 text-[#8B879C]" />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="inline-flex h-[38px] items-center gap-[7px] rounded-[8px] border border-[#E7E5EF] bg-white px-[14px] text-[11.5px] font-medium text-[#4A4658]"
        >
          <SlidersHorizontal size={14} className="text-[#6E6A80]" />
          Filters
        </button>

        <button
          type="button"
          className="ml-auto inline-flex h-[38px] items-center gap-[10px] rounded-[8px] border border-[#E7E5EF] bg-white pl-[14px] pr-[12px] text-[11.5px] text-[#2E2A3B]"
        >
          01 May 2025&nbsp;&nbsp;-&nbsp;&nbsp;18 May 2025
          <Calendar size={15} className="shrink-0 text-[#8B879C]" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
              <th className="w-[46px] py-[11px] pl-5">
                <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#CFCBDB] bg-white" />
              </th>
              {[
                "Consultation ID",
                "User Details",
                "Expert",
                "Type",
                "Date & Time",
                "Amount",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap py-[11px] pr-4 text-[11.5px] font-medium text-[#6E6A80]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((c) => {
              const t = typeStyles[c.type];
              const s = statusStyles[c.status];
              const TypeIcon = typeIcons[c.type];

              return (
                <tr key={c.id} className="border-b border-[#F3F2F7]">
                  <td className="py-[13px] pl-5 align-middle">
                    <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#CFCBDB] bg-white" />
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 text-[11.5px] font-medium text-[#6D28D9]">
                    {c.id}
                  </td>

                  <td className="py-[13px] pr-4">
                    <div className="flex items-center gap-[10px]">
                      <Image
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
                        alt={c.user}
                        width={30}
                        height={30}
                        className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
                      />
                      <div className="leading-tight">
                        <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#221C33]">
                          {c.user}
                        </p>
                        <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                          {c.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-[13px] pr-4">
                    <div className="flex items-center gap-[10px]">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        alt={c.expert}
                        width={28}
                        height={28}
                        className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
                      />
                      <div className="leading-tight">
                        <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#221C33]">
                          {c.expert}
                        </p>
                        <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                          {c.expertRole}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-[13px] pr-4">
                    <span
                      className={`inline-flex h-[26px] items-center gap-[5px] whitespace-nowrap rounded-[7px] px-[9px] text-[10.5px] font-medium ${t.bg} ${t.text}`}
                    >
                      <TypeIcon size={12} />
                      {t.label}
                    </span>
                  </td>

                  <td className="py-[13px] pr-4 leading-tight">
                    <p className="whitespace-nowrap text-[11.5px] text-[#2E2A3B]">
                      {c.date}
                    </p>
                    <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {c.time}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 text-[11.5px] font-semibold text-[#221C33]">
                    {c.amount}
                  </td>

                  <td className="py-[13px] pr-4">
                    <span
                      className={`inline-flex h-[24px] items-center whitespace-nowrap rounded-[7px] px-[10px] text-[10.5px] font-medium ${s.bg} ${s.text}`}
                    >
                      {s.label}
                    </span>
                  </td>

                  <td className="py-[13px] pr-5">
                    <div className="flex items-center gap-[8px]">
                      <button
                        type="button"
                        aria-label="View"
                        className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#6E6A80] hover:bg-[#FAF9FC]"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="More"
                        className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#6E6A80] hover:bg-[#FAF9FC]"
                      >
                        <MoreVertical size={15} />
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
      <div className="flex flex-wrap items-center gap-4 px-5 py-[16px]">
        <p className="text-[11.5px] text-[#8B879C]">
          Showing 1 to 8 of {(total || rows.length).toLocaleString("en-IN")} consultations
        </p>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-[6px]">
          <button
            type="button"
            aria-label="Previous"
            className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C]"
          >
            <ChevronLeft size={15} />
          </button>

          <button
            type="button"
            className="grid h-[30px] w-[30px] place-items-center rounded-[8px] bg-[#5B2497] text-[11.5px] font-semibold text-white"
          >
            1
          </button>

          {["2", "3", "4"].map((p) => (
            <button
              key={p}
              type="button"
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[11.5px] text-[#4A4658]"
            >
              {p}
            </button>
          ))}

          <span className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[11.5px] text-[#8B879C]">
            ...
          </span>

          <button
            type="button"
            className="grid h-[30px] w-[38px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[11.5px] text-[#4A4658]"
          >
            161
          </button>

          <button
            type="button"
            aria-label="Next"
            className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C]"
          >
            <ChevronRight size={15} />
          </button>

          <button
            type="button"
            className="ml-2 flex h-[32px] w-[104px] items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] text-[11.5px] text-[#4A4658]"
          >
            10 / page
            <ChevronDown size={15} className="shrink-0 text-[#8B879C]" />
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Eye,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { roleStyles, statusStyles } from "./data";
import { api } from "../../../lib/api";

const tabs = [
  { label: "All Users", active: true },
  { label: "Active Users" },
  { label: "New Users" },
  { label: "Blocked Users" },
  { label: "Verified Users" },
];

const selects = [
  { caption: "Role", value: "All Roles", w: "w-[124px]" },
  { caption: "Status", value: "All Status", w: "w-[124px]" },
  { caption: "Verification", value: "All", w: "w-[124px]" },
];

function fmtDate(iso: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

export default function UsersPanel() {
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.admin
      .getUsers()
      .then((data: any) => {
        const items = data?.data ?? data;
        if (data?.meta?.total) setTotal(data.meta.total);
        if (Array.isArray(items) && items.length) {
          setList(
            items.map((u: any) => {
              const { date, time } = fmtDate(u.created_at);
              return {
                id: u.id,
                name: u.name,
                avatar: u.avatar || "",
                verified: !!u.verified,
                email: u.email,
                phone: u.phone,
                role: u.role,
                status: u.status,
                date,
                time,
              };
            })
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const userRows = list || [];

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" /></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;

  return (
    <section className="rounded-[14px] border border-[#EDECF3] bg-white shadow-[0_1px_2px_rgba(24,20,40,.04)]">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-[#EFEEF4] px-5">
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
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-[10px] px-5 py-[14px]">
        <div className="flex h-[38px] w-[240px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px]">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={15} className="shrink-0 text-[#8B879C]" />
        </div>

        {selects.map((s) => (
          <div key={s.caption}>
            <span className="mb-[4px] block text-[10px] text-[#8B879C]">
              {s.caption}
            </span>
            <button
              type="button"
              className={`flex h-[38px] ${s.w} items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]`}
            >
              {s.value}
              <ChevronDown size={14} className="shrink-0 text-[#8B879C]" />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="inline-flex h-[38px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-[12px] text-[11px] font-medium text-[#4A4658]"
        >
          <SlidersHorizontal size={14} className="text-[#6E6A80]" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
              <th className="w-[40px] py-[11px] pl-5">
                <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#CFCBDB] bg-white" />
              </th>
              {[
                "User",
                "Email / Phone",
                "Role",
                "Status",
                "Joined On",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {userRows.map((u) => {
              const role = roleStyles[u.role];
              const st = statusStyles[u.status];

              return (
                <tr
                  key={u.id}
                  className={`border-b border-[#F3F2F7] ${
                    u.selected ? "bg-[#F7F2FE]" : ""
                  }`}
                >
                  <td className="py-[11px] pl-5 align-middle">
                    {u.selected ? (
                      <span className="grid h-[14px] w-[14px] place-items-center rounded-[4px] bg-[#6D28D9]">
                        <Check
                          size={10}
                          strokeWidth={3}
                          className="text-white"
                        />
                      </span>
                    ) : (
                      <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#CFCBDB] bg-white" />
                    )}
                  </td>

                  <td className="py-[11px] pr-3">
                    <div className="flex items-center gap-[8px]">
                      {u.avatar ? (
                        <Image
                          src={u.avatar}
                          alt={u.name}
                          width={30}
                          height={30}
                          className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[11px] font-bold text-white">
                          {u.name?.slice(0, 2)?.toUpperCase() || "U"}
                        </span>
                      )}
                      <div className="leading-tight">
                        <div className="flex items-center gap-[6px]">
                          <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#221C33]">
                            {u.name}
                          </p>
                          {u.verified ? (
                            <span className="inline-flex h-[17px] items-center rounded-[5px] bg-[#EDE7FB] px-[6px] text-[9px] font-medium text-[#6D28D9]">
                              Verified
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                          ID: {u.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-[11px] pr-3 leading-tight">
                    <p className="whitespace-nowrap text-[11.5px] text-[#2E2A3B]">
                      {u.email}
                    </p>
                    <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {u.phone}
                    </p>
                  </td>

                  <td className="py-[11px] pr-3">
                    <span
                      className={`inline-flex h-[24px] items-center whitespace-nowrap rounded-[7px] px-[10px] text-[10.5px] font-medium ${role.bg} ${role.text}`}
                    >
                      {role.label}
                    </span>
                  </td>

                  <td className="py-[11px] pr-3">
                    <span
                      className={`inline-flex h-[24px] items-center whitespace-nowrap rounded-[7px] px-[10px] text-[10.5px] font-medium ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                  </td>

                  <td className="py-[11px] pr-3 leading-tight">
                    <p className="whitespace-nowrap text-[11.5px] text-[#2E2A3B]">
                      {u.date}
                    </p>
                    <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {u.time}
                    </p>
                  </td>

                  <td className="py-[11px] pr-5">
                    <div className="flex items-center gap-[6px]">
                      <button
                        type="button"
                        aria-label="View"
                        className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#6E6A80] hover:bg-[#FAF9FC]"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="More"
                        className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#6E6A80] hover:bg-[#FAF9FC]"
                      >
                        <MoreVertical size={14} />
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
          Showing 1 to {userRows.length} of {(total || userRows.length).toLocaleString("en-IN")} users
        </p>

        <div className="ml-auto flex items-center gap-[6px]">
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

          {["2", "3", "4", "5"].map((p) => (
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
            className="grid h-[30px] w-[46px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[11.5px] text-[#4A4658]"
          >
            1574
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

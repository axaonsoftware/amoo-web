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
  Loader2,
} from "lucide-react";
import {
  serviceStyles,
  statusStyles,
  type ServiceKey,
} from "./data";
import { api } from "../../../lib/api";

const tabs = [
  { label: "All Bookings", active: true },
  { label: "Upcoming" },
  { label: "Today" },
  { label: "Pending Approval", badge: "7" },
  { label: "Completed" },
  { label: "Cancelled / Refunds" },
];

const selects = [
  { value: "All Experts", w: "w-[116px]" },
  { value: "All Services", w: "w-[120px]" },
  { value: "All Status", w: "w-[110px]" },
];

const serviceIcons: Record<ServiceKey, React.ComponentType<{ size?: number }>> =
  {
    "kundli-reading": Grid2x2,
    "tarot-reading": Layers,
    numerology: Hash,
    "vastu-consultation": Compass,
    "kundli-matching": Heart,
    "career-guidance": Briefcase,
    "name-correction": SpellCheck,
  };

function mapStatusToKey(status: string): ServiceKey {
  const map: Record<string, ServiceKey> = {
    "kundli-reading": "kundli-reading",
    "tarot-reading": "tarot-reading",
    numerology: "numerology",
    "vastu-consultation": "vastu-consultation",
    "kundli-matching": "kundli-matching",
    "career-guidance": "career-guidance",
    "name-correction": "name-correction",
  };
  return map[status] || "numerology";
}

export default function BookingsPanel() {
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
            items.map((b: any) => ({
              id: b.booking_ref,
              user: { name: b.user_name, email: "", phone: "" },
              expert: { name: b.expert_name || "Unassigned", role: b.expert_role || "", avatar: b.expert_avatar || "" },
              service: mapStatusToKey(b.service_name),
              date: b.date,
              time: b.time,
              amount: `₹ ${Number(b.amount).toLocaleString("en-IN")}`,
              payment: b.payment,
              status: b.status,
            }))
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const bookingRows = list || [];

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" /></div>;
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
      <div className="flex flex-wrap items-center gap-[10px] px-5 py-[18px]">
        <div className="flex h-[38px] w-full items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] sm:w-[240px]">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={15} className="shrink-0 text-[#8B879C]" />
        </div>

        {selects.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`flex h-[38px] ${s.w} items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]`}
          >
            {s.value}
            <ChevronDown size={14} className="shrink-0 text-[#8B879C]" />
          </button>
        ))}

        <button
          type="button"
          className="inline-flex h-[38px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-[12px] text-[11px] font-medium text-[#4A4658]"
        >
          <SlidersHorizontal size={14} className="text-[#6E6A80]" />
          Filters
        </button>

        <button
          type="button"
          className="ml-auto inline-flex h-[38px] items-center gap-[8px] whitespace-nowrap rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] text-[11px] text-[#2E2A3B]"
        >
          01 May 2025&nbsp;&nbsp;-&nbsp;&nbsp;18 May 2025
          <Calendar size={14} className="shrink-0 text-[#8B879C]" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[930px] border-collapse">
          <thead>
            <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
              <th className="w-[40px] py-[11px] pl-5">
                <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#CFCBDB] bg-white" />
              </th>
              {[
                "Booking ID",
                "User Details",
                "Expert",
                "Service",
                "Date & Time",
                "Payment",
                "Status",
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
            {bookingRows.map((b) => {
              const svc = serviceStyles[b.service];
              const st = statusStyles[b.status];
              const ServiceIcon = serviceIcons[b.service];

              return (
                <tr key={b.id} className="border-b border-[#F3F2F7]">
                  <td className="py-[13px] pl-5 align-middle">
                    <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#CFCBDB] bg-white" />
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-3 text-[11.5px] font-medium text-[#6D28D9]">
                    {b.id}
                  </td>

                  <td className="py-[13px] pr-3">
                    <div className="leading-tight">
                      <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#221C33]">
                        {b.user.name}
                      </p>
                      <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                        {b.user.email}
                      </p>
                      <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                        {b.user.phone}
                      </p>
                    </div>
                  </td>

                  <td className="py-[13px] pr-3">
                    <div className="flex items-center gap-[8px]">
                      {b.expert.avatar ? (
                        <Image
                          src={b.expert.avatar}
                          alt={b.expert.name}
                          width={28}
                          height={28}
                          className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[10px] font-bold text-white">
                          {b.expert.name?.slice(0, 2)?.toUpperCase() || "E"}
                        </span>
                      )}
                      <div className="leading-tight">
                        <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#221C33]">
                          {b.expert.name}
                        </p>
                        <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                          {b.expert.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-[13px] pr-3">
                    <span
                      className={`inline-flex h-[26px] items-center gap-[5px] whitespace-nowrap rounded-[7px] px-[9px] text-[10.5px] font-medium ${svc.bg} ${svc.text}`}
                    >
                      <ServiceIcon size={12} />
                      {svc.label}
                    </span>
                  </td>

                  <td className="py-[13px] pr-3 leading-tight">
                    <p className="whitespace-nowrap text-[11.5px] text-[#2E2A3B]">
                      {b.date}
                    </p>
                    <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {b.time}
                    </p>
                  </td>

                  <td className="py-[13px] pr-3 leading-tight">
                    <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#221C33]">
                      {b.amount}
                    </p>
                    <p
                      className={`mt-[2px] whitespace-nowrap text-[10px] font-medium ${
                        b.payment === "Paid"
                          ? "text-[#16A34A]"
                          : "text-[#EA580C]"
                      }`}
                    >
                      {b.payment}
                    </p>
                  </td>

                  <td className="py-[13px] pr-3">
                    <span
                      className={`inline-flex h-[24px] items-center whitespace-nowrap rounded-[7px] px-[10px] text-[10.5px] font-medium ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                  </td>

                  <td className="py-[13px] pr-5">
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
          Showing 1 to {bookingRows.length} of {(total || bookingRows.length).toLocaleString("en-IN")} bookings
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-[6px]">
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
            268
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

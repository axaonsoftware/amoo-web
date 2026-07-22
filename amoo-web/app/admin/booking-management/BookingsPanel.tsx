"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  XCircle,
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
import ConfirmDialog from "../shared/ConfirmDialog";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Today", value: "today" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
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

function buildQuery(params: {
  page: number;
  limit: number;
  search: string;
  status: string;
}) {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("pageSize", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  return q.toString();
}

export default function BookingsPanel() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "complete" | "cancel"; booking: any }>({ open: false, type: "complete", booking: null });
  const [confirmSaving, setConfirmSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" } | null>(null);

  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const reload = () => {
    setLoading(true);
    setError("");
    const query = buildQuery({ page, limit, search: debouncedSearch, status });
    api.admin.getBookings(`?${query}`).then((res: any) => {
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const m = res?.meta ?? {};
      setMeta({ total: m.total ?? items.length, totalPages: m.totalPages ?? 1 });
      setList(items.map((b: any) => ({
        id: b.booking_ref, user: { name: b.user_name, email: "", phone: "" },
        expert: { name: b.expert_name || "Unassigned", role: b.expert_role || "", avatar: b.expert_avatar || "" },
        service: mapStatusToKey(b.service_name), date: b.date, time: b.time,
        amount: `₹ ${Number(b.amount).toLocaleString("en-IN")}`, payment: b.payment, status: b.status,
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = buildQuery({ page, limit, search: debouncedSearch, status });

    api.admin
      .getBookings(`?${query}`)
      .then((res: any) => {
        if (cancelled) return;
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const m = res?.meta ?? {};
        setMeta({
          total: m.total ?? items.length,
          totalPages: m.totalPages ?? 1,
        });
        setList(
          items.map((b: any) => ({
            id: b.booking_ref,
            user: { name: b.user_name, email: "", phone: "" },
            expert: {
              name: b.expert_name || "Unassigned",
              role: b.expert_role || "",
              avatar: b.expert_avatar || "",
            },
            service: mapStatusToKey(b.service_name),
            date: b.date,
            time: b.time,
            amount: `₹ ${Number(b.amount).toLocaleString("en-IN")}`,
            payment: b.payment,
            status: b.status,
          }))
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, debouncedSearch, status]);

  const totalPages = meta.totalPages || 1;
  const from = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, meta.total);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    if (pages[pages.length - 1] !== totalPages) pages.push(totalPages);
    return pages;
  };

  return (
    <>
    <section className="rounded-[14px] border border-[#EDECF3] bg-white shadow-[0_1px_2px_rgba(24,20,40,.04)]">
      {/* Tabs */}
      <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-[#EFEEF4] px-5">
        {[
          { label: "All Bookings", active: true },
          { label: "Upcoming" },
          { label: "Today" },
          { label: "Pending Approval", badge: "7" },
          { label: "Completed" },
          { label: "Cancelled / Refunds" },
        ].map((t) => (
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
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={15} className="shrink-0 text-[#8B879C]" />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-[38px] w-[110px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 text-[#8B879C]"
          />
        </div>

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
            {loading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#6D28D9]" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[13px] text-[#EF4444]">
                  {error}
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[13px] text-[#8B879C]">
                  No bookings found.
                </td>
              </tr>
            ) : (
              list.map((b) => {
                const svc = serviceStyles[b.service as ServiceKey];
                const st = statusStyles[b.status as keyof typeof statusStyles];
                const ServiceIcon = serviceIcons[b.service as ServiceKey];

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
                        {b.status !== "completed" && b.status !== "cancelled" && (
                          <button type="button" aria-label="Complete" onClick={() => setConfirmDialog({ open: true, type: "complete", booking: b })} title="Mark Complete" className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#16A34A] hover:bg-[#E6F7EE]">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {b.status !== "completed" && b.status !== "cancelled" && (
                          <button type="button" aria-label="Cancel" onClick={() => setConfirmDialog({ open: true, type: "cancel", booking: b })} title="Cancel Booking" className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#EF4444] hover:bg-[#FEE2E2]">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-[16px]">
        <p className="text-[11.5px] text-[#8B879C]">
          Showing {from.toLocaleString("en-IN")} to {to.toLocaleString("en-IN")} of{" "}
          {meta.total.toLocaleString("en-IN")} bookings
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-[6px]">
          <button
            type="button"
            aria-label="Previous"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
              page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FAF9FC]"
            }`}
          >
            <ChevronLeft size={15} />
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[11.5px] text-[#8B879C]"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] text-[11.5px] font-semibold ${
                  p === page
                    ? "bg-[#5B2497] text-white"
                    : "border border-[#E7E5EF] bg-white text-[#4A4658]"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Next"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
              page >= totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#FAF9FC]"
            }`}
          >
            <ChevronRight size={15} />
          </button>

          <div className="relative ml-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="flex h-[32px] w-[104px] appearance-none items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] text-[11.5px] text-[#4A4658]"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#8B879C]"
            />
          </div>
        </div>
      </div>
    </section>

    <ConfirmDialog
      open={confirmDialog.open}
      title={confirmDialog.type === "complete" ? "Complete Booking" : "Cancel Booking"}
      message={confirmDialog.type === "complete" ? `Mark booking ${confirmDialog.booking?.id} as completed?` : `Are you sure you want to cancel booking ${confirmDialog.booking?.id}? This action cannot be undone.`}
      onConfirm={async () => {
        setConfirmSaving(true);
        try {
          if (confirmDialog.type === "complete") {
            await api.admin.completeBooking(confirmDialog.booking.id);
            showToast("Booking marked as completed");
          } else {
            await api.admin.cancelBooking(confirmDialog.booking.id);
            showToast("Booking cancelled");
          }
          setConfirmDialog({ open: false, type: "complete", booking: null });
          reload();
        } catch (e: any) {
          showToast(e.message || "Action failed", "error");
        } finally {
          setConfirmSaving(false);
        }
      }}
      onCancel={() => setConfirmDialog({ open: false, type: "complete", booking: null })}
      saving={confirmSaving}
    />

    {toast && (
      <div className={`fixed right-4 top-4 z-[999] rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-lg ${toast.kind === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"}`}>
        {toast.msg}
      </div>
    )}
    </>
  );
}

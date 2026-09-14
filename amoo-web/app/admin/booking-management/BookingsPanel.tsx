"use client";

import Image from "next/image";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Grid2x2,
  Layers,
  Hash,
  Compass,
  Heart,
  Briefcase,
  SpellCheck,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { serviceStyles, statusStyles, type ServiceKey } from "./data";
import { api, type PageMeta } from "../../../lib/api";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";
import ConfirmDialog from "../shared/ConfirmDialog";
import { sanitize } from "../../../lib/sanitize";
import { errorMessage } from "../../../lib/errors";
import type { Booking } from "../../../lib/types";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Today", value: "today" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const serviceIcons: Record<
  ServiceKey,
  React.ComponentType<{ size?: number }>
> = {
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
  expert_id?: string;
  service_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("pageSize", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.expert_id) q.set("expert_id", params.expert_id);
  if (params.service_id) q.set("service_id", params.service_id);
  if (params.date_from) q.set("date_from", params.date_from);
  if (params.date_to) q.set("date_to", params.date_to);
  return q.toString();
}

type ListResponse<T> = { data?: T[]; meta?: PageMeta };

interface AdminBooking extends Booking {
  expert_role?: string | null;
  expert_avatar?: string | null;
}

interface BookingRow {
  id: string;
  bookingDbId: number;
  user: { name: string; email: string; phone: string };
  expert: { name: string; role: string; avatar: string };
  service: ServiceKey;
  date: string;
  time: string;
  amount: string;
  payment: Booking["payment"];
  status: Booking["status"];
}

interface BookingsPanelProps {
  openBookingRef: RefObject<(() => void) | null>;
}

function DetailRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] font-medium text-[#8B879C]">{label}</span>
      <span
        className={`text-[12px] font-medium text-[#221C33] ${valueClass ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function BookingsPanel({ openBookingRef }: BookingsPanelProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [expertFilter, setExpertFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [experts, setExperts] = useState<{ id: number; name: string }[]>([]);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [detailBooking, setDetailBooking] = useState<BookingRow | null>(null);

  const [list, setList] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "complete" | "cancel" | "upcoming";
    booking: BookingRow | null;
  }>({ open: false, type: "complete", booking: null });
  const [confirmSaving, setConfirmSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    kind: "success" | "error";
  } | null>(null);

  const [manualModal, setManualModal] = useState(false);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [manualSaving, setManualSaving] = useState(false);
  const [manualExperts, setManualExperts] = useState<
    { id: number; name: string }[]
  >([]);
  const [manualServices, setManualServices] = useState<
    { id: number; name: string; price: number }[]
  >([]);

  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const openManualCreate = () => {
    setManualValues({
      date: "",
      time: "",
      user_id: "",
      service_id: "",
      expert_id: "",
      payment_status: "Pending",
      notes: "",
      amount: "",
    });
    setManualModal(true);
    api.admin
      .getExperts()
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setManualExperts(list.map((e: any) => ({ id: e.id, name: e.name })));
      })
      .catch(() => {});
    api.admin
      .getServices()
      .then((res: any) => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        setManualServices(
          list.map((s: any) => ({
            id: s.id,
            name: s.name,
            price: Number(s.price),
          })),
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    openBookingRef.current = openManualCreate;

    return () => {
      openBookingRef.current = null;
    };
  }, [openBookingRef]);

  const handleManualCreate = async () => {
    setManualSaving(true);
    try {
      await api.admin.createManualBooking({
        user_id: Number(manualValues.user_id),
        service_id: Number(manualValues.service_id),
        expert_id: manualValues.expert_id
          ? Number(manualValues.expert_id)
          : undefined,
        date: manualValues.date,
        time: manualValues.time,
        payment_status: manualValues.payment_status,
        amount: manualValues.amount ? Number(manualValues.amount) : undefined,
        notes: manualValues.notes || undefined,
      });
      setManualModal(false);
      showToast("Booking created successfully");
      reload();
    } catch (e: unknown) {
      showToast(errorMessage(e, "Failed to create booking"), "error");
    } finally {
      setManualSaving(false);
    }
  };

  const reload = () => {
    setLoading(true);
    setError("");
    const query = buildQuery({
      page,
      limit,
      search: debouncedSearch,
      status,
      expert_id: expertFilter,
      service_id: serviceFilter,
      date_from: dateFrom,
      date_to: dateTo,
    });
    api.admin
      .getBookings(`?${query}`)
      .then((res: ListResponse<AdminBooking>) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        const m = res?.meta;
        setMeta({
          total: m?.total ?? items.length,
          totalPages: m?.totalPages ?? 1,
        });
        setList(
          items
            .filter((b: AdminBooking) => !status || b.status === status)
            .map((b: AdminBooking) => ({
              id: b.booking_ref,
              bookingDbId: b.id,
              user: { name: b.user_name ?? "", email: "", phone: "" },
              expert: {
                name: b.expert_name || "Unassigned",
                role: b.expert_role || "",
                avatar: b.expert_avatar || "",
              },
              service: mapStatusToKey(b.service_name ?? ""),
              date: b.date,
              time: b.time,
              amount: `₹ ${Number(b.amount).toLocaleString("en-IN")}`,
              payment: b.payment,
              status: b.status,
            })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const { isRefreshing } = useAutoRefresh(reload);
  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start();
    else stop();
  }, [isRefreshing, start, stop]);

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
    api.admin
      .getExperts()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : [];
        setExperts(list.map((e: any) => ({ id: e.id, name: e.name })));
      })
      .catch(() => {});
    api.admin
      .getServices()
      .then((res: any) => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        setServices(list.map((s: any) => ({ id: s.id, name: s.name })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = buildQuery({
      page,
      limit,
      search: debouncedSearch,
      status,
      expert_id: expertFilter,
      service_id: serviceFilter,
      date_from: dateFrom,
      date_to: dateTo,
    });

    api.admin
      .getBookings(`?${query}`)
      .then((res: ListResponse<AdminBooking>) => {
        if (cancelled) return;
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        const m = res?.meta;
        setMeta({
          total: m?.total ?? items.length,
          totalPages: m?.totalPages ?? 1,
        });
        setList(
          items
            .filter((b: AdminBooking) => !status || b.status === status)
            .map((b: AdminBooking) => ({
              id: b.booking_ref,
              bookingDbId: b.id,
              user: { name: b.user_name ?? "", email: "", phone: "" },
              expert: {
                name: b.expert_name || "Unassigned",
                role: b.expert_role || "",
                avatar: b.expert_avatar || "",
              },
              service: mapStatusToKey(b.service_name ?? ""),
              date: b.date,
              time: b.time,
              amount: `₹ ${Number(b.amount).toLocaleString("en-IN")}`,
              payment: b.payment,
              status: b.status,
            })),
        );
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    page,
    limit,
    debouncedSearch,
    status,
    expertFilter,
    serviceFilter,
    dateFrom,
    dateTo,
  ]);

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
            { label: "All Bookings", value: "" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Today", value: "today" },
            { label: "Pending Approval", value: "pending", badge: "7" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled / Refunds", value: "cancelled" },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setStatus(t.value);
                setPage(1);
              }}
              className={`flex shrink-0 items-center gap-[6px] whitespace-nowrap border-b-2 py-[14px] text-[12.5px] ${
                status === t.value
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
            onClick={openManualCreate}
            className="inline-flex h-[38px] items-center gap-[6px] rounded-[8px] bg-[#6D28D9] px-[14px] text-[11px] font-medium text-white hover:bg-[#5B21B6]"
          >
            <Plus size={14} />
            New Booking
          </button>

          <div className="relative">
            <select
              value={expertFilter}
              onChange={(e) => {
                setExpertFilter(e.target.value);
                setPage(1);
              }}
              className="h-[38px] w-[140px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]"
            >
              <option value="">All Experts</option>
              {experts.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 text-[#8B879C]"
            />
          </div>

          <div className="relative">
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="h-[38px] w-[140px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]"
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 text-[#8B879C]"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="h-[38px] w-[130px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="h-[38px] w-[130px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#2E2A3B]"
            />
          </div>
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
                  <td
                    colSpan={9}
                    className="py-10 text-center text-[13px] text-[#EF4444]"
                  >
                    {error}
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-[13px] text-[#8B879C]"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                list.map((b) => {
                  const svc = serviceStyles[b.service as ServiceKey];
                  const st =
                    statusStyles[b.status as keyof typeof statusStyles];
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
                            {sanitize(b.user.name)}
                          </p>
                          <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                            {sanitize(b.user.email)}
                          </p>
                          <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                            {sanitize(b.user.phone)}
                          </p>
                        </div>
                      </td>

                      <td className="py-[13px] pr-3">
                        <div className="flex items-center gap-[8px]">
                          {b.expert.avatar ? (
                            <Image
                              src={b.expert.avatar}
                              alt={sanitize(b.expert.name)}
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
                              {sanitize(b.expert.name)}
                            </p>
                            <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                              {sanitize(b.expert.role)}
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
                            aria-label="View Details"
                            onClick={() => setDetailBooking(b)}
                            title="View Details"
                            className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#6D28D9] hover:bg-[#EDE9FE]"
                          >
                            <Eye size={14} />
                          </button>
                          {b.status !== "completed" &&
                            b.status !== "cancelled" && (
                              <button
                                type="button"
                                aria-label="Complete"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    type: "complete",
                                    booking: b,
                                  })
                                }
                                title="Mark Complete"
                                className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#16A34A] hover:bg-[#E6F7EE]"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                          {b.status !== "completed" &&
                            b.status !== "cancelled" && (
                              <button
                                type="button"
                                aria-label="Cancel"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    type: "cancel",
                                    booking: b,
                                  })
                                }
                                title="Cancel Booking"
                                className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#EF4444] hover:bg-[#FEE2E2]"
                              >
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
            Showing {from.toLocaleString("en-IN")} to{" "}
            {to.toLocaleString("en-IN")} of {meta.total.toLocaleString("en-IN")}{" "}
            bookings
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-[6px]">
            <button
              type="button"
              aria-label="Previous"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
                page <= 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#FAF9FC]"
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
              ),
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
        title={
          confirmDialog.type === "complete"
            ? "Complete Booking"
            : "Cancel Booking"
        }
        message={
          confirmDialog.type === "complete"
            ? `Mark booking ${confirmDialog.booking?.id} as completed?`
            : `Are you sure you want to cancel booking ${confirmDialog.booking?.id}? This action cannot be undone.`
        }
        onConfirm={async () => {
          if (!confirmDialog.booking) return;
          setConfirmSaving(true);
          try {
            if (confirmDialog.type === "complete") {
              await api.admin.completeBooking(
                confirmDialog.booking.bookingDbId,
              );
              showToast("Booking marked as completed");
            } else {
              await api.admin.cancelBooking(confirmDialog.booking.bookingDbId);
              showToast("Booking cancelled");
            }
            setConfirmDialog({ open: false, type: "complete", booking: null });
            reload();
          } catch (e: unknown) {
            showToast(errorMessage(e, "Action failed"), "error");
          } finally {
            setConfirmSaving(false);
          }
        }}
        onCancel={() =>
          setConfirmDialog({ open: false, type: "complete", booking: null })
        }
        saving={confirmSaving}
      />

      {manualModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-booking-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2
                id="manual-booking-title"
                className="text-[16px] font-bold text-[#231640]"
              >
                Create Manual Booking
              </h2>
              <button
                type="button"
                onClick={() => setManualModal(false)}
                aria-label="Close"
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X size={18} className="text-[#8B879C]" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  User ID
                </label>
                <input
                  type="number"
                  value={manualValues.user_id ?? ""}
                  onChange={(e) =>
                    setManualValues({
                      ...manualValues,
                      user_id: e.target.value,
                    })
                  }
                  placeholder="Enter user ID"
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Service
                </label>
                <select
                  value={manualValues.service_id ?? ""}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const svc = manualServices.find(
                      (s) => String(s.id) === sid,
                    );
                    setManualValues({
                      ...manualValues,
                      service_id: sid,
                      amount: svc ? String(svc.price) : manualValues.amount,
                    });
                  }}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                >
                  <option value="">Select service</option>
                  {manualServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Expert (optional)
                </label>
                <select
                  value={manualValues.expert_id ?? ""}
                  onChange={(e) =>
                    setManualValues({
                      ...manualValues,
                      expert_id: e.target.value,
                    })
                  }
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                >
                  <option value="">Select expert</option>
                  {manualExperts.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={manualValues.date ?? ""}
                    onChange={(e) =>
                      setManualValues({ ...manualValues, date: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                    Time
                  </label>
                  <input
                    type="time"
                    value={manualValues.time ?? ""}
                    onChange={(e) =>
                      setManualValues({ ...manualValues, time: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                    Payment Status
                  </label>
                  <select
                    value={manualValues.payment_status ?? "Pending"}
                    onChange={(e) =>
                      setManualValues({
                        ...manualValues,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={manualValues.amount ?? ""}
                    onChange={(e) =>
                      setManualValues({
                        ...manualValues,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Auto-filled from service"
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Notes
                </label>
                <textarea
                  value={manualValues.notes ?? ""}
                  onChange={(e) =>
                    setManualValues({ ...manualValues, notes: e.target.value })
                  }
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setManualModal(false)}
                className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#3D3752] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualCreate}
                disabled={
                  manualSaving ||
                  !manualValues.user_id ||
                  !manualValues.service_id ||
                  !manualValues.date ||
                  !manualValues.time
                }
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#6D28D9] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#5B21B6] disabled:opacity-50"
              >
                {manualSaving && <Loader2 size={14} className="animate-spin" />}
                {manualSaving ? "Saving..." : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetailBooking(null)}
        >
          <div
            className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#231640]">
                Booking Details
              </h2>
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                aria-label="Close"
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X size={18} className="text-[#8B879C]" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <DetailRow label="Booking ID" value={detailBooking.id} />
              <DetailRow label="User" value={detailBooking.user.name} />
              <DetailRow label="Expert" value={detailBooking.expert.name} />
              <DetailRow
                label="Service"
                value={
                  serviceStyles[detailBooking.service]?.label ??
                  detailBooking.service
                }
              />
              <DetailRow label="Date" value={detailBooking.date} />
              <DetailRow label="Time" value={detailBooking.time} />
              <DetailRow label="Amount" value={detailBooking.amount} />
              <DetailRow
                label="Payment"
                value={detailBooking.payment}
                valueClass={
                  detailBooking.payment === "Paid"
                    ? "text-[#16A34A]"
                    : "text-[#EA580C]"
                }
              />
              <DetailRow label="Status" value={detailBooking.status} />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="rounded-[8px] border border-[#E7E5EF] px-4 py-2 text-[12px] font-medium text-[#4A4658] hover:bg-[#F7F6FB]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed right-4 top-4 z-[999] rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-lg ${toast.kind === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"}`}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}

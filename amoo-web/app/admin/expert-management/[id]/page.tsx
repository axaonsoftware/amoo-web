"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  UserCog,
  Calendar,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { api, unwrapList, unwrapMeta, qs } from "@/lib/api";
import type { Expert, Booking, Slot } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAutoRefreshApi } from "@/lib/useAutoRefreshApi";
import { useToast } from "@/app/admin/shared/useToast";
import AdminPageHeader from "@/app/admin/shared/AdminPageHeader";
import {
  Skeleton,
  TableSkeletonRows,
  EmptyState,
  EmptyRow,
  ErrorRow,
} from "@/app/components/states";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const fmt = (n: number | undefined | null) =>
  n == null ? "—" : n.toLocaleString("en-IN");

const statusColor = (s: string) =>
  s === "active"
    ? "bg-[#ECFDF5] text-[#059669]"
    : s === "blocked"
      ? "bg-[#FEF2F2] text-[#DC2626]"
      : "bg-[#FFF7ED] text-[#D97706]";

const badgeColor = (s: string) => {
  if (s === "Paid") return "bg-[#ECFDF5] text-[#059669]";
  if (s === "Pending") return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#F3F4F6] text-[#6B7280]";
};

const bookingStatusColor = (s: string) => {
  if (s === "completed") return "bg-[#ECFDF5] text-[#059669]";
  if (s === "cancelled") return "bg-[#FEF2F2] text-[#DC2626]";
  if (s === "pending-payment") return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#EEF2FF] text-[#4F46E5]";
};

const slotStatusColor = (s: string) => {
  if (s === "available") return "bg-[#ECFDF5] text-[#059669]";
  if (s === "booked") return "bg-[#EEF2FF] text-[#4F46E5]";
  return "bg-[#F3F4F6] text-[#6B7280]";
};

/* ------------------------------------------------------------------ */
/*  Tabs                                                              */
/* ------------------------------------------------------------------ */

const TABS = ["Overview", "Bookings", "Availability"] as const;
type Tab = (typeof TABS)[number];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ExpertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const expertId = Number(id);
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  /* ---------------------------------------------------------------- */
  /*  Bookings state                                                   */
  /* ---------------------------------------------------------------- */

  const [bkPage, setBkPage] = useState(1);
  const [bkSearch, setBkSearch] = useState("");
  const [debouncedBkSearch, setDebouncedBkSearch] = useState("");
  const [bkList, setBkList] = useState<Booking[]>([]);
  const [bkMeta, setBkMeta] = useState({ total: 0, totalPages: 1 });
  const [bkLoading, setBkLoading] = useState(true);
  const [bkError, setBkError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBkSearch = useCallback((val: string) => {
    setBkSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedBkSearch(val), 300);
  }, []);

  const bkQuery = useMemo(
    () =>
      qs({
        page: bkPage,
        pageSize: 10,
        search: debouncedBkSearch,
      }),
    [bkPage, debouncedBkSearch],
  );

  const loadBookings = useCallback(() => {
    setBkLoading(true);
    setBkError("");
    api.admin
      .getExpertBookings(expertId, bkQuery)
      .then((res: unknown) => {
        const meta = unwrapMeta(res);
        if (meta) setBkMeta({ total: meta.total, totalPages: meta.totalPages });
        setBkList(unwrapList<Booking>(res));
      })
      .catch(() => setBkError("Failed to load bookings."))
      .finally(() => setBkLoading(false));
  }, [expertId, bkQuery]);

  useEffect(() => {
    if (activeTab === "Bookings") loadBookings();
  }, [activeTab, loadBookings]);

  useEffect(() => {
    setBkPage(1);
  }, [debouncedBkSearch]);

  const bkTotalPages = bkMeta.totalPages || 1;
  const bkShowingFrom = bkList.length === 0 ? 0 : (bkPage - 1) * 10 + 1;
  const bkShowingTo = Math.min(bkPage * 10, bkMeta.total);

  /* ---------------------------------------------------------------- */
  /*  Availability state                                               */
  /* ---------------------------------------------------------------- */

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  const loadAvailability = useCallback(() => {
    setSlotsLoading(true);
    setSlotsError("");
    api.admin
      .getExpertAvailability(expertId)
      .then((res: unknown) => {
        const list = unwrapList<Slot>(res);
        setSlots(list);
      })
      .catch(() => setSlotsError("Failed to load availability."))
      .finally(() => setSlotsLoading(false));
  }, [expertId]);

  useEffect(() => {
    if (activeTab === "Availability") loadAvailability();
  }, [activeTab, loadAvailability]);

  /* ---------------------------------------------------------------- */
  /*  Earnings via auto-refresh                                         */
  /* ---------------------------------------------------------------- */

  const { data: earnings, loading: earningsLoading, error: earningsError } =
    useAutoRefreshApi(() => api.admin.getExpertEarnings(expertId), [expertId]);

  const earningsData = earnings as {
    expert?: Expert;
    summary?: {
      total_bookings?: number;
      completed_bookings?: number;
      cancelled_bookings?: number;
      total_revenue?: number;
      earned_revenue?: number;
      avg_booking_value?: number;
    };
    monthly?: { month: string; bookings: number; revenue: number }[];
  } | null;

  const expert = earningsData?.expert;

  /* ---------------------------------------------------------------- */
  /*  Stats cards                                                      */
  /* ---------------------------------------------------------------- */

  const statsItems = [
    {
      label: "Total Bookings",
      value: fmt(earningsData?.summary?.total_bookings),
      Icon: Calendar,
    },
    {
      label: "Completed",
      value: fmt(earningsData?.summary?.completed_bookings),
      Icon: CheckCircle,
    },
    {
      label: "Total Revenue",
      value: earningsData?.summary?.total_revenue != null
        ? formatCurrency(earningsData.summary.total_revenue)
        : "—",
      Icon: IndianRupee,
    },
    {
      label: "Avg Booking Value",
      value: earningsData?.summary?.avg_booking_value != null
        ? formatCurrency(earningsData.summary.avg_booking_value)
        : "—",
      Icon: TrendingUp,
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Pagination helper                                                */
  /* ---------------------------------------------------------------- */

  const getPageNumbers = (total: number, current: number) => {
    const pages: (number | "...")[] = [];
    if (total <= 6) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  /* ---------------------------------------------------------------- */
  /*  Loading skeleton                                                 */
  /* ---------------------------------------------------------------- */

  if (earningsLoading && !expert) {
    return (
      <div className="flex-1 px-4 pb-8 pt-5 sm:px-6">
        <AdminPageHeader
          title="Expert Details"
          description="Loading expert information…"
          Icon={UserCog}
        />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[#EDECF3] bg-white p-4 shadow-[0_2px_10px_rgba(42,17,72,.05)]"
            >
              <div className="flex items-start gap-3.5">
                <Skeleton className="h-[46px] w-[46px] shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-6 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="mt-5 h-[320px] w-full rounded-[14px]" />
      </div>
    );
  }

  if (earningsError && !expert) {
    return (
      <div className="flex-1 px-4 pb-8 pt-5 sm:px-6">
        <AdminPageHeader
          title="Expert Details"
          description="Failed to load expert"
          Icon={UserCog}
        />
        <div className="mt-6 rounded-[14px] border border-[#F6D7D7] bg-[#FEF6F6] p-8 text-center text-[13px] text-[#B42318]">
          Failed to load expert details.
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-5 sm:px-6">
      <Toast />

      <AdminPageHeader
        title={expert?.name ?? "Expert Details"}
        description="Expert earnings, bookings & availability"
        Icon={UserCog}
      />

      {/* Stats Row */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsItems.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-[14px] border border-[#EDECF3] bg-gradient-to-b from-white to-[#fbf9fe] px-4 pb-3 pt-4 shadow-[0_1px_3px_rgba(42,17,72,.05)]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white shadow-[0_6px_14px_rgba(109,40,217,.28)]">
                <Icon className="h-[20px] w-[20px]" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[#8b8397]">
                  {label}
                </p>
                <p className="mt-[3px] text-[22px] font-bold leading-none tracking-[-0.01em] text-[#2a1148]">
                  {value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <section className="mt-5 rounded-[14px] border border-[#EDECF3] bg-white shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        <div className="flex items-center gap-6 overflow-x-auto border-b border-[#EFEEF4] px-5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`flex shrink-0 items-center gap-[6px] whitespace-nowrap border-b-2 py-[14px] text-[12.5px] ${
                activeTab === t
                  ? "border-[#6D28D9] font-semibold text-[#6D28D9]"
                  : "border-transparent font-normal text-[#7C7890] hover:text-[#2E2A3B]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ---- Overview Tab ---- */}
          {activeTab === "Overview" && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="flex flex-wrap items-start gap-5 rounded-[12px] border border-[#EDECF3] bg-[#fbfaFd] p-5">
                {expert?.avatar ? (
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[22px] font-bold text-white">
                    {expert?.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-[20px] font-bold text-[#231640]">
                      {expert?.name}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusColor(expert?.status ?? "")}`}
                    >
                      {expert?.status}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#8B879C]">
                    {expert?.email}
                  </p>
                  {expert?.specialties && (
                    <p className="text-[12px] text-[#6E6A80]">
                      <span className="font-medium">Specialties:</span>{" "}
                      {expert.specialties}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <Star
                      size={14}
                      className="text-[#F59E0B]"
                      fill="#F59E0B"
                    />
                    <span className="font-semibold text-[#231640]">
                      {expert?.rating != null
                        ? Number(expert.rating).toFixed(1)
                        : "—"}
                    </span>
                    <span className="text-[#8B879C]">rating</span>
                  </div>
                </div>
              </div>

              {/* Monthly Earnings Table */}
              <div>
                <h3 className="mb-3 font-display text-[15px] font-semibold text-[#231640]">
                  Monthly Earnings (Last 6 Months)
                </h3>
                <div className="overflow-x-auto rounded-[10px] border border-[#EDECF3]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFEEF4] bg-[#FAF9FC] text-left">
                        <th className="whitespace-nowrap py-[11px] pl-5 pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                          Month
                        </th>
                        <th className="whitespace-nowrap py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                          Bookings
                        </th>
                        <th className="whitespace-nowrap py-[11px] pr-5 text-[11.5px] font-medium text-[#6E6A80]">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {earningsData?.monthly &&
                      earningsData.monthly.length > 0 ? (
                        earningsData.monthly.map((m) => (
                          <tr
                            key={m.month}
                            className="border-b border-[#F3F2F7]"
                          >
                            <td className="py-[12px] pl-5 pr-3 text-[12px] font-medium text-[#2E2A3B]">
                              {m.month}
                            </td>
                            <td className="py-[12px] pr-3 text-[12px] text-[#4A4658]">
                              {fmt(m.bookings)}
                            </td>
                            <td className="py-[12px] pr-5 text-[12px] text-[#4A4658]">
                              {formatCurrency(m.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <EmptyRow
                          colSpan={3}
                          title="No earnings data"
                          message="Monthly earnings will appear here once bookings are completed."
                        />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---- Bookings Tab ---- */}
          {activeTab === "Bookings" && (
            <div>
              <div className="mb-4 flex h-[38px] w-[260px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px]">
                <input
                  type="text"
                  value={bkSearch}
                  onChange={(e) => handleBkSearch(e.target.value)}
                  placeholder="Search by booking ref..."
                  className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
                />
                <Search size={15} className="shrink-0 text-[#8B879C]" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[740px] border-collapse">
                  <thead>
                    <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
                      {[
                        "Booking Ref",
                        "User",
                        "Service",
                        "Date",
                        "Amount",
                        "Payment",
                        "Status",
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
                    {bkError ? (
                      <ErrorRow colSpan={7} message={bkError} onRetry={loadBookings} />
                    ) : bkLoading && bkList.length === 0 ? (
                      <TableSkeletonRows rows={5} cols={7} />
                    ) : bkList.length === 0 ? (
                      <EmptyRow
                        colSpan={7}
                        title="No bookings found"
                        message="This expert has no bookings yet."
                      />
                    ) : null}
                    {bkList.map((b) => (
                      <tr key={b.id} className="border-b border-[#F3F2F7]">
                        <td className="py-[12px] pr-3 pl-5 text-[12px] font-medium text-[#6D28D9]">
                          {b.booking_ref}
                        </td>
                        <td className="py-[12px] pr-3 text-[12px] text-[#2E2A3B]">
                          {b.user_name ?? "—"}
                        </td>
                        <td className="py-[12px] pr-3 text-[12px] text-[#4A4658]">
                          {b.service_name ?? "—"}
                        </td>
                        <td className="py-[12px] pr-3 text-[12px] text-[#4A4658]">
                          {formatDate(b.date)}
                        </td>
                        <td className="py-[12px] pr-3 text-[12px] text-[#4A4658]">
                          {formatCurrency(b.amount)}
                        </td>
                        <td className="py-[12px] pr-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${badgeColor(b.payment)}`}
                          >
                            {b.payment}
                          </span>
                        </td>
                        <td className="py-[12px] pr-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize ${bookingStatusColor(b.status)}`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {bkLoading && bkList.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
                  </div>
                )}
              </div>

              {/* Pagination */}
              {bkMeta.total > 0 && (
                <div className="flex flex-wrap items-center gap-4 px-2 py-[14px]">
                  <p className="text-[11.5px] text-[#8B879C]">
                    Showing {bkShowingFrom} to {bkShowingTo} of{" "}
                    {bkMeta.total.toLocaleString("en-IN")} bookings
                  </p>
                  <div className="ml-auto flex items-center gap-[6px]">
                    <button
                      type="button"
                      aria-label="Previous"
                      onClick={() => setBkPage((p) => Math.max(1, p - 1))}
                      disabled={bkPage <= 1}
                      className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
                        bkPage <= 1 ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {getPageNumbers(bkTotalPages, bkPage).map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`e-${i}`}
                          className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[11.5px] text-[#8B879C]"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setBkPage(p)}
                          className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] text-[11.5px] font-semibold ${
                            p === bkPage
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
                      onClick={() =>
                        setBkPage((p) => Math.min(bkTotalPages, p + 1))
                      }
                      disabled={bkPage >= bkTotalPages}
                      className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
                        bkPage >= bkTotalPages
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- Availability Tab ---- */}
          {activeTab === "Availability" && (
            <div>
              {slotsError ? (
                <div className="rounded-[12px] border border-[#F6D7D7] bg-[#FEF6F6] p-8 text-center">
                  <p className="text-[13px] font-semibold text-[#B42318]">
                    Couldn&apos;t load availability
                  </p>
                  <p className="mt-1 text-[12px] text-[#8B879C]">
                    {slotsError}
                  </p>
                  <button
                    type="button"
                    onClick={loadAvailability}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] bg-[#6D28D9] px-3.5 py-2 text-[12px] font-medium text-white hover:bg-[#5B21B6]"
                  >
                    Try again
                  </button>
                </div>
              ) : slotsLoading ? (
                <TableSkeletonRows rows={5} cols={3} />
              ) : slots.length === 0 ? (
                <EmptyState
                  title="No availability slots"
                  message="This expert has not set up any availability slots yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
                        {["Date", "Time", "Status"].map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap py-[11px] pr-3 pl-5 text-[11.5px] font-medium text-[#6E6A80]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((s) => (
                        <tr key={s.id} className="border-b border-[#F3F2F7]">
                          <td className="py-[12px] pr-3 pl-5 text-[12px] text-[#2E2A3B]">
                            {formatDate(s.date)}
                          </td>
                          <td className="py-[12px] pr-3 text-[12px] text-[#4A4658]">
                            {s.start_time}
                            {s.end_time ? ` – ${s.end_time}` : ""}
                          </td>
                          <td className="py-[12px] pr-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize ${slotStatusColor(s.status)}`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

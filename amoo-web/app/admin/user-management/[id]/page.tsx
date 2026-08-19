"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  User,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ban,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";
import { api, unwrapList, unwrapMeta, qs } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { useAutoRefreshApi } from "@/lib/useAutoRefreshApi";
import { useToast } from "@/app/admin/shared/useToast";
import AdminPageHeader from "@/app/admin/shared/AdminPageHeader";
import AdminModal from "@/app/admin/shared/AdminModal";
import {
  Skeleton,
  TableSkeletonRows,
  EmptyRow,
  ErrorRow,
} from "@/app/components/states";
import { roleStyles, statusStyles } from "../data";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const TABS = ["Overview", "Bookings", "Wallet"] as const;
type Tab = (typeof TABS)[number];

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

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const { showToast, Toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  /* ---------------------------------------------------------------- */
  /*  User data                                                        */
  /* ---------------------------------------------------------------- */

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useAutoRefreshApi(() => api.admin.getUser(userId), [userId]);

  const user = userData as {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: string;
    status: string;
    verified: boolean;
    created_at: string;
    gender?: string | null;
    dob?: string | null;
  } | null;

  /* ---------------------------------------------------------------- */
  /*  Wallet data                                                      */
  /* ---------------------------------------------------------------- */

  const {
    data: walletData,
    loading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useAutoRefreshApi(() => api.admin.getUserWallet(userId), [userId]);

  const wallet = walletData as {
    balance?: number;
    currency?: string;
    transactions?: {
      id: number;
      amount: number;
      type: string;
      reference_type: string;
      reference_id: number | null;
      created_at: string;
    }[];
  } | null;

  /* ---------------------------------------------------------------- */
  /*  Credit modal                                                     */
  /* ---------------------------------------------------------------- */

  const [creditOpen, setCreditOpen] = useState(false);
  const [creditValues, setCreditValues] = useState<
    Record<string, string | number>
  >({ amount: "", reason: "" });
  const [creditSaving, setCreditSaving] = useState(false);

  const handleCredit = useCallback(async () => {
    const amount = Number(creditValues.amount);
    if (!amount) {
      showToast("Please enter an amount", "error");
      return;
    }
    setCreditSaving(true);
    try {
      await api.admin.creditUser(userId, {
        amount,
        reason: String(creditValues.reason || ""),
      });
      setCreditOpen(false);
      setCreditValues({ amount: "", reason: "" });
      showToast(
        amount > 0
          ? `₹${amount.toLocaleString("en-IN")} credited successfully`
          : `₹${Math.abs(amount).toLocaleString("en-IN")} deducted successfully`,
      );
      refetchWallet();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Failed to process credit";
      showToast(msg, "error");
    } finally {
      setCreditSaving(false);
    }
  }, [creditValues, userId, refetchWallet, showToast]);

  /* ---------------------------------------------------------------- */
  /*  Status toggle                                                    */
  /* ---------------------------------------------------------------- */

  const [toggling, setToggling] = useState(false);

  const handleToggleStatus = useCallback(async () => {
    if (!user) return;
    const newStatus = user.status === "blocked" ? "active" : "blocked";
    setToggling(true);
    try {
      await api.admin.updateUser(userId, { status: newStatus });
      showToast(
        newStatus === "blocked"
          ? "User blocked successfully"
          : "User unblocked successfully",
      );
      window.location.reload();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Failed to update status";
      showToast(msg, "error");
    } finally {
      setToggling(false);
    }
  }, [user, userId, showToast]);

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
        user_id: userId,
        search: debouncedBkSearch,
      }),
    [bkPage, debouncedBkSearch, userId],
  );

  const loadBookings = useCallback(() => {
    setBkLoading(true);
    setBkError("");
    api.admin
      .getBookings(bkQuery)
      .then((res: unknown) => {
        const meta = unwrapMeta(res);
        if (meta) setBkMeta({ total: meta.total, totalPages: meta.totalPages });
        setBkList(unwrapList<Booking>(res));
      })
      .catch(() => setBkError("Failed to load bookings."))
      .finally(() => setBkLoading(false));
  }, [bkQuery]);

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

  if (userLoading && !user) {
    return (
      <div className="flex-1 px-4 pb-8 pt-5 sm:px-6">
        <AdminPageHeader
          title="User Details"
          description="Loading user information…"
          Icon={User}
        />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
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

  if (userError && !user) {
    return (
      <div className="flex-1 px-4 pb-8 pt-5 sm:px-6">
        <AdminPageHeader
          title="User Details"
          description="Failed to load user"
          Icon={User}
        />
        <div className="mt-6 rounded-[14px] border border-[#F6D7D7] bg-[#FEF6F6] p-8 text-center text-[13px] text-[#B42318]">
          Failed to load user details.
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Role / status badge helpers                                      */
  /* ---------------------------------------------------------------- */

  const roleStyle = roleStyles[user?.role as keyof typeof roleStyles] ?? {
    label: user?.role ?? "—",
    bg: "bg-[#F5F4F9]",
    text: "text-[#6B6480]",
  };
  const statusStyle = statusStyles[user?.status as keyof typeof statusStyles] ?? {
    label: user?.status ?? "—",
    bg: "bg-[#F5F4F9]",
    text: "text-[#6B6480]",
  };

  /* ---------------------------------------------------------------- */
  /*  Stats                                                            */
  /* ---------------------------------------------------------------- */

  const statsItems = [
    {
      label: "Wallet Balance",
      value:
        wallet != null
          ? formatCurrency(wallet.balance ?? 0)
          : walletLoading
            ? "…"
            : "—",
      Icon: Wallet,
    },
    {
      label: "Total Bookings",
      value:
        bkMeta.total > 0
          ? bkMeta.total.toLocaleString("en-IN")
          : bkLoading
            ? "…"
            : bkMeta.total === 0 && activeTab === "Bookings"
              ? "0"
              : "—",
      Icon: Calendar,
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Transactions                                                     */
  /* ---------------------------------------------------------------- */

  const transactions = wallet?.transactions ?? [];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-5 sm:px-6">
      <Toast />

      <AdminPageHeader
        title={user?.name ?? "User Details"}
        description="User profile, bookings & wallet"
        Icon={User}
      />

      {/* Stats Row */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[22px] font-bold text-white">
                    {user?.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-[20px] font-bold text-[#231640]">
                      {user?.name}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${roleStyle.bg} ${roleStyle.text}`}
                    >
                      {roleStyle.label}
                    </span>
                    {user?.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE7FB] px-2.5 py-0.5 text-[11px] font-medium text-[#6D28D9]">
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1 text-[12.5px] text-[#8B879C]">
                    <p className="flex items-center gap-1.5">
                      <Mail size={13} /> {user?.email}
                    </p>
                    {user?.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={13} /> {user.phone}
                      </p>
                    )}
                    <p>
                      Joined {formatDate(user?.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-[12px] font-medium text-white disabled:opacity-60 ${
                    user?.status === "blocked"
                      ? "bg-[#16A34A] hover:bg-[#15803D]"
                      : "bg-[#EF4444] hover:bg-[#DC2626]"
                  }`}
                >
                  {toggling && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <Ban size={14} />
                  {user?.status === "blocked" ? "Unblock User" : "Block User"}
                </button>
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
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[740px] border-collapse">
                  <thead>
                    <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
                      {[
                        "Booking Ref",
                        "Expert",
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
                      <ErrorRow
                        colSpan={7}
                        message={bkError}
                        onRetry={loadBookings}
                      />
                    ) : bkLoading && bkList.length === 0 ? (
                      <TableSkeletonRows rows={5} cols={7} />
                    ) : bkList.length === 0 ? (
                      <EmptyRow
                        colSpan={7}
                        title="No bookings found"
                        message="This user has no bookings yet."
                      />
                    ) : null}
                    {bkList.map((b) => (
                      <tr key={b.id} className="border-b border-[#F3F2F7]">
                        <td className="py-[12px] pr-3 pl-5 text-[12px] font-medium text-[#6D28D9]">
                          {b.booking_ref}
                        </td>
                        <td className="py-[12px] pr-3 text-[12px] text-[#2E2A3B]">
                          {b.expert_name ?? "—"}
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

          {/* ---- Wallet Tab ---- */}
          {activeTab === "Wallet" && (
            <div className="space-y-5">
              {/* Balance */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#EDECF3] bg-[#fbfaFd] p-5">
                <div>
                  <p className="text-[12px] text-[#8B879C]">Wallet Balance</p>
                  <p className="mt-1 font-display text-[32px] font-bold text-[#231640]">
                    {walletLoading
                      ? "…"
                      : formatCurrency(wallet?.balance ?? 0)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreditValues({ amount: "", reason: "" });
                    setCreditOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2.5 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] hover:shadow-[0_6px_16px_rgba(109,40,217,.35)]"
                >
                  <Wallet size={15} />
                  Add Credit
                </button>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="mb-3 font-display text-[15px] font-semibold text-[#231640]">
                  Transaction History
                </h3>
                <div className="overflow-x-auto rounded-[10px] border border-[#EDECF3]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#EFEEF4] bg-[#FAF9FC] text-left">
                        {["Date", "Amount", "Type", "Reference"].map((h) => (
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
                      {walletError ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-10 text-center text-[13px] text-[#EF4444]"
                          >
                            Failed to load transactions.
                          </td>
                        </tr>
                      ) : walletLoading ? (
                        <TableSkeletonRows rows={4} cols={4} />
                      ) : transactions.length === 0 ? (
                        <EmptyRow
                          colSpan={4}
                          title="No transactions yet"
                          message="Wallet transactions will appear here once credits are added."
                        />
                      ) : (
                        transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="border-b border-[#F3F2F7]"
                          >
                            <td className="py-[12px] pr-3 pl-5 text-[12px] text-[#2E2A3B]">
                              {formatDate(tx.created_at)}
                            </td>
                            <td className="py-[12px] pr-3">
                              <span
                                className={`text-[12px] font-semibold ${
                                  tx.amount >= 0
                                    ? "text-[#16A34A]"
                                    : "text-[#EF4444]"
                                }`}
                              >
                                {tx.amount >= 0 ? "+" : ""}
                                {formatCurrency(tx.amount)}
                              </span>
                            </td>
                            <td className="py-[12px] pr-3 text-[12px] text-[#4A4658]">
                              {titleCase(tx.type)}
                            </td>
                            <td className="py-[12px] pr-3 text-[12px] text-[#8B879C]">
                              {tx.reference_type ? `${tx.reference_type}${tx.reference_id ? ` #${tx.reference_id}` : ""}` : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Credit Modal */}
      <AdminModal
        open={creditOpen}
        title="Add / Deduct Credit"
        fields={[
          {
            name: "amount",
            label: "Amount (use negative for refund)",
            type: "number",
            required: true,
            placeholder: "e.g. 500 or -200",
          },
          {
            name: "reason",
            label: "Reason",
            type: "textarea",
            placeholder: "Optional reason for this transaction",
            full: true,
          },
        ]}
        values={creditValues}
        onChange={(name, value) =>
          setCreditValues((prev) => ({ ...prev, [name]: value }))
        }
        saving={creditSaving}
        onClose={() => setCreditOpen(false)}
        onSave={handleCredit}
      />
    </main>
  );
}

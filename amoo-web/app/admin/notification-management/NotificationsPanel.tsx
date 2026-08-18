"use client";
import { useCallback, useEffect,  useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Bell,
  Send,
  Users,
} from "lucide-react";
import { typeTone } from "./data";
import { api, type PageMeta } from "../../../lib/api";
import ConfirmDialog from "../shared/ConfirmDialog";
import { sanitize } from "../../../lib/sanitize";
import { errorMessage } from "../../../lib/errors";
import type { Notification, User } from "../../../lib/types";

const statusOptions = [
  { label: "All Types", value: "" },
  { label: "Info", value: "info" },
  { label: "Warning", value: "warning" },
  { label: "Alert", value: "alert" },
  { label: "Success", value: "success" },
  { label: "Promotion", value: "promotion" },
];

const targetOptions = [
  { label: "Broadcast (All Users)", value: "" },
  { label: "Specific User", value: "specific" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type ListResponse<T> = { data?: T[]; meta?: PageMeta };

function fmtDateTime(iso: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export default function NotificationsPanel({
  onReady,
}: {
  onReady?: (fns: { openCompose: () => void }) => void;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Notification | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTarget, setComposeTarget] = useState("");
  const [composeUserId, setComposeUserId] = useState("");
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeType, setComposeType] = useState("info");
  const [composeSending, setComposeSending] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    kind: "success" | "error";
  } | null>(null);

  const [userList, setUserList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const loadNotifications = useCallback(() => {
    setLoading(true);
    setError("");
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("pageSize", String(limit));
    if (typeFilter) q.set("type", typeFilter);

    api.admin
      .getNotifications(`?${q.toString()}`)
      .then((res: ListResponse<Notification>) => {
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
        setList(items);
      })
      .catch((e: unknown) => setError(errorMessage(e, "Failed to load")))
      .finally(() => setLoading(false));
  }, [page, limit, typeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const loadUsers = useCallback(() => {
    api.admin
      .getUsers("page=1&pageSize=50")
      .then((res: ListResponse<User>) => {
        const items = res?.data ?? res ?? [];
        if (Array.isArray(items)) setUserList(items);
      })
      .catch(() => {});
  }, []);

  const openCompose = () => {
    loadUsers();
    setComposeOpen(true);
    setComposeTarget("");
    setComposeUserId("");
    setComposeTitle("");
    setComposeMessage("");
    setComposeType("info");
  };

  useEffect(() => {
    if (onReady) onReady({ openCompose });
  });

  const handleSend = async () => {
    if (!composeTitle.trim() || !composeMessage.trim()) {
      showToast("Title and message are required", "error");
      return;
    }
    setComposeSending(true);
    try {
      await api.admin.createNotification({
        user_id: composeTarget === "specific" ? Number(composeUserId) : null,
        title: composeTitle.trim(),
        message: composeMessage.trim(),
        type: composeType,
      });
      setComposeOpen(false);
      showToast("Notification sent successfully");
      setPage(1);
      loadNotifications();
    } catch (err: unknown) {
      showToast(errorMessage(err, "Failed to send"), "error");
    } finally {
      setComposeSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteSaving(true);
    try {
      await api.admin.deleteNotification(deleting.id);
      setConfirmOpen(false);
      setDeleting(null);
      showToast("Notification deleted");
      loadNotifications();
    } catch (err: unknown) {
      showToast(errorMessage(err, "Delete failed"), "error");
    } finally {
      setDeleteSaving(false);
    }
  };

  const totalPages = meta.totalPages || 1;
  const from = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, meta.total);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    if (pages[pages.length - 1] !== totalPages) pages.push(totalPages);
    return pages;
  };

  const filteredUsers = userList.filter(
    (u) =>
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <>
      <section className="rounded-[14px] border border-[#EDECF3] bg-white shadow-[0_1px_2px_rgba(24,20,40,.04)]">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="flex h-[36px] w-[220px] items-center rounded-[8px] border border-[#E7E5EF] pl-3 pr-2">
            <Search size={14} className="shrink-0 text-[#8B879C]" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="ml-2 h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-[36px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-3 pr-8 text-[11px] text-[#2E2A3B] outline-none"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B879C]"
            />
          </div>
        </div>

        {/* Compose section (collapsible) */}
        {composeOpen && (
          <div className="mx-5 mb-4 rounded-[12px] border border-[#EEEDF4] bg-[#FAF9FC] p-4">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#1F1836]">
              <Send size={14} className="text-[#7C3AED]" />
              Compose Notification
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="notificationspanel-target"
                  className="mb-1 block text-[10.5px] font-medium text-[#3D3752]"
                >
                  Target
                </label>
                <select
                  id="notificationspanel-target"
                  value={composeTarget}
                  onChange={(e) => setComposeTarget(e.target.value)}
                  className="h-[36px] w-full rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#2E2A3B] outline-none"
                >
                  {targetOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {composeTarget === "specific" && (
                <div>
                  <label
                    htmlFor="notif-user"
                    className="mb-1 block text-[10.5px] font-medium text-[#3D3752]"
                  >
                    Select User
                  </label>
                  <div className="relative">
                    <label htmlFor="notif-user-search" className="sr-only">
                      Search users
                    </label>
                    <input
                      id="notif-user-search"
                      type="search"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="mb-1 h-[32px] w-full rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
                    />
                    <select
                      id="notif-user"
                      value={composeUserId}
                      onChange={(e) => setComposeUserId(e.target.value)}
                      className="h-[36px] w-full rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#2E2A3B] outline-none"
                    >
                      <option value="">Select a user…</option>
                      {filteredUsers.map((u: User) => (
                        <option key={u.id} value={u.id}>
                          {sanitize(u.name)} ({sanitize(u.email)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="notificationspanel-type"
                  className="mb-1 block text-[10.5px] font-medium text-[#3D3752]"
                >
                  Type
                </label>
                <select
                  id="notificationspanel-type"
                  value={composeType}
                  onChange={(e) => setComposeType(e.target.value)}
                  className="h-[36px] w-full rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#2E2A3B] outline-none"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                  <option value="success">Success</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="notificationspanel-title"
                  className="mb-1 block text-[10.5px] font-medium text-[#3D3752]"
                >
                  Title *
                </label>
                <input
                  id="notificationspanel-title"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="Notification title"
                  className="h-[36px] w-full rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="notif-message"
                  className="mb-1 block text-[10.5px] font-medium text-[#3D3752]"
                >
                  Message *
                </label>
                <textarea
                  id="notif-message"
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Notification message"
                  rows={3}
                  className="w-full rounded-[8px] border border-[#E7E5EF] bg-white px-3 py-2 text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setComposeOpen(false)}
                className="rounded-[8px] border border-[#E7E5EF] bg-white px-4 py-2 text-[11px] font-medium text-[#3D3752] hover:bg-[#F7F6FB]"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={composeSending}
                className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[11px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-60"
              >
                {composeSending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {composeSending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-y border-[#EFEEF4] bg-[#FAF9FC] text-left">
                <th className="py-[11px] pl-5 pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                  Title
                </th>
                <th className="py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                  Message
                </th>
                <th className="py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                  Target
                </th>
                <th className="py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                  Type
                </th>
                <th className="py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                  Read
                </th>
                <th className="py-[11px] pr-3 text-[11.5px] font-medium text-[#6E6A80]">
                  Sent At
                </th>
                <th className="py-[11px] pr-5 text-[11.5px] font-medium text-[#6E6A80]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#6D28D9]" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-[13px] text-[#EF4444]"
                  >
                    {error}
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-[12px] text-[#8B879C]"
                  >
                    No notifications sent yet.
                  </td>
                </tr>
              ) : (
                list.map((n) => {
                  const { date, time } = fmtDateTime(n.created_at);
                  const isBroadcast = !n.user_id;
                  return (
                    <tr key={n.id} className="border-b border-[#F3F2F7]">
                      <td className="py-[13px] pl-5 pr-3">
                        <div className="flex items-center gap-[8px]">
                          <span
                            className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] ${isBroadcast ? "bg-[#F0EAFB]" : "bg-[#E7F0FE]"}`}
                          >
                            {isBroadcast ? (
                              <Bell
                                size={13}
                                strokeWidth={2}
                                className="text-[#7C3AED]"
                              />
                            ) : (
                              <Users
                                size={13}
                                strokeWidth={2}
                                className="text-[#2563EB]"
                              />
                            )}
                          </span>
                          <p className="text-[11.5px] font-semibold text-[#221C33]">
                            {sanitize(n.title)}
                          </p>
                        </div>
                      </td>
                      <td className="py-[13px] pr-3">
                        <p className="max-w-[260px] truncate text-[11px] text-[#6B6480]">
                          {sanitize(n.message)}
                        </p>
                      </td>
                      <td className="py-[13px] pr-3">
                        <span
                          className={`inline-flex items-center rounded-[6px] px-[8px] py-[3px] text-[9.5px] font-medium ${isBroadcast ? "bg-[#F0EAFB] text-[#7C3AED]" : "bg-[#E7F0FE] text-[#2563EB]"}`}
                        >
                          {isBroadcast ? "Broadcast" : `User #${n.user_id}`}
                        </span>
                      </td>
                      <td className="py-[13px] pr-3">
                        <span
                          className={`inline-flex items-center rounded-[6px] px-[8px] py-[3px] text-[9.5px] font-medium ${typeTone[n.type] || "bg-[#F5F4F9] text-[#6B6480]"}`}
                        >
                          {n.type || "info"}
                        </span>
                      </td>
                      <td className="py-[13px] pr-3">
                        <span
                          className={`inline-flex items-center rounded-[6px] px-[8px] py-[3px] text-[9.5px] font-medium ${n.is_read ? "bg-[#E6F7EE] text-[#16A34A]" : "bg-[#FEF1E1] text-[#F59E0B]"}`}
                        >
                          {n.is_read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="py-[13px] pr-3 leading-tight">
                        <p className="whitespace-nowrap text-[11px] text-[#2E2A3B]">
                          {date}
                        </p>
                        <p className="mt-[1px] whitespace-nowrap text-[9.5px] text-[#8B879C]">
                          {time}
                        </p>
                      </td>
                      <td className="py-[13px] pr-5">
                        <button
                          onClick={() => {
                            setDeleting(n);
                            setConfirmOpen(true);
                          }}
                          className="grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[#EF4444] hover:bg-[#FEE2E2]"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
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
            {meta.total > 0
              ? `Showing ${from.toLocaleString("en-IN")} to ${to.toLocaleString("en-IN")} of ${meta.total.toLocaleString("en-IN")} notifications`
              : "No results"}
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-[6px]">
            <button
              type="button"
              aria-label="Previous"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FAF9FC]"}`}
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
                  className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] text-[11.5px] font-semibold ${p === page ? "bg-[#5B2497] text-white" : "border border-[#E7E5EF] bg-white text-[#4A4658]"}`}
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
              className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FAF9FC]"}`}
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
                className="flex h-[32px] w-[104px] appearance-none items-center rounded-[8px] border border-[#E7E5EF] bg-white pl-3 pr-8 text-[11.5px] text-[#4A4658] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B879C]"
              />
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Notification"
        message={`Are you sure you want to delete "${deleting?.title || "this notification"}"?`}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleting(null);
        }}
        saving={deleteSaving}
      />

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

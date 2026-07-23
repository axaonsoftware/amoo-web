"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  Pencil,
  Trash2,
  Ban,
} from "lucide-react";
import { roleStyles, statusStyles } from "./data";
import { api } from "../../../lib/api";
import ConfirmDialog from "../shared/ConfirmDialog";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import { sanitize } from "../../../lib/sanitize";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editValues, setEditValues] = useState<Record<string, string | number>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "delete" | "block"; user: any }>({ open: false, type: "delete", user: null });
  const [confirmSaving, setConfirmSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" } | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(limit));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    return params.toString();
  }, [page, limit, debouncedSearch, role, status]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.admin
      .getUsers(buildQuery())
      .then((data: any) => {
        const items = data?.data ?? data;
        if (data?.meta) setMeta({ total: data.meta.total, totalPages: data.meta.totalPages });
        if (Array.isArray(items)) {
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
  }, [page, limit, debouncedSearch, role, status]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status]);

  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const reload = () => {
    setLoading(true);
    api.admin.getUsers(buildQuery()).then((data: any) => {
      const items = data?.data ?? data;
      if (data?.meta) setMeta({ total: data.meta.total, totalPages: data.meta.totalPages });
      if (Array.isArray(items)) {
        setList(items.map((u: any) => {
          const { date, time } = fmtDate(u.created_at);
          return { id: u.id, name: u.name, avatar: u.avatar || "", verified: !!u.verified, email: u.email, phone: u.phone, role: u.role, status: u.status, date, time };
        }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const userRows = list;
  const totalPages = meta.totalPages || 1;
  const total = meta.total;
  const showingFrom = userRows.length === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading && userRows.length === 0)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
      </div>
    );
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
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
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
                          alt={sanitize(u.name)}
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
                            {sanitize(u.name)}
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
                      {sanitize(u.email)}
                    </p>
                    <p className="mt-[2px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {sanitize(u.phone)}
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
                      <button type="button" aria-label="Edit" onClick={() => { setEditingUser(u); setEditValues({ name: u.name, email: u.email, phone: u.phone || "", role: u.role, status: u.status }); setEditModalOpen(true); }} className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#6E6A80] hover:bg-[#FAF9FC]">
                        <Pencil size={14} />
                      </button>
                      {u.status !== "blocked" && (
                        <button type="button" aria-label="Block" onClick={() => setConfirmDialog({ open: true, type: "block", user: u })} className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#F59E0B] hover:bg-[#FEF3C7]">
                          <Ban size={14} />
                        </button>
                      )}
                      <button type="button" aria-label="Delete" onClick={() => setConfirmDialog({ open: true, type: "delete", user: u })} className="grid h-[28px] w-[28px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#EF4444] hover:bg-[#FEE2E2]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && userRows.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-[16px]">
        <p className="text-[11.5px] text-[#8B879C]">
          Showing {showingFrom} to {showingTo} of {total.toLocaleString("en-IN")} users
        </p>

        <div className="ml-auto flex items-center gap-[6px]">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
              page <= 1 ? "opacity-50 cursor-not-allowed" : ""
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#8B879C] ${
              page >= totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = limit === 10 ? 25 : limit === 25 ? 50 : 10;
              setLimit(next);
            }}
            className="ml-2 flex h-[32px] w-[104px] items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white pl-[12px] pr-[10px] text-[11.5px] text-[#4A4658]"
          >
            {limit} / page
            <ChevronDown size={15} className="shrink-0 text-[#8B879C]" />
          </button>
        </div>
      </div>
      <AdminModal
        open={editModalOpen}
        title="Edit User"
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "text", required: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "role", label: "Role", type: "select", options: [{ label: "User", value: "user" }, { label: "Premium", value: "premium" }, { label: "Admin", value: "admin" }] },
          { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Blocked", value: "blocked" }] },
        ]}
        values={editValues}
        onChange={(name, value) => setEditValues((prev) => ({ ...prev, [name]: value }))}
        saving={editSaving}
        onClose={() => setEditModalOpen(false)}
        onSave={async () => {
          if (!editingUser) return;
          setEditSaving(true);
          try {
            await api.admin.updateUser(editingUser.id, { name: editValues.name, email: editValues.email, phone: editValues.phone, role: editValues.role, status: editValues.status });
            setEditModalOpen(false);
            showToast("User updated successfully");
            reload();
          } catch (e: any) {
            showToast(e.message || "Failed to update user", "error");
          } finally {
            setEditSaving(false);
          }
        }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === "delete" ? "Delete User" : "Block User"}
        message={confirmDialog.type === "delete" ? `Are you sure you want to delete ${sanitize(confirmDialog.user?.name)}? This action cannot be undone.` : `Are you sure you want to block ${sanitize(confirmDialog.user?.name)}? They will no longer be able to access the platform.`}
        onConfirm={async () => {
          setConfirmSaving(true);
          try {
            if (confirmDialog.type === "delete") {
              await api.admin.deleteUser(confirmDialog.user.id);
              showToast("User deleted successfully");
            } else {
              await api.admin.updateUser(confirmDialog.user.id, { status: "blocked" });
              showToast("User blocked successfully");
            }
            setConfirmDialog({ open: false, type: "delete", user: null });
            reload();
          } catch (e: any) {
            showToast(e.message || "Action failed", "error");
          } finally {
            setConfirmSaving(false);
          }
        }}
        onCancel={() => setConfirmDialog({ open: false, type: "delete", user: null })}
        saving={confirmSaving}
      />

      {toast && (
        <div className={`fixed right-4 top-4 z-[999] rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-lg ${toast.kind === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"}`}>
          {toast.msg}
        </div>
      )}
    </section>
  );
}

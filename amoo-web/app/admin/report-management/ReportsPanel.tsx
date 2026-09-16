"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Pencil,
} from "lucide-react";
import { reportTypeStyles, statusStyles } from "./data";
import { api, type PageMeta } from "../../../lib/api";
import ConfirmDialog from "../shared/ConfirmDialog";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import { exportCSV } from "../shared/exportCSV";
import { sanitize } from "../../../lib/sanitize";
import { errorMessage } from "../../../lib/errors";
import type { Report, User } from "../../../lib/types";

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Tarot", value: "tarot" },
  { label: "Numerology", value: "numerology" },
  { label: "Kundali", value: "kundali" },
  { label: "Reiki", value: "reiki" },
];

const statusFilterOptions = [
  { label: "All Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Ready", value: "ready" },
  { label: "Rejected", value: "rejected" },
];

const reportTypeOptions = [
  { label: "Tarot", value: "tarot" },
  { label: "Numerology", value: "numerology" },
  { label: "Kundali", value: "kundali" },
  { label: "Reiki", value: "reiki" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

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

type PanelStats = {
  total: number;
  pending: number;
  ready: number;
  rejected: number;
  thisMonth: number;
  avgPerDay: number;
};

type PanelFns = {
  openCompose: () => void;
  stats: PanelStats;
};

type ListResponse<T> = { data?: T[]; meta?: PageMeta };

export default function ReportsPanel({
  onReady,
}: {
  onReady?: (fns: PanelFns) => void;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [list, setList] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Report | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [formValues, setFormValues] = useState({
    user_id: "",
    type: "numerology",
    title: "",
    content: "",
    file_url: "",
    status: "pending",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [, setUserList] = useState<User[]>([]);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  const [toast, setToast] = useState<{
    msg: string;
    kind: "success" | "error";
  } | null>(null);
  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReports = useCallback(() => {
    setLoading(true);
    setError("");
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("pageSize", String(limit));
    if (typeFilter) q.set("type", typeFilter);
    if (statusFilter) q.set("status", statusFilter);
    if (search.trim()) q.set("search", search.trim());

    api.admin
      .getReports(`?${q.toString()}`)
      .then((res: ListResponse<Report>) => {
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
  }, [page, limit, typeFilter, statusFilter, search]);

  const stats = useMemo<PanelStats>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const pending = list.filter((r) => r.status === "pending").length;
    const ready = list.filter((r) => r.status === "ready").length;
    const rejected = list.filter((r) => r.status === "rejected").length;

    const thisMonth = list.filter((r) => {
      const date = new Date(r.created_at);
      return date.getFullYear() === year && date.getMonth() === month;
    }).length;

    const daysPassed = now.getDate();

    return {
      total: meta.total,
      pending,
      ready,
      rejected,
      thisMonth,
      avgPerDay:
        daysPassed > 0 ? Number((thisMonth / daysPassed).toFixed(1)) : 0,
    };
  }, [list, meta.total]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const loadUsers = useCallback(() => {
    api.admin
      .getUsers("page=1&pageSize=100")
      .then((res: ListResponse<User>) => {
        const items = res?.data ?? res ?? [];
        if (Array.isArray(items)) setUserList(items);
      })
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormValues({
      user_id: "",
      type: "numerology",
      title: "",
      content: "",
      file_url: "",
      status: "pending",
    });
    setFormErrors({});
    loadUsers();
    setModalOpen(true);
  };

  const openEdit = (report: Report) => {
    setEditing(report);
    setFormValues({
      user_id: String(report.user_id ?? ""),
      type: String(report.type ?? "numerology"),
      title: String(report.title ?? ""),
      content: String(report.content ?? ""),
      file_url: String(report.file_url ?? ""),
      status: String(report.status ?? "pending"),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!editing && !formValues.user_id) errs.user_id = "User is required";
    if (!formValues.title) errs.title = "Title is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.admin.updateReport(editing.id, {
          title: String(formValues.title),
          content: String(formValues.content ?? ""),
          status: String(formValues.status ?? "pending"),
          file_url: String(formValues.file_url ?? ""),
        });
        setSaving(false);
        setModalOpen(false);
        loadReports();
        showToast("Report updated successfully");
      } else {
        const result = await api.admin.createReport({
          user_id: Number(formValues.user_id),
          type: String(formValues.type),
          title: String(formValues.title),
          content: String(formValues.content ?? ""),
        });
        if (!formValues.content) {
          const reportId = result?.id || result?.data?.id;
          if (reportId) {
            pollIntervalRef.current = setInterval(async () => {
              try {
                const res = await api.admin.getReport(reportId);
                const report = res?.data || res;
                if (report && report.status !== "pending") {
                  if (pollIntervalRef.current)
                    clearInterval(pollIntervalRef.current);
                  if (pollTimeoutRef.current)
                    clearTimeout(pollTimeoutRef.current);
                  pollIntervalRef.current = null;
                  pollTimeoutRef.current = null;
                  setSaving(false);
                  setModalOpen(false);
                  loadReports();
                  showToast("Report generated successfully");
                }
              } catch {
                /* continue polling */
              }
            }, 2000);
            pollTimeoutRef.current = setTimeout(() => {
              if (pollIntervalRef.current)
                clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
              pollTimeoutRef.current = null;
              setSaving(false);
              setModalOpen(false);
              loadReports();
              showToast("Report created — generation still in progress");
            }, 30000);
            return;
          }
        }
        setSaving(false);
        setModalOpen(false);
        loadReports();
        showToast("Report created successfully");
      }
    } catch (e: unknown) {
      setFormErrors({ _submit: errorMessage(e, "Failed to save") });
      setSaving(false);
    }
  };

  const handleDeleteClick = (report: Report) => {
    setDeleting(report);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setDeleteSaving(true);
    try {
      await api.admin.deleteReport(deleting.id);
      setConfirmOpen(false);
      setDeleting(null);
      loadReports();
      showToast("Report deleted successfully");
    } catch (e: unknown) {
      showToast(errorMessage(e, "Failed to delete"), "error");
    } finally {
      setDeleteSaving(false);
    }
  };

  // Expose controls to parent
  useEffect(() => {
    if (onReady) {
      // onReady({ openCompose: openCreate });
      onReady({
        openCompose: openCreate,
        stats,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady, stats]);

  const modalFields: ModalField[] = useMemo(() => {
    const cols: ModalField[] = [];
    if (!editing) {
      cols.push({
        name: "user_id",
        label: "User",
        type: "text",
        placeholder: "Select user...",
      });
    }
    if (!editing) {
      cols.push({
        name: "type",
        label: "Report Type",
        type: "select",
        options: reportTypeOptions,
      });
    }
    cols.push(
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Report title",
      },
      {
        name: "content",
        label: "Content (leave blank to auto-generate)",
        type: "textarea",
      },
      {
        name: "file_url",
        label: "File URL (optional)",
        type: "text",
        placeholder: "https://...",
      },
    );
    return cols;
  }, [editing]);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.kind === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-[10px]">
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9D98AA]"
            strokeWidth={2.2}
          />
          <input
            type="text"
            placeholder="Search by title or user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-[38px] w-full rounded-[9px] border border-[#E7E5EF] bg-white pl-[34px] pr-3 text-[12.5px] text-[#1D1630] placeholder:text-[#9D98AA] outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-[38px] appearance-none rounded-[9px] border border-[#E7E5EF] bg-white pl-[12px] pr-[32px] text-[12.5px] text-[#1D1630] outline-none focus:border-[#7C3AED]"
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#9D98AA]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-[38px] appearance-none rounded-[9px] border border-[#E7E5EF] bg-white pl-[12px] pr-[32px] text-[12.5px] text-[#1D1630] outline-none focus:border-[#7C3AED]"
          >
            {statusFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#9D98AA]"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            exportCSV(
              list.map((r) => ({ ...r })),
              "reports-export.csv",
            )
          }
          className="flex h-[38px] items-center gap-2 rounded-[9px] border border-[#E7E5EF] bg-white px-[14px] text-[12px] font-medium text-[#3D3752] hover:bg-[#F7F6FB]"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center text-[12.5px] text-[#8B879C]">
            No reports found.
          </div>
        ) : (
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-[#EEEDF4] bg-[#F8F7FC] text-[11px] font-medium uppercase text-[#8B879C]">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">ID</th>
                <th className="whitespace-nowrap px-4 py-3">User ID</th>
                <th className="whitespace-nowrap px-4 py-3">Type</th>
                <th className="whitespace-nowrap px-4 py-3">Title</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Created</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r: Report) => {
                const dt = fmtDateTime(r.created_at);
                const typeClass =
                  reportTypeStyles[(r.type ?? "").toLowerCase()] ??
                  "bg-[#F0EAFB] text-[#7C3AED]";
                const statClass =
                  statusStyles[r.status] ?? "bg-[#F0EAFB] text-[#7C3AED]";
                return (
                  <tr
                    key={r.id}
                    className="border-b border-[#F1F0F7] last:border-0 hover:bg-[#FAF9FE]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#3D3752]">
                      {r.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#6B6580]">
                      {r.user_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-block rounded-[6px] px-[9px] py-[3px] text-[11px] font-medium ${typeClass}`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[#1D1630]">
                      {sanitize(r.title)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-block rounded-[6px] px-[9px] py-[3px] text-[11px] font-medium ${statClass}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#8B879C]">
                      <span className="block">{dt.date}</span>
                      <span className="block text-[11px]">{dt.time}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-lg p-2 text-[#8B879C] hover:bg-[#F3F0FA] hover:text-[#7C3AED]"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(r)}
                          className="rounded-lg p-2 text-[#8B879C] hover:bg-[#FDE8E8] hover:text-[#EF4444]"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[#8B879C]">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="appearance-none rounded-[6px] border border-[#E7E5EF] bg-white px-2 py-1 text-[12px] text-[#1D1630] outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>
            {meta.total === 0
              ? "0 entries"
              : `${(page - 1) * limit + 1}–${Math.min(page * limit, meta.total)} of ${meta.total}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#3D3752] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
            const start = Math.max(1, page - 2);
            const p = start + i;
            if (p > meta.totalPages) return null;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[12px] font-medium ${
                  p === page
                    ? "bg-[#7C3AED] text-white"
                    : "border border-[#E7E5EF] bg-white text-[#3D3752]"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-[#E7E5EF] bg-white text-[#3D3752] disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Report" : "Create Report"}
        fields={
          editing
            ? [
                {
                  name: "title",
                  label: "Title",
                  type: "text",
                  placeholder: "Report title",
                },
                { name: "content", label: "Content", type: "textarea" },
                {
                  name: "file_url",
                  label: "File URL (optional)",
                  type: "text",
                  placeholder: "https://...",
                },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  options: [
                    { label: "Pending", value: "pending" },
                    { label: "Ready", value: "ready" },
                    { label: "Rejected", value: "rejected" },
                  ],
                },
              ]
            : modalFields
        }
        values={formValues}
        errors={formErrors}
        saving={saving}
        onChange={(name, value) =>
          setFormValues((prev) => ({ ...prev, [name]: value }))
        }
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Report"
        message={`Are you sure you want to delete "${deleting?.title || "this report"}"? This action cannot be undone.`}
        saving={deleteSaving}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleting(null);
        }}
      />
    </>
  );
}

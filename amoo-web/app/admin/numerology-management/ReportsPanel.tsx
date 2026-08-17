"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Eye,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { reportTypeStyles, statusStyles } from "./data";
import { api, type PageMeta } from "../../../lib/api";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import { exportCSV } from "../shared/exportCSV";
import { sanitize } from "../../../lib/sanitize";
import { errorMessage } from "../../../lib/errors";

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const statusLabelMap: Record<string, string> = {
  pending: "Pending",
  active: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const tabs = [
  { label: "All Reports", active: true },
  { label: "Today's Reports" },
  { label: "Name Corrections" },
  { label: "Name Suggestions" },
  { label: "Custom Reports" },
  { label: "Archived" },
];

const selects = ["All Services", "All Report Types", "All Status"];

function fmt(iso: string) {
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

interface RawReport {
  id: number;
  user_id?: number;
  type?: string;
  title?: string;
  content?: string;
  file_url?: string;
  status?: string;
  created_at?: string;
  user?: { name?: string; email?: string };
  [key: string]: unknown;
}

interface DisplayRow {
  id: string;
  rawId: number;
  client: { name: string; email: string; phone: string };
  subject: { name: string; birth: string };
  master: { name: string; role: string };
  type: string;
  date: string;
  time: string;
  status: string;
  amount: string;
}

type ListResponse<T> = { data?: T[]; meta?: PageMeta };

function toRow(r: RawReport): DisplayRow {
  const { date, time } = fmt(r.created_at ?? "");
  return {
    id: `RPT-${r.id}`,
    rawId: r.id,
    client: { name: r.title || "Client", email: "", phone: "" },
    subject: { name: r.type || "Numerology", birth: "" },
    master: { name: "System", role: "Auto-generated" },
    type: r.type ?? "full",
    date,
    time,
    status: statusLabelMap[r.status ?? ""] || r.status || "Pending",
    amount: "-",
  };
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-[8px] bg-[#16A34A] px-4 py-2.5 text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(22,163,74,.3)]">
      {message}
    </div>
  );
}

export default function ReportsPanel() {
  const [list, setList] = useState<DisplayRow[] | null>(null);
  const [rawReports, setRawReports] = useState<RawReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawReport | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.admin
      .getReports()
      .then((data: ListResponse<RawReport> | RawReport[]) => {
        const items: RawReport[] = Array.isArray(data)
          ? data
          : (data?.data ?? []);
        const meta = Array.isArray(data) ? undefined : data?.meta;
        if (meta?.total) setTotal(meta.total);
        setRawReports(items);
        if (Array.isArray(items) && items.length) {
          setList(items.map(toRow));
        }
      })
      .catch((e: unknown) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reportRows = list || [];

  const addFields: ModalField[] = useMemo(
    () => [
      {
        name: "user_id",
        label: "User ID",
        type: "number",
        placeholder: "Enter user ID",
        required: true,
        min: 1,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Report title",
        required: true,
      },
      {
        name: "content",
        label: "Content",
        type: "textarea",
        placeholder: "Report content...",
        full: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
    ],
    [],
  );

  const editFields: ModalField[] = useMemo(
    () => [
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Report title",
        required: true,
      },
      {
        name: "content",
        label: "Content",
        type: "textarea",
        placeholder: "Report content...",
        full: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      {
        name: "file_url",
        label: "File URL",
        type: "text",
        placeholder: "https://...",
        full: true,
      },
    ],
    [],
  );

  const handleAdd = () => {
    setEditing(null);
    setFormValues({ user_id: "", title: "", content: "", status: "pending" });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = (row: DisplayRow) => {
    const raw = rawReports.find((r) => r.id === row.rawId);
    if (!raw) return;
    setEditing(raw);
    setFormValues({
      title: raw.title ?? "",
      content: raw.content ?? "",
      status: raw.status ?? "pending",
      file_url: raw.file_url ?? "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDelete = (row: DisplayRow) => {
    setDeletingId(row.rawId);
    setConfirmOpen(true);
  };

  const handleExport = () => {
    exportCSV(
      rawReports.map((r) => ({
        title: r.title ?? "",
        content: r.content ?? "",
        status: r.status ?? "",
        user_name: r.user?.name ?? "",
        created_at: r.created_at ?? "",
      })),
      "numerology-reports.csv",
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!editing) {
      const uid = Number(formValues.user_id);
      if (!formValues.user_id || isNaN(uid) || uid < 1) {
        errs.user_id = "Valid user ID is required";
      }
    }
    if (!String(formValues.title ?? "").trim()) {
      errs.title = "Title is required";
    }
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return false;
    }
    setFormErrors({});
    return true;
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
        load();
        setToast("Report updated successfully");
      } else {
        const result = await api.admin.createReport({
          user_id: Number(formValues.user_id),
          type: "numerology",
          title: String(formValues.title),
          content: String(formValues.content ?? ""),
        });
        // If content was empty, the generator fires async — poll until ready
        if (!formValues.content) {
          const reportId = result?.id || result?.data?.id;
          if (reportId) {
            const poll = setInterval(async () => {
              try {
                const res = await api.admin.getReport(reportId);
                const report = res?.data || res;
                if (report && report.status !== "pending") {
                  clearInterval(poll);
                  setSaving(false);
                  setModalOpen(false);
                  load();
                  setToast("Report generated successfully");
                }
              } catch {
                // continue polling
              }
            }, 2000);
            setTimeout(() => {
              clearInterval(poll);
              setSaving(false);
              setModalOpen(false);
              load();
              setToast("Report created — generation still in progress");
            }, 30000);
            return;
          }
        }
        setSaving(false);
        setModalOpen(false);
        load();
        setToast("Report created successfully");
      }
    } catch (e: unknown) {
      setFormErrors({ _submit: errorMessage(e, "Failed to save") });
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingId == null) return;
    setSaving(true);
    try {
      await api.admin.deleteReport(deletingId);
      setConfirmOpen(false);
      setDeletingId(null);
      load();
      setToast("Report deleted successfully");
    } catch (e: unknown) {
      setToast(errorMessage(e, "Failed to delete"));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <svg
          className="h-6 w-6 animate-spin text-[#7C3AED]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="32"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center py-10 text-[13px] text-[#EF4444]">
        {error}
      </div>
    );

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <section className="overflow-hidden rounded-[12px] border border-[#EFEDF4] bg-white shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
        {/* Tabs */}
        <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-[#EFEDF4] px-4">
          {tabs.map((t) => (
            <button
              key={t.label}
              type="button"
              className={`relative flex shrink-0 items-center gap-[6px] whitespace-nowrap py-[14px] text-[12px] ${
                t.active
                  ? "font-semibold text-[#5B21B6]"
                  : "font-medium text-[#8B879C]"
              }`}
            >
              {t.label}
              {t.active ? (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#5B21B6]" />
              ) : null}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-[10px] px-4 pt-[14px] pb-2">
          <div className="flex h-[36px] w-full max-w-[204px] items-center rounded-[8px] border border-[#E7E5EF] bg-white px-3">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
            />
            <Search size={14} className="shrink-0 text-[#4A3B63]" />
          </div>

          {selects.map((s) => (
            <button
              key={s}
              type="button"
              className="flex h-[36px] w-[112px] items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
            >
              {s}
              <ChevronDown size={14} className="text-[#8B879C]" />
            </button>
          ))}

          <button
            type="button"
            className="flex h-[36px] items-center gap-3 rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
          >
            01 May 2025 &nbsp;-&nbsp; 18 May 2025
            <Calendar size={14} className="text-[#8B879C]" />
          </button>

          <button
            type="button"
            className="flex h-[36px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
          >
            <SlidersHorizontal size={13} className="text-[#4A3B63]" />
            Filters
          </button>

          <div className="ml-auto flex items-center gap-[8px]">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-[36px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557] hover:bg-[#F7F6FB]"
            >
              <Download size={13} />
              Export
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex h-[36px] items-center gap-[6px] rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-3 text-[11px] font-medium text-white shadow-[0_2px_8px_rgba(109,40,217,.25)] hover:shadow-[0_4px_12px_rgba(109,40,217,.35)]"
            >
              <Plus size={14} />
              Add Report
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="border-y border-[#EFEDF4] bg-[#FBFAFD]">
                <th className="w-[38px] py-[11px] pl-4 text-left">
                  <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#D6D3E0] bg-white" />
                </th>
                {[
                  "Report ID",
                  "Client Details",
                  "Report Type",
                  "Name / Birth Details",
                  "Generated By",
                  "Date & Time",
                  "Status",
                  "Amount",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap py-[11px] pr-4 text-left text-[11px] font-semibold text-[#4A4557]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {reportRows.map((r) => {
                const type =
                  reportTypeStyles[r.type as keyof typeof reportTypeStyles] ||
                  reportTypeStyles.full;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-[#F2F0F7] last:border-b-0 hover:bg-[#FCFBFE]"
                  >
                    <td className="py-[13px] pl-4 align-middle">
                      <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#D6D3E0] bg-white" />
                    </td>

                    <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11.5px] font-semibold text-[#6D28D9]">
                      {r.id}
                    </td>

                    <td className="py-[13px] pr-4 align-middle">
                      <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#1B1630]">
                        {sanitize(r.client.name)}
                      </p>
                      <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                        {sanitize(r.client.email)}
                      </p>
                      <p className="whitespace-nowrap text-[10px] text-[#8B879C]">
                        {sanitize(r.client.phone)}
                      </p>
                    </td>

                    <td className="py-[13px] pr-4 align-middle">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-[6px] border px-[8px] py-[4px] text-[10.5px] font-medium ${type.className}`}
                      >
                        {type.label}
                      </span>
                    </td>

                    <td className="py-[13px] pr-4 align-middle">
                      <p className="whitespace-nowrap text-[11.5px] font-medium text-[#1B1630]">
                        {sanitize(r.subject.name)}
                      </p>
                      <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                        {r.subject.birth}
                      </p>
                    </td>

                    <td className="py-[13px] pr-4 align-middle">
                      <p className="whitespace-nowrap text-[11.5px] font-medium text-[#1B1630]">
                        {sanitize(r.master.name)}
                      </p>
                      <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                        {r.master.role}
                      </p>
                    </td>

                    <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                      <p className="text-[11px] font-medium text-[#1B1630]">
                        {r.date}
                      </p>
                      <p className="mt-[1px] text-[10px] text-[#8B879C]">
                        {r.time}
                      </p>
                    </td>

                    <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                      <span
                        className={`inline-flex items-center justify-center rounded-[6px] px-[10px] py-[5px] text-[10.5px] font-semibold ${
                          statusStyles[r.status as keyof typeof statusStyles] ||
                          statusStyles.Pending
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11.5px] font-semibold text-[#1B1630]">
                      {r.amount}
                    </td>

                    <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                      <div className="flex items-center gap-[6px]">
                        <button
                          type="button"
                          className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63] hover:bg-[#F7F6FB]"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(r)}
                          className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63] hover:bg-[#F7F6FB]"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r)}
                          className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#EF4444] hover:bg-[#FEF2F2]"
                        >
                          <Trash2 size={13} />
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
        <div className="flex flex-wrap items-center gap-3 border-t border-[#EFEDF4] px-4 py-[14px]">
          <p className="text-[11.5px] text-[#8B879C]">
            Showing 1 to 10 of{" "}
            {(total || reportRows.length).toLocaleString("en-IN")} reports
          </p>

          <div className="ml-auto flex items-center gap-[6px]">
            <button
              type="button"
              className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#8B879C]"
            >
              <ChevronLeft size={14} />
            </button>

            {["1", "2", "3", "4", "5"].map((p) => (
              <button
                key={p}
                type="button"
                className={`grid h-[28px] w-[28px] place-items-center rounded-[6px] border text-[11px] font-medium ${
                  p === "1"
                    ? "border-[#4C1D95] bg-[#4C1D95] text-white"
                    : "border-[#E7E5EF] bg-white text-[#4A4557]"
                }`}
              >
                {p}
              </button>
            ))}

            <span className="px-[2px] text-[11px] text-[#8B879C]">...</span>

            <button
              type="button"
              className="grid h-[28px] w-[34px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[11px] font-medium text-[#4A4557]"
            >
              257
            </button>

            <button
              type="button"
              className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A4557]"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            type="button"
            className="flex h-[30px] w-[104px] items-center justify-between rounded-[6px] border border-[#E7E5EF] bg-white px-[10px] text-[11px] font-medium text-[#4A4557]"
          >
            10 / page
            <ChevronDown size={13} className="text-[#8B879C]" />
          </button>
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Report" : "Add Report"}
        fields={editing ? editFields : addFields}
        values={formValues}
        onChange={(name, value) => {
          setFormValues((prev) => ({ ...prev, [name]: value }));
          setFormErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
        }}
        onSave={handleSave}
        saving={saving}
        onClose={() => setModalOpen(false)}
        errors={formErrors}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
        saving={saving}
      />
    </>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { sessionTypeStyles, statusStyles, paymentStyles } from "./data";
import { api } from "../../../lib/api";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import { exportCSV } from "../shared/exportCSV";

const tabs = [
  { label: "All Sessions", active: true },
  { label: "Upcoming" },
  { label: "Ongoing" },
  { label: "Completed" },
  { label: "Distance Healing" },
  { label: "Cancelled" },
];

const selects = ["All Reiki Masters", "All Session Types", "All Status"];

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function fmtRK(iso: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

type RawReport = {
  id: number;
  user_id: number;
  service_id: number | null;
  type: string;
  title: string;
  content: string;
  file_url: string;
  status: string;
  created_at: string;
  user?: { name?: string; email?: string };
};

type Toast = { id: number; message: string; kind: "success" | "error" };

export default function SessionsPanel({ onReady }: { onReady?: (fns: { openCreate: () => void; exportData: () => void }) => void } = {}) {
  const [rawList, setRawList] = useState<RawReport[]>([]);
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawReport | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");
    api.admin
      .getReports()
      .then((data: any) => {
        const items = data?.data ?? data ?? [];
        if (data?.meta?.total) setTotal(data.meta.total);
        const rows: RawReport[] = items.filter((r: any) =>
          (r.type || "").toLowerCase().includes("reiki")
        );
        const src = rows.length ? rows : items;
        setRawList(src);
        if (src.length) {
          setList(
            src.map((r: RawReport) => {
              const { date, time } = fmtRK(r.created_at);
              return {
                id: `REIKI-${r.id}`,
                rawId: r.id,
                client: { name: r.user?.name || r.title || "Client", email: r.user?.email || "", phone: "" },
                master: { name: "Reiki Master", role: "Healer" },
                type: "distance" as const,
                date,
                time,
                duration: "45 mins",
                status: capitalize(r.status || "pending"),
                amount: "-",
                payment: "Paid" as const,
                raw: r,
              };
            })
          );
        } else {
          setList([]);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sessionRows = list || [];

  const addFields: ModalField[] = [
    { name: "user_id", label: "User ID", type: "number", required: true, placeholder: "Enter user ID", min: 1 },
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Session title", full: true },
    { name: "content", label: "Content", type: "textarea", placeholder: "Session details...", full: true },
    { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Select status" },
  ];

  const editFields: ModalField[] = [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Session title", full: true },
    { name: "content", label: "Content", type: "textarea", placeholder: "Session details...", full: true },
    { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Select status" },
    { name: "file_url", label: "File URL", type: "text", placeholder: "https://...", full: true },
  ];

  const handleOpenAdd = () => {
    setEditing(null);
    setFormValues({ user_id: "", title: "", content: "", status: "pending" });
    setModalOpen(true);
  };

  useEffect(() => {
    onReady?.({ openCreate: handleOpenAdd, exportData: handleExport });
  });

  const handleOpenEdit = (raw: RawReport) => {
    setEditing(raw);
    setFormValues({
      title: raw.title || "",
      content: raw.content || "",
      status: raw.status || "pending",
      file_url: raw.file_url || "",
    });
    setModalOpen(true);
  };

  const handleFormChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (editing) {
      if (!formValues.title) return;
      setSaving(true);
      try {
        await api.admin.updateReport(editing.id, {
          title: String(formValues.title),
          content: String(formValues.content),
          status: String(formValues.status),
          file_url: String(formValues.file_url),
        });
        addToast("Session updated successfully");
        setModalOpen(false);
        loadData();
      } catch (e: any) {
        addToast(e.message || "Failed to update session", "error");
      } finally {
        setSaving(false);
      }
    } else {
      if (!formValues.user_id || !formValues.title) return;
      setSaving(true);
      try {
        const result = await api.admin.createReport({
          user_id: Number(formValues.user_id),
          type: "reiki",
          title: String(formValues.title),
          content: String(formValues.content),
        });
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
                  loadData();
                  addToast("Session generated successfully");
                }
              } catch { /* continue polling */ }
            }, 2000);
            setTimeout(() => {
              clearInterval(poll);
              setSaving(false);
              setModalOpen(false);
              loadData();
              addToast("Session created — generation still in progress");
            }, 30000);
            return;
          }
        }
        addToast("Session created successfully");
        setModalOpen(false);
        loadData();
      } catch (e: any) {
        addToast(e.message || "Failed to create session", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteClick = (rawId: number) => {
    setDeletingId(rawId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId === null) return;
    setSaving(true);
    try {
      await api.admin.deleteReport(deletingId);
      addToast("Session deleted successfully");
      setConfirmOpen(false);
      setDeletingId(null);
      loadData();
    } catch (e: any) {
      addToast(e.message || "Failed to delete session", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const rows = rawList.map((r) => ({
      title: r.title || "",
      content: r.content || "",
      status: r.status || "",
      user_name: r.user?.name || "",
      created_at: r.created_at || "",
    }));
    if (!rows.length) {
      addToast("No sessions to export", "error");
      return;
    }
    exportCSV(rows, "reiki-sessions.csv");
    addToast(`Exported ${rows.length} sessions`);
  };

  if (loading) return <div className="flex justify-center py-10"><svg className="h-6 w-6 animate-spin text-[#7C3AED]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /></svg></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;

  return (
    <section className="overflow-hidden rounded-[12px] border border-[#EFEDF4] bg-white shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[#EFEDF4] px-4 py-[12px]">
        <p className="text-[13px] font-semibold text-[#1F1836]">Reiki Sessions</p>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-[32px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-[12px] text-[11px] font-medium text-[#4A4557] hover:bg-[#F7F6FB]"
          >
            <Download size={13} />
            Export
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex h-[32px] items-center gap-[6px] rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[12px] text-[11px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)]"
          >
            <Plus size={14} />
            New Reiki Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-[#EFEDF4] px-4">
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-[10px] px-4 py-[14px]">
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
            className="flex h-[36px] w-[128px] items-center justify-between rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
          >
            {s}
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        ))}

        <button
          type="button"
          className="flex h-[36px] items-center gap-[10px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] font-medium text-[#4A4557]"
        >
          <SlidersHorizontal size={13} className="text-[#4A3B63]" />
          01 May 2025 &nbsp;-&nbsp; 18 May 2025
          <Calendar size={14} className="text-[#8B879C]" />
        </button>
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
                "Session ID",
                "Client Details",
                "Reiki Master",
                "Session Type",
                "Date & Time",
                "Duration",
                "Status",
                "Payment",
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
            {sessionRows.map((s) => {
              const type = sessionTypeStyles[s.type];
              return (
                <tr
                  key={s.id}
                  className="border-b border-[#F2F0F7] last:border-b-0 hover:bg-[#FCFBFE]"
                >
                  <td className="py-[13px] pl-4 align-middle">
                    <span className="block h-[14px] w-[14px] rounded-[4px] border border-[#D6D3E0] bg-white" />
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11.5px] font-semibold text-[#6D28D9]">
                    {s.id}
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <p className="whitespace-nowrap text-[11.5px] font-semibold text-[#1B1630]">
                      {s.client.name}
                    </p>
                    <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                      {s.client.email}
                    </p>
                    <p className="whitespace-nowrap text-[10px] text-[#8B879C]">
                      {s.client.phone}
                    </p>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <div className="flex items-center gap-[8px]">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        alt={s.master.name}
                        width={28}
                        height={28}
                        className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-[11.5px] font-medium text-[#1B1630]">
                          {s.master.name}
                        </p>
                        <p className="mt-[1px] whitespace-nowrap text-[10px] text-[#8B879C]">
                          {s.master.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-[13px] pr-4 align-middle">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-[6px] border px-[8px] py-[4px] text-[10.5px] font-medium ${type.className}`}
                    >
                      {type.label}
                    </span>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <p className="text-[11px] font-medium text-[#1B1630]">
                      {s.date}
                    </p>
                    <p className="mt-[1px] text-[10px] text-[#8B879C]">
                      {s.time}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle text-[11px] font-medium text-[#4A4557]">
                    {s.duration}
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <span
                      className={`inline-flex items-center justify-center rounded-[6px] px-[10px] py-[5px] text-[10.5px] font-semibold ${
                        statusStyles[s.status] || "bg-[#F3F0FA] text-[#6D28D9]"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <p className="text-[11.5px] font-semibold text-[#1B1630]">
                      {s.amount}
                    </p>
                    <p
                      className={`mt-[1px] text-[10px] font-medium ${
                        paymentStyles[s.payment] || "text-[#8B879C]"
                      }`}
                    >
                      {s.payment}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-[13px] pr-4 align-middle">
                    <div className="flex items-center gap-[6px]">
                      <button
                        type="button"
                        aria-label="View"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63] hover:bg-[#F7F6FB]"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => handleOpenEdit(s.raw)}
                        className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A3B63] hover:bg-[#F7F6FB]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => handleDeleteClick(s.rawId)}
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
          Showing 1 to 8 of {(total || sessionRows.length).toLocaleString("en-IN")} sessions
        </p>

        <div className="ml-auto flex items-center gap-[6px]">
          <button
            type="button"
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#8B879C]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          {["1", "2", "3", "4"].map((p) => (
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
            156
          </button>

          <button
            type="button"
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#4A4557]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
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

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Reiki Session" : "New Reiki Session"}
        fields={editing ? editFields : addFields}
        values={formValues}
        onChange={handleFormChange}
        onSave={handleSave}
        saving={saving}
        onClose={() => setModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        saving={saving}
      />

      {/* Toasts */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-[10px] border px-4 py-3 text-[12px] font-medium shadow-lg backdrop-blur-sm transition-all ${
              t.kind === "success"
                ? "border-[#BBF7D0] bg-white/95 text-[#15803D]"
                : "border-[#FECACA] bg-white/95 text-[#DC2626]"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={15} className="shrink-0" />
            ) : (
              <XCircle size={15} className="shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </section>
  );
}

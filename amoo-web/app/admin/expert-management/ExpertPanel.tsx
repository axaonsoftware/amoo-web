"use client";
import { memo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  KeyRound,
  Loader2,
  Eye,
  ToggleLeft,
} from "lucide-react";
import { api, unwrapList } from "../../../lib/api";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import SetPasswordDialog from "./SetPasswordDialog";
import { useToast } from "../shared/useToast";
import { exportCSV } from "../shared/exportCSV";
import { sanitize } from "../../../lib/sanitize";
import { specializationTone, statusTone } from "./data";
import { errorMessage } from "../../../lib/errors";
import type { Expert } from "../../../lib/types";

const expertFields: ModalField[] = [
  {
    name: "name",
    label: "Full Name",
    required: true,
    placeholder: "Full name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "Email address",
  },
  { name: "phone", label: "Phone", placeholder: "+91 phone number" },
  {
    name: "specialties",
    label: "Specialization",
    type: "select",
    required: true,
    options: [
      { label: "Astrology", value: "Astrology" },
      { label: "Numerology", value: "Numerology" },
      { label: "Tarot", value: "Tarot" },
      { label: "Healing", value: "Healing" },
      { label: "Vastu", value: "Vastu" },
      { label: "AI Services", value: "AI Services" },
      { label: "Spiritual", value: "Spiritual" },
    ],
  },
  {
    name: "experience",
    label: "Experience (years)",
    type: "number",
    placeholder: "e.g. 5",
  },
  {
    name: "hourly_rate",
    label: "Hourly Rate",
    type: "number",
    placeholder: "e.g. 999",
  },
  {
    name: "bio",
    label: "Bio",
    type: "textarea",
    full: true,
    placeholder: "Short bio or description",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

const avatarColors = [
  "from-[#7C3AED] to-[#5B21B6]",
  "from-[#DB2777] to-[#9D174D]",
  "from-[#0284C7] to-[#0369A1]",
  "from-[#16A34A] to-[#15803D]",
  "from-[#D97706] to-[#B45309]",
  "from-[#4F46E5] to-[#4338CA]",
  "from-[#059669] to-[#047857]",
  "from-[#E11D48] to-[#BE123C]",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function getAvatarBg(idx: number) {
  return avatarColors[idx % avatarColors.length];
}

type PanelFns = {
  openCreate: () => void;
  exportData: () => void;
};

type AdminExpert = Expert & {
  specialties?: string | null;
  experience?: string | number | null;
  hourly_rate?: string | number | null;
  sessions?: number | null;
};

const ExpertRow = memo(function ExpertRow({
  expert,
  idx,
  onEdit,
  onSetPassword,
  onDelete,
  onToggleStatus,
}: {
  expert: AdminExpert;
  idx: number;
  onEdit: (e: AdminExpert) => void;
  onSetPassword: (e: AdminExpert) => void;
  onDelete: (e: AdminExpert) => void;
  onToggleStatus: (e: AdminExpert) => void;
}) {
  return (
    <tr
      key={expert.id ?? idx}
      className="border-b border-[#FAF9FC] hover:bg-[#FAF9FC]/60"
    >
      <td className="px-[14px] py-[11px]">
        <div className="flex items-center gap-[10px]">
          <span
            className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarBg(idx)} text-[11px] font-bold text-white shadow-[0_2px_6px_rgba(0,0,0,.15)]`}
          >
            {getInitials(expert.name || "E")}
          </span>
          <div>
            <p className="font-medium text-[#1F1836]">
              {sanitize(expert.name)}
            </p>
            <p className="text-[10px] text-[#A5A2B5]">
              {sanitize(expert.email)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-[14px] py-[11px]">
        <span
          className={`inline-block rounded-full px-[10px] py-[3px] text-[10px] font-medium ${specializationTone[expert.specialties ?? ""] || "bg-[#F5F4F9] text-[#6B6480]"}`}
        >
          {expert.specialties || "—"}
        </span>
      </td>
      <td className="px-[14px] py-[11px] text-[11px] text-[#6B6480]">
        {expert.experience ? `${expert.experience} yrs` : "—"}
      </td>
      <td className="px-[14px] py-[11px] text-[11px] text-[#6B6480]">
        {expert.hourly_rate ? `₹${expert.hourly_rate}` : "—"}
      </td>
      <td className="px-[14px] py-[11px] text-[11px] font-medium text-[#D97706]">
        {expert.rating ? `★ ${expert.rating}` : "—"}
      </td>
      <td className="px-[14px] py-[11px] text-[11px] text-[#6B6480]">
        {expert.sessions ?? "—"}
      </td>
      <td className="px-[14px] py-[11px]">
        <span
          className={`inline-block rounded-full px-[10px] py-[3px] text-[10px] font-medium ${statusTone[expert.status] || "bg-[#F5F4F9] text-[#6B6480]"}`}
        >
          {expert.status || "—"}
        </span>
      </td>
      <td className="px-[14px] py-[11px]">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/expert-management/${expert.id}`}
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#3B82F6] hover:bg-[#EFF6FF]"
            title="View details"
          >
            <Eye size={13} strokeWidth={2} />
          </Link>
          <button
            onClick={() => onToggleStatus(expert)}
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#F59E0B] hover:bg-[#FEF3C7]"
            title={expert.status === "active" ? "Deactivate" : "Activate"}
            aria-label={`Toggle status for ${sanitize(expert.name) || "expert"}`}
          >
            <ToggleLeft size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => onEdit(expert)}
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#7C3AED] hover:bg-[#FAF7FF]"
            title="Edit"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => onSetPassword(expert)}
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#6D28D9] hover:bg-[#FAF7FF]"
            title="Set login password"
            aria-label={`Set login password for ${sanitize(expert.name) || "expert"}`}
          >
            <KeyRound size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => onDelete(expert)}
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#E7E5EF] bg-white text-[#EF4444] hover:bg-[#FEF2F2]"
            title="Delete"
            aria-label={`Delete ${sanitize(expert.name) || "expert"}`}
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function ExpertPanel({
  onReady,
  onChanged,
}: {
  onReady?: (fns: PanelFns) => void;
  onChanged?: (experts: AdminExpert[]) => void;
}) {
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminExpert | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminExpert | null>(null);
  const [deleting2, setDeleting2] = useState(false);

  const [passwordTarget, setPasswordTarget] = useState<AdminExpert | null>(
    null,
  );
  const { showToast, Toast } = useToast();

  const cancelled = useRef(false);

  const loadExperts = useCallback(async () => {
    cancelled.current = false;
    setLoading(true);
    try {
      const res = await api.admin.getExperts();
      const list = unwrapList<AdminExpert>(res);
      if (!cancelled.current) {
        setExperts(list);
        onChanged?.(list);
      }
    } catch {
      if (!cancelled.current) {
        setExperts([]);
        onChanged?.([]);
      }
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [onChanged]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  const openAdd = () => {
    setEditing(null);
    setValues({});
    setModalOpen(true);
  };

  const openEdit = (expert: AdminExpert) => {
    setEditing(expert);
    setValues({
      name: expert.name || "",
      email: expert.email || "",
      phone: expert.phone || "",
      specialties: expert.specialties || "",
      experience: String(expert.experience || ""),
      hourly_rate: String(expert.hourly_rate || ""),
      bio: expert.bio || "",
      status: expert.status || "active",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const required = ["name", "email"];
    for (const f of required) {
      if (!values[f]?.trim()) return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...values };
      if (body.experience) body.experience = Number(body.experience);
      if (body.hourly_rate) body.hourly_rate = Number(body.hourly_rate);
      if (editing) {
        await api.admin.updateExpert(editing.id, body);
      } else {
        await api.admin.createExpert(body);
      }
      setModalOpen(false);
      setEditing(null);
      setValues({});
      loadExperts();
    } catch (err: unknown) {
      alert(errorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleting2(true);
    try {
      await api.admin.deleteExpert(deleting.id);
      setConfirmOpen(false);
      setDeleting(null);
      loadExperts();
    } catch (err: unknown) {
      alert(errorMessage(err, "Delete failed"));
    } finally {
      setDeleting2(false);
    }
  };

  // Declared BEFORE handleExport, which reads it. It used to be declared ~20
  // lines below its own consumer: legal at runtime only because handleExport is
  // never called during render, but a temporal-dead-zone hazard the moment that
  // changes (and what react-hooks/immutability flags).
  //
  // The filter matches on `specialties`, the actual column. It compared
  // `e.specialization` — a field the `experts` table does not have and
  // EXPERT_SELECT never returns — so the Specialization dropdown could never
  // match anything and always emptied the table.
  const filtered = experts.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q);
    const matchSpec =
      !specializationFilter ||
      (e.specialties || "")
        .toLowerCase()
        .includes(specializationFilter.toLowerCase());
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchSpec && matchStatus;
  });

  const handleExport = useCallback(() => {
    if (!filtered.length) return;
    // Columns are the ones EXPERT_SELECT actually returns. `specialization`,
    // `experience`, `hourly_rate` and `sessions` do not exist on `experts`, so
    // those four columns exported as empty strings for every row.
    exportCSV(
      filtered.map((e) => ({
        Name: e.name,
        Email: e.email,
        Phone: e.phone || "",
        Title: e.role_title || "",
        Specialties: e.specialties || "",
        Rating: e.rating ?? "",
        Status: e.status || "",
        Joined: e.created_at || "",
      })),
      "experts",
    );
  }, [filtered]);

  // Was dependency-less, so it re-invoked the parent's callback on EVERY
  // render — each one handing the toolbar a fresh pair of closures.
  useEffect(() => {
    onReady?.({ openCreate: openAdd, exportData: handleExport });
  }, [onReady, handleExport]);

  const handleEditExpert = useCallback((e: AdminExpert) => openEdit(e), []);
  const handleSetPassword = useCallback(
    (e: AdminExpert) => setPasswordTarget(e),
    [],
  );
  const handleDeleteExpert = useCallback((e: AdminExpert) => {
    setDeleting(e);
    setConfirmOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    async (e: AdminExpert) => {
      try {
        await api.admin.updateExpert(e.id, {
          status: e.status === "active" ? "inactive" : "active",
        });
        showToast(
          `Expert ${e.status === "active" ? "deactivated" : "activated"}`,
        );
        loadExperts();
      } catch (err: unknown) {
        showToast(errorMessage(err, "Failed to update status"), "error");
      }
    },
    [loadExperts, showToast],
  );

  return (
    <>
      {/* Search and filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={15}
            className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#A5A2B5]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experts by name or email…"
            className="h-[36px] w-full rounded-[9px] border border-[#E7E5EF] bg-white pl-[32px] pr-3 text-[12px] text-[#1F1836] outline-none placeholder:text-[#B7B3C4] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#A5A2B5]" />
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="h-[36px] rounded-[9px] border border-[#E7E5EF] bg-white px-3 pr-8 text-[12px] text-[#1F1836] outline-none focus:border-[#7C3AED]"
          >
            <option value="">All Specializations</option>
            {Object.keys(specializationTone).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[36px] rounded-[9px] border border-[#E7E5EF] bg-white px-3 pr-8 text-[12px] text-[#1F1836] outline-none focus:border-[#7C3AED]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        <table className="w-full text-left text-[11.5px] text-[#1F1836]">
          <thead>
            <tr className="border-b border-[#EEEDF4] bg-[#FAF9FC]">
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Expert
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Specialization
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Experience
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Rate
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Rating
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Sessions
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Status
              </th>
              <th className="px-[14px] py-[10px] font-medium text-[#6B6480]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-[#A5A2B5]"
                >
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#7C3AED]" />
                  Loading experts…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-[12px] text-[#A5A2B5]"
                >
                  No experts found.
                </td>
              </tr>
            ) : (
              filtered.map((expert, idx) => (
                <ExpertRow
                  key={expert.id ?? idx}
                  expert={expert}
                  idx={idx}
                  onEdit={handleEditExpert}
                  onSetPassword={handleSetPassword}
                  onDelete={handleDeleteExpert}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Expert" : "Add New Expert"}
        fields={expertFields}
        values={values}
        onChange={(n, v) => setValues((prev) => ({ ...prev, [n]: v }))}
        onSave={handleSave}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Expert"
        message={`Are you sure you want to delete ${sanitize(deleting?.name) || "this expert"}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleting(null);
        }}
        saving={deleting2}
      />

      <SetPasswordDialog
        expert={passwordTarget}
        onClose={() => setPasswordTarget(null)}
        onDone={(msg) => {
          showToast(msg);
          loadExperts();
        }}
      />

      <Toast />
    </>
  );
}

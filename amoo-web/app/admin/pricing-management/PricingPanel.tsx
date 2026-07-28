"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { serviceTone, planTypeTone } from "./data";
import { api } from "../../../lib/api";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import { exportCSV } from "../shared/exportCSV";
import { errorMessage } from "../../../lib/errors";

type RawPackage = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  status: string;
  plan_type?: string;
  created_at?: string;
};

type Row = {
  id: number;
  name: string;
  sub: string;
  service: string;
  planType: string;
  price: string;
  priceRaw: number;
  duration: string;
  durationDaysRaw: number;
  status: string;
  bookings: string;
  _raw: RawPackage;
};

type Toast = { id: number; message: string; kind: "success" | "error" };

const allTabs = [
  { label: "All Plans", active: true },
  { label: "Service Packages" },
  { label: "Subscriptions" },
  { label: "Offers & Coupons" },
];

const planTypes = ["All Plan Types", "Subscription", "One-time"];
const statuses = ["All Status", "Active", "Inactive"];

const PAGE_SIZE = 10;

const PricingRow = memo(function PricingRow({
  r,
  onEdit,
  onDelete,
}: {
  r: Row;
  onEdit: (r: Row) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <tr key={r.id} className="border-b border-[#F2F1F7]">
      <td className="py-[12px] pl-3 pr-2">
        <div>
          <p className="text-[11.5px] font-semibold text-[#1F1836]">{r.name}</p>
          <p className="mt-[2px] text-[9.5px] text-[#8B879C]">{r.sub}</p>
        </div>
      </td>

      <td className="px-2 py-[12px]">
        <span
          className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${
            serviceTone[r.service as keyof typeof serviceTone] || "bg-[#E4F1FD] text-[#0E7FBF]"
          }`}
        >
          {r.service}
        </span>
      </td>

      <td className="px-2 py-[12px]">
        <span
          className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${
            planTypeTone[r.planType as keyof typeof planTypeTone] || "bg-[#F1EAFE] text-[#7C3AED]"
          }`}
        >
          {r.planType}
        </span>
      </td>

      <td className="px-2 py-[12px] text-[11.5px] font-semibold text-[#1F1836]">{r.price}</td>

      <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">{r.duration}</td>

      <td className="px-2 py-[12px]">
        <span
          className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${
            r.status === "Active"
              ? "bg-[#E6F7EE] text-[#16A34A]"
              : "bg-[#FDE8E8] text-[#EF4444]"
          }`}
        >
          {r.status}
        </span>
      </td>

      <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">{r.bookings}</td>

      <td className="py-[12px] pl-2 pr-3">
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={() => onEdit(r)}
            title="Edit"
            className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#F7F6FB]"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(r.id)}
            title="Delete"
            className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#FDE8E8] hover:text-[#EF4444]"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function PricingPanel({
  onReady,
}: {
  onReady?: (fns: { openCreate: () => void; exportData: () => void }) => void;
} = {}) {
  const [rawList, setRawList] = useState<RawPackage[]>([]);
  const [list, setList] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [services, setServices] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawPackage | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    Promise.all([api.admin.getPackages(), api.admin.getServices()])
      .then(([pkgData, svcData]: any[]) => {
        const pkgItems = (pkgData?.data ?? pkgData) as RawPackage[];
        if (pkgData?.meta?.total) setTotal(pkgData.meta.total);
        const svcItems = Array.isArray(svcData?.data ?? svcData) ? (svcData?.data ?? svcData) : [];
        const svcNames = svcItems.map((s: any) => s.name || s.title).filter(Boolean);
        setServices(svcNames);

        if (Array.isArray(pkgItems)) {
          setRawList(pkgItems);
          setList(
            pkgItems.map((p: any) => {
              const matchedSvc = svcNames.find(
                (name: string) => name.toLowerCase() === (p.service_name || "").toLowerCase()
              );
              return {
                id: p.id,
                name: p.name,
                sub: p.description || "",
                service: matchedSvc || "All",
                planType: p.plan_type || "Subscription",
                price: `₹ ${Number(p.price).toLocaleString("en-IN")}`,
                priceRaw: Number(p.price),
                duration: p.duration_days ? `${p.duration_days} days` : "-",
                durationDaysRaw: p.duration_days || 0,
                status: p.status === "active" ? "Active" : p.status === "inactive" ? "Inactive" : p.status,
                bookings: "-",
                _raw: p,
              };
            })
          );
        }
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const rows = list || [];

  const filteredRows = rows.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.sub.toLowerCase().includes(q)) return false;
    }
    if (activeTab === 1 && r.planType !== "One-time") return false;
    if (activeTab === 2 && r.planType !== "Subscription") return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setFormValues({
      name: "",
      description: "",
      price: "",
      duration_days: "",
      status: "active",
      plan_type: "Subscription",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (row: Row) => {
    const raw = row._raw;
    setEditing(raw);
    setFormValues({
      name: raw.name || "",
      description: raw.description || "",
      price: raw.price,
      duration_days: raw.duration_days || "",
      status: raw.status === "Active" ? "active" : raw.status === "Inactive" ? "inactive" : raw.status,
      plan_type: raw.plan_type || "Subscription",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!formValues.name) errs.name = "Name is required";
    if (formValues.price === "" || formValues.price === undefined) errs.price = "Price is required";
    if (Number(formValues.price) < 0) errs.price = "Price must be ≥ 0";
    if (formValues.duration_days === "" || formValues.duration_days === undefined) errs.duration_days = "Duration is required";
    if (Number(formValues.duration_days) < 1) errs.duration_days = "Duration must be ≥ 1 day";
    if (!formValues.status) errs.status = "Status is required";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    try {
      const body = {
        name: String(formValues.name),
        description: String(formValues.description),
        price: Number(formValues.price),
        duration_days: Number(formValues.duration_days),
        status: String(formValues.status),
        plan_type: String(formValues.plan_type),
      };
      if (editing) {
        await api.admin.updatePackage(editing.id, body);
        addToast("Package updated successfully");
      } else {
        await api.admin.createPackage(body);
        addToast("Package created successfully");
      }
      setModalOpen(false);
      loadData();
    } catch (e: unknown) {
      addToast(errorMessage(e, "Failed to save package"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await api.admin.deletePackage(deletingId);
      addToast("Package deleted successfully");
      setConfirmOpen(false);
      setDeletingId(null);
      loadData();
    } catch (e: unknown) {
      addToast(errorMessage(e, "Failed to delete package"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const rows = filteredRows.map((r) => ({
      name: r.name,
      description: r.sub,
      service: r.service,
      planType: r.planType,
      price: r.priceRaw,
      duration: r.duration,
      status: r.status,
    }));
    if (!rows.length) { addToast("No plans to export", "error"); return; }
    exportCSV(rows, "pricing-plans.csv");
    addToast(`Exported ${rows.length} plans`);
  };

  // Registered AFTER the handlers it passes up. It previously sat ~100 lines
  // above `handleExport` with no dependency array, so it both referenced a
  // not-yet-initialised binding (a temporal-dead-zone hazard) and re-ran on
  // every single render, handing the parent toolbar new closures each time.
  useEffect(() => {
    onReady?.({ openCreate: handleOpenAdd, exportData: handleExport });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleOpenAdd and
    // handleExport are redefined every render; depending on them would restore
    // the every-render loop this fix removes. They close over state that is
    // only read when the user clicks, so a stable identity is not required.
  }, [onReady]);

  const modalFields: ModalField[] = [
    { name: "name", label: "Plan Name", type: "text", required: true, placeholder: "e.g. Gold Package", full: true },
    { name: "description", label: "Description", type: "textarea", placeholder: "Describe the plan...", full: true },
    { name: "price", label: "Price (₹)", type: "number", required: true, min: 0, placeholder: "0" },
    { name: "duration_days", label: "Duration (days)", type: "number", required: true, min: 1, placeholder: "30" },
    { name: "plan_type", label: "Plan Type", type: "select", options: [{ label: "Subscription", value: "Subscription" }, { label: "One-time", value: "One-time" }] },
    { name: "status", label: "Status", type: "select", required: true, options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
  ];

  const handleEditPlan = useCallback((r: Row) => handleOpenEdit(r), []);
  const handleDeletePlan = useCallback((id: number) => { setDeletingId(id); setConfirmOpen(true); }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <svg className="h-6 w-6 animate-spin text-[#7C3AED]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" />
        </svg>
      </div>
    );
  if (error) return <div className="flex justify-center py-10 text-[13px] text-[#EF4444]">{error}</div>;

  return (
    <>
      <section className="rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
        {/* Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-[#EEEDF4] px-6">
          {allTabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`shrink-0 border-b-2 pb-[11px] pt-[13px] text-[12px] ${
                activeTab === i
                  ? "border-[#7C3AED] font-medium text-[#7C3AED]"
                  : "border-transparent font-normal text-[#7C748C] hover:text-[#2E2A3B]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-[18px] px-6 pb-[14px] pt-[16px]">
          <div className="flex h-[34px] w-full max-w-[200px] items-center rounded-[8px] border border-[#E7E5EF] pl-3 pr-2">
            <input
              type="text"
              placeholder="Search plan name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
            />
            <Search size={14} className="shrink-0 text-[#6B6480]" />
          </div>

          <button
            type="button"
            className="ml-auto flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-[14px] text-[11px] text-[#3D3752]"
          >
            <SlidersHorizontal size={13} className="text-[#6B6480]" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-6">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-y border-[#EEEDF4] bg-[#FAFAFC]">
                {["Plan Name", "Service", "Plan Type", "Price", "Duration", "Status", "Bookings", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-[11px] text-left text-[10.5px] font-medium text-[#6B6480] first:pl-3 last:pr-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((r) => (
                <PricingRow
                  key={r.id}
                  r={r}
                  onEdit={handleEditPlan}
                  onDelete={handleDeletePlan}
                />
              ))}
              {!filteredRows.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[12px] text-[#8B879C]">
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-[16px] pt-[14px]">
          <p className="text-[10.5px] text-[#8B879C]">
            Showing {filteredRows.length ? 1 : 0} to {Math.min(PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length.toLocaleString("en-IN")} plans
          </p>
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Package" : "Create New Package"}
        fields={modalFields}
        values={formValues}
        onChange={(name, value) => { setFormValues((prev) => ({ ...prev, [name]: value })); setFormErrors((prev) => { const n = { ...prev }; delete n[name]; return n; }); }}
        onSave={handleSave}
        saving={saving}
        onClose={() => setModalOpen(false)}
        errors={formErrors}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        saving={saving}
      />

      {toasts.map((t) => (
        <div
          key={t.id}
          className={`fixed right-4 top-4 z-[999] rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-lg ${
            t.kind === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"
          }`}
        >
          {t.message}
        </div>
      ))}
    </>
  );
}

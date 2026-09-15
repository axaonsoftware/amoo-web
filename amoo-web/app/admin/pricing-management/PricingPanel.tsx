"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, Pencil, Trash2 } from "lucide-react";
import { serviceTone, planTypeTone } from "./data";
import { api, type PageMeta } from "../../../lib/api";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";
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
  service_name?: string;
  created_at?: string;
};

type RawService = {
  name: string;
  title?: string;
};

type ListResponse<T> = { data?: T[]; meta?: PageMeta };

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
            serviceTone[r.service as keyof typeof serviceTone] ||
            "bg-[#E4F1FD] text-[#0E7FBF]"
          }`}
        >
          {r.service}
        </span>
      </td>

      <td className="px-2 py-[12px]">
        <span
          className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${
            planTypeTone[r.planType as keyof typeof planTypeTone] ||
            "bg-[#F1EAFE] text-[#7C3AED]"
          }`}
        >
          {r.planType}
        </span>
      </td>

      <td className="px-2 py-[12px] text-[11.5px] font-semibold text-[#1F1836]">
        {r.price}
      </td>

      <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">
        {r.duration}
      </td>

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

      <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">
        {r.bookings}
      </td>

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
  const [, setRawList] = useState<RawPackage[]>([]);
  const [list, setList] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setTotal] = useState(0);
  const [services, setServices] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [serviceFilter, setServiceFilter] = useState("All");
  const [planTypeFilter, setPlanTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawPackage | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback(
    (message: string, kind: Toast["kind"] = "success") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, message, kind }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000,
      );
    },
    [],
  );

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([api.admin.getPackages(), api.admin.getServices()])
      .then(
        ([pkgData, svcData]: [
          ListResponse<RawPackage> | RawPackage[],
          ListResponse<RawService> | RawService[],
        ]) => {
          const pkgItems: RawPackage[] = Array.isArray(pkgData)
            ? pkgData
            : (pkgData?.data ?? []);
          const meta = Array.isArray(pkgData) ? undefined : pkgData?.meta;
          if (meta?.total) setTotal(meta.total);
          const svcItems: RawService[] = Array.isArray(svcData)
            ? svcData
            : (svcData?.data ?? []);
          const svcNames = svcItems
            .map((s) => s.name || s.title)
            .filter((n): n is string => Boolean(n));
          setServices(svcNames);

          if (Array.isArray(pkgItems)) {
            setRawList(pkgItems);
            setList(
              pkgItems.map((p) => {
                const matchedSvc = svcNames.find(
                  (name: string) =>
                    name.toLowerCase() === (p.service_name || "").toLowerCase(),
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
                  status:
                    p.status === "active"
                      ? "Active"
                      : p.status === "inactive"
                        ? "Inactive"
                        : p.status,
                  bookings: "-",
                  _raw: p,
                };
              }),
            );
          }
        },
      )
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { isRefreshing } = useAutoRefresh(loadData);
  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start();
    else stop();
  }, [isRefreshing, start, stop]);

  const rows = list || [];

  const hasAppliedFilter =
    serviceFilter !== "All" ||
    planTypeFilter !== "All" ||
    statusFilter !== "All";

  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();

    if (
      q &&
      ![
        r.name,
        r.sub,
        r.service,
        r.planType,
        r.price,
        r.duration,
        r.status,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q),
      )
    ) {
      return false;
    }

    if (activeTab === 1 && r.planType !== "One-time") return false;
    if (activeTab === 2 && r.planType !== "Subscription") return false;

    if (serviceFilter !== "All" && r.service !== serviceFilter) return false;
    if (planTypeFilter !== "All" && r.planType !== planTypeFilter) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;

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
      status:
        raw.status === "Active"
          ? "active"
          : raw.status === "Inactive"
            ? "inactive"
            : raw.status,
      plan_type: raw.plan_type || "Subscription",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};

    const priceVal = Number(formValues.price);
    const durationVal = Number(formValues.duration_days);

    if (!formValues.name?.toString().trim()) errs.name = "Name is required";
    if (formValues.price === "" || formValues.price === undefined)
      errs.price = "Price is required";
    else if (!Number.isFinite(priceVal) || priceVal < 0)
      errs.price = "Price must be a number ≥ 0";
    if (
      formValues.duration_days === "" ||
      formValues.duration_days === undefined
    )
      errs.duration_days = "Duration is required";
    else if (!Number.isFinite(durationVal) || durationVal < 1)
      errs.duration_days = "Duration must be a whole number ≥ 1";
    else if (!Number.isInteger(durationVal))
      errs.duration_days = "Duration must be a whole number";
    if (!formValues.status) errs.status = "Status is required";
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

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
    if (!rows.length) {
      addToast("No plans to export", "error");
      return;
    }
    exportCSV(rows, "pricing-plans.csv");
    addToast(`Exported ${rows.length} plans`);
  };

  // Registered AFTER the handlers it passes up. It previously sat ~100 lines
  // above `handleExport` with no dependency array, so it both referenced a
  // not-yet-initialised binding (a temporal-dead-zone hazard) and re-ran on
  // every single render, handing the parent toolbar new closures each time.
  useEffect(() => {
    onReady?.({ openCreate: handleOpenAdd, exportData: handleExport });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]);

  const modalFields: ModalField[] = [
    {
      name: "name",
      label: "Plan Name",
      type: "text",
      required: true,
      placeholder: "e.g. Gold Package",
      full: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the plan...",
      full: true,
    },
    {
      name: "price",
      label: "Price (₹)",
      type: "number",
      required: true,
      min: 0,
      placeholder: "0",
    },
    {
      name: "duration_days",
      label: "Duration (days)",
      type: "number",
      required: true,
      min: 1,
      placeholder: "30",
    },
    {
      name: "plan_type",
      label: "Plan Type",
      type: "select",
      options: [
        { label: "Subscription", value: "Subscription" },
        { label: "One-time", value: "One-time" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  const handleEditPlan = useCallback((r: Row) => handleOpenEdit(r), []);
  const handleDeletePlan = useCallback((id: number) => {
    setDeletingId(id);
    setConfirmOpen(true);
  }, []);

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
        <div className="flex flex-wrap items-center gap-[10px] px-6 pb-[14px] pt-[16px]">
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

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-[34px] rounded-[8px] border border-[#E7E5EF] bg-white px-[10px] text-[11px] text-[#3D3752] outline-none"
          >
            <option value="All">All Services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          <select
            value={planTypeFilter}
            onChange={(e) => setPlanTypeFilter(e.target.value)}
            className="h-[34px] rounded-[8px] border border-[#E7E5EF] bg-white px-[10px] text-[11px] text-[#3D3752] outline-none"
          >
            <option value="All">All Plan Types</option>
            <option value="Subscription">Subscription</option>
            <option value="One-time">One-time</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[34px] rounded-[8px] border border-[#E7E5EF] bg-white px-[10px] text-[11px] text-[#3D3752] outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {hasAppliedFilter && (
            <button
              type="button"
              onClick={() => {
                setServiceFilter("All");
                setPlanTypeFilter("All");
                setStatusFilter("All");
              }}
              className="h-[34px]  rounded-[8px] border border-1 px-[10px] text-[11px] font-medium text-[#7C3AED] hover:bg-[#F7F6FB]"
            >
              Clear
            </button>
          )}

          {/* <button
            type="button"
            className="ml-auto flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] bg-white px-[14px] text-[11px] text-[#3D3752] hover:bg-[#F7F6FB]"
          >
            <SlidersHorizontal size={13} className="text-[#6B6480]" />
            Filters
          </button> */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-6">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-y border-[#EEEDF4] bg-[#FAFAFC]">
                {[
                  "Plan Name",
                  "Service",
                  "Plan Type",
                  "Price",
                  "Duration",
                  "Status",
                  "Bookings",
                  "Actions",
                ].map((h) => (
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
                  <td
                    colSpan={8}
                    className="py-10 text-center text-[12px] text-[#8B879C]"
                  >
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
            Showing {filteredRows.length ? 1 : 0} to{" "}
            {Math.min(PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length.toLocaleString("en-IN")} plans
          </p>
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Package" : "Create New Package"}
        fields={modalFields}
        values={formValues}
        onChange={(name, value) => {
          setFormValues((prev) => ({ ...prev, [name]: value }));
          setFormErrors((prev) => {
            const n = { ...prev };
            delete n[name];
            return n;
          });
        }}
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
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
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

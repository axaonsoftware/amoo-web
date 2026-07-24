"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { typeTone } from "./data";
import { api } from "../../../lib/api";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import { exportCSV } from "../shared/exportCSV";
import { errorMessage } from "../../../lib/errors";

type Package = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  status: string;
  created_at: string;
};

type Row = {
  id: number;
  name: string;
  sub: string;
  img: string;
  type: string;
  services: string;
  price: string;
  oldPrice: string;
  discount: string;
  validity: string;
  status: string;
  _raw: Package;
};

const modalFields: ModalField[] = [
  { name: "name", label: "Package Name", type: "text", required: true, full: true, placeholder: "e.g. Premium Beauty Bundle" },
  { name: "description", label: "Description", type: "textarea", full: true, placeholder: "Short description of the package..." },
  { name: "price", label: "Price (₹)", type: "number", required: true, min: 0, placeholder: "0" },
  { name: "duration_days", label: "Duration (days)", type: "number", required: true, min: 1, placeholder: "30" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
];

const selects = ["All Types", "All Services", "All Status"];

export default function PackagesPanel({ onReady }: { onReady?: (fns: { openCreate: () => void; exportData: () => void }) => void } = {}) {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.admin.getPackages();
      const items = data?.data ?? data;
      if (data?.meta?.total) setTotal(data.meta.total);
      if (Array.isArray(items) && items.length) {
        setList(
          items.map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            sub: p.description,
            img: "/imagesP/aura_scanner.png",
            type: "Package",
            services: p.duration_days ? `${p.duration_days} days` : "Multiple",
            price: `₹ ${Number(p.price).toLocaleString("en-IN")}`,
            oldPrice: "",
            discount: p.status === "Active" ? "Live" : "-",
            validity: p.duration_days ? `${p.duration_days} days` : "-",
            status: p.status,
            _raw: {
              id: Number(p.id),
              name: p.name,
              description: p.description ?? "",
              price: Number(p.price),
              duration_days: Number(p.duration_days),
              status: p.status,
              created_at: p.created_at ?? "",
            } as Package,
          }))
        );
      } else {
        setList([]);
      }
    } catch (e: unknown) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!onReady) return;
    onReady({
      openCreate: () => {
        setEditing(null);
        setFormValues({ name: "", description: "", price: "", duration_days: "", status: "Active" });
        setFormErrors({});
        setModalOpen(true);
      },
      exportData: () => {
        exportCSV(
          list.map((r) => ({
            name: r._raw.name,
            description: r._raw.description,
            price: r._raw.price,
            duration_days: r._raw.duration_days,
            status: r._raw.status,
          })),
          "packages.csv"
        );
      },
    });
  }, [onReady, list]);

  const handleFormChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!String(formValues.name ?? "").trim()) errs.name = "Name is required";
    if (formValues.price === "" || formValues.price === undefined) errs.price = "Price is required";
    else if (Number(formValues.price) < 0) errs.price = "Price must be ≥ 0";
    if (formValues.duration_days === "" || formValues.duration_days === undefined) errs.duration_days = "Duration is required";
    else if (Number(formValues.duration_days) < 1) errs.duration_days = "Duration must be ≥ 1";
    if (!formValues.status) errs.status = "Status is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        name: String(formValues.name).trim(),
        description: String(formValues.description ?? "").trim(),
        price: Number(formValues.price),
        duration_days: Number(formValues.duration_days),
        status: String(formValues.status),
      };
      if (editing) {
        await api.admin.updatePackage(editing.id, body);
        showToast("Package updated successfully");
      } else {
        await api.admin.createPackage(body);
        showToast("Package created successfully");
      }
      setModalOpen(false);
      setEditing(null);
      await loadData();
    } catch (e: unknown) {
      showToast(errorMessage(e, "Something went wrong"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    setDeleting(true);
    try {
      await api.admin.deletePackage(deletingId);
      showToast("Package deleted successfully");
      setConfirmOpen(false);
      setDeletingId(null);
      await loadData();
    } catch (e: unknown) {
      showToast(errorMessage(e, "Failed to delete package"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const rows = list;

  if (loading) return <div className="flex justify-center py-10"><svg className="h-6 w-6 animate-spin text-[#7C3AED]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /></svg></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;

  return (
    <section className="rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-[#EEEDF4] px-6">
        {[
          { label: "All Packages & Offers", active: true },
          { label: "Service Packages" },
          { label: "Combo Packages" },
          { label: "Offers & Discounts" },
          { label: "Coupons" },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            className={`shrink-0 border-b-2 pb-[11px] pt-[13px] text-[12px] ${
              t.active
                ? "border-[#7C3AED] font-medium text-[#7C3AED]"
                : "border-transparent font-normal text-[#7C748C] hover:text-[#2E2A3B]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters + Action Buttons */}
      <div className="flex flex-wrap items-center gap-[10px] px-6 pb-[14px] pt-[14px]">
        <div className="flex h-[34px] w-full max-w-[212px] items-center rounded-[8px] border border-[#E7E5EF] pl-3 pr-2">
          <input
            type="text"
            placeholder="Search package or offer..."
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={14} className="shrink-0 text-[#6B6480]" />
        </div>

        {selects.map((s) => (
          <button
            key={s}
            type="button"
            className="flex h-[34px] w-[112px] items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]"
          >
            {s}
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        ))}

        <button
          type="button"
          className="flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]"
        >
          <SlidersHorizontal size={13} className="text-[#6B6480]" />
          Filters
        </button>

        <button
          type="button"
          className="flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]"
        >
          <RotateCcw size={13} className="text-[#6B6480]" />
          Reset
        </button>

        <div className="ml-auto flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => {
              exportCSV(
                rows.map((r) => ({
                  name: r._raw.name,
                  description: r._raw.description,
                  price: r._raw.price,
                  duration_days: r._raw.duration_days,
                  status: r._raw.status,
                })),
                "packages.csv"
              );
            }}
            className="flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#7C3AED] bg-white px-3 text-[11px] font-medium text-[#6D28D9] hover:bg-[#FAF7FF]"
          >
            <Download size={13} strokeWidth={2} />
            Export
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormValues({ name: "", description: "", price: "", duration_days: "", status: "Active" });
              setFormErrors({});
              setModalOpen(true);
            }}
            className="flex h-[34px] items-center gap-[6px] rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-3 text-[11px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.2)]"
          >
            <Plus size={13} strokeWidth={2.4} />
            Create New Package
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-y border-[#EEEDF4] bg-[#FAFAFC]">
              {[
                "Package / Offer",
                "Type",
                "Services Included",
                "Price",
                "Discount",
                "Validity",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-[11px] text-left text-[10.5px] font-medium text-[#6B6480] first:pl-6 last:pr-6"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[#F2F1F7]">
                <td className="py-[12px] pl-6 pr-2">
                  <div className="flex items-center gap-[10px]">
                    <Image
                      src={r.img}
                      alt=""
                      width={32}
                      height={32}
                      className="h-[32px] w-[32px] shrink-0 rounded-full object-cover"
                    />
                    <div className="leading-tight">
                      <p className="text-[11.5px] font-semibold text-[#1F1836]">
                        {r.name}
                      </p>
                      <p className="mt-[2px] text-[9.5px] text-[#8B879C]">
                        {r.sub}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-[12px]">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${typeTone[r.type as keyof typeof typeTone] ?? "bg-[#F3F2F7] text-[#5B5570]"}`}
                  >
                    {r.type}
                  </span>
                </td>

                <td className="px-2 py-[12px]">
                  <span className="inline-flex items-center rounded-[6px] bg-[#F3F2F7] px-[8px] py-[4px] text-[9.5px] font-medium text-[#5B5570]">
                    {r.services}
                  </span>
                </td>

                <td className="px-2 py-[12px]">
                  {r.price ? (
                    <div className="leading-tight">
                      <p className="text-[11.5px] font-semibold text-[#1F1836]">
                        {r.price}
                      </p>
                      <p className="mt-[2px] text-[9.5px] text-[#A5A2B5] line-through">
                        {r.oldPrice}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11.5px] text-[#8B879C]">-</span>
                  )}
                </td>

                <td className="px-2 py-[12px]">
                  <span className="inline-flex items-center rounded-[6px] bg-[#E6F7EE] px-[8px] py-[4px] text-[9.5px] font-medium text-[#16A34A]">
                    {r.discount}
                  </span>
                </td>

                <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">
                  {r.validity}
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

                <td className="py-[12px] pl-2 pr-6">
                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#F7F6FB]"
                      title="View"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(r._raw);
                        setFormValues({
                          name: r._raw.name,
                          description: r._raw.description,
                          price: r._raw.price,
                          duration_days: r._raw.duration_days,
                          status: r._raw.status,
                        });
                        setFormErrors({});
                        setModalOpen(true);
                      }}
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#F7F6FB]"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingId(r.id);
                        setConfirmOpen(true);
                      }}
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#EF4444] hover:bg-[#FEF2F2]"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[12px] text-[#8B879C]">
                  No packages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-[16px] pt-[14px]">
        <p className="text-[10.5px] text-[#8B879C]">
          Showing {rows.length > 0 ? 1 : 0} to {rows.length} of {(total || rows.length).toLocaleString("en-IN")} packages/offers
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C]"
            >
              <ChevronLeft size={13} />
            </button>

            {["1", "2", "3", "4"].map((p) => (
              <button
                key={p}
                type="button"
                className={`grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[10.5px] ${
                  p === "1"
                    ? "bg-[#6D28D9] font-medium text-white"
                    : "border border-[#E7E5EF] text-[#3D3752] hover:bg-[#F7F6FB]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[10.5px] text-[#3D3752]"
            >
              …
            </button>

            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C]"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <button
            type="button"
            className="flex h-[28px] w-[110px] items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 text-[10.5px] text-[#3D3752]"
          >
            10 / page
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Package" : "Create New Package"}
        fields={modalFields}
        values={formValues}
        onChange={handleFormChange}
        onSave={handleSave}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        errors={formErrors}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Package"
        message="This action cannot be undone. The package will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
        saving={deleting}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-[100] flex items-center gap-2 rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,.15)] transition-all ${
            toast.type === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </section>
  );
}

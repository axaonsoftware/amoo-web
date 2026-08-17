"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Ticket, Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { api, qs, unwrapList } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { sanitize } from "@/lib/sanitize";
import AdminPageHeader, { AdminStats } from "../shared/AdminPageHeader";
import { useToast } from "../shared/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";
import { EmptyRow, ErrorRow, TableSkeletonRows } from "../../components/states";

/**
 * Admin coupon management.
 *
 * `/api/coupons` has had full admin CRUD (list, create, update, delete) plus
 * `/validate` and a transactional `/apply` since the backend was written, and
 * `lib/api.ts` exposed all four admin methods — but nothing in the frontend
 * ever called them. There was no way to create a coupon, so the coupon box on
 * the checkout page could only ever reject whatever a customer typed.
 */

type Coupon = {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "flat";
  discount_value: number | string;
  min_amount: number | string;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at?: string;
};

type FormState = {
  code: string;
  description: string;
  discount_type: "percent" | "flat";
  discount_value: string;
  min_amount: string;
  max_uses: string;
  expires_at: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: "",
  min_amount: "0",
  max_uses: "",
  expires_at: "",
  active: true,
};

function isExpired(c: Coupon): boolean {
  return !!c.expires_at && new Date(c.expires_at) < new Date();
}
function isExhausted(c: Coupon): boolean {
  return c.max_uses != null && c.used_count >= c.max_uses;
}

const CouponRow = memo(function CouponRow({
  c,
  onEdit,
  onDelete,
}: {
  c: Coupon;
  onEdit: (c: Coupon) => void;
  onDelete: (c: Coupon) => void;
}) {
  const expired = isExpired(c);
  const exhausted = isExhausted(c);
  const usable = !!c.active && !expired && !exhausted;
  return (
    <tr
      key={c.id}
      className="border-b border-[#F0EDF5] last:border-b-0 hover:bg-[#FAF9FE]"
    >
      <td className="px-4 py-3">
        <span className="font-mono font-semibold text-[#3D3752]">
          {sanitize(c.code)}
        </span>
        {c.description && (
          <p className="mt-0.5 max-w-[220px] truncate text-[10.5px] text-[#8B879C]">
            {sanitize(c.description)}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-[#3D3752]">
        {c.discount_type === "percent"
          ? `${Number(c.discount_value)}%`
          : formatCurrency(c.discount_value)}
      </td>
      <td className="px-4 py-3 text-[#3D3752]">
        {Number(c.min_amount) > 0 ? formatCurrency(c.min_amount) : "—"}
      </td>
      <td className="px-4 py-3 text-[#3D3752]">
        {c.used_count}
        {c.max_uses != null && (
          <span className="text-[#8B879C]"> / {c.max_uses}</span>
        )}
      </td>
      <td className="px-4 py-3 text-[#3D3752]">
        {c.expires_at ? formatDate(c.expires_at) : "Never"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
            usable
              ? "bg-[#E8F5E9] text-[#2E7D32]"
              : expired
                ? "bg-[#FFF4E5] text-[#B26A00]"
                : exhausted
                  ? "bg-[#EEF0F5] text-[#5A6472]"
                  : "bg-[#FFEBEE] text-[#C62828]"
          }`}
        >
          {usable
            ? "Active"
            : expired
              ? "Expired"
              : exhausted
                ? "Exhausted"
                : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(c)}
            aria-label={`Edit coupon ${c.code}`}
            className="rounded-md p-1.5 text-[#6D28D9] hover:bg-[#F0EAFF]"
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(c)}
            aria-label={`Delete coupon ${c.code}`}
            className="rounded-md p-1.5 text-[#C62828] hover:bg-[#FFEBEE]"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast, Toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getCoupons(qs({ search, status }))
      .then((res: unknown) => setCoupons(unwrapList<Coupon>(res)))
      .catch((e: Error) => setError(e?.message || "Failed to load coupons"))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description ?? "",
      discount_type: c.discount_type,
      discount_value: String(c.discount_value ?? ""),
      min_amount: String(c.min_amount ?? "0"),
      max_uses: c.max_uses != null ? String(c.max_uses) : "",
      // <input type="date"> needs YYYY-MM-DD; the API returns a full datetime.
      expires_at: c.expires_at ? String(c.expires_at).slice(0, 10) : "",
      active: !!c.active,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setFormError(null);

    const value = Number(form.discount_value);
    if (!form.code.trim() || form.code.trim().length < 3) {
      setFormError("Code must be at least 3 characters.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Discount value must be greater than 0.");
      return;
    }
    // Mirrors the server rule so the mistake is caught before the round-trip;
    // the backend still validates independently.
    if (form.discount_type === "percent" && value > 100) {
      setFormError("A percentage discount cannot exceed 100.");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discount_type: form.discount_type,
      discount_value: value,
      min_amount: Number(form.min_amount) || 0,
      // Joi rejects "" for these; send null so the column is cleared instead.
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: form.active,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.admin.updateCoupon(editing.id, payload);
        showToast(`Coupon ${payload.code} updated`);
      } else {
        await api.admin.createCoupon(payload);
        showToast(`Coupon ${payload.code} created`);
      }
      setShowForm(false);
      load();
    } catch (e) {
      setFormError((e as Error)?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteCoupon(deleteTarget.id);
      showToast(`Coupon ${deleteTarget.code} deleted`);
      setDeleteTarget(null);
      load();
    } catch (e) {
      showToast((e as Error)?.message || "Failed to delete coupon", "error");
    } finally {
      setDeleting(false);
    }
  };

  const COLS = 7;
  const activeCount = coupons.filter(
    (c) => c.active && !isExpired(c) && !isExhausted(c),
  ).length;
  const redemptions = coupons.reduce(
    (sum, c) => sum + (Number(c.used_count) || 0),
    0,
  );

  const handleEditCoupon = useCallback((c: Coupon) => openEdit(c), []);
  const handleDeleteCoupon = useCallback((c: Coupon) => setDeleteTarget(c), []);

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <AdminPageHeader
        title="Coupon Management"
        description="Create and manage discount codes customers can redeem at checkout."
        Icon={Ticket}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex h-[38px] items-center gap-[7px] rounded-[9px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[15px] text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(109,40,217,.25)]"
          >
            <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
            Add Coupon
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-[360px] flex-1">
          <label htmlFor="coupon-search" className="sr-only">
            Search coupon codes
          </label>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B879C]"
            aria-hidden="true"
          />
          <input
            id="coupon-search"
            type="search"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[36px] w-full rounded-[8px] border border-[#E5E1F0] bg-white pl-9 pr-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <label htmlFor="coupon-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="coupon-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
        >
          <option value="">All Coupons</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <AdminStats
        stats={[
          { label: "Total Coupons", value: coupons.length },
          { label: "Currently Usable", value: activeCount },
          { label: "Expired", value: coupons.filter(isExpired).length },
          { label: "Total Redemptions", value: redemptions },
        ]}
      />

      <div className="mt-5 overflow-x-auto rounded-[12px] border border-[#E5E1F0] bg-white">
        <table className="w-full min-w-[760px] text-left text-[12px]">
          <caption className="sr-only">Discount coupons</caption>
          <thead>
            <tr className="border-b border-[#E5E1F0] bg-[#FAF9FE]">
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Code
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Discount
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Min Order
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Used
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Expires
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={5} cols={COLS} />
            ) : error ? (
              <ErrorRow colSpan={COLS} message={error} onRetry={load} />
            ) : coupons.length === 0 ? (
              <EmptyRow
                colSpan={COLS}
                title="No coupons yet"
                message="Create one and customers can redeem it on the consultation checkout page."
              />
            ) : (
              coupons.map((c) => (
                <CouponRow
                  key={c.id}
                  c={c}
                  onEdit={handleEditCoupon}
                  onDelete={handleDeleteCoupon}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coupon-form-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2
                id="coupon-form-title"
                className="font-display text-lg font-bold text-[#231640]"
              >
                {editing ? "Edit Coupon" : "Add Coupon"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X size={18} className="text-[#8B879C]" aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-700"
              >
                {formError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="c-code"
                  className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                >
                  Code
                </label>
                <input
                  id="c-code"
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER20"
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 font-mono text-[12px] uppercase text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label
                  htmlFor="c-desc"
                  className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                >
                  Description <span className="text-[#8B879C]">(internal)</span>
                </label>
                <input
                  id="c-desc"
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Summer campaign, 20% off"
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="c-type"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Discount Type
                  </label>
                  <select
                    id="c-type"
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_type: e.target.value as "percent" | "flat",
                      })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="c-value"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    {form.discount_type === "percent"
                      ? "Percent off"
                      : "Amount off (₹)"}
                  </label>
                  <input
                    id="c-value"
                    type="number"
                    min={0}
                    max={form.discount_type === "percent" ? 100 : undefined}
                    value={form.discount_value}
                    onChange={(e) =>
                      setForm({ ...form, discount_value: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="c-min"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Minimum order (₹)
                  </label>
                  <input
                    id="c-min"
                    type="number"
                    min={0}
                    value={form.min_amount}
                    onChange={(e) =>
                      setForm({ ...form, min_amount: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="c-max"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Max uses{" "}
                    <span className="text-[#8B879C]">(blank = unlimited)</span>
                  </label>
                  <input
                    id="c-max"
                    type="number"
                    min={1}
                    value={form.max_uses}
                    onChange={(e) =>
                      setForm({ ...form, max_uses: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="c-expires"
                  className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                >
                  Expires on{" "}
                  <span className="text-[#8B879C]">(blank = never)</span>
                </label>
                <input
                  id="c-expires"
                  type="date"
                  value={form.expires_at}
                  onChange={(e) =>
                    setForm({ ...form, expires_at: e.target.value })
                  }
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="c-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="rounded"
                />
                <label
                  htmlFor="c-active"
                  className="text-[12px] text-[#3D3752]"
                >
                  Active — customers can redeem this code
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#8B879C] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-50"
              >
                {saving && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                )}
                {editing ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete coupon?"
        message={
          deleteTarget
            ? `"${deleteTarget.code}" will be permanently deleted. Redemptions already recorded against it are kept for reporting. Customers who try the code will see "Invalid coupon".`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        saving={deleting}
      />

      <Toast />
    </main>
  );
}

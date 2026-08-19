"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign,
} from "lucide-react";
import { categoryTone, typeTone, type ServiceRow } from "./data";
import { api } from "../../../lib/api";
import { useAutoRefresh } from "../../../lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";
import ConfirmDialog from "../shared/ConfirmDialog";
import AdminModal from "../shared/AdminModal";
import { errorMessage } from "../../../lib/errors";
import type { Decimal, Service } from "../../../lib/types";

const tabs = [
  { label: "All Services", active: true },
  { label: "Active Services" },
  { label: "Inactive Services" },
  { label: "Popular Services" },
  { label: "Recently Added" },
];

const categoryOptions = [
  "Numerology",
  "Tarot",
  "Astrology",
  "Healing",
  "Vastu",
  "AI Services",
  "Spiritual",
];

const statusOptions = ["Active", "Inactive"];

interface ServiceRowData {
  id: number;
  name: string;
  sub: string | null;
  img: string | null;
  category: Service["category"];
  type: Service["type"];
  price: string;
  priceRaw: Decimal;
  duration: string | null;
  status: Service["status"];
  bookings: number;
}

type ServicesResponse = { data?: Service[]; meta?: { total?: number } };

export default function ServicesPanel() {
  const [rows, setRows] = useState<ServiceRowData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRowData | null>(
    null,
  );
  const [editValues, setEditValues] = useState<Record<string, string | number>>(
    {},
  );
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    service: ServiceRowData | null;
  }>({ open: false, service: null });
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    kind: "success" | "error";
  } | null>(null);

  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingService, setPricingService] = useState<ServiceRowData | null>(
    null,
  );
  const [pricingList, setPricingList] = useState<
    {
      id: number;
      expert_id: number;
      expert_name: string;
      price: number;
    }[]
  >([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [allExperts, setAllExperts] = useState<
    { id: number; name: string }[]
  >([]);
  const [newPricingExpert, setNewPricingExpert] = useState<string>("");
  const [newPricingPrice, setNewPricingPrice] = useState<string>("");
  const [pricingSaving, setPricingSaving] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const load = useCallback(() => {
    api.admin
      .getServices()
      .then((data: ServicesResponse) => {
        const items = data?.data ?? data;
        if (data?.meta?.total) setTotal(data.meta.total);
        if (Array.isArray(items) && items.length) {
          setRows(
            items.map((s: Service) => ({
              id: s.id,
              name: s.name,
              sub: s.sub,
              img: s.img,
              category: s.category,
              type: s.type,
              price: `₹ ${Number(s.price).toLocaleString("en-IN")}`,
              priceRaw: s.price,
              duration: s.duration,
              status: s.status,
              bookings: s.bookings,
            })),
          );
        }
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const { isRefreshing } = useAutoRefresh(load);
  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start(); else stop();
  }, [isRefreshing, start, stop]);

  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const reload = load;

  const openPricingModal = async (service: ServiceRowData) => {
    setPricingService(service);
    setPricingModalOpen(true);
    setPricingLoading(true);
    try {
      const [pricingRes, expertsRes] = await Promise.all([
        api.admin.getServicePricing(service.id),
        api.admin.getExperts(),
      ]);
      const pricingData =
        pricingRes && typeof pricingRes === "object"
          ? (pricingRes as { data?: unknown[] }).data ?? pricingRes
          : [];
      setPricingList(Array.isArray(pricingData) ? (pricingData as typeof pricingList) : []);
      const expertsData =
        expertsRes && typeof expertsRes === "object"
          ? (expertsRes as { data?: unknown[] }).data ?? expertsRes
          : [];
      setAllExperts(
        Array.isArray(expertsData)
          ? (expertsData as { id: number; name: string }[]).map((e) => ({
              id: e.id,
              name: e.name,
            }))
          : [],
      );
      setNewPricingExpert("");
      setNewPricingPrice("");
    } catch {
      showToast("Failed to load pricing data", "error");
    } finally {
      setPricingLoading(false);
    }
  };

  const addExpertPrice = async () => {
    if (!pricingService || !newPricingExpert || !newPricingPrice) return;
    setPricingSaving(true);
    try {
      await api.admin.setServicePricing(pricingService.id, {
        expert_id: Number(newPricingExpert),
        price: Number(newPricingPrice),
      });
      const updated = await api.admin.getServicePricing(pricingService.id);
      const updatedData =
        updated && typeof updated === "object"
          ? (updated as { data?: unknown[] }).data ?? updated
          : [];
      setPricingList(Array.isArray(updatedData) ? (updatedData as typeof pricingList) : []);
      setNewPricingExpert("");
      setNewPricingPrice("");
      showToast("Expert price saved");
    } catch {
      showToast("Failed to save expert price", "error");
    } finally {
      setPricingSaving(false);
    }
  };

  const removeExpertPrice = async (expertId: number) => {
    if (!pricingService) return;
    try {
      await api.admin.deleteServicePricing(pricingService.id, expertId);
      setPricingList((prev) => prev.filter((p) => p.expert_id !== expertId));
      showToast("Expert price removed");
    } catch {
      showToast("Failed to remove expert price", "error");
    }
  };

  const list = useMemo(() => {
    const rows_ = rows || [];
    return rows_.filter((r) => {
      if (
        debouncedSearch &&
        !r.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
        return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, debouncedSearch, categoryFilter, statusFilter]);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D28D9]" />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">
        {error}
      </div>
    );

  return (
    <section className="rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-[#EEEDF4] px-6">
        {tabs.map((t) => (
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-[12px] px-6 pb-[14px] pt-[16px]">
        <div className="flex h-[36px] w-full max-w-[205px] items-center rounded-[8px] border border-[#E7E5EF] pl-3 pr-2">
          <input
            type="text"
            placeholder="Search service by name..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={14} className="shrink-0 text-[#6B6480]" />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[36px] w-[145px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#3D3752]"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 text-[#8B879C]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[36px] w-[132px] appearance-none rounded-[8px] border border-[#E7E5EF] bg-white pl-[11px] pr-[9px] text-[11px] text-[#3D3752]"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 text-[#8B879C]"
          />
        </div>

        <button
          type="button"
          className="flex h-[36px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-[14px] text-[11px] text-[#3D3752]"
        >
          <SlidersHorizontal size={13} className="text-[#6B6480]" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-y border-[#EEEDF4] bg-[#FAFAFC]">
              {[
                "Service",
                "Category",
                "Type",
                "Price",
                "Duration",
                "Status",
                "Bookings",
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
            {list.map((r) => (
              <tr key={r.id ?? r.name} className="border-b border-[#F2F1F7]">
                <td className="py-[13px] pl-6 pr-2">
                  <div className="flex items-center gap-[10px]">
                    <Image
                      src={r.img ?? ""}
                      alt=""
                      width={34}
                      height={34}
                      className="h-[34px] w-[34px] shrink-0 rounded-full object-cover"
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

                <td className="px-2 py-[13px]">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${categoryTone[r.category as ServiceRow["category"]] || "bg-[#F5F4F9] text-[#6B6480]"}`}
                  >
                    {r.category}
                  </span>
                </td>

                <td className="px-2 py-[13px]">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${typeTone[r.type as ServiceRow["type"]] || "bg-[#F5F4F9] text-[#6B6480]"}`}
                  >
                    {r.type}
                  </span>
                </td>

                <td className="px-2 py-[13px] text-[11.5px] font-semibold text-[#1F1836]">
                  {r.price}
                </td>

                <td className="px-2 py-[13px] text-[11px] text-[#3D3752]">
                  {r.duration}
                </td>

                <td className="px-2 py-[13px]">
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

                <td className="px-2 py-[13px] text-[11px] font-medium text-[#3D3752]">
                  {r.bookings}
                </td>

                <td className="py-[13px] pl-2 pr-6">
                  <div className="flex items-center gap-[8px]">
                    <button
                      type="button"
                      aria-label="Pricing Tiers"
                      onClick={() => openPricingModal(r)}
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[#7C3AED] hover:bg-[#F1EAFE]"
                    >
                      <DollarSign size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={() => {
                        setEditingService(r);
                        setEditValues({
                          name: r.name,
                          sub: r.sub || "",
                          category: r.category,
                          type: r.type,
                          price: r.priceRaw ?? r.price,
                          duration: r.duration ?? "",
                          status: r.status === "Active" ? "active" : "inactive",
                        });
                        setEditModalOpen(true);
                      }}
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[#8B879C] hover:bg-[#F7F6FB]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Toggle Status"
                      title={r.status === "Active" ? "Deactivate" : "Activate"}
                      onClick={async () => {
                        try {
                          await api.admin.updateService(r.id, {
                            status: r.status === "Active" ? "inactive" : "active",
                          });
                          showToast(
                            r.status === "Active"
                              ? "Service deactivated"
                              : "Service activated",
                          );
                          reload();
                        } catch (e: unknown) {
                          showToast(
                            errorMessage(e, "Failed to update status"),
                            "error",
                          );
                        }
                      }}
                      className={`grid h-[26px] w-[26px] place-items-center rounded-[6px] hover:bg-[#F7F6FB] ${
                        r.status === "Active"
                          ? "text-[#16A34A] hover:bg-[#E6F7EE]"
                          : "text-[#EF4444] hover:bg-[#FEE2E2]"
                      }`}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() =>
                        setConfirmDelete({ open: true, service: r })
                      }
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[#EF4444] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-[16px] pt-[16px]">
        <p className="text-[10.5px] text-[#8B879C]">
          Showing {list.length.toLocaleString("en-IN")} of{" "}
          {(total || (rows || []).length).toLocaleString("en-IN")} services
        </p>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-[6px]">
            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C]"
            >
              <ChevronLeft size={13} />
            </button>

            {["1", "2", "3", "4", "5"].map((p) => (
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
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[10.5px] text-[#3D3752] hover:bg-[#F7F6FB]"
            >
              …
            </button>

            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[10.5px] text-[#3D3752] hover:bg-[#F7F6FB]"
            >
              7
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
            className="flex h-[30px] w-[110px] items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 text-[10.5px] text-[#3D3752]"
          >
            10 / page
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        </div>
      </div>

      <AdminModal
        open={editModalOpen}
        title="Edit Service"
        fields={[
          {
            name: "name",
            label: "Service Name",
            type: "text",
            required: true,
            full: true,
          },
          { name: "sub", label: "Subtitle", type: "text", full: true },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "Astrology", value: "Astrology" },
              { label: "Numerology", value: "Numerology" },
              { label: "Vastu", value: "Vastu" },
              { label: "Puja", value: "Puja" },
              { label: "Rudraksha", value: "Rudraksha" },
              { label: "Crystals", value: "Crystals" },
              { label: "Gemstone", value: "Gemstone" },
            ],
          },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: [
              { label: "Individual", value: "individual" },
              { label: "Package", value: "package" },
            ],
          },
          {
            name: "price",
            label: "Price (₹)",
            type: "number",
            required: true,
            min: 0,
          },
          { name: "duration", label: "Duration", type: "text" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
        values={editValues}
        onChange={(name, value) =>
          setEditValues((prev) => ({ ...prev, [name]: value }))
        }
        saving={editSaving}
        onClose={() => setEditModalOpen(false)}
        onSave={async () => {
          if (!editingService) return;
          setEditSaving(true);
          try {
            await api.admin.updateService(editingService.id, {
              name: editValues.name,
              sub: editValues.sub,
              category: editValues.category,
              type: editValues.type,
              price: Number(editValues.price),
              duration: editValues.duration,
              status: editValues.status,
            });
            setEditModalOpen(false);
            showToast("Service updated successfully");
            reload();
          } catch (e: unknown) {
            showToast(errorMessage(e, "Failed to update service"), "error");
          } finally {
            setEditSaving(false);
          }
        }}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Service"
        message={`Are you sure you want to delete "${confirmDelete.service?.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (!confirmDelete.service) return;
          setDeleteSaving(true);
          try {
            await api.admin.deleteService(confirmDelete.service.id);
            setConfirmDelete({ open: false, service: null });
            showToast("Service deleted successfully");
            reload();
          } catch (e: unknown) {
            showToast(errorMessage(e, "Failed to delete service"), "error");
          } finally {
            setDeleteSaving(false);
          }
        }}
        onCancel={() => setConfirmDelete({ open: false, service: null })}
        saving={deleteSaving}
      />

      {toast && (
        <div
          className={`fixed right-4 top-4 z-[999] rounded-[8px] px-4 py-3 text-[12px] font-medium text-white shadow-lg ${toast.kind === "success" ? "bg-[#16A34A]" : "bg-[#EF4444]"}`}
        >
          {toast.msg}
        </div>
      )}

      {pricingModalOpen && pricingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPricingModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_20px_60px_rgba(20,16,40,.18)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEEDF4] bg-white px-6 py-4">
              <h3 className="text-[16px] font-bold text-[#1F1836]">
                Expert Pricing — {pricingService.name}
              </h3>
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="grid h-[28px] w-[28px] place-items-center rounded-[6px] text-[#8B879C] hover:bg-[#F7F6FB]"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              {pricingLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
                </div>
              ) : (
                <>
                  {pricingList.length > 0 && (
                    <div className="mb-5 space-y-2">
                      {pricingList.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 py-2"
                        >
                          <span className="text-[12px] font-medium text-[#3D3752]">
                            {p.expert_name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-semibold text-[#16A34A]">
                              ₹{Number(p.price).toLocaleString("en-IN")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExpertPrice(p.expert_id)}
                              className="grid h-[22px] w-[22px] place-items-center rounded-[4px] text-[#EF4444] hover:bg-[#FEE2E2]"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px_auto]">
                    <select
                      value={newPricingExpert}
                      onChange={(e) => setNewPricingExpert(e.target.value)}
                      className="h-[38px] w-full appearance-none rounded-[8px] border border-[#E7E5EF] px-3 text-[12px] text-[#1F1836] outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
                    >
                      <option value="">Select expert...</option>
                      {allExperts.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      placeholder="Price (₹)"
                      value={newPricingPrice}
                      onChange={(e) => setNewPricingPrice(e.target.value)}
                      className="h-[38px] w-full rounded-[8px] border border-[#E7E5EF] px-3 text-[12px] text-[#1F1836] outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
                    />
                    <button
                      type="button"
                      onClick={addExpertPrice}
                      disabled={
                        pricingSaving || !newPricingExpert || !newPricingPrice
                      }
                      className="inline-flex h-[38px] items-center gap-1 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-4 text-[12px] font-medium text-white shadow-sm disabled:opacity-60"
                    >
                      {pricingSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "+"
                      )}
                      Add
                    </button>
                  </div>

                  {pricingList.length === 0 && !pricingLoading && (
                    <p className="mt-4 text-center text-[11px] text-[#8B879C]">
                      No expert-specific prices set. Add one above.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

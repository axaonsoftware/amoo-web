"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { categoryTone, typeTone, type ServiceRow } from "./data";
import { api } from "../../../lib/api";
import ConfirmDialog from "../shared/ConfirmDialog";
import AdminModal, { type ModalField } from "../shared/AdminModal";
import { errorMessage } from "../../../lib/errors";
import type { Decimal, Service } from "../../../lib/types";

const tabs = [
  { label: "All Services", active: true },
  { label: "Active Services" },
  { label: "Inactive Services" },
  { label: "Popular Services" },
  { label: "Recently Added" },
];

const selects = [
  { label: "All Categories", w: "w-[145px]" },
  { label: "All Status", w: "w-[132px]" },
  { label: "All Service Types", w: "w-[162px]" },
];

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

  useEffect(() => {
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

  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const reload = () => {
    setLoading(true);
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
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const list = rows || [];

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
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={14} className="shrink-0 text-[#6B6480]" />
        </div>

        {selects.map((s) => (
          <button
            key={s.label}
            type="button"
            className={`flex h-[36px] ${s.w} items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]`}
          >
            {s.label}
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        ))}

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
          Showing 1 to 8 of {(total || list.length).toLocaleString("en-IN")}{" "}
          services
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
    </section>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  {
    name: "name",
    label: "Package Name",
    type: "text",
    required: true,
    full: true,
    placeholder: "e.g. Premium Beauty Bundle",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    full: true,
    placeholder: "Short description of the package...",
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

export default function PackagesPanel({
  onReady,
}: {
  onReady?: (fns: { openCreate: () => void; exportData: () => void }) => void;
} = {}) {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeTab, setActiveTab] = useState("All Packages & Offers");
  const [viewing, setViewing] = useState<Package | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.admin.getPackages();
      const items = data?.data ?? data;
      setTotal(data?.meta?.total ?? 0);
      setTotalPages(data?.meta?.totalPages ?? 1);
      setPage(data?.meta?.page ?? 1);
      setPageSize(data?.meta?.pageSize ?? 20);
      if (Array.isArray(items) && items.length) {
        setList(
          items.map((p: Package) => ({
            id: Number(p.id),
            name: p.name,
            sub: p.description,
            img: "https://res.cloudinary.com/iguqsxhj/image/upload/amoo/imagesP/aura_scanner.png",
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
          })),
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
  }, [loadData, page, pageSize]);

  useEffect(() => {
    if (!onReady) return;
    onReady({
      openCreate: () => {
        setEditing(null);
        setFormValues({
          name: "",
          description: "",
          price: "",
          duration_days: "",
          status: "Active",
        });
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
          "packages.csv",
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
    if (formValues.price === "" || formValues.price === undefined)
      errs.price = "Price is required";
    else if (Number(formValues.price) < 0) errs.price = "Price must be ≥ 0";
    if (
      formValues.duration_days === "" ||
      formValues.duration_days === undefined
    )
      errs.duration_days = "Duration is required";
    else if (Number(formValues.duration_days) < 1)
      errs.duration_days = "Duration must be ≥ 1";
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

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return list.filter((row) => {
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.sub.toLowerCase().includes(query);

      const matchesType = typeFilter === "All Types" || row.type === typeFilter;

      const matchesService =
        serviceFilter === "All Services" ||
        row.services.toLowerCase().includes(serviceFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || row.status === statusFilter;

      const matchesTab =
        activeTab === "All Packages & Offers" ||
        (activeTab === "Service Packages" && row.type === "Package") ||
        (activeTab === "Combo Packages" && row.type === "Combo") ||
        (activeTab === "Offers & Discounts" && row.type === "Offer") ||
        (activeTab === "Coupons" && row.type === "Coupon");

      return (
        matchesSearch &&
        matchesType &&
        matchesService &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [list, search, typeFilter, serviceFilter, statusFilter, activeTab]);

  const rows = filteredRows;

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "All Types" ||
    serviceFilter !== "All Services" ||
    statusFilter !== "All Status";

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All Types");
    setServiceFilter("All Services");
    setStatusFilter("All Status");
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
      <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">
        {error}
      </div>
    );

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <section className="rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-[#EEEDF4] px-6">
        {[
          "All Packages & Offers",
          "Service Packages",
          "Combo Packages",
          "Offers & Discounts",
          "Coupons",
        ].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 pb-[11px] pt-[13px] text-[12px] ${
              activeTab === tab
                ? "border-[#7C3AED] font-medium text-[#7C3AED]"
                : "border-transparent font-normal text-[#7C748C] hover:text-[#2E2A3B]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-[10px] px-6 pb-[14px] pt-[14px]">
        <div className="flex h-[34px] w-full max-w-[212px] items-center rounded-[8px] border border-[#E7E5EF] pl-3 pr-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search package or offer..."
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={14} className="shrink-0 text-[#6B6480]" />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-[34px] w-[112px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#3D3752] outline-none"
        >
          <option>All Types</option>
          <option>Package</option>
          <option>Combo</option>
          <option>Offer</option>
          <option>Coupon</option>
        </select>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="h-[34px] w-[112px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#3D3752] outline-none"
        >
          <option>All Services</option>
          <option>Reiki</option>
          <option>Tarot</option>
          <option>Numerology</option>
          <option>Chakra</option>
          <option>Kundali</option>
          <option>Love</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[34px] w-[112px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[11px] text-[#3D3752] outline-none"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        {/* <button
          type="button"
          className="flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]"
        >
          <SlidersHorizontal size={13} className="text-[#6B6480]" />
          Filters
        </button> */}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]"
          >
            <RotateCcw size={13} className="text-[#6B6480]" />
            Reset
          </button>
        )}

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
                "packages.csv",
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
              setFormValues({
                name: "",
                description: "",
                price: "",
                duration_days: "",
                status: "Active",
              });
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
                      onClick={() => setViewing(r._raw)}
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
                <td
                  colSpan={8}
                  className="py-10 text-center text-[12px] text-[#8B879C]"
                >
                  No packages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-[16px] pt-[14px]">
        <p className="text-[10.5px] text-[#8B879C]">
          Showing {startItem} to {endItem} of {total.toLocaleString("en-IN")}{" "}
          packages/offers
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[10.5px] ${
                    p === page
                      ? "bg-[#6D28D9] font-medium text-white"
                      : "border border-[#E7E5EF] text-[#3D3752] hover:bg-[#F7F6FB]"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-[28px] w-[110px] rounded-[8px] border border-[#E7E5EF] bg-white px-3 text-[10.5px] text-[#3D3752] outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

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

      {viewing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[520px] rounded-[14px] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#1F1836]">
                Package Details
              </h2>

              <button
                type="button"
                onClick={() => setViewing(null)}
                className="text-[20px] text-[#8B879C] hover:text-[#2E2A3B]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-[12px]">
              <div>
                <p className="text-[#8B879C]">Package Name</p>
                <p className="mt-1 font-medium text-[#1F1836]">
                  {viewing.name}
                </p>
              </div>

              <div>
                <p className="text-[#8B879C]">Description</p>
                <p className="mt-1 text-[#3D3752]">
                  {viewing.description || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#8B879C]">Price</p>
                  <p className="mt-1 font-medium text-[#1F1836]">
                    ₹ {Number(viewing.price).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-[#8B879C]">Duration</p>
                  <p className="mt-1 font-medium text-[#1F1836]">
                    {viewing.duration_days} days
                  </p>
                </div>

                <div>
                  <p className="text-[#8B879C]">Status</p>
                  <p className="mt-1 font-medium text-[#1F1836]">
                    {viewing.status}
                  </p>
                </div>

                <div>
                  <p className="text-[#8B879C]">Created At</p>
                  <p className="mt-1 font-medium text-[#1F1836]">
                    {viewing.created_at
                      ? new Date(viewing.created_at).toLocaleDateString("en-IN")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-[8px] bg-[#6D28D9] px-4 py-2 text-[11px] font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

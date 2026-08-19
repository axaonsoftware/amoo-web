"use client";

import { memo, useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Star,
} from "lucide-react";
import { api, qs, unwrapList, unwrapMeta, type PageMeta } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { sanitize } from "@/lib/sanitize";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { useAutoRefreshTracking } from "../AutoRefreshProvider";
import AdminPageHeader, { AdminStats } from "../shared/AdminPageHeader";
import { useToast } from "../shared/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";
import { EmptyRow, ErrorRow, TableSkeletonRows } from "../../components/states";

type Tab = "horoscopes" | "zodiac";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

type Horoscope = {
  id: number;
  zodiac_sign: string;
  horoscope_type: "daily" | "weekly" | "monthly";
  content: string;
  publish_date: string;
  status: "draft" | "published";
  created_at?: string;
};

type ZodiacSign = {
  id: number;
  name: string;
  symbol: string;
  date_range: string;
  element: string;
  ruling_planet: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
};

type HoroscopeFormState = {
  zodiac_sign: string;
  horoscope_type: "daily" | "weekly" | "monthly";
  content: string;
  publish_date: string;
  status: "draft" | "published";
};

const EMPTY_HOROSCOPE_FORM: HoroscopeFormState = {
  zodiac_sign: "Aries",
  horoscope_type: "daily",
  content: "",
  publish_date: "",
  status: "draft",
};

type ZodiacFormState = {
  description: string;
  image_url: string;
};

const HoroscopeRow = memo(function HoroscopeRow({
  h,
  onEdit,
  onDelete,
}: {
  h: Horoscope;
  onEdit: (h: Horoscope) => void;
  onDelete: (h: Horoscope) => void;
}) {
  return (
    <tr
      key={h.id}
      className="border-b border-[#F0EDF5] last:border-b-0 hover:bg-[#FAF9FE]"
    >
      <td className="px-4 py-3 font-medium text-[#3D3752]">
        {sanitize(h.zodiac_sign)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-block rounded-full bg-[#F0EAFF] px-2.5 py-0.5 text-[10px] font-medium text-[#6D28D9]">
          {h.horoscope_type}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="max-w-[280px] truncate text-[#6B6480]">
          {sanitize(h.content)}
        </p>
      </td>
      <td className="px-4 py-3 text-[#3D3752]">
        {h.publish_date ? formatDate(h.publish_date) : "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
            h.status === "published"
              ? "bg-[#E8F5E9] text-[#2E7D32]"
              : "bg-[#F0EDF5] text-[#5A6472]"
          }`}
        >
          {h.status === "published" ? "Published" : "Draft"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(h)}
            aria-label={`Edit horoscope for ${h.zodiac_sign}`}
            className="rounded-md p-1.5 text-[#6D28D9] hover:bg-[#F0EAFF]"
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(h)}
            aria-label={`Delete horoscope for ${h.zodiac_sign}`}
            className="rounded-md p-1.5 text-[#C62828] hover:bg-[#FFEBEE]"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("horoscopes");

  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);
  const [horoscopeMeta, setHoroscopeMeta] = useState<PageMeta | null>(null);
  const [hLoading, setHLoading] = useState(true);
  const [hError, setHError] = useState<string | null>(null);
  const [hSearch, setHSearch] = useState("");
  const [hFilterSign, setHFilterSign] = useState("");
  const [hFilterType, setHFilterType] = useState("");
  const [hFilterStatus, setHFilterStatus] = useState("");
  const [hPage, setHPage] = useState(1);

  const [showHForm, setShowHForm] = useState(false);
  const [editingH, setEditingH] = useState<Horoscope | null>(null);
  const [hForm, setHForm] = useState<HoroscopeFormState>(EMPTY_HOROSCOPE_FORM);
  const [hSaving, setHSaving] = useState(false);
  const [hFormError, setHFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Horoscope | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [zodiacSigns, setZodiacSigns] = useState<ZodiacSign[]>([]);
  const [zLoading, setZLoading] = useState(true);
  const [zError, setZError] = useState<string | null>(null);
  const [editingZ, setEditingZ] = useState<ZodiacSign | null>(null);
  const [zForm, setZForm] = useState<ZodiacFormState>({
    description: "",
    image_url: "",
  });
  const [zSaving, setZSaving] = useState(false);

  const { showToast, Toast } = useToast();

  const loadHoroscopes = useCallback(() => {
    setHLoading(true);
    setHError(null);
    api.admin
      .getHoroscopes(
        qs({
          search: hSearch,
          zodiac_sign: hFilterSign,
          horoscope_type: hFilterType,
          status: hFilterStatus,
          page: hPage,
          limit: 20,
        }),
      )
      .then((res: unknown) => {
        setHoroscopes(unwrapList<Horoscope>(res));
        setHoroscopeMeta(unwrapMeta(res));
      })
      .catch((e: Error) =>
        setHError(e?.message || "Failed to load horoscopes"),
      )
      .finally(() => setHLoading(false));
  }, [hSearch, hFilterSign, hFilterType, hFilterStatus, hPage]);

  const loadZodiacSigns = useCallback(() => {
    setZLoading(true);
    setZError(null);
    api.admin
      .getZodiacSigns()
      .then((res: unknown) => setZodiacSigns(unwrapList<ZodiacSign>(res)))
      .catch((e: Error) =>
        setZError(e?.message || "Failed to load zodiac signs"),
      )
      .finally(() => setZLoading(false));
  }, []);

  const { isRefreshing } = useAutoRefresh(loadHoroscopes);
  const { start, stop } = useAutoRefreshTracking();
  useEffect(() => {
    if (isRefreshing) start(); else stop();
  }, [isRefreshing, start, stop]);

  useEffect(() => {
    const t = setTimeout(loadHoroscopes, hSearch ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadHoroscopes, hSearch]);

  useEffect(() => setHPage(1), [hSearch, hFilterSign, hFilterType, hFilterStatus]);

  useEffect(() => {
    if (activeTab === "zodiac" && zodiacSigns.length === 0) {
      loadZodiacSigns();
    }
  }, [activeTab, zodiacSigns.length, loadZodiacSigns]);

  const openCreateH = () => {
    setEditingH(null);
    setHForm(EMPTY_HOROSCOPE_FORM);
    setHFormError(null);
    setShowHForm(true);
  };

  const openEditH = (h: Horoscope) => {
    setEditingH(h);
    setHForm({
      zodiac_sign: h.zodiac_sign,
      horoscope_type: h.horoscope_type,
      content: h.content,
      publish_date: h.publish_date
        ? String(h.publish_date).slice(0, 10)
        : "",
      status: h.status,
    });
    setHFormError(null);
    setShowHForm(true);
  };

  const handleSaveH = async () => {
    setHFormError(null);
    if (!hForm.content.trim()) return setHFormError("Content is required.");
    if (!hForm.publish_date)
      return setHFormError("Publish date is required.");

    const payload = {
      zodiac_sign: hForm.zodiac_sign,
      horoscope_type: hForm.horoscope_type,
      content: hForm.content.trim(),
      publish_date: hForm.publish_date,
      status: hForm.status,
    };

    setHSaving(true);
    try {
      if (editingH) {
        await api.admin.updateHoroscope(editingH.id, payload);
        showToast(`Horoscope for ${payload.zodiac_sign} updated`);
      } else {
        await api.admin.createHoroscope(payload);
        showToast(`Horoscope for ${payload.zodiac_sign} created`);
      }
      setShowHForm(false);
      loadHoroscopes();
    } catch (e) {
      setHFormError((e as Error)?.message || "Failed to save horoscope");
    } finally {
      setHSaving(false);
    }
  };

  const handleDeleteH = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteHoroscope(deleteTarget.id);
      showToast(`Horoscope for ${deleteTarget.zodiac_sign} deleted`);
      setDeleteTarget(null);
      loadHoroscopes();
    } catch (e) {
      showToast(
        (e as Error)?.message || "Failed to delete horoscope",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const openEditZ = (z: ZodiacSign) => {
    setEditingZ(z);
    setZForm({
      description: z.description ?? "",
      image_url: z.image_url ?? "",
    });
  };

  const closeEditZ = () => setEditingZ(null);

  const handleSaveZ = async () => {
    if (!editingZ) return;
    setZSaving(true);
    try {
      await api.admin.updateZodiacSign(editingZ.id, {
        description: zForm.description.trim(),
        image_url: zForm.image_url.trim() || null,
      });
      showToast(`${editingZ.name} updated`);
      closeEditZ();
      loadZodiacSigns();
    } catch (e) {
      showToast(
        (e as Error)?.message || "Failed to update zodiac sign",
        "error",
      );
    } finally {
      setZSaving(false);
    }
  };

  const handleToggleZodiacActive = async (z: ZodiacSign) => {
    try {
      await api.admin.updateZodiacSign(z.id, { active: !z.active });
      showToast(`${z.name} ${!z.active ? "activated" : "deactivated"}`);
      loadZodiacSigns();
    } catch (e) {
      showToast(
        (e as Error)?.message || "Failed to update zodiac sign",
        "error",
      );
    }
  };

  const HCOLS = 6;

  const handleEditH = useCallback((h: Horoscope) => openEditH(h), []);
  const handleDeleteH2 = useCallback(
    (h: Horoscope) => setDeleteTarget(h),
    [],
  );

  const tabBtn = (tab: Tab, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 rounded-[8px] px-4 py-2 text-[12px] font-medium transition-colors ${
        activeTab === tab
          ? "bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-[0_4px_12px_rgba(109,40,217,.25)]"
          : "border border-[#E5E1F0] bg-white text-[#6B6480] hover:bg-[#FAF9FE]"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <AdminPageHeader
        title="Content Management"
        description="Manage horoscopes and zodiac signs content."
        Icon={Sparkles}
        action={
          activeTab === "horoscopes" ? (
            <button
              type="button"
              onClick={openCreateH}
              className="flex h-[38px] items-center gap-[7px] rounded-[9px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[15px] text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(109,40,217,.25)]"
            >
              <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
              New Horoscope
            </button>
          ) : undefined
        }
      />

      <div className="mt-5 flex items-center gap-3">
        {tabBtn("horoscopes", "Horoscopes", <Sparkles size={14} aria-hidden="true" />)}
        {tabBtn("zodiac", "Zodiac Signs", <Star size={14} aria-hidden="true" />)}
      </div>

      {activeTab === "horoscopes" && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-[360px] flex-1">
              <label htmlFor="h-search" className="sr-only">
                Search horoscopes
              </label>
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B879C]"
                aria-hidden="true"
              />
              <input
                id="h-search"
                type="search"
                placeholder="Search content..."
                value={hSearch}
                onChange={(e) => setHSearch(e.target.value)}
                className="h-[36px] w-full rounded-[8px] border border-[#E5E1F0] bg-white pl-9 pr-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
              />
            </div>
            <label htmlFor="h-filter-sign" className="sr-only">
              Filter by zodiac sign
            </label>
            <select
              id="h-filter-sign"
              value={hFilterSign}
              onChange={(e) => setHFilterSign(e.target.value)}
              className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
            >
              <option value="">All Signs</option>
              {ZODIAC_SIGNS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label htmlFor="h-filter-type" className="sr-only">
              Filter by type
            </label>
            <select
              id="h-filter-type"
              value={hFilterType}
              onChange={(e) => setHFilterType(e.target.value)}
              className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <label htmlFor="h-filter-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="h-filter-status"
              value={hFilterStatus}
              onChange={(e) => setHFilterStatus(e.target.value)}
              className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <AdminStats
            stats={[
              { label: "Total Horoscopes", value: horoscopeMeta?.total ?? horoscopes.length },
              {
                label: "Published",
                value: horoscopes.filter((h) => h.status === "published").length,
              },
              {
                label: "Drafts",
                value: horoscopes.filter((h) => h.status === "draft").length,
              },
              {
                label: "Zodiac Signs",
                value: ZODIAC_SIGNS.length,
              },
            ]}
          />

          <div className="mt-5 overflow-x-auto rounded-[12px] border border-[#E5E1F0] bg-white">
            <table className="w-full min-w-[760px] text-left text-[12px]">
              <caption className="sr-only">Horoscopes</caption>
              <thead>
                <tr className="border-b border-[#E5E1F0] bg-[#FAF9FE]">
                  <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                    Zodiac Sign
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                    Content
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">
                    Publish Date
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
                {hLoading ? (
                  <TableSkeletonRows rows={5} cols={HCOLS} />
                ) : hError ? (
                  <ErrorRow colSpan={HCOLS} message={hError} onRetry={loadHoroscopes} />
                ) : horoscopes.length === 0 ? (
                  <EmptyRow
                    colSpan={HCOLS}
                    title="No horoscopes yet"
                    message="Create your first horoscope — it will appear for the selected zodiac sign once published."
                  />
                ) : (
                  horoscopes.map((h) => (
                    <HoroscopeRow
                      key={h.id}
                      h={h}
                      onEdit={handleEditH}
                      onDelete={handleDeleteH2}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {horoscopeMeta && horoscopeMeta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setHPage((p) => Math.max(1, p - 1))}
                disabled={hPage <= 1}
                className="rounded-[8px] border border-[#E5E1F0] px-3 py-1.5 text-[11.5px] text-[#3D3752] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[11.5px] text-[#8B879C]">
                Page {horoscopeMeta.page} of {horoscopeMeta.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setHPage((p) => Math.min(horoscopeMeta.totalPages, p + 1))
                }
                disabled={hPage >= horoscopeMeta.totalPages}
                className="rounded-[8px] border border-[#E5E1F0] px-3 py-1.5 text-[11.5px] text-[#3D3752] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "zodiac" && (
        <>
          {zLoading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-[14px] border border-[#E5E1F0] bg-white p-5"
                >
                  <div className="h-5 w-24 rounded bg-[#f0eaf8]" />
                  <div className="mt-3 h-3 w-16 rounded bg-[#f0eaf8]" />
                  <div className="mt-2 h-3 w-32 rounded bg-[#f0eaf8]" />
                  <div className="mt-2 h-3 w-20 rounded bg-[#f0eaf8]" />
                  <div className="mt-3 h-3 w-28 rounded bg-[#f0eaf8]" />
                </div>
              ))}
            </div>
          ) : zError ? (
            <div className="mt-5 rounded-[12px] border border-[#F6D7D7] bg-[#FEF6F6] p-6 text-center">
              <p className="text-[13px] font-semibold text-[#B42318]">
                Couldn&apos;t load zodiac signs
              </p>
              <p className="mt-1 text-[12px] text-[#8B879C]">{zError}</p>
              <button
                type="button"
                onClick={loadZodiacSigns}
                className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] bg-[#6D28D9] px-3.5 py-2 text-[12px] font-medium text-white hover:bg-[#5B21B6]"
              >
                Try again
              </button>
            </div>
          ) : zodiacSigns.length === 0 ? (
            <div className="mt-5 rounded-[12px] border border-[#E5E1F0] bg-white p-10 text-center">
              <p className="text-[14px] font-semibold text-[#231640]">
                No zodiac signs found
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zodiacSigns.map((z) => (
                <div
                  key={z.id}
                  className={`rounded-[14px] border bg-white p-5 transition-colors ${
                    editingZ?.id === z.id
                      ? "border-[#7C3AED] shadow-[0_0_0_2px_rgba(124,58,237,.15)]"
                      : "border-[#E5E1F0]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-[16px] font-bold text-[#231640]">
                        {sanitize(z.name)}{" "}
                        <span className="text-[#8B879C]">{sanitize(z.symbol)}</span>
                      </h3>
                      <p className="mt-1 text-[11px] text-[#8B879C]">
                        {sanitize(z.date_range)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleZodiacActive(z)}
                        aria-label={`${z.active ? "Deactivate" : "Activate"} ${z.name}`}
                        className={`relative h-[22px] w-[40px] rounded-full transition-colors ${
                          z.active ? "bg-[#6D28D9]" : "bg-[#D1CDE0]"
                        }`}
                      >
                        <span
                          className={`absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow transition-transform ${
                            z.active ? "left-[21px]" : "left-[3px]"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => (editingZ?.id === z.id ? closeEditZ() : openEditZ(z))}
                        aria-label={`Edit ${z.name}`}
                        className="rounded-md p-1.5 text-[#6D28D9] hover:bg-[#F0EAFF]"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-[11px] text-[#6B6480]">
                      <span className="font-medium text-[#3D3752]">Element:</span>{" "}
                      {z.element ? sanitize(z.element) : "—"}
                    </p>
                    <p className="text-[11px] text-[#6B6480]">
                      <span className="font-medium text-[#3D3752]">Ruling Planet:</span>{" "}
                      {z.ruling_planet ? sanitize(z.ruling_planet) : "—"}
                    </p>
                  </div>

                  {editingZ?.id === z.id && (
                    <div className="mt-4 space-y-3 border-t border-[#EEEDF4] pt-4">
                      <div>
                        <label
                          htmlFor={`z-desc-${z.id}`}
                          className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                        >
                          Description
                        </label>
                        <textarea
                          id={`z-desc-${z.id}`}
                          rows={3}
                          value={zForm.description}
                          onChange={(e) =>
                            setZForm({ ...zForm, description: e.target.value })
                          }
                          className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`z-image-${z.id}`}
                          className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                        >
                          Image URL
                        </label>
                        <input
                          id={`z-image-${z.id}`}
                          type="url"
                          value={zForm.image_url}
                          onChange={(e) =>
                            setZForm({ ...zForm, image_url: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeEditZ}
                          className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#8B879C] hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveZ}
                          disabled={zSaving}
                          className="flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-50"
                        >
                          {zSaving && (
                            <Loader2
                              size={13}
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showHForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="horoscope-form-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2
                id="horoscope-form-title"
                className="font-display text-lg font-bold text-[#231640]"
              >
                {editingH ? "Edit Horoscope" : "New Horoscope"}
              </h2>
              <button
                type="button"
                onClick={() => setShowHForm(false)}
                aria-label="Close"
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X size={18} className="text-[#8B879C]" aria-hidden="true" />
              </button>
            </div>

            {hFormError && (
              <div
                role="alert"
                className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-700"
              >
                {hFormError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="h-sign"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Zodiac Sign
                  </label>
                  <select
                    id="h-sign"
                    value={hForm.zodiac_sign}
                    onChange={(e) =>
                      setHForm({ ...hForm, zodiac_sign: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    {ZODIAC_SIGNS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="h-type"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Type
                  </label>
                  <select
                    id="h-type"
                    value={hForm.horoscope_type}
                    onChange={(e) =>
                      setHForm({
                        ...hForm,
                        horoscope_type: e.target.value as
                          | "daily"
                          | "weekly"
                          | "monthly",
                      })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="h-content"
                  className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                >
                  Content
                </label>
                <textarea
                  id="h-content"
                  rows={6}
                  value={hForm.content}
                  onChange={(e) =>
                    setHForm({ ...hForm, content: e.target.value })
                  }
                  placeholder="Write the horoscope reading..."
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="h-date"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Publish Date
                  </label>
                  <input
                    id="h-date"
                    type="date"
                    value={hForm.publish_date}
                    onChange={(e) =>
                      setHForm({ ...hForm, publish_date: e.target.value })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="h-status"
                    className="mb-1 block text-[11px] font-medium text-[#3D3752]"
                  >
                    Status
                  </label>
                  <select
                    id="h-status"
                    value={hForm.status}
                    onChange={(e) =>
                      setHForm({
                        ...hForm,
                        status: e.target.value as "draft" | "published",
                      })
                    }
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowHForm(false)}
                className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#8B879C] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveH}
                disabled={hSaving}
                className="flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-50"
              >
                {hSaving && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                )}
                {editingH ? "Save Changes" : "Create Horoscope"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete horoscope?"
        message={
          deleteTarget
            ? `This horoscope for ${deleteTarget.zodiac_sign} (${deleteTarget.horoscope_type}) will be permanently deleted.`
            : ""
        }
        onConfirm={handleDeleteH}
        onCancel={() => setDeleteTarget(null)}
        saving={deleting}
      />

      <Toast />
    </main>
  );
}

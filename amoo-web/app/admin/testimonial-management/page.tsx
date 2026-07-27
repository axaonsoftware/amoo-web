"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { MessageSquareQuote, Star, Check, EyeOff, Trash2, Loader2 } from "lucide-react";
import { api, qs, unwrapList, unwrapMeta, type PageMeta } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { sanitize } from "@/lib/sanitize";
import AdminPageHeader, { AdminStats } from "../shared/AdminPageHeader";
import { useToast } from "../shared/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";
import { EmptyState, ErrorState, ListSkeleton } from "../../components/states";

/**
 * Testimonial moderation queue.
 *
 * `POST /api/testimonials` deliberately inserts new submissions as
 * `status = 'Inactive'` so an admin can approve them before they appear on the
 * public site — a good design. But the only route that can flip that status,
 * `PATCH /api/testimonials/:id`, had no UI, and neither did `GET /all`.
 *
 * The result was a moderation queue with no moderator: every testimonial a
 * customer submitted went into the table and stayed invisible forever, and the
 * public testimonial carousels could only ever show seeded rows.
 */

type Testimonial = {
  id: number;
  user_id: number | null;
  name: string | null;
  avatar: string | null;
  comment: string;
  rating: number;
  status: "Active" | "Inactive";
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          aria-hidden="true"
          className={i < value ? "fill-[#F0B429] text-[#F0B429]" : "text-[#D9D5E4]"}
        />
      ))}
    </span>
  );
}

const TestimonialItem = memo(function TestimonialItem({
  t,
  busyId,
  onPublish,
  onHide,
  onDelete,
}: {
  t: Testimonial;
  busyId: number | null;
  onPublish: (t: Testimonial) => void;
  onHide: (t: Testimonial) => void;
  onDelete: (t: Testimonial) => void;
}) {
  return (
    <li key={t.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
      {t.avatar ? (
        <Image
          src={t.avatar}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[12px] font-bold text-white"
        >
          {initials(t.name)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12.5px] font-semibold text-[#231640]">
            {sanitize(t.name) || "Anonymous"}
          </p>
          <Stars rating={t.rating} />
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              t.status === "Active"
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "bg-[#FFF4E5] text-[#B26A00]"
            }`}
          >
            {t.status === "Active" ? "Published" : "Pending"}
          </span>
          <span className="text-[10.5px] text-[#8B879C]">{formatDate(t.created_at)}</span>
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-[12px] leading-relaxed text-[#3D3752]">
          {sanitize(t.comment)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {t.status === "Inactive" ? (
          <button
            type="button"
            onClick={() => onPublish(t)}
            disabled={busyId === t.id}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E8F5E9] px-3 py-1.5 text-[11.5px] font-medium text-[#2E7D32] hover:bg-[#D6EFD8] disabled:opacity-50"
          >
            {busyId === t.id ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Check size={13} aria-hidden="true" />
            )}
            Publish
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onHide(t)}
            disabled={busyId === t.id}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E5E1F0] px-3 py-1.5 text-[11.5px] font-medium text-[#8B879C] hover:bg-gray-50 disabled:opacity-50"
          >
            {busyId === t.id ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <EyeOff size={13} aria-hidden="true" />
            )}
            Hide
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(t)}
          aria-label={`Delete testimonial from ${t.name || "Anonymous"}`}
          className="rounded-md p-1.5 text-[#C62828] hover:bg-[#FFEBEE]"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
});

export default function TestimonialManagementPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Inactive"); // pending queue first — that is the job
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast, Toast } = useToast();

  const load = useCallback(() => {
    setError(null);
    api.admin
      .getTestimonials(qs({ status, page, limit: 20 }))
      .then((res: unknown) => {
        setItems(unwrapList<Testimonial>(res));
        setMeta(unwrapMeta(res));
      })
      .catch((e: Error) => setError(e?.message || "Failed to load testimonials"))
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status]);

  const setStatusFor = async (t: Testimonial, next: "Active" | "Inactive") => {
    setBusyId(t.id);
    try {
      await api.admin.updateTestimonial(t.id, { status: next });
      showToast(next === "Active" ? "Testimonial published" : "Testimonial hidden");
      load();
    } catch (e) {
      showToast((e as Error)?.message || "Failed to update", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteTestimonial(deleteTarget.id);
      showToast("Testimonial deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      showToast((e as Error)?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishTestimonial = useCallback((t: Testimonial) => setStatusFor(t, "Active"), []);
  const handleHideTestimonial = useCallback((t: Testimonial) => setStatusFor(t, "Inactive"), []);
  const handleDeleteTestimonial = useCallback((t: Testimonial) => setDeleteTarget(t), []);

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <AdminPageHeader
        title="Testimonial Moderation"
        description="Review customer testimonials before they appear on the public site."
        Icon={MessageSquareQuote}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter testimonials" className="flex gap-2">
          {[
            { label: "Pending review", value: "Inactive" },
            { label: "Published", value: "Active" },
            { label: "All", value: "" },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              onClick={() => setStatus(t.value)}
              className={`rounded-[8px] px-3 py-1.5 text-[11.5px] font-medium ${
                status === t.value
                  ? "bg-[#F0EAFF] text-[#6D28D9]"
                  : "border border-[#E5E1F0] bg-white text-[#8B879C] hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AdminStats
        stats={[
          { label: "Showing", value: items.length },
          { label: "Total (filter)", value: meta?.total ?? "—" },
          {
            label: "Average Rating",
            value: items.length
              ? (items.reduce((s, t) => s + (Number(t.rating) || 0), 0) / items.length).toFixed(1)
              : "—",
          },
          { label: "5-Star", value: items.filter((t) => Number(t.rating) === 5).length },
        ]}
      />

      <div className="mt-5 rounded-[12px] border border-[#E5E1F0] bg-white p-4">
        {loading ? (
          <ListSkeleton rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title={status === "Inactive" ? "Nothing awaiting review" : "No testimonials"}
            message={
              status === "Inactive"
                ? "New submissions arrive here for approval before going live."
                : "Customer testimonials will appear here once submitted."
            }
            icon={<MessageSquareQuote className="h-6 w-6" strokeWidth={1.8} />}
          />
        ) : (
          <ul className="divide-y divide-[#F0EDF5]">
            {items.map((t) => (
              <TestimonialItem
                key={t.id}
                t={t}
                busyId={busyId}
                onPublish={handlePublishTestimonial}
                onHide={handleHideTestimonial}
                onDelete={handleDeleteTestimonial}
              />
            ))}
          </ul>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-[8px] border border-[#E5E1F0] px-3 py-1.5 text-[11.5px] text-[#3D3752] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[11.5px] text-[#8B879C]">Page {meta.page} of {meta.totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="rounded-[8px] border border-[#E5E1F0] px-3 py-1.5 text-[11.5px] text-[#3D3752] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete testimonial?"
        message="This removes the testimonial from the site. It is a soft delete — the row is retained in the database."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        saving={deleting}
      />

      <Toast />
    </main>
  );
}

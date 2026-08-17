"use client";

import { memo, useCallback, useEffect, useState } from "react";
import {
  Inbox,
  Search,
  Trash2,
  Mail,
  Phone,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { api, qs, unwrapList, unwrapMeta, type PageMeta } from "@/lib/api";
import { formatDateTime, formatRelative } from "@/lib/format";
import { sanitize } from "@/lib/sanitize";
import AdminPageHeader, { AdminStats } from "../shared/AdminPageHeader";
import { useToast } from "../shared/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";
import { EmptyState, ErrorState, ListSkeleton } from "../../components/states";

/**
 * Admin inbox for public contact-form enquiries.
 *
 * `POST /api/contact` is public and has always accepted submissions into the
 * `contacts` table. The four admin routes to read, triage, reply to and delete
 * them (`GET /api/contact`, `GET /api/contact/:id`, `PATCH /api/contact/:id`,
 * `DELETE /api/contact/:id`) were fully implemented, and `lib/api.ts` exposed
 * all four — but no page ever called them.
 *
 * So the "Contact Us" form on the marketing site accepted messages from real
 * customers straight into a table nobody could see. Every enquiry since launch
 * is sitting there unread.
 */

type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  reply: string | null;
  status: "new" | "replied" | "closed";
  created_at: string;
};

const STATUS_STYLES: Record<Contact["status"], string> = {
  new: "bg-[#E7F0FE] text-[#2563EB]",
  replied: "bg-[#E8F5E9] text-[#2E7D32]",
  closed: "bg-[#EEF0F5] text-[#5A6472]",
};

const ContactItem = memo(function ContactItem({
  c,
  onSelect,
}: {
  c: Contact;
  onSelect: (c: Contact) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(c)}
        className="flex w-full items-start gap-3 rounded-[8px] px-2 py-3 text-left hover:bg-[#FAF9FE]"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[11px] font-bold text-white"
        >
          {(c.name || "?").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12.5px] font-semibold text-[#231640]">
              {sanitize(c.name)}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[c.status]}`}
            >
              {c.status}
            </span>
            <span className="ml-auto text-[10.5px] text-[#8B879C]">
              {formatRelative(c.created_at)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11.5px] font-medium text-[#3D3752]">
            {sanitize(c.subject) || "(no subject)"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#8B879C]">
            {sanitize(c.message)}
          </p>
        </div>
      </button>
    </li>
  );
});

export default function ContactInboxPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast, Toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getContacts(qs({ search, status, page, limit: 20 }))
      .then((res: unknown) => {
        setItems(unwrapList<Contact>(res));
        setMeta(unwrapMeta(res));
      })
      .catch((e: Error) => setError(e?.message || "Failed to load enquiries"))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  // Any filter change invalidates the current page number.
  useEffect(() => setPage(1), [search, status]);

  const openDetail = (c: Contact) => {
    setSelected(c);
    setReplyText(c.reply ?? "");
  };

  const saveReply = async (nextStatus: Contact["status"]) => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.admin.updateContact(selected.id, {
        status: nextStatus,
        ...(replyText.trim() ? { reply: replyText.trim() } : {}),
      });
      showToast(nextStatus === "closed" ? "Enquiry closed" : "Reply saved");
      setSelected(null);
      load();
    } catch (e) {
      showToast((e as Error)?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteContact(deleteTarget.id);
      showToast("Enquiry deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      showToast((e as Error)?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  const newCount = items.filter((c) => c.status === "new").length;

  const handleSelectContact = useCallback((c: Contact) => {
    setSelected(c);
    setReplyText(c.reply ?? "");
  }, []);

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <AdminPageHeader
        title="Contact Inbox"
        description="Enquiries submitted through the public contact form."
        Icon={Inbox}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-[360px] flex-1">
          <label htmlFor="contact-search" className="sr-only">
            Search enquiries
          </label>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B879C]"
            aria-hidden="true"
          />
          <input
            id="contact-search"
            type="search"
            placeholder="Search name, email or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[36px] w-full rounded-[8px] border border-[#E5E1F0] bg-white pl-9 pr-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <label htmlFor="contact-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="contact-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
        >
          <option value="">All Enquiries</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <AdminStats
        stats={[
          { label: "Total (this page)", value: items.length },
          { label: "Awaiting Reply", value: newCount },
          {
            label: "Replied",
            value: items.filter((c) => c.status === "replied").length,
          },
          { label: "All Enquiries", value: meta?.total ?? "—" },
        ]}
      />

      <div className="mt-5 rounded-[12px] border border-[#E5E1F0] bg-white p-4">
        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No enquiries"
            message="Messages sent through the public contact form will appear here."
            icon={<Inbox className="h-6 w-6" strokeWidth={1.8} />}
          />
        ) : (
          <ul className="divide-y divide-[#F0EDF5]">
            {items.map((c) => (
              <ContactItem key={c.id} c={c} onSelect={handleSelectContact} />
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
          <span className="text-[11.5px] text-[#8B879C]">
            Page {meta.page} of {meta.totalPages}
          </span>
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="enquiry-title"
                  className="font-display text-lg font-bold text-[#231640]"
                >
                  {sanitize(selected.subject) || "Enquiry"}
                </h2>
                <p className="mt-1 text-[11px] text-[#8B879C]">
                  From {sanitize(selected.name)} ·{" "}
                  {formatDateTime(selected.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X size={18} className="text-[#8B879C]" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-[11.5px]">
              <a
                href={`mailto:${encodeURIComponent(selected.email)}`}
                className="inline-flex items-center gap-1.5 text-[#6D28D9] hover:underline"
              >
                <Mail size={13} aria-hidden="true" />
                {sanitize(selected.email)}
              </a>
              {selected.phone && (
                <a
                  href={`tel:${encodeURIComponent(selected.phone)}`}
                  className="inline-flex items-center gap-1.5 text-[#6D28D9] hover:underline"
                >
                  <Phone size={13} aria-hidden="true" />
                  {sanitize(selected.phone)}
                </a>
              )}
            </div>

            {/* sanitize() strips markup; React escapes the text node. The
                message is public, unauthenticated input. */}
            <div className="mt-4 whitespace-pre-wrap rounded-[10px] border border-[#EFEDF6] bg-[#FAF9FE] p-4 text-[12.5px] leading-relaxed text-[#3D3752]">
              {sanitize(selected.message)}
            </div>

            <div className="mt-5">
              <label
                htmlFor="enquiry-reply"
                className="mb-1 block text-[11px] font-medium text-[#3D3752]"
              >
                Internal reply note
              </label>
              <textarea
                id="enquiry-reply"
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Record what was said in reply, for the team's reference..."
                className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
              />
              {/* Stated plainly: PATCH /api/contact/:id stores `reply` and
                  sends nothing. Implying otherwise would leave customers
                  waiting for an email that never arrives. */}
              <p className="mt-1.5 text-[10.5px] text-[#8B879C]">
                This is stored against the enquiry for your records — it does{" "}
                <strong>not</strong> email the customer. Use the email link
                above to reply directly.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(selected)}
                className="mr-auto inline-flex items-center gap-1.5 rounded-[8px] border border-[#F3D3D3] px-3 py-2 text-[12px] font-medium text-[#C62828] hover:bg-[#FFEBEE]"
              >
                <Trash2 size={13} aria-hidden="true" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => saveReply("closed")}
                disabled={saving}
                className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#3D3752] hover:bg-gray-50 disabled:opacity-50"
              >
                Close enquiry
              </button>
              <button
                type="button"
                onClick={() => saveReply("replied")}
                disabled={saving}
                className="flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2 size={13} aria-hidden="true" />
                )}
                Mark replied
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete enquiry?"
        message={
          deleteTarget
            ? `The enquiry from ${deleteTarget.name} will be permanently deleted. This cannot be undone.`
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

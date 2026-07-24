"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Pencil, Trash2, Search, X, Loader2, Eye } from "lucide-react";
import { api, qs, unwrapList, unwrapMeta, type PageMeta } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { sanitize } from "@/lib/sanitize";
import AdminPageHeader, { AdminStats } from "../shared/AdminPageHeader";
import { useToast } from "../shared/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";
import { EmptyRow, ErrorRow, TableSkeletonRows } from "../../components/states";

/**
 * Admin blog management.
 *
 * `/api/blogs` has full admin CRUD and `lib/api.ts` exposed getBlogs/createBlog/
 * updateBlog/deleteBlog — none of which any page called. The public `/blog`
 * listing and `/blog/[slug]` reader were live, so the site had a blog that could
 * only ever be populated by writing SQL by hand.
 */

type Blog = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image: string | null;
  author: string | null;
  author_avatar: string | null;
  read_time: string | null;
  views: number;
  status: "draft" | "published";
  created_at: string;
};

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  read_time: string;
  status: "draft" | "published";
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "",
  image: "",
  author: "",
  read_time: "",
  status: "draft",
};

/** "Reiki & You: A Guide" -> "reiki-you-a-guide" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 255);
}

/** Rough reading time, so the field does not have to be filled by hand. */
function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast, Toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getBlogs(qs({ search, status, page, limit: 20 }))
      .then((res: unknown) => {
        setPosts(unwrapList<Blog>(res));
        setMeta(unwrapMeta(res));
      })
      .catch((e: Error) => setError(e?.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => setPage(1), [search, status]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (b: Blog) => {
    setEditing(b);
    setForm({
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt ?? "",
      content: b.content ?? "",
      category: b.category ?? "",
      image: b.image ?? "",
      author: b.author ?? "",
      read_time: b.read_time ?? "",
      status: b.status,
    });
    // Never auto-rewrite the slug of a published post: it is the permalink, and
    // changing it silently breaks every existing link and its search ranking.
    setSlugTouched(true);
    setFormError(null);
    setShowForm(true);
  };

  const onTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.title.trim()) return setFormError("Title is required.");
    if (!form.slug.trim()) return setFormError("Slug is required.");
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      return setFormError("Slug may contain only lowercase letters, numbers and hyphens.");
    }

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category.trim(),
      image: form.image.trim(),
      author: form.author.trim(),
      read_time: form.read_time.trim() || estimateReadTime(form.content),
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.admin.updateBlog(editing.id, payload);
        showToast("Post updated");
      } else {
        await api.admin.createBlog(payload);
        showToast("Post created");
      }
      setShowForm(false);
      load();
    } catch (e) {
      setFormError((e as Error)?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteBlog(deleteTarget.id);
      showToast("Post deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      showToast((e as Error)?.message || "Failed to delete post", "error");
    } finally {
      setDeleting(false);
    }
  };

  const COLS = 6;

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <AdminPageHeader
        title="Blog Management"
        description="Write and publish articles for the public blog."
        Icon={FileText}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex h-[38px] items-center gap-[7px] rounded-[9px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[15px] text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(109,40,217,.25)]"
          >
            <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
            New Post
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-[360px] flex-1">
          <label htmlFor="blog-search" className="sr-only">Search posts</label>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B879C]" aria-hidden="true" />
          <input
            id="blog-search"
            type="search"
            placeholder="Search title or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[36px] w-full rounded-[8px] border border-[#E5E1F0] bg-white pl-9 pr-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <label htmlFor="blog-status" className="sr-only">Filter by status</label>
        <select
          id="blog-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
        >
          <option value="">All Posts</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <AdminStats
        stats={[
          { label: "All Posts", value: meta?.total ?? posts.length },
          { label: "Published", value: posts.filter((p) => p.status === "published").length },
          { label: "Drafts", value: posts.filter((p) => p.status === "draft").length },
          { label: "Views (this page)", value: formatNumber(posts.reduce((s, p) => s + (p.views || 0), 0)) },
        ]}
      />

      <div className="mt-5 overflow-x-auto rounded-[12px] border border-[#E5E1F0] bg-white">
        <table className="w-full min-w-[720px] text-left text-[12px]">
          <caption className="sr-only">Blog posts</caption>
          <thead>
            <tr className="border-b border-[#E5E1F0] bg-[#FAF9FE]">
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">Title</th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">Category</th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">Views</th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">Created</th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">Status</th>
              <th scope="col" className="px-4 py-3 font-medium text-[#8B879C]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={5} cols={COLS} />
            ) : error ? (
              <ErrorRow colSpan={COLS} message={error} onRetry={load} />
            ) : posts.length === 0 ? (
              <EmptyRow
                colSpan={COLS}
                title="No posts yet"
                message="Write your first article — it will appear on the public /blog page once published."
              />
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-b border-[#F0EDF5] last:border-b-0 hover:bg-[#FAF9FE]">
                  <td className="px-4 py-3">
                    <p className="max-w-[320px] truncate font-medium text-[#3D3752]">{sanitize(p.title)}</p>
                    <p className="mt-0.5 truncate font-mono text-[10.5px] text-[#8B879C]">/{sanitize(p.slug)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.category ? (
                      <span className="inline-block rounded-full bg-[#F0EAFF] px-2.5 py-0.5 text-[10px] font-medium text-[#6D28D9]">
                        {sanitize(p.category)}
                      </span>
                    ) : (
                      <span className="text-[#8B879C]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#3D3752]">{formatNumber(p.views)}</td>
                  <td className="px-4 py-3 text-[#3D3752]">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        p.status === "published"
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-[#FFF4E5] text-[#B26A00]"
                      }`}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === "published" && (
                        <Link
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          aria-label={`View ${p.title} on the public site`}
                          className="rounded-md p-1.5 text-[#3D3752] hover:bg-[#F0EDF5]"
                        >
                          <Eye size={14} aria-hidden="true" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.title}`}
                        className="rounded-md p-1.5 text-[#6D28D9] hover:bg-[#F0EAFF]"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        aria-label={`Delete ${p.title}`}
                        className="rounded-md p-1.5 text-[#C62828] hover:bg-[#FFEBEE]"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-form-title"
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="blog-form-title" className="font-display text-lg font-bold text-[#231640]">
                {editing ? "Edit Post" : "New Post"}
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
              <div role="alert" className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="b-title" className="mb-1 block text-[11px] font-medium text-[#3D3752]">Title</label>
                <input
                  id="b-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label htmlFor="b-slug" className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Slug <span className="text-[#8B879C]">— the permalink, /blog/&lt;slug&gt;</span>
                </label>
                <input
                  id="b-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 font-mono text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
                {editing && (
                  <p className="mt-1 text-[10.5px] text-[#B26A00]">
                    Changing the slug breaks existing links to this post.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="b-category" className="mb-1 block text-[11px] font-medium text-[#3D3752]">Category</label>
                  <input
                    id="b-category"
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Numerology"
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label htmlFor="b-author" className="mb-1 block text-[11px] font-medium text-[#3D3752]">Author</label>
                  <input
                    id="b-author"
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="b-image" className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Cover image URL
                </label>
                <input
                  id="b-image"
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
                {/* next.config.ts restricts next/image to specific hosts, so an
                    arbitrary URL will fail to render rather than 404 quietly. */}
                <p className="mt-1 text-[10.5px] text-[#8B879C]">
                  Must be an allowed image host (see <code>images.remotePatterns</code> in next.config.ts).
                </p>
              </div>

              <div>
                <label htmlFor="b-excerpt" className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Excerpt <span className="text-[#8B879C]">— shown on the blog index and in link previews</span>
                </label>
                <textarea
                  id="b-excerpt"
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label htmlFor="b-content" className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                  Content <span className="text-[#8B879C]">— HTML</span>
                </label>
                <textarea
                  id="b-content"
                  rows={12}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<p>Your article...</p>"
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#3D3752] outline-none focus:border-[#7C3AED]"
                />
                <p className="mt-1 text-[10.5px] text-[#8B879C]">
                  Rendered as HTML on the public page and sanitised with DOMPurify — scripts,
                  event handlers and unknown tags are stripped. Allowed: headings, p, ul/ol, a,
                  img, blockquote, code, strong/em.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="b-readtime" className="mb-1 block text-[11px] font-medium text-[#3D3752]">
                    Read time <span className="text-[#8B879C]">(auto if blank)</span>
                  </label>
                  <input
                    id="b-readtime"
                    type="text"
                    value={form.read_time}
                    onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                    placeholder={estimateReadTime(form.content)}
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label htmlFor="b-status" className="mb-1 block text-[11px] font-medium text-[#3D3752]">Status</label>
                  <select
                    id="b-status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    <option value="draft">Draft — not visible publicly</option>
                    <option value="published">Published — live on /blog</option>
                  </select>
                </div>
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
                {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                {editing ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete post?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from the public blog. This is a soft delete — the row is retained in the database.`
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

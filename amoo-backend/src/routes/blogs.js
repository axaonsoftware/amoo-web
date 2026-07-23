const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

// GET /api/blogs — public paginated list (published only)
router.get(
  "/",
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE status = 'published' AND deleted_at IS NULL";
    if (req.query.category) { where += " AND category = ?"; params.push(req.query.category); }
    if (req.query.search) { where += " AND (title LIKE ? OR excerpt LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM blogs ${where}`, params);
    const [rows] = await pool.query(
      `SELECT id, slug, title, excerpt, category, image, author, author_avatar, read_time, views, created_at FROM blogs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/blogs/all — admin list (all statuses)
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE deleted_at IS NULL";
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    if (req.query.category) { where += " AND category = ?"; params.push(req.query.category); }
    if (req.query.search) { where += " AND (title LIKE ? OR excerpt LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM blogs ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM blogs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/blogs/:slug — public single post
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const [[row]] = await pool.query(
      "SELECT id, slug, title, excerpt, content, category, image, author, author_avatar, read_time, views, created_at FROM blogs WHERE slug = ? AND status = 'published' AND deleted_at IS NULL",
      [req.params.slug]
    );
    if (!row) throw new HttpError(404, "Blog post not found");
    // fire-and-forget view count
    pool.query("UPDATE blogs SET views = views + 1 WHERE id = ?", [row.id]);
    ok(res, row);
  })
);

// POST /api/blogs — admin create
router.post(
  "/",
  adminRequired,
  validate("blog"),
  asyncHandler(async (req, res) => {
    const { slug, title, excerpt, content, category, image, author, author_avatar, read_time, status } = req.body;
    const [existing] = await pool.query("SELECT id FROM blogs WHERE slug = ?", [slug]);
    if (existing.length) throw new HttpError(409, "Slug already exists");
    const [result] = await pool.query(
      `INSERT INTO blogs (slug, title, excerpt, content, category, image, author, author_avatar, read_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, title, excerpt || null, content || null, category || null, image || null, author || null, author_avatar || null, read_time || null, status || "published"]
    );
    req.audit("create", "blog", result.insertId, { slug });
    created(res, { id: result.insertId, slug });
  })
);

// PATCH /api/blogs/:id — admin update
router.patch(
  "/:id",
  adminRequired,
  validate("blogUpdate"),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, ["slug", "title", "excerpt", "content", "category", "image", "author", "author_avatar", "read_time", "status"], [req.params.id]);
    await pool.query(`UPDATE blogs SET ${setClause} WHERE id = ? AND deleted_at IS NULL`, values);
    req.audit("update", "blog", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// DELETE /api/blogs/:id — admin soft-delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [[row]] = await pool.query("SELECT id FROM blogs WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (!row) throw new HttpError(404, "Blog post not found");
    await pool.query("UPDATE blogs SET deleted_at = NOW() WHERE id = ?", [req.params.id]);
    req.audit("delete", "blog", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;

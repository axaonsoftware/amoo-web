const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { saveFile, deleteFile } = require("../config/storage");
const { asyncHandler } = require("../utils/helpers");
const { resolveStoredFile } = require("../utils/paths");
const { validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination, fail } = require("../utils/response");
const env = require("../config/env");

// POST /api/uploads (single file, auth required)
router.post(
  "/",
  authRequired,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return fail(res, 400, "No file uploaded");
    const ext = path.extname(req.file.originalname).toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    const saved = await saveFile(req.file.buffer, unique, req.file.mimetype);
    const result = await pool.query(
      "INSERT INTO uploads (user_id, original_name, stored_name, path, mime, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [req.user.id, req.file.originalname, saved.key, saved.url, req.file.mimetype, req.file.size]
    );
    created(res, { id: result.rows[0].id, url: saved.url, filename: saved.key, size: req.file.size });
  })
);

// GET /api/uploads (own files — paginated)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { rows: [{ total }] } = await pool.query(
      "SELECT COUNT(*) AS total FROM uploads WHERE user_id = $1",
      [req.user.id]
    );
    const { rows } = await pool.query(
      "SELECT id, original_name, stored_name, path, mime, size, created_at FROM uploads WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [req.user.id, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin: list all uploads
router.get(
  "/all",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { rows: [{ total }] } = await pool.query("SELECT COUNT(*) AS total FROM uploads");
    const { rows } = await pool.query(
      "SELECT id, user_id, original_name, path, mime, size, created_at FROM uploads ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/uploads/:id/download (owner or admin) — authenticated file access.
// Prevents anyone from fetching arbitrary uploaded files by guessing the name.
router.get(
  "/:id/download",
  authRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM uploads WHERE id = $1", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    const u = rows[0];
    if (req.user.kind !== "admin" && u.user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    if (env.storage.enabled && u.path && /^https?:\/\//i.test(u.path)) {
      return res.redirect(u.path);
    }
    const filePath = resolveStoredFile(u.path);
    if (!filePath) return fail(res, 400, "Invalid file reference");
    if (!fs.existsSync(filePath)) return fail(res, 404, "File not found on disk");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.download(filePath, u.original_name || path.basename(filePath));
  })
);

// DELETE /api/uploads/:id (owner or admin)
router.delete(
  "/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM uploads WHERE id = $1", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    await deleteFile(rows[0].stored_name);
    await pool.query("DELETE FROM uploads WHERE id = $1", [req.params.id]);
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;

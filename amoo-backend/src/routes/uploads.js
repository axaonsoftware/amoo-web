const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { saveFile, deleteFile } = require("../config/storage");
const { asyncHandler } = require("../utils/helpers");
const { validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");
const path = require("path");

// POST /api/uploads (single file, auth required)
router.post(
  "/",
  authRequired,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    const saved = await saveFile(req.file.buffer, unique, req.file.mimetype);
    const [result] = await pool.query(
      "INSERT INTO uploads (user_id, original_name, stored_name, path, mime, size) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, req.file.originalname, saved.key, saved.url, req.file.mimetype, req.file.size]
    );
    created(res, { id: result.insertId, url: saved.url, filename: saved.key, size: req.file.size });
  })
);

// GET /api/uploads (own files — paginated)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM uploads WHERE user_id = ?",
      [req.user.id]
    );
    const [rows] = await pool.query(
      "SELECT id, original_name, stored_name, path, mime, size, created_at FROM uploads WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM uploads");
    const [rows] = await pool.query(
      "SELECT id, user_id, original_name, path, mime, size, created_at FROM uploads ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
    const [rows] = await pool.query("SELECT * FROM uploads WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    const u = rows[0];
    if (req.user.kind !== "admin" && u.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    if (env.storage.enabled && u.path && u.path.startsWith("http")) {
      return res.redirect(u.path);
    }
    const filePath = path.join(__dirname, "..", "..", u.path || "");
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
    const [rows] = await pool.query("SELECT * FROM uploads WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    await deleteFile(rows[0].stored_name);
    await pool.query("DELETE FROM uploads WHERE id = ?", [req.params.id]);
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;

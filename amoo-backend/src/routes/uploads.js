const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { asyncHandler } = require("../utils/helpers");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");
const fs = require("fs");
const path = require("path");

// POST /api/uploads (single file, auth required)
router.post(
  "/",
  authRequired,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    const [result] = await pool.query(
      "INSERT INTO uploads (user_id, original_name, stored_name, path, mime, size) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, req.file.originalname, req.file.filename, url, req.file.mimetype, req.file.size]
    );
    created(res, { id: result.insertId, url, filename: req.file.filename, size: req.file.size });
  })
);

// GET /api/uploads (own files)
router.get(
  "/",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      "SELECT id, original_name, stored_name, path, mime, size, created_at FROM uploads WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    ok(res, rows);
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
    const filePath = path.join(__dirname, "..", "..", rows[0].path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await pool.query("DELETE FROM uploads WHERE id = ?", [req.params.id]);
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;

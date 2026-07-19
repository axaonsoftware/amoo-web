const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { asyncHandler } = require("../utils/helpers");

// POST /api/uploads  (single file, auth required)
router.post("/", authRequired, upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  await pool.query(
    "INSERT INTO uploads (user_id, original_name, stored_name, path, mime, size) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, req.file.originalname, req.file.filename, url, req.file.mimetype, req.file.size]
  );
  res.status(201).json({ url, filename: req.file.filename, size: req.file.size });
}));

// GET /api/uploads (own files)
router.get("/", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  res.json(rows);
}));

module.exports = router;

const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

// GET /api/notifications  (own)
router.get("/", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50",
    [req.user.id]
  );
  res.json(rows);
}));

// GET /api/notifications/unread-count
router.get("/unread-count", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0",
    [req.user.id]
  );
  res.json(rows[0]);
}));

// POST /api/notifications/:id/read
router.post("/:id/read", authRequired, asyncHandler(async (req, res) => {
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// admin: create for a user (or broadcast with user_id null)
router.post("/", adminRequired, asyncHandler(async (req, res) => {
  const { user_id, title, message, type } = req.body;
  if (!title || !message) return res.status(400).json({ error: "title and message required" });
  const [result] = await pool.query(
    "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
    [user_id || null, title, message, type || "info"]
  );
  res.status(201).json({ id: result.insertId });
}));

// admin: all
router.get("/all", adminRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100");
  res.json(rows);
}));

module.exports = router;

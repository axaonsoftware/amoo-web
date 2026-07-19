const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

// GET /api/users  (admin)
router.get("/", adminRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, avatar, role, status, verified, created_at FROM users ORDER BY created_at DESC"
  );
  res.json(rows);
}));

// GET /api/users/me
router.get("/me", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, avatar, role, status, verified FROM users WHERE id = ?",
    [req.user.id]
  );
  res.json(rows[0] || {});
}));

// PATCH /api/users/me  (update own profile)
router.patch("/me", authRequired, asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  await pool.query(
    "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?",
    [name, phone, avatar, req.user.id]
  );
  const [rows] = await pool.query("SELECT id, name, email, phone, avatar, role, status FROM users WHERE id = ?", [req.user.id]);
  res.json(rows[0]);
}));

// admin: update role/status
router.patch("/:id", adminRequired, asyncHandler(async (req, res) => {
  const { role, status, verified } = req.body;
  await pool.query(
    "UPDATE users SET role = COALESCE(?, role), status = COALESCE(?, status), verified = COALESCE(?, verified) WHERE id = ?",
    [role, status, verified, req.params.id]
  );
  res.json({ success: true });
}));

// admin: delete
router.delete("/:id", adminRequired, asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;

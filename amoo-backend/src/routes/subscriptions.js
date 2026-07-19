const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

// GET /api/subscriptions
router.get("/", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, p.name AS package_name, p.price AS package_price
     FROM subscriptions s LEFT JOIN packages p ON p.id = s.package_id
     WHERE s.user_id = ? ORDER BY s.started_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}));

// POST /api/subscriptions  (subscribe to a package)
router.post("/", authRequired, asyncHandler(async (req, res) => {
  const { package_id, plan_name, duration_days } = req.body;
  let pkg = null;
  let name = plan_name;
  let days = duration_days ? Number(duration_days) : 30;
  if (package_id) {
    const [rows] = await pool.query("SELECT * FROM packages WHERE id = ?", [package_id]);
    pkg = rows[0];
    if (pkg) { name = pkg.name; days = pkg.duration_days || days; }
  }
  if (!name) return res.status(400).json({ error: "plan_name or package_id required" });
  const expires = new Date(Date.now() + days * 86400000);
  const [result] = await pool.query(
    "INSERT INTO subscriptions (user_id, package_id, plan_name, expires_at) VALUES (?, ?, ?, ?)",
    [req.user.id, package_id || null, name, expires]
  );
  // upgrade user role to premium
  await pool.query("UPDATE users SET role = 'premium' WHERE id = ?", [req.user.id]);
  res.status(201).json({ id: result.insertId, plan_name: name, expires_at: expires });
}));

// admin: all
router.get("/all", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, u.name AS user_name, p.name AS package_name
     FROM subscriptions s JOIN users u ON u.id = s.user_id
     LEFT JOIN packages p ON p.id = s.package_id ORDER BY s.started_at DESC`
  );
  res.json(rows);
}));

module.exports = router;

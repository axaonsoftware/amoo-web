const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { signToken, authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// POST /api/auth/register
router.post("/register", validate(schemas.register), asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, 'pending')",
    [name, email, phone, hash]
  );
  const token = signToken({ id: result.insertId, kind: "user" });
  res.status(201).json({ token, user: { id: result.insertId, name, email, role: "free", status: "pending" } });
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];
  if (!user || !user.password_hash) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, kind: "user" });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
  });
}));

// POST /api/auth/admin/login
router.post("/admin/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
  const admin = rows[0];
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: admin.id, kind: "admin" });
  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
}));

// GET /api/auth/me
router.get("/me", authRequired, asyncHandler(async (req, res) => {
  if (req.user.kind === "admin") {
    const [rows] = await pool.query("SELECT id, name, email, role FROM admins WHERE id = ?", [req.user.id]);
    return res.json({ kind: "admin", data: rows[0] });
  }
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, avatar, role, status, verified FROM users WHERE id = ?",
    [req.user.id]
  );
  res.json({ kind: "user", data: rows[0] });
}));

module.exports = router;

const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/reports  (user: own, admin: all)
router.get("/", authRequired, asyncHandler(async (req, res) => {
  if (req.user.kind === "admin") {
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    return res.json(rows);
  }
  const [rows] = await pool.query("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  res.json(rows);
}));

// GET /api/reports/:id
router.get("/:id", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM reports WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Report not found" });
  if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(rows[0]);
}));

// user create (generate report)
router.post("/", authRequired, validate(schemas.report), asyncHandler(async (req, res) => {
  const { service_id, type, title, content, file_url } = req.body;
  const [result] = await pool.query(
    "INSERT INTO reports (user_id, service_id, type, title, content, file_url) VALUES (?,?,?,?,?,?)",
    [req.user.id, service_id, type, title, content, file_url]
  );
  res.status(201).json({ id: result.insertId });
}));

// admin create for any user
router.post("/admin", adminRequired, asyncHandler(async (req, res) => {
  const { user_id, service_id, type, title, content, file_url } = req.body;
  const [result] = await pool.query(
    "INSERT INTO reports (user_id, service_id, type, title, content, file_url) VALUES (?,?,?,?,?,?)",
    [user_id, service_id, type, title, content, file_url]
  );
  res.status(201).json({ id: result.insertId });
}));

module.exports = router;

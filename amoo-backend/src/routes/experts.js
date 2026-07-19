const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { asyncHandler } = require("../utils/helpers");

// GET /api/experts
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, avatar, role_title, bio, specialties, rating, status FROM experts WHERE status = 'active'"
  );
  res.json(rows);
}));

// GET /api/experts/:id
router.get("/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM experts WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Expert not found" });
  res.json(rows[0]);
}));

// admin create
router.post("/", asyncHandler(async (req, res) => {
  const { name, email, phone, avatar, role_title, bio, specialties, rating } = req.body;
  const [result] = await pool.query(
    "INSERT INTO experts (name, email, phone, avatar, role_title, bio, specialties, rating) VALUES (?,?,?,?,?,?,?,?)",
    [name, email, phone, avatar, role_title, bio, specialties, rating]
  );
  res.status(201).json({ id: result.insertId });
}));

// admin update
router.patch("/:id", asyncHandler(async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ error: "No fields" });
  const set = keys.map((k) => `${k} = ?`).join(", ");
  await pool.query(`UPDATE experts SET ${set} WHERE id = ?`, [...keys.map((k) => fields[k]), req.params.id]);
  res.json({ success: true });
}));

module.exports = router;

const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/services
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM services WHERE status = 'Active' ORDER BY category, name"
  );
  res.json(rows);
}));

// admin: all (incl inactive)
router.get("/all", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM services ORDER BY id DESC");
  res.json(rows);
}));

// GET /api/services/:id
router.get("/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Service not found" });
  res.json(rows[0]);
}));

// admin create
router.post("/", validate(schemas.service), asyncHandler(async (req, res) => {
  const { name, sub, img, category, type, price, duration, status } = req.body;
  const [result] = await pool.query(
    "INSERT INTO services (name, sub, img, category, type, price, duration, status) VALUES (?,?,?,?,?,?,?,?)",
    [name, sub, img, category, type, price, duration, status || "Active"]
  );
  res.status(201).json({ id: result.insertId });
}));

// admin update
router.patch("/:id", asyncHandler(async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  const set = keys.map((k) => `${k} = ?`).join(", ");
  await pool.query(`UPDATE services SET ${set} WHERE id = ?`, [...keys.map((k) => fields[k]), req.params.id]);
  res.json({ success: true });
}));

// admin delete
router.delete("/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM services WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;

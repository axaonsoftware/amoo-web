const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/packages
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM packages WHERE status = 'Active'");
  res.json(rows);
}));

// admin all
router.get("/all", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM packages ORDER BY id DESC");
  res.json(rows);
}));

// admin create
router.post("/", validate(schemas.package), asyncHandler(async (req, res) => {
  const { name, description, price, duration_days, status } = req.body;
  const [result] = await pool.query(
    "INSERT INTO packages (name, description, price, duration_days, status) VALUES (?,?,?,?,?)",
    [name, description, price, duration_days, status || "Active"]
  );
  res.status(201).json({ id: result.insertId });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  const set = keys.map((k) => `${k} = ?`).join(", ");
  await pool.query(`UPDATE packages SET ${set} WHERE id = ?`, [...keys.map((k) => fields[k]), req.params.id]);
  res.json({ success: true });
}));

module.exports = router;

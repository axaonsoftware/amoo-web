const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/slots?expert_id=1&date=2025-05-18
router.get("/", asyncHandler(async (req, res) => {
  const { expert_id, date } = req.query;
  let sql = "SELECT * FROM slots WHERE 1=1";
  const params = [];
  if (expert_id) { sql += " AND expert_id = ?"; params.push(expert_id); }
  if (date) { sql += " AND date = ?"; params.push(date); }
  sql += " ORDER BY date, start_time";
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// admin create slot
router.post("/", validate(schemas.slot), asyncHandler(async (req, res) => {
  const { expert_id, date, start_time, end_time, status } = req.body;
  if (!expert_id || !date || !start_time) {
    return res.status(400).json({ error: "expert_id, date and start_time are required" });
  }
  const [result] = await pool.query(
    "INSERT INTO slots (expert_id, date, start_time, end_time, status) VALUES (?,?,?,?,?)",
    [expert_id, date, start_time, end_time, status || "available"]
  );
  res.status(201).json({ id: result.insertId });
}));

// admin book/block slot
router.patch("/:id", asyncHandler(async (req, res) => {
  const { status } = req.body;
  await pool.query("UPDATE slots SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ success: true });
}));

module.exports = router;

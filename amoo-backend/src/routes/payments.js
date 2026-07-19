const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/payments  (admin: all, user: own)
router.get("/", authRequired, asyncHandler(async (req, res) => {
  if (req.user.kind === "admin") {
    const [rows] = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    return res.json(rows);
  }
  const [rows] = await pool.query("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  res.json(rows);
}));

// POST /api/payments  (record a payment for a booking)
router.post("/", authRequired, validate(schemas.payment), asyncHandler(async (req, res) => {
  const { booking_id, amount, method, status, txn_id } = req.body;
  const [result] = await pool.query(
    "INSERT INTO payments (booking_id, user_id, amount, method, status, txn_id) VALUES (?, ?, ?, ?, ?, ?)",
    [booking_id, req.user.id, amount, method, status || "pending", txn_id]
  );
  if (status === "success" && booking_id) {
    await pool.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", [booking_id]);
  }
  res.status(201).json({ id: result.insertId });
}));

// admin stats
router.get("/stats/overview", adminRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(amount) AS total_revenue,
       SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) AS collected,
       SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
     FROM payments`
  );
  res.json(rows[0]);
}));

module.exports = router;

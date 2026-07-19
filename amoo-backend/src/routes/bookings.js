const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, genBookingRef } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/bookings  -> user sees own, admin sees all
router.get("/", authRequired, asyncHandler(async (req, res) => {
  if (req.user.kind === "admin") {
    const [rows] = await pool.query(
      `SELECT b.*, u.name AS user_name, e.name AS expert_name, s.name AS service_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       LEFT JOIN experts e ON e.id = b.expert_id
       JOIN services s ON s.id = b.service_id
       ORDER BY b.date DESC, b.time DESC`
    );
    return res.json(rows);
  }
  const [rows] = await pool.query(
    `SELECT b.*, e.name AS expert_name, s.name AS service_name
     FROM bookings b
     LEFT JOIN experts e ON e.id = b.expert_id
     JOIN services s ON s.id = b.service_id
     WHERE b.user_id = ? ORDER BY b.date DESC, b.time DESC`,
    [req.user.id]
  );
  res.json(rows);
}));

// GET /api/bookings/:id
router.get("/:id", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, u.name AS user_name, e.name AS expert_name, s.name AS service_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     LEFT JOIN experts e ON e.id = b.expert_id
     JOIN services s ON s.id = b.service_id
     WHERE b.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Booking not found" });
  if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(rows[0]);
}));

// POST /api/bookings  (create booking + payment record)
router.post("/", authRequired, validate(schemas.booking), asyncHandler(async (req, res) => {
  const { service_id, expert_id, date, time, mode, amount, payment } = req.body;
  if (!service_id || !date || !time) {
    return res.status(400).json({ error: "service_id, date and time are required" });
  }
  const ref = genBookingRef();
  const [result] = await pool.query(
    `INSERT INTO bookings (booking_ref, user_id, expert_id, service_id, date, time, mode, amount, payment, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ref, req.user.id, expert_id || null, service_id, date, time, mode, amount || 0, payment || "Pending", payment === "Paid" ? "upcoming" : "pending-payment"]
  );

  if (payment === "Paid") {
    await pool.query(
      "INSERT INTO payments (booking_id, user_id, amount, method, status) VALUES (?, ?, ?, ?, 'success')",
      [result.insertId, req.user.id, amount || 0, req.body.method || "card"]
    );
    await pool.query("UPDATE services SET bookings = bookings + 1 WHERE id = ?", [service_id]);
  }

  const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}));

// admin update status
router.patch("/:id", adminRequired, asyncHandler(async (req, res) => {
  const { status, payment } = req.body;
  await pool.query(
    "UPDATE bookings SET status = COALESCE(?, status), payment = COALESCE(?, payment) WHERE id = ?",
    [status, payment, req.params.id]
  );
  res.json({ success: true });
}));

// cancel (owner or admin)
router.delete("/:id", authRequired, asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT user_id FROM bookings WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;

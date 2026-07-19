const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

// GET /api/dashboard/overview  (admin)
router.get("/overview", adminRequired, asyncHandler(async (req, res) => {
  const [[users]] = await pool.query("SELECT COUNT(*) AS total FROM users");
  const [[experts]] = await pool.query("SELECT COUNT(*) AS total FROM experts WHERE status='active'");
  const [[services]] = await pool.query("SELECT COUNT(*) AS total FROM services WHERE status='Active'");
  const [[bookings]] = await pool.query(
    "SELECT COUNT(*) AS total, SUM(amount) AS revenue FROM bookings WHERE status != 'cancelled'"
  );
  const [[today]] = await pool.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE date = CURDATE()"
  );
  const [topServices] = await pool.query(
    "SELECT id, name, bookings, price FROM services ORDER BY bookings DESC LIMIT 5"
  );
  const [recent] = await pool.query(
    `SELECT b.booking_ref, u.name AS user_name, s.name AS service_name, b.amount, b.status
     FROM bookings b JOIN users u ON u.id=b.user_id JOIN services s ON s.id=b.service_id
     ORDER BY b.created_at DESC LIMIT 8`
  );
  res.json({
    stats: {
      users: users.total,
      experts: experts.total,
      services: services.total,
      bookings: bookings.total,
      revenue: bookings.revenue || 0,
      todayBookings: today.total,
    },
    topServices,
    recent,
  });
}));

module.exports = router;

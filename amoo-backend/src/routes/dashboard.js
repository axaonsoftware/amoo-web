const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { ok } = require("../utils/response");

const allowedPeriods = { day: "%Y-%m-%d", week: "%Y-%u", month: "%Y-%m", year: "%Y" };

// GET /api/dashboard/overview (admin)
router.get(
  "/overview",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [[users]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL");
    const [[experts]] = await pool.query("SELECT COUNT(*) AS total FROM experts WHERE status='active' AND deleted_at IS NULL");
    const [[services]] = await pool.query("SELECT COUNT(*) AS total FROM services WHERE status='Active' AND deleted_at IS NULL");
    const [[bookings]] = await pool.query(
      "SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS revenue FROM bookings WHERE status != 'cancelled'"
    );
    const [[today]] = await pool.query("SELECT COUNT(*) AS total FROM bookings WHERE date = CURDATE()");
    const [[pendingPayments]] = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS amount FROM payments WHERE status = 'pending'"
    );
    const [topServices] = await pool.query(
      "SELECT id, name, bookings, price FROM services WHERE deleted_at IS NULL ORDER BY bookings DESC LIMIT 5"
    );
    const [recent] = await pool.query(
      `SELECT b.booking_ref, u.name AS user_name, s.name AS service_name, b.amount, b.status, b.date
       FROM bookings b JOIN users u ON u.id=b.user_id JOIN services s ON s.id=b.service_id
       ORDER BY b.created_at DESC LIMIT 8`
    );
    ok(res, {
      stats: {
        users: users.total,
        experts: experts.total,
        services: services.total,
        bookings: bookings.total,
        revenue: Number(bookings.revenue) || 0,
        pendingPayments: Number(pendingPayments.amount) || 0,
        todayBookings: today.total,
      },
      topServices,
      recent,
    });
  })
);

// GET /api/dashboard/revenue?period=month&from=&to=
router.get(
  "/revenue",
  adminRequired,
  asyncHandler(async (req, res) => {
    const fmt = allowedPeriods[req.query.period] || allowedPeriods.month;
    const where = req.query.from ? "WHERE DATE(p.created_at) >= ?" : "";
    const params = req.query.from ? [req.query.from] : [];
    if (req.query.to) { where && (where += " AND"); params.push(req.query.to); }
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(p.created_at, ?) AS label,
              COUNT(*) AS payments,
              COALESCE(SUM(p.amount),0) AS revenue
       FROM payments p ${where}
       WHERE p.status = 'success'
       GROUP BY label ORDER BY label`,
      [fmt, ...params]
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/bookings/trends?period=month
router.get(
  "/bookings/trends",
  adminRequired,
  asyncHandler(async (req, res) => {
    const fmt = allowedPeriods[req.query.period] || allowedPeriods.month;
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) AS label,
              COUNT(*) AS count,
              SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM bookings GROUP BY label ORDER BY label`,
      [fmt]
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/users/growth?period=month
router.get(
  "/users/growth",
  adminRequired,
  asyncHandler(async (req, res) => {
    const fmt = allowedPeriods[req.query.period] || allowedPeriods.month;
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) AS label, COUNT(*) AS new_users
       FROM users WHERE deleted_at IS NULL GROUP BY label ORDER BY label`,
      [fmt]
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/experts/top
router.get(
  "/experts/top",
  adminRequired,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.rating,
              COUNT(b.id) AS bookings
       FROM experts e LEFT JOIN bookings b ON b.expert_id = e.id AND b.status != 'cancelled'
       WHERE e.deleted_at IS NULL GROUP BY e.id ORDER BY bookings DESC, e.rating DESC LIMIT ?`,
      [limit]
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/export/:type  (CSV export: bookings | users | payments)
router.get(
  "/export/:type",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    let rows, headers, filename;
    if (type === "bookings") {
      [rows] = await pool.query(
        `SELECT b.booking_ref, u.name AS user, e.name AS expert, s.name AS service,
                b.date, b.time, b.amount, b.payment, b.status
         FROM bookings b JOIN users u ON u.id=b.user_id
         LEFT JOIN experts e ON e.id=b.expert_id JOIN services s ON s.id=b.service_id
         ORDER BY b.created_at DESC LIMIT 5000`
      );
      headers = ["booking_ref", "user", "expert", "service", "date", "time", "amount", "payment", "status"];
      filename = "bookings.csv";
    } else if (type === "users") {
      [rows] = await pool.query(
        "SELECT id, name, email, phone, role, status, verified, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5000"
      );
      headers = ["id", "name", "email", "phone", "role", "status", "verified", "created_at"];
      filename = "users.csv";
    } else if (type === "payments") {
      [rows] = await pool.query(
        `SELECT p.id, u.name AS user, p.amount, p.method, p.status, p.txn_id, p.created_at
         FROM payments p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 5000`
      );
      headers = ["id", "user", "amount", "method", "status", "txn_id", "created_at"];
      filename = "payments.csv";
    } else {
      throw new HttpError(400, "Unsupported export type");
    }
    const esc = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(",")]
      .concat(rows.map((r) => headers.map((h) => esc(r[h])).join(",")))
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  })
);

module.exports = router;

const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validateQuery } = require("../middleware/validate");
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
  validateQuery,
  asyncHandler(async (req, res) => {
    const fmt = allowedPeriods[req.query.period] || allowedPeriods.month;
    const params = [fmt];
    let where = "WHERE p.status = 'success'";
    if (req.query.from) { where += " AND p.created_at >= ?"; params.push(req.query.from); }
    if (req.query.to) { where += " AND p.created_at <= ?"; params.push(req.query.to + " 23:59:59"); }
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(p.created_at, ?) AS label,
              COUNT(*) AS payments,
              COALESCE(SUM(p.amount),0) AS revenue
       FROM payments p ${where}
       GROUP BY label ORDER BY label`,
      params
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/bookings/trends?period=month&from=2025-01-01&to=2025-12-31
router.get(
  "/bookings/trends",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const fmt = allowedPeriods[req.query.period] || allowedPeriods.month;
    const params = [fmt];
    let where = "WHERE created_at >= ?";
    params.push(req.query.from || "1970-01-01");
    if (req.query.to) { where += " AND created_at <= ?"; params.push(req.query.to + " 23:59:59"); }
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) AS label,
              COUNT(*) AS count,
              SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM bookings ${where} GROUP BY label ORDER BY label`,
      params
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/users/growth?period=month&from=2025-01-01&to=2025-12-31
router.get(
  "/users/growth",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const fmt = allowedPeriods[req.query.period] || allowedPeriods.month;
    const params = [fmt];
    let where = "WHERE deleted_at IS NULL AND created_at >= ?";
    params.push(req.query.from || "1970-01-01");
    if (req.query.to) { where += " AND created_at <= ?"; params.push(req.query.to + " 23:59:59"); }
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) AS label, COUNT(*) AS new_users
       FROM users ${where} GROUP BY label ORDER BY label`,
      params
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/revenue/by-service?from=&to=
// Revenue split by service. `payments` carries no service column, so the split
// can only be done by joining through the booking — which the frontend cannot
// do without an N+1. Added for the admin "Revenue by Service" donut, which
// previously grouped `SELECT * FROM payments` on a `service_name` field that
// does not exist and so rendered every payment as "Others".
router.get(
  "/revenue/by-service",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const params = [];
    let where = "WHERE p.status = 'success'";
    if (req.query.from) { where += " AND p.created_at >= ?"; params.push(req.query.from); }
    if (req.query.to) { where += " AND p.created_at <= ?"; params.push(req.query.to + " 23:59:59"); }
    const [rows] = await pool.query(
      `SELECT s.id, s.name,
              COUNT(p.id) AS payments,
              COALESCE(SUM(p.amount),0) AS revenue
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       JOIN services s ON s.id = b.service_id
       ${where}
       GROUP BY s.id, s.name
       ORDER BY revenue DESC`,
      params
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/reports/by-type
// Count of generated reports grouped by `reports.type`. Exists so the admin
// "Reports Summary" card can show real per-category counts instead of
// splitting a single total by invented percentages.
router.get(
  "/reports/by-type",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT COALESCE(NULLIF(type, ''), 'other') AS type,
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS ready,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM reports
       WHERE deleted_at IS NULL
       GROUP BY COALESCE(NULLIF(type, ''), 'other')
       ORDER BY total DESC`
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/experts/top
router.get(
  "/experts/top",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    // avatar/completed/revenue/clients added for the admin "Top Performing
    // Astrologers" table, which rendered those columns against fields this
    // endpoint never returned (so they were always 0) and used one hardcoded
    // stock avatar for every row.
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.avatar, e.rating,
              COUNT(b.id) AS bookings,
              SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed,
              COALESCE(SUM(b.amount),0) AS revenue,
              COUNT(DISTINCT b.user_id) AS clients
       FROM experts e LEFT JOIN bookings b ON b.expert_id = e.id AND b.status != 'cancelled'
       WHERE e.deleted_at IS NULL GROUP BY e.id ORDER BY bookings DESC, e.rating DESC LIMIT ?`,
      [limit]
    );
    ok(res, rows);
  })
);

// GET /api/dashboard/bookings/patterns
// Peak booking day-of-week and hour-of-day. Added for the admin "Quick
// Insights" card, which read `peakDay`/`peakTime` off /overview — keys that
// endpoint has never returned, so the card always showed its hardcoded values.
router.get(
  "/bookings/patterns",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM bookings WHERE status != 'cancelled'"
    );
    // DAYOFWEEK(): 1=Sunday .. 7=Saturday
    const [byDay] = await pool.query(
      `SELECT DAYOFWEEK(date) AS day, COUNT(*) AS count
       FROM bookings WHERE status != 'cancelled' AND date IS NOT NULL
       GROUP BY day ORDER BY count DESC`
    );
    const [byHour] = await pool.query(
      `SELECT HOUR(time) AS hour, COUNT(*) AS count
       FROM bookings WHERE status != 'cancelled' AND time IS NOT NULL
       GROUP BY hour ORDER BY count DESC`
    );
    ok(res, {
      total,
      peakDay: byDay[0] || null,
      peakHour: byHour[0] || null,
      byDay,
      byHour,
    });
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
         ORDER BY b.created_at DESC LIMIT 50000`
      );
      headers = ["booking_ref", "user", "expert", "service", "date", "time", "amount", "payment", "status"];
      filename = "bookings.csv";
    } else if (type === "users") {
      [rows] = await pool.query(
        "SELECT id, name, email, phone, role, status, verified, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50000"
      );
      headers = ["id", "name", "email", "phone", "role", "status", "verified", "created_at"];
      filename = "users.csv";
    } else if (type === "payments") {
      [rows] = await pool.query(
        `SELECT p.id, u.name AS user, p.amount, p.method, p.status, p.txn_id, p.created_at
         FROM payments p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 50000`
      );
      headers = ["id", "user", "amount", "method", "status", "txn_id", "created_at"];
      filename = "payments.csv";
    } else {
      throw new HttpError(400, "Unsupported export type");
    }
    // CSV escaping + spreadsheet formula neutralisation.
    //
    // Excel, LibreOffice and Google Sheets execute any cell whose text begins
    // with = + - @ (or a leading tab/CR). Values here come from user-controlled
    // columns — users.name, services.name, payments.txn_id — so a user who
    // registers as `=cmd|'/c calc'!A1` gets that executed on the machine of
    // whichever admin opens the export. Prefixing with a single quote makes the
    // cell literal text; the quote is not shown by the spreadsheet.
    const esc = (v) => {
      let s = v === null || v === undefined ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(",")]
      .concat(rows.map((r) => headers.map((h) => esc(r[h])).join(",")))
      .join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    // BOM so Excel reads the file as UTF-8 rather than the local ANSI codepage,
    // which otherwise mangles non-ASCII names.
    res.send("﻿" + csv);
  })
);

module.exports = router;

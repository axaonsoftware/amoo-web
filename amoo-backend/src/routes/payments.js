const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

// GET /api/payments (admin: all, user: own) with filters
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = req.user.kind === "admin" ? "" : "WHERE user_id = ?";
    if (req.user.kind !== "admin") params.push(req.user.id);
    const add = (clause, val) => { where += where ? " AND" : "WHERE"; where += clause; params.push(val); };
    if (req.query.status) add(" status = ?", req.query.status);
    if (req.query.method) add(" method = ?", req.query.method);
    if (req.query.user_id && req.user.kind === "admin") add(" user_id = ?", req.query.user_id);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM payments ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM payments ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/payments (record a payment for a booking)
router.post(
  "/",
  authRequired,
  validate("payment"),
  asyncHandler(async (req, res) => {
    const { booking_id, amount, method, status, txn_id, gateway } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        "INSERT INTO payments (booking_id, user_id, amount, method, status, txn_id, gateway) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [booking_id || null, req.user.id, amount, method || null, status || "pending", txn_id || null, gateway || null]
      );
      if (status === "success" && booking_id) {
        await conn.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", [booking_id]);
      }
      await conn.commit();
      req.audit("create", "payment", result.insertId, { booking_id, amount, status });
      created(res, { id: result.insertId });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

// POST /api/payments/:id/refund
router.post(
  "/:id/refund",
  authRequired,
  validate("refund"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const [payments] = await pool.query("SELECT * FROM payments WHERE id = ?", [req.params.id]);
    if (assertFound(res, payments[0])) return;
    const p = payments[0];
    if (req.user.kind !== "admin" && p.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    if (p.status === "refunded") throw new HttpError(409, "Already refunded");

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE payments SET status = 'refunded' WHERE id = ?", [p.id]);
      if (p.booking_id) {
        await conn.query("UPDATE bookings SET payment = 'Pending', status = 'cancelled' WHERE id = ?", [p.booking_id]);
      }
      await conn.query(
        "INSERT INTO refunds (payment_id, user_id, amount, reason, status) VALUES (?, ?, ?, ?, 'processed')",
        [p.id, p.user_id, p.amount, reason || null]
      );
      await conn.commit();
      req.audit("refund", "payment", p.id, { reason });
      ok(res, { id: p.id, refunded: true, amount: p.amount });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

// GET /api/payments/refunds (admin list of refunds)
router.get(
  "/refunds",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM refunds ${where}`, params);
    const [rows] = await pool.query(
      `SELECT r.*, p.txn_id, p.method FROM refunds r JOIN payments p ON p.id = r.payment_id ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/payments/webhook  (payment gateway webhook stub — e.g. Razorpay/Stripe)
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const event = req.body && req.body.event;
    // Real gateways sign their webhooks; verify the signature here in production.
    if (!event) return res.status(400).json({ success: false, error: "Unknown event" });
    if (event === "payment.captured" || event === "payment.success") {
      const paymentId = req.body.payment_id || req.body.id;
      const [rows] = await pool.query("SELECT id, booking_id FROM payments WHERE txn_id = ?", [paymentId]);
      if (rows.length) {
        const p = rows[0];
        await pool.query("UPDATE payments SET status = 'success' WHERE id = ?", [p.id]);
        if (p.booking_id) {
          await pool.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", [p.booking_id]);
        }
        req.audit("webhook-success", "payment", p.id);
      }
    }
    res.json({ success: true, received: true });
  })
);

// admin stats
router.get(
  "/stats/overview",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(amount),0) AS total_revenue,
         COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END),0) AS collected,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END),0) AS pending,
         COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END),0) AS refunded
       FROM payments`
    );
    const [[refunds]] = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS amount FROM refunds WHERE status='processed'");
    const [byMethod] = await pool.query("SELECT method, COUNT(*) AS count, COALESCE(SUM(amount),0) AS amount FROM payments WHERE status='success' GROUP BY method");
    ok(res, { ...rows[0], refunds: refunds.total, refunded_amount: Number(refunds.amount) || 0, by_method: byMethod });
  })
);

module.exports = router;

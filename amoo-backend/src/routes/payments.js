const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, assertFound, parsePagination } = require("../utils/response");
const env = require("../config/env");

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
// SECURITY: a non-admin can NEVER mark a payment "success" — only the
// payment-gateway webhook may do that. The amount is taken from the booking,
// never the client, and the booking must belong to the caller.
router.post(
  "/",
  authRequired,
  validate("payment"),
  asyncHandler(async (req, res) => {
    const { booking_id, subscription_id, method, txn_id, gateway } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      let amount = 0;
      if (booking_id) {
        const [b] = await conn.query(
          "SELECT id, user_id, amount, payment FROM bookings WHERE id = ?",
          [booking_id]
        );
        if (!b.length) throw new HttpError(404, "Booking not found");
        if (req.user.kind !== "admin" && b[0].user_id !== req.user.id) {
          throw new HttpError(403, "Forbidden");
        }
        amount = Number(b[0].amount);
      } else if (subscription_id) {
        const [s] = await conn.query(
          "SELECT id, user_id, status FROM subscriptions WHERE id = ?",
          [subscription_id]
        );
        if (!s.length) throw new HttpError(404, "Subscription not found");
        if (req.user.kind !== "admin" && s[0].user_id !== req.user.id) {
          throw new HttpError(403, "Forbidden");
        }
        const [[pkg]] = await conn.query(
          "SELECT COALESCE(p.price,0) AS price FROM subscriptions s LEFT JOIN packages p ON p.id = s.package_id WHERE s.id = ?",
          [subscription_id]
        );
        amount = Number(pkg.price) || 0;
      }
      // Force pending for users; only the webhook upgrades to success.
      const status = req.user.kind === "admin" ? (req.body.status || "pending") : "pending";
      const [result] = await conn.query(
        "INSERT INTO payments (booking_id, subscription_id, user_id, amount, method, status, txn_id, gateway) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [booking_id || null, subscription_id || null, req.user.id, amount, method || null, status, txn_id || null, gateway || null]
      );
      await conn.commit();
      req.audit("create", "payment", result.insertId, { booking_id, amount, status });
      created(res, { id: result.insertId, status });
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
      return fail(res, 403, "Forbidden");
    }

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

// POST /api/payments/webhook  (payment gateway webhook — Razorpay/Stripe aware)
// Signature verification uses the RAW request body so it is not affected by
// JSON key reordering or number coercion. The raw body is captured in server.js.
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    if (env.payments.gateway !== "mock" && env.payments.webhookSecret) {
      const sig = req.headers["x-payment-signature"] || req.headers["x-razorpay-signature"];
      const raw = req.rawBody || JSON.stringify(req.body);
      const expected = crypto
        .createHmac("sha256", env.payments.webhookSecret)
        .update(raw)
        .digest("hex");
      if (!sig || sig !== expected) return fail(res, 401, "Invalid signature");
    }

    const event = req.body && req.body.event;
    if (!event) return fail(res, 400, "Unknown event");

    // Idempotency key: deduplicate webhook events by event+txn_id
    const idempotencyKey = req.headers["x-idempotency-key"] || `${event}:${req.body.txn_id || req.body.id || "none"}`;
    if (idempotencyKey) {
      const [existing] = await pool.query("SELECT id FROM audit_log WHERE meta->>'$.idempotency_key' = ? AND action = 'webhook-received'", [idempotencyKey]);
      if (existing.length) return res.json({ success: true, received: true, deduplicated: true });
    }

    if (event === "payment.captured" || event === "payment.success" || event === "order.paid") {
      // Prefer matching the booking/subscription directly; fall back to txn_id only when set by gateway.
      const bookingId = req.body.booking_id || req.body.bookingId || req.body.payload?.booking_id;
      const subscriptionId = req.body.subscription_id || req.body.subscriptionId || req.body.payload?.subscription_id;
      const paymentId = req.body.payment_id || req.body.id || req.body.txn_id;
      let p = null;
      if (bookingId) {
        const [byBooking] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE booking_id = ?", [bookingId]);
        if (byBooking.length) p = byBooking[0];
      }
      if (!p && subscriptionId) {
        const [bySub] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE subscription_id = ?", [subscriptionId]);
        if (bySub.length) p = bySub[0];
      }
      if (!p && paymentId) {
        const [byTxn] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE txn_id = ?", [paymentId]);
        if (byTxn.length) p = byTxn[0];
      }
      if (p) {
        // Skip if already processed (idempotent)
        if (p.status === "success") return res.json({ success: true, received: true, already_processed: true });

        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();
          await conn.query("UPDATE payments SET status = 'success' WHERE id = ? AND status != 'success'", [p.id]);
          if (p.booking_id) {
            await conn.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", [p.booking_id]);
          }
          // Activate a subscription paid via this payment and grant premium.
          if (p.subscription_id) {
            await conn.query(
              "UPDATE subscriptions SET status = 'active' WHERE id = ? AND status = 'pending-payment'",
              [p.subscription_id]
            );
            const [[sub]] = await conn.query("SELECT user_id FROM subscriptions WHERE id = ?", [p.subscription_id]);
            if (sub) {
              await conn.query("UPDATE users SET role = 'premium' WHERE id = ? AND role != 'premium'", [sub.user_id]);
            }
          }
          await conn.commit();
          req.audit("webhook-received", "payment", p.id, { idempotency_key: idempotencyKey });
        } catch (e) {
          await conn.rollback();
          throw e;
        } finally {
          conn.release();
        }
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

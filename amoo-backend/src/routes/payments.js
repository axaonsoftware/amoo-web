const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, assertFound, parsePagination } = require("../utils/response");
const env = require("../config/env");

let razorpayInstance = null;
function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;
  if (env.payments.razorpayKeyId && env.payments.razorpayKeySecret) {
    razorpayInstance = new Razorpay({
      key_id: env.payments.razorpayKeyId,
      key_secret: env.payments.razorpayKeySecret,
    });
  }
  return razorpayInstance;
}

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

// POST /api/payments/create-order (Razorpay: create an order for a booking)
// Creates a pending payment record, then creates a Razorpay order.
// Returns { order_id, amount, currency, key_id, payment_id } to the frontend.
router.post(
  "/create-order",
  authRequired,
  asyncHandler(async (req, res) => {
    const { booking_id, subscription_id } = req.body;
    if (!booking_id && !subscription_id) {
      return fail(res, 400, "booking_id or subscription_id is required");
    }

    const rp = getRazorpay();
    if (!rp) {
      return fail(res, 503, "Payment gateway not configured (RAZORPAY_KEY_ID missing)");
    }

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
      } else {
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

      if (amount <= 0) {
        return fail(res, 400, "Amount must be greater than 0");
      }

      // Create a pending payment record
      const [result] = await conn.query(
        "INSERT INTO payments (booking_id, subscription_id, user_id, amount, method, gateway, status) VALUES (?, ?, ?, ?, 'razorpay', 'razorpay', 'pending')",
        [booking_id || null, subscription_id || null, req.user.id, amount]
      );
      const paymentId = result.insertId;

      // Create Razorpay order (amount in paise)
      const order = await rp.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `pay_${paymentId}`,
        notes: {
          booking_id: booking_id ? String(booking_id) : "",
          subscription_id: subscription_id ? String(subscription_id) : "",
          payment_id: String(paymentId),
        },
      });

      // Store the gateway order ID on the payment record
      await conn.query("UPDATE payments SET gateway_order_id = ? WHERE id = ?", [order.id, paymentId]);

      await conn.commit();
      req.audit("create-order", "payment", paymentId, { razorpay_order_id: order.id, amount });
      ok(res, {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: env.payments.razorpayKeyId,
        payment_id: paymentId,
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

// POST /api/payments/verify (Razorpay: verify payment after frontend checkout)
// Called from the frontend after a successful Razorpay checkout.
// Verifies the HMAC signature, then updates the payment and booking/subscription.
router.post(
  "/verify",
  authRequired,
  asyncHandler(async (req, res) => {
    const { booking_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return fail(res, 400, "Missing payment verification fields");
    }

    // Verify HMAC signature
    const secret = env.payments.razorpayKeySecret;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) {
      return fail(res, 400, "Invalid payment signature");
    }

    // Find the payment record by gateway_order_id
    const [p] = await pool.query(
      "SELECT id, booking_id, subscription_id, status, amount FROM payments WHERE gateway_order_id = ?",
      [razorpay_order_id]
    );
    if (!p.length) {
      return fail(res, 404, "Payment order not found");
    }
    const payment = p[0];

    if (payment.status === "success") {
      return ok(res, { id: payment.id, status: "success", already_processed: true });
    }

    // Update transaction ID
    await pool.query(
      "UPDATE payments SET status = 'success', txn_id = ? WHERE id = ? AND status != 'success'",
      [razorpay_payment_id, payment.id]
    );

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (payment.booking_id) {
        await conn.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", [payment.booking_id]);
      }
      if (payment.subscription_id) {
        await conn.query(
          "UPDATE subscriptions SET status = 'active' WHERE id = ? AND status = 'pending-payment'",
          [payment.subscription_id]
        );
        const [[sub]] = await conn.query("SELECT user_id FROM subscriptions WHERE id = ?", [payment.subscription_id]);
        if (sub) {
          await conn.query("UPDATE users SET role = 'premium' WHERE id = ? AND role != 'premium'", [sub.user_id]);
        }
      }
      await conn.commit();
      req.audit("verify-payment", "payment", payment.id, { razorpay_order_id, razorpay_payment_id });
      ok(res, { id: payment.id, status: "success" });
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
    if (p.status === "refunded") {
      return fail(res, 400, "Payment already refunded");
    }
    if (p.status !== "success") {
      return fail(res, 400, "Only successful payments can be refunded");
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Call the gateway API to actually reverse the charge
      let gatewayRefundId = null;
      if (p.gateway === "razorpay" && p.txn_id) {
        try {
          const rzp = getRazorpay();
          if (rzp) {
            const refundRes = await rzp.payments.refund(p.txn_id, {
              amount: Math.round(p.amount * 100), // Razorpay expects paise
              notes: { reason: reason || "", refunded_by: req.user.kind },
            });
            gatewayRefundId = refundRes.id;
          }
        } catch (gatewayErr) {
          // Log the error but don't rollback — mark as refunded in DB
          // and let the admin reconcile manually.
          console.error("[payments] Gateway refund failed for payment", p.id, gatewayErr.message);
        }
      }

      // 2. Update payment record
      await conn.query(
        "UPDATE payments SET status = 'refunded', refund_id = ?, refunded_at = NOW() WHERE id = ?",
        [gatewayRefundId || null, p.id]
      );

      // 3. Cancel the associated booking
      if (p.booking_id) {
        await conn.query(
          "UPDATE bookings SET payment = 'Pending', status = 'cancelled' WHERE id = ?",
          [p.booking_id]
        );
      }

      // 4. Record in refunds table
      await conn.query(
        "INSERT INTO refunds (payment_id, user_id, amount, reason, status) VALUES (?, ?, ?, ?, 'processed')",
        [p.id, p.user_id, p.amount, reason || null]
      );

      await conn.commit();
      req.audit("refund", "payment", p.id, { reason, gatewayRefundId });
      ok(res, { id: p.id, refunded: true, amount: p.amount, gateway_refund_id: gatewayRefundId });
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
      // Razorpay sends event data inside payload.payment.entity or payload.order.entity
      const payload = req.body.payload || {};
      const paymentEntity = payload.payment?.entity || {};
      const orderEntity = payload.order?.entity || {};
      const entity = Object.keys(paymentEntity).length ? paymentEntity : orderEntity;
      const razorpayOrderId = entity.order_id || req.body.order_id || "";

      // Match by gateway_order_id (Razorpay order ID stored on our payment record)
      let p = null;
      if (razorpayOrderId) {
        const [byOrder] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE gateway_order_id = ?", [razorpayOrderId]);
        if (byOrder.length) p = byOrder[0];
      }

      // Fall back to booking_id / subscription_id from notes
      const bookingId = entity.notes?.booking_id || req.body.booking_id || req.body.bookingId || payload.booking_id;
      const subscriptionId = entity.notes?.subscription_id || req.body.subscription_id || req.body.subscriptionId || payload.subscription_id;
      if (!p && bookingId) {
        const [byBooking] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE booking_id = ?", [bookingId]);
        if (byBooking.length) p = byBooking[0];
      }
      if (!p && subscriptionId) {
        const [bySub] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE subscription_id = ?", [subscriptionId]);
        if (bySub.length) p = bySub[0];
      }

      // Fall back to txn_id
      const paymentId = entity.id || req.body.payment_id || req.body.id || req.body.txn_id;
      if (!p && paymentId) {
        const [byTxn] = await pool.query("SELECT id, booking_id, subscription_id, status FROM payments WHERE txn_id = ?", [paymentId]);
        if (byTxn.length) p = byTxn[0];
      }

      if (p) {
        if (p.status === "success") return res.json({ success: true, received: true, already_processed: true });

        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();
          // Update txn_id if this is a new payment ID from the gateway
          if (paymentId) {
            await conn.query("UPDATE payments SET status = 'success', txn_id = COALESCE(NULLIF(txn_id,''), ?) WHERE id = ? AND status != 'success'", [paymentId, p.id]);
          } else {
            await conn.query("UPDATE payments SET status = 'success' WHERE id = ? AND status != 'success'", [p.id]);
          }

          if (p.booking_id) {
            await conn.query("UPDATE bookings SET payment = 'Paid', status = 'upcoming' WHERE id = ?", [p.booking_id]);
          }
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

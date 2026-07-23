const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

const joi = require("joi");
const couponSchema = joi.object({
  code: joi.string().uppercase().min(3).max(30).required(),
  description: joi.string().allow("").max(255),
  discount_type: joi.string().valid("percent", "flat").required(),
  discount_value: joi.number().min(0).required(),
  min_amount: joi.number().min(0).default(0),
  max_uses: joi.number().integer().min(1).allow(null),
  expires_at: joi.string().allow("").allow(null),
  active: joi.boolean().default(true),
});
const couponUpdateSchema = joi.object({
  code: joi.string().uppercase().min(3).max(30),
  description: joi.string().allow("").max(255),
  discount_type: joi.string().valid("percent", "flat"),
  discount_value: joi.number().min(0),
  min_amount: joi.number().min(0),
  max_uses: joi.number().integer().min(1).allow(null),
  expires_at: joi.string().allow("").allow(null),
  active: joi.boolean(),
});
const COUPON_UPDATE_ALLOWED = ["code", "description", "discount_type", "discount_value", "min_amount", "max_uses", "expires_at", "active"];

// GET /api/coupons (admin list + filters)
router.get(
  "/",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    if (req.query.status === "active") where += " AND active = 1";
    if (req.query.status === "inactive") where += " AND active = 0";
    if (req.query.search) { where += " AND code LIKE ?"; params.push(`%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM coupons ${where}`, params);
    const [rows] = await pool.query(
      "SELECT * FROM coupons " + where + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/coupons (admin create)
router.post(
  "/",
  adminRequired,
  validate("coupon", undefined, couponSchema),
  asyncHandler(async (req, res) => {
    const {
      code, description, discount_type, discount_value, min_amount, max_uses, expires_at, active,
    } = req.body;
    const [existing] = await pool.query("SELECT id FROM coupons WHERE code = ?", [code]);
    if (existing.length) throw new HttpError(409, "Coupon code already exists");
    const [result] = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_amount, max_uses, expires_at, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, description || null, discount_type, discount_value, min_amount, max_uses || null, expires_at || null, active]
    );
    req.audit("create", "coupon", result.insertId, { code });
    created(res, { id: result.insertId });
  })
);

// POST /api/coupons/validate (public — used at checkout)
router.post(
  "/validate",
  validate("couponValidate"),
  asyncHandler(async (req, res) => {
    const { code, amount } = req.body;
    const [rows] = await pool.query("SELECT * FROM coupons WHERE code = ?", [code.toUpperCase()]);
    if (!rows.length) throw new HttpError(404, "Invalid coupon");
    const c = rows[0];
    if (!c.active) throw new HttpError(400, "Coupon inactive");
    if (c.expires_at && new Date(c.expires_at) < new Date()) throw new HttpError(400, "Coupon expired");
    if (c.max_uses && c.used_count >= c.max_uses) throw new HttpError(400, "Coupon exhausted");
    if (amount && Number(amount) < Number(c.min_amount)) {
      throw new HttpError(400, `Minimum order ${c.min_amount}`);
    }
    const discount = amount
      ? (c.discount_type === "percent"
          ? (Number(amount) * Number(c.discount_value)) / 100
          : Number(c.discount_value))
      : 0;
    ok(res, { coupon: c, discount: Math.round(discount * 100) / 100, amount: Number(amount) || 0 });
  })
);

// POST /api/coupons/apply (redeems a coupon against a booking)
//
// SECURITY: requires booking_id, validates the booking belongs to the caller,
// and is idempotent per booking — one coupon per booking, enforced both by the
// pre-check below and by the UNIQUE key on coupon_usages.booking_id — which
// prevents replay/exhaustion of a coupon and stops two coupons stacking
// discounts onto the same booking.
//
// The discount is computed from the booking's own stored amount, never from the
// client-supplied `amount`, and is written back to bookings.amount inside the
// same transaction so the customer is actually charged the discounted price.
// Redemptions are recorded in coupon_usages, not as zero-amount `payments`
// rows — those were counted by /api/payments/stats/overview and inflated the
// transaction totals in admin revenue reporting.
router.post(
  "/apply",
  authRequired,
  validate("couponApply"),
  asyncHandler(async (req, res) => {
    const { code, booking_id } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // Lock the booking: its amount is both the discount base and the row we
      // are about to rewrite, so it must not move underneath us.
      const [b] = await conn.query(
        "SELECT id, user_id, amount, payment, status FROM bookings WHERE id = ? FOR UPDATE",
        [booking_id]
      );
      if (!b.length) throw new HttpError(404, "Booking not found");
      const booking = b[0];
      if (booking.user_id !== req.user.id) throw new HttpError(403, "Forbidden");
      if (booking.payment === "Paid") throw new HttpError(400, "Booking is already paid");
      if (booking.status === "cancelled") throw new HttpError(400, "Booking is cancelled");

      const [[already]] = await conn.query(
        "SELECT id FROM coupon_usages WHERE booking_id = ? LIMIT 1",
        [booking_id]
      );
      if (already) throw new HttpError(409, "A coupon has already been applied to this booking");
      // Legacy guard: redemptions made before coupon_usages existed live in
      // `payments` as gateway = 'coupon:CODE'. Drop this once those are migrated.
      const [[legacy]] = await conn.query(
        "SELECT id FROM payments WHERE booking_id = ? AND gateway LIKE 'coupon:%' LIMIT 1",
        [booking_id]
      );
      if (legacy) throw new HttpError(409, "A coupon has already been applied to this booking");

      const [rows] = await conn.query("SELECT * FROM coupons WHERE code = ? FOR UPDATE", [code.toUpperCase()]);
      if (!rows.length) throw new HttpError(404, "Invalid coupon");
      const c = rows[0];
      if (!c.active) throw new HttpError(400, "Coupon inactive");
      if (c.expires_at && new Date(c.expires_at) < new Date()) throw new HttpError(400, "Coupon expired");
      if (c.max_uses && c.used_count >= c.max_uses) throw new HttpError(400, "Coupon exhausted");

      const amountBefore = Number(booking.amount);
      if (amountBefore < Number(c.min_amount)) throw new HttpError(400, `Minimum order ${c.min_amount}`);
      const raw = c.discount_type === "percent"
        ? (amountBefore * Number(c.discount_value)) / 100
        : Number(c.discount_value);
      // A flat coupon larger than the booking must not push the total negative.
      const discount = Math.round(Math.min(raw, amountBefore) * 100) / 100;
      const amountAfter = Math.round((amountBefore - discount) * 100) / 100;

      await conn.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [c.id]);
      await conn.query("UPDATE bookings SET amount = ? WHERE id = ?", [amountAfter, booking_id]);
      await conn.query(
        `INSERT INTO coupon_usages (coupon_id, booking_id, user_id, discount, amount_before, amount_after)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, booking_id, req.user.id, discount, amountBefore, amountAfter]
      );
      await conn.commit();
      req.audit("apply", "coupon", c.id, { code: c.code, booking_id, discount, amount_before: amountBefore, amount_after: amountAfter });
      ok(res, {
        code: c.code,
        discount,
        booking_id,
        amount_before: amountBefore,
        amount: amountAfter,
      });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  })
);

// admin full update
router.patch(
  "/:id",
  adminRequired,
  validate("coupon", undefined, couponUpdateSchema),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, COUPON_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE coupons SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "coupon", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM coupons WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
    req.audit("delete", "coupon", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;

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

// POST /api/coupons/apply (records usage — increments used_count)
// SECURITY: requires booking_id, validates the booking belongs to the caller,
// and is idempotent per booking (a coupon cannot be applied twice to the same
// booking), preventing replay/exhaustion of a coupon.
router.post(
  "/apply",
  authRequired,
  validate("couponApply"),
  asyncHandler(async (req, res) => {
    const { code, amount, booking_id } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [b] = await conn.query("SELECT id, user_id, amount FROM bookings WHERE id = ?", [booking_id]);
      if (!b.length) throw new HttpError(404, "Booking not found");
      if (b[0].user_id !== req.user.id) throw new HttpError(403, "Forbidden");
      const [[already]] = await conn.query(
        "SELECT id FROM payments WHERE booking_id = ? AND gateway = ? LIMIT 1",
        [booking_id, "coupon:" + code.toUpperCase()]
      );
      if (already) throw new HttpError(409, "Coupon already applied to this booking");
      const [rows] = await conn.query("SELECT * FROM coupons WHERE code = ? FOR UPDATE", [code.toUpperCase()]);
      if (!rows.length) throw new HttpError(404, "Invalid coupon");
      const c = rows[0];
      if (!c.active) throw new HttpError(400, "Coupon inactive");
      if (c.expires_at && new Date(c.expires_at) < new Date()) throw new HttpError(400, "Coupon expired");
      if (c.max_uses && c.used_count >= c.max_uses) throw new HttpError(400, "Coupon exhausted");
      if (amount && Number(amount) < Number(c.min_amount)) throw new HttpError(400, `Minimum order ${c.min_amount}`);
      const discount = c.discount_type === "percent"
        ? (Number(amount) * Number(c.discount_value)) / 100
        : Number(c.discount_value);
      await conn.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [c.id]);
      await conn.query(
        "INSERT INTO payments (booking_id, user_id, amount, method, status, gateway) VALUES (?, ?, 0, 'coupon', 'success', ?)",
        [booking_id, req.user.id, "coupon:" + c.code.toUpperCase()]
      );
      await conn.commit();
      ok(res, { code: c.code, discount: Math.round(discount * 100) / 100 });
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

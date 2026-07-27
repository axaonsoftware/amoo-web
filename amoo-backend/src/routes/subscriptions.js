const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, assertFound, parsePagination } = require("../utils/response");

const SUB_UPDATE_ALLOWED = ["status", "auto_renew", "plan_name", "expires_at"];

// GET /api/subscriptions (own — paginated)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { rows: [{ total }] } = await pool.query(
      "SELECT COUNT(*) AS total FROM subscriptions WHERE user_id = $1",
      [req.user.id]
    );
    const { rows } = await pool.query(
      `SELECT s.*, p.name AS package_name, p.price AS package_price
       FROM subscriptions s LEFT JOIN packages p ON p.id = s.package_id
       WHERE s.user_id = $1 ORDER BY s.started_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/subscriptions (subscribe to a package)
// SECURITY: a subscription is created in 'pending-payment' state and the
// 'premium' role is NOT granted here. It is activated (status -> active,
// role -> premium) ONLY when a successful payment is recorded against it
// (via the gateway webhook in payments.js). A genuinely free package
// (price 0 / null) is activated immediately since no payment is required.
router.post(
  "/",
  authRequired,
  validate("subscription"),
  asyncHandler(async (req, res) => {
    const { package_id, plan_name, duration_days, auto_renew } = req.body;
    let name = plan_name;
    let days = duration_days ? Number(duration_days) : 30;
    let price = 0;
    if (package_id) {
      const { rows } = await pool.query("SELECT * FROM packages WHERE id = $1 AND deleted_at IS NULL", [package_id]);
      if (!rows.length) throw new HttpError(404, "Package not found");
      if (rows[0].status !== "Active") throw new HttpError(400, "Package is not available");
      name = rows[0].name;
      days = rows[0].duration_days || days;
      price = Number(rows[0].price) || 0;
    }
    if (!name) throw new HttpError(400, "plan_name or package_id required");
    const expires = new Date(Date.now() + days * 86400000);
    const isFree = price <= 0;
    const status = isFree ? "active" : "pending-payment";
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        "INSERT INTO subscriptions (user_id, package_id, plan_name, expires_at, status, auto_renew) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [req.user.id, package_id || null, name, expires, status, auto_renew]
      );
      const insertId = result.rows[0].id;
      if (isFree) {
        // No payment needed: activate premium immediately.
        await client.query("UPDATE users SET role = 'premium' WHERE id = $1", [req.user.id]);
      }
      await client.query('COMMIT');
      req.audit("create", "subscription", insertId, { plan_name: name, free: isFree });
      created(res, {
        id: insertId,
        plan_name: name,
        expires_at: expires,
        status,
        premium_activated: isFree,
        note: isFree ? "Free plan activated." : "Complete payment to activate premium.",
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  })
);

// user self-cancel
router.post(
  "/:id/cancel",
  authRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM subscriptions WHERE id = $1", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    await pool.query("UPDATE subscriptions SET status = 'cancelled', auto_renew = false WHERE id = $1", [req.params.id]);
    req.audit("cancel", "subscription", Number(req.params.id));
    ok(res, { id: Number(req.params.id), cancelled: true });
  })
);

// admin: all (paginated + filters)
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    let paramIndex = 0;
    if (req.query.status) { where += ` AND s.status = $${++paramIndex}`; params.push(req.query.status); }
    if (req.query.user_id) { where += ` AND s.user_id = $${++paramIndex}`; params.push(req.query.user_id); }
    const { rows: [{ total }] } = await pool.query(
      `SELECT COUNT(*) AS total FROM subscriptions s ${where}`,
      params
    );
    const { rows } = await pool.query(
      `SELECT s.*, u.name AS user_name, p.name AS package_name
       FROM subscriptions s JOIN users u ON u.id = s.user_id
       LEFT JOIN packages p ON p.id = s.package_id ${where}
       ORDER BY s.started_at DESC LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin update (status / auto_renew / plan / expiry)
router.patch(
  "/:id",
  adminRequired,
  validate("subscriptionUpdate"),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, SUB_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE subscriptions SET ${setClause} WHERE id = $${values.length}`, values);
    req.audit("update", "subscription", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// Shared expire logic (used by both the HTTP endpoint and the cron job).
// Returns { expired: number } so callers can log or respond accordingly.
async function expireSubscriptions() {
  const { rows: expired } = await pool.query(
    "SELECT id, user_id FROM subscriptions WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW()"
  );
if (expired.length) {
    const ids = expired.map((e) => e.id);
    await pool.query("UPDATE subscriptions SET status = 'expired' WHERE id = ANY($1::int[])", [ids]);
    const userIds = [...new Set(expired.map((e) => e.user_id))];
    const { rows: [{ keepActive }] } = await pool.query(
      "SELECT COUNT(DISTINCT user_id)::int AS keepActive FROM subscriptions WHERE user_id = ANY($1::int[]) AND status = 'active'",
      [userIds]
    );
    if (keepActive < userIds.length) {
      await pool.query(
        "UPDATE users SET role = 'free' WHERE id = ANY($1::int[]) AND role != 'free' AND id NOT IN (SELECT user_id FROM subscriptions WHERE status = 'active')",
        [userIds]
      );
    }
  }
  return { expired: expired.length };
}

// POST /api/subscriptions/expire  (cron: mark expired subs, downgrade users)
router.post(
  "/expire",
  adminRequired,
  asyncHandler(async (req, res) => {
    const result = await expireSubscriptions();
    req.audit("expire-job", "subscription", null, result);
    ok(res, result);
  })
);

module.exports = { router, expireSubscriptions };

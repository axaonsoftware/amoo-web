const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, fail, assertFound, parsePagination } = require("../utils/response");
const path = require("path");
const { upload } = require("../middleware/upload");
const { saveFile } = require("../config/storage");

const USER_UPDATE_ALLOWED = ["name", "email", "phone", "role", "status", "verified"];
// Fields a user may change on their own profile. `email` is excluded on
// purpose — it identifies the account, so changing it belongs in a
// re-verification flow rather than a profile PATCH. Kept in sync with the
// `updateProfile` schema in middleware/validate.js.
const SELF_UPDATE_ALLOWED = [
  "name", "phone", "avatar", "dob", "tob", "birthplace",
  "gender", "language", "country", "state", "city", "address",
];
const USER_SELECT =
  "id, name, email, phone, avatar, role, status, verified, dob, tob, birthplace, " +
  "gender, language, country, state, city, address, created_at";

// GET /api/users (admin) with pagination + search + filters
router.get(
  "/",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE deleted_at IS NULL";
    if (req.query.search) {
      // The admin search box is labelled "name, email or phone" — phone was
      // missing here, so searching by number always returned nothing.
      where += " AND (name LIKE $1 OR email LIKE $2 OR phone LIKE $3)";
      const term = `%${req.query.search}%`;
      params.push(term, term, term);
    }
    if (req.query.status) { where += ` AND status = $${params.length + 1}`; params.push(req.query.status); }
    if (req.query.role) { where += ` AND role = $${params.length + 1}`; params.push(req.query.role); }
    // Backs the admin "Verified Users" tab / verification dropdown.
    if (req.query.verified === "1" || req.query.verified === "0") {
      where += ` AND verified = $${params.length + 1}`;
      params.push(req.query.verified === "1");
    }
    if (req.query.date_from) { where += ` AND created_at >= $${params.length + 1}`; params.push(req.query.date_from); }
    if (req.query.date_to) { where += ` AND created_at <= $${params.length + 1}`; params.push(req.query.date_to + " 23:59:59"); }
    const { rows: [{ total }] } = await pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    const pageParams = [...params, pageSize, offset];
    const n = params.length;
    const { rows } = await pool.query(
      `SELECT ${USER_SELECT} FROM users ${where} ORDER BY created_at DESC LIMIT $${n + 1} OFFSET $${n + 2}`,
      pageParams
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/users/stats (admin)
router.get(
  "/stats",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows: [{ total }] } = await pool.query("SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL");
    const { rows: [active] } = await pool.query("SELECT COUNT(*) AS total FROM users WHERE status='active' AND deleted_at IS NULL");
    const { rows: [premium] } = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role='premium' AND deleted_at IS NULL");
    const { rows: [today] } = await pool.query("SELECT COUNT(*) AS total FROM users WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'");
    const { rows: byRole } = await pool.query(
      "SELECT role, COUNT(*) AS count FROM users WHERE deleted_at IS NULL GROUP BY role"
    );
    ok(res, { total, active: active.total, premium: premium.total, today: today.total, byRole });
  })
);

// GET /api/users/me
router.get(
  "/me",
  authRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT ${USER_SELECT} FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [req.user.id]
    );
    if (assertFound(res, rows[0])) return;
    ok(res, rows[0]);
  })
);

// PATCH /api/users/me
router.patch(
  "/me",
  authRequired,
  upload.single("avatar"), 
  validate("updateProfile"),
  asyncHandler(async (req, res) => {
    const updateData = { ...req.body };

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const unique =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;

      const saved = await saveFile(
        req.file.buffer,
        unique,
        req.file.mimetype
      );

      updateData.avatar = saved.url;
    }

    console.log("USER FILE:", req.file);
    console.log("USER UPDATE DATA:", updateData);

    const { setClause, values } = buildUpdate(
      updateData,
      SELF_UPDATE_ALLOWED
    );

    if (!setClause) {
      return fail(res, 400, "No valid fields to update");
    }

    await pool.query(
      `UPDATE users
       SET ${setClause}
       WHERE id = $${values.length + 1}`,
      [...values, req.user.id]
    );

    const { rows } = await pool.query(
      `SELECT ${USER_SELECT}
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    ok(res, rows[0]);
  })
);

// GET /api/users/:id (admin)
router.get(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`SELECT ${USER_SELECT} FROM users WHERE id = $1 AND deleted_at IS NULL`, [req.params.id]);
    if (assertFound(res, rows[0])) return;
    ok(res, rows[0]);
  })
);

// PATCH /api/users/:id (admin)
router.patch(
  "/:id",
  adminRequired,
  validate("userUpdateAdmin"),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, USER_UPDATE_ALLOWED);
    const result = await pool.query(`UPDATE users SET ${setClause} WHERE id = $${values.length + 1}`, [...values, req.params.id]);
    if (result.rowCount === 0) throw new HttpError(404, "User not found");
    req.audit("update", "user", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// GET /api/users/:id/wallet — wallet balance + transactions (admin)
router.get(
  "/:id/wallet",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows: user } = await pool.query("SELECT id, name, email FROM users WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, user[0])) return;
    // Get the user's wallet and its transactions. The wallet system uses a
    // `wallets` table (keyed by user_id) and `wallet_transactions` (keyed by
    // wallet_id), with balance stored on the wallets row. The old query summed
    // wallet_transactions.amount without distinguishing credits from debits and
    // used the wrong join column (user_id instead of wallet_id).
    const { rows: wallets } = await pool.query(
      "SELECT id, balance FROM wallets WHERE user_id = $1",
      [req.params.id]
    );
    const wallet = wallets[0] || { id: 0, balance: 0 };
    const { rows: txResult } = await pool.query(
      `SELECT id, amount, type, reason, ref, created_at
       FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [wallet.id]
    );
    ok(res, {
      user: user[0],
      balance: Number(wallet.balance) || 0,
      transactions: txResult.rows,
    });
  })
);

// POST /api/users/:id/credit — admin credits wallet (top-up or refund)
router.post(
  "/:id/credit",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { amount, reason } = req.body;
    if (!amount || Number(amount) === 0) return fail(res, 400, "Amount is required and must be non-zero");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows: user } = await client.query("SELECT id, name FROM users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE", [req.params.id]);
      if (!user.length) { await client.query("ROLLBACK"); return fail(res, 404, "User not found"); }
      await client.query(
        "INSERT INTO wallet_transactions (user_id, amount, type, reference_type, reference_id) VALUES ($1, $2, $3, 'admin', NULL)",
        [req.params.id, Number(amount), Number(amount) > 0 ? "credit" : "refund"]
      );
      await client.query("COMMIT");
      req.audit("wallet-credit", "user", Number(req.params.id), { amount, reason });
      ok(res, { id: Number(req.params.id), credited: true, amount: Number(amount) });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

// Soft-delete /api/users/:id (admin)
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE users SET deleted_at = NOW(), status = 'blocked' WHERE id = $1", [req.params.id]);
    req.audit("delete", "user", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;

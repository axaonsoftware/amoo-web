const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, parsePagination, fail } = require("../utils/response");
const logger = require("../utils/logger");

async function ensureWallet(client, userId) {
  const { rows } = await client.query("SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE", [userId]);
  if (rows.length) return rows[0];
  const result = await client.query("INSERT INTO wallets (user_id) VALUES ($1) RETURNING id", [userId]);
  const { rows: created } = await client.query("SELECT * FROM wallets WHERE id = $1", [result.rows[0].id]);
  return created[0];
}

// GET /api/wallet  (balance + paginated transaction history)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { rows: w } = await pool.query("SELECT * FROM wallets WHERE user_id = $1", [req.user.id]);
    const wallet = w[0] || { balance: 0, currency: "INR", id: null };
    const { rows: [{ total }] } = await pool.query(
      "SELECT COUNT(*) AS total FROM wallet_transactions WHERE wallet_id = $1",
      [wallet.id || 0]
    );
    const { rows: txns } = await pool.query(
      "SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [wallet.id || 0, pageSize, offset]
    );
    ok(res, {
      balance: Number(wallet.balance) || 0,
      currency: wallet.currency || "INR",
      transactions: txns,
      meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  })
);

// GET /api/wallet/transaction/:id  (single transaction receipt)
router.get(
  "/transaction/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const txnId = Number(req.params.id);
    if (!Number.isFinite(txnId) || txnId <= 0) throw new HttpError(400, "Invalid transaction id");
    const { rows: w } = await pool.query("SELECT id FROM wallets WHERE user_id = $1", [req.user.id]);
    if (!w.length) throw new HttpError(404, "Wallet not found");
    const { rows: txns } = await pool.query(
      "SELECT id, amount, type, reason, ref, created_at FROM wallet_transactions WHERE id = $1 AND wallet_id = $2",
      [txnId, w[0].id]
    );
    if (!txns.length) throw new HttpError(404, "Transaction not found");
    ok(res, txns[0]);
  })
);

// POST /api/wallet/credit  ->  DEPRECATED for users.
router.post(
  "/credit",
  authRequired,
  (req, res) => {
    return fail(res, 403, "Wallet top-up must go through a payment. Admins use /api/wallet/admin/credit.");
  }
);

// POST /api/wallet/admin/credit  (admin-only, audited)
router.post(
  "/admin/credit",
  adminRequired,
  validate("walletTxn"),
  asyncHandler(async (req, res) => {
    const { user_id, amount, reason, ref } = req.body;
    if (!user_id) throw new HttpError(400, "user_id is required");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const w = await ensureWallet(client, Number(user_id));
      await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [amount, w.id]);
      await client.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES ($1, $2, 'credit', $3, $4)",
        [w.id, amount, reason || "Admin credited", ref || null]
      );
      await client.query("COMMIT");
      const { rows: [updated] } = await client.query("SELECT balance, currency FROM wallets WHERE id = $1", [w.id]);
      req.audit("wallet-admin-credit", "wallet", w.id, { user_id, amount });
      logger.info(`Admin ${req.user.id} credited user ${user_id} ₹${amount}`);
      ok(res, updated);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

// POST /api/wallet/debit (atomic, balance-checked)
router.post(
  "/debit",
  authRequired,
  validate("walletTxn"),
  asyncHandler(async (req, res) => {
    const { amount, reason, ref } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const w = await ensureWallet(client, req.user.id);
      if (Number(w.balance) < amount) throw new HttpError(400, "Insufficient balance");
      await client.query("UPDATE wallets SET balance = balance - $1 WHERE id = $2", [amount, w.id]);
      await client.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES ($1, $2, 'debit', $3, $4)",
        [w.id, amount, reason || "Debited", ref || null]
      );
      await client.query("COMMIT");
      const { rows: [updated] } = await client.query("SELECT balance, currency FROM wallets WHERE id = $1", [w.id]);
      req.audit("wallet-debit", "wallet", w.id, { amount });
      ok(res, updated);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

// POST /api/wallet/transfer  (move funds to another user)
router.post(
  "/transfer",
  authRequired,
  validate("walletTransfer"),
  asyncHandler(async (req, res) => {
    const { to_user_id, amount, note } = req.body;
    if (Number(to_user_id) === req.user.id) throw new HttpError(400, "Cannot transfer to yourself");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const wFrom = await ensureWallet(client, req.user.id);
      if (Number(wFrom.balance) < amount) throw new HttpError(400, "Insufficient balance");
      const wTo = await ensureWallet(client, Number(to_user_id));
      await client.query("UPDATE wallets SET balance = balance - $1 WHERE id = $2", [amount, wFrom.id]);
      await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [amount, wTo.id]);
      await client.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES ($1, $2, 'debit', $3, $4)",
        [wFrom.id, amount, `Transfer to #${to_user_id}`, `TXF-${wTo.id}`]
      );
      await client.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES ($1, $2, 'credit', $3, $4)",
        [wTo.id, amount, `Transfer from #${req.user.id}`, `TXF-${wFrom.id}`]
      );
      await client.query("COMMIT");
      req.audit("wallet-transfer", "wallet", wFrom.id, { to: to_user_id, amount });
      ok(res, { transferred: amount, to_user_id: Number(to_user_id) });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

// GET /api/wallet/low-balance  (admin overview)
router.get(
  "/low-balance",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const threshold = Number(req.query.threshold) || 0;
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, w.balance, w.currency
       FROM wallets w JOIN users u ON u.id = w.user_id
       WHERE w.balance <= $1 ORDER BY w.balance ASC LIMIT 50`,
      [threshold]
    );
    ok(res, rows);
  })
);

// POST /api/wallet/admin/adjust  (admin balance adjustment)
router.post(
  "/admin/adjust",
  adminRequired,
  validate("walletAdjust"),
  asyncHandler(async (req, res) => {
    const { user_id, amount, reason } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const w = await ensureWallet(client, Number(user_id));
      const type = amount >= 0 ? "credit" : "debit";
      await client.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [amount, w.id]);
      await client.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES ($1, $2, $3, $4, $5)",
        [w.id, Math.abs(amount), type, reason || "Admin adjustment", "ADJ"]
      );
      await client.query("COMMIT");
      const { rows: [updated] } = await client.query("SELECT balance, currency FROM wallets WHERE id = $1", [w.id]);
      req.audit("wallet-admin-adjust", "wallet", w.id, { user_id, amount, reason });
      ok(res, updated);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

module.exports = router;

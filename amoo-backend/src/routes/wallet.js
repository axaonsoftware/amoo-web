const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, parsePagination } = require("../utils/response");

async function ensureWallet(conn, userId) {
  const [rows] = await conn.query("SELECT * FROM wallets WHERE user_id = ? FOR UPDATE", [userId]);
  if (rows.length) return rows[0];
  const [result] = await conn.query("INSERT INTO wallets (user_id) VALUES (?)", [userId]);
  const [created] = await conn.query("SELECT * FROM wallets WHERE id = ?", [result.insertId]);
  return created[0];
}

// GET /api/wallet  (balance + paginated transaction history)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const [w] = await pool.query("SELECT * FROM wallets WHERE user_id = ?", [req.user.id]);
    const wallet = w[0] || { balance: 0, currency: "INR", id: null };
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM wallet_transactions WHERE wallet_id = ?",
      [wallet.id || 0]
    );
    const [txns] = await pool.query(
      "SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
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

// POST /api/wallet/credit
router.post(
  "/credit",
  authRequired,
  validate("walletTxn"),
  asyncHandler(async (req, res) => {
    const { amount, reason, ref } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const w = await ensureWallet(conn, req.user.id);
      await conn.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [amount, w.id]);
      await conn.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES (?, ?, 'credit', ?, ?)",
        [w.id, amount, reason || "Added funds", ref || null]
      );
      await conn.commit();
      const [updated] = await conn.query("SELECT balance, currency FROM wallets WHERE id = ?", [w.id]);
      req.audit("wallet-credit", "wallet", w.id, { amount });
      ok(res, updated[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
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
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const w = await ensureWallet(conn, req.user.id);
      if (Number(w.balance) < amount) throw new HttpError(400, "Insufficient balance");
      await conn.query("UPDATE wallets SET balance = balance - ? WHERE id = ?", [amount, w.id]);
      await conn.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES (?, ?, 'debit', ?, ?)",
        [w.id, amount, reason || "Debited", ref || null]
      );
      await conn.commit();
      const [updated] = await conn.query("SELECT balance, currency FROM wallets WHERE id = ?", [w.id]);
      req.audit("wallet-debit", "wallet", w.id, { amount });
      ok(res, updated[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
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
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const wFrom = await ensureWallet(conn, req.user.id);
      if (Number(wFrom.balance) < amount) throw new HttpError(400, "Insufficient balance");
      const wTo = await ensureWallet(conn, Number(to_user_id));
      await conn.query("UPDATE wallets SET balance = balance - ? WHERE id = ?", [amount, wFrom.id]);
      await conn.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [amount, wTo.id]);
      await conn.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES (?, ?, 'debit', ?, ?)",
        [wFrom.id, amount, `Transfer to #${to_user_id}`, `TXF-${wTo.id}`]
      );
      await conn.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES (?, ?, 'credit', ?, ?)",
        [wTo.id, amount, `Transfer from #${req.user.id}`, `TXF-${wFrom.id}`]
      );
      await conn.commit();
      req.audit("wallet-transfer", "wallet", wFrom.id, { to: to_user_id, amount });
      ok(res, { transferred: amount, to_user_id: Number(to_user_id) });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
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
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, w.balance, w.currency
       FROM wallets w JOIN users u ON u.id = w.user_id
       WHERE w.balance <= ? ORDER BY w.balance ASC LIMIT 50`,
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
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const w = await ensureWallet(conn, Number(user_id));
      const type = amount >= 0 ? "credit" : "debit";
      await conn.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [amount, w.id]);
      await conn.query(
        "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES (?, ?, ?, ?, ?)",
        [w.id, Math.abs(amount), type, reason || "Admin adjustment", "ADJ"]
      );
      await conn.commit();
      const [updated] = await conn.query("SELECT balance, currency FROM wallets WHERE id = ?", [w.id]);
      req.audit("wallet-admin-adjust", "wallet", w.id, { user_id, amount, reason });
      ok(res, updated[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

module.exports = router;

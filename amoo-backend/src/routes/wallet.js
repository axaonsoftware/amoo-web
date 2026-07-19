const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

// Ensure wallet exists for user, return it
async function ensureWallet(userId) {
  const [rows] = await pool.query("SELECT * FROM wallets WHERE user_id = ?", [userId]);
  if (rows.length) return rows[0];
  const [result] = await pool.query("INSERT INTO wallets (user_id) VALUES (?)", [userId]);
  const [created] = await pool.query("SELECT * FROM wallets WHERE id = ?", [result.insertId]);
  return created[0];
}

// GET /api/wallet
router.get("/", authRequired, asyncHandler(async (req, res) => {
  const w = await ensureWallet(req.user.id);
  const [txns] = await pool.query(
    "SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50",
    [w.id]
  );
  res.json({ balance: w.balance, currency: w.currency, transactions: txns });
}));

// POST /api/wallet/credit  (add funds)
router.post("/credit", authRequired, asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "amount must be > 0" });
  const w = await ensureWallet(req.user.id);
  await pool.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [amount, w.id]);
  await pool.query(
    "INSERT INTO wallet_transactions (wallet_id, amount, type, reason) VALUES (?, ?, 'credit', ?)",
    [w.id, amount, reason || "Added funds"]
  );
  const [updated] = await pool.query("SELECT balance FROM wallets WHERE id = ?", [w.id]);
  res.json({ balance: updated[0].balance });
}));

// POST /api/wallet/debit
router.post("/debit", authRequired, asyncHandler(async (req, res) => {
  const { amount, reason, ref } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "amount must be > 0" });
  const w = await ensureWallet(req.user.id);
  if (Number(w.balance) < amount) return res.status(400).json({ error: "Insufficient balance" });
  await pool.query("UPDATE wallets SET balance = balance - ? WHERE id = ?", [amount, w.id]);
  await pool.query(
    "INSERT INTO wallet_transactions (wallet_id, amount, type, reason, ref) VALUES (?, ?, 'debit', ?, ?)",
    [w.id, amount, reason || "Debited", ref || null]
  );
  const [updated] = await pool.query("SELECT balance FROM wallets WHERE id = ?", [w.id]);
  res.json({ balance: updated[0].balance });
}));

module.exports = router;

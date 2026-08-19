const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { ok } = require("../utils/response");

// Ensure platform_settings table exists
(async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS platform_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) NOT NULL UNIQUE,
      value TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  } catch (_) { /* table already exists */ }
})();

// Seed default settings if the table is empty
(async () => {
  try {
    const { rows: [{ count }] } = await pool.query("SELECT COUNT(*) AS count FROM platform_settings");
    if (Number(count) === 0) {
      const defaults = [
        ['platform_name', 'Amoo Guru'],
        ['commission_rate', '10'],
        ['tax_rate', '18'],
        ['support_email', 'support@amoo.guru'],
        ['support_phone', '+91-XXXXXXXXXX'],
        ['maintenance_mode', 'false'],
        ['terms_and_conditions', ''],
        ['privacy_policy', ''],
      ];
      for (const [k, v] of defaults) {
        await pool.query("INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING", [k, v]);
      }
    }
  } catch (_) { /* ignore */ }
})();

// GET /api/settings — admin, returns all settings as key-value object
router.get(
  "/",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT key, value FROM platform_settings");
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    ok(res, settings);
  })
);

// PUT /api/settings — admin, upserts key-value pairs
router.put(
  "/",
  adminRequired,
  asyncHandler(async (req, res) => {
    const entries = Object.entries(req.body || {});
    const updated = [];
    for (const [k, v] of entries) {
      await pool.query(
        "INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
        [k, v]
      );
      updated.push(k);
    }
    ok(res, { updated: true, keys: updated });
  })
);

module.exports = router;

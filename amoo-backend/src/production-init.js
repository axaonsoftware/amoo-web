require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool, testConnection } = require("./config/db");
const logger = require("./utils/logger");

// ──────────────────────────────────────────────────────────────
//  Production Admin Initializer
//
//  Creates EXACTLY ONE admin account for production deployments.
//  Environment variables:
//    ADMIN_EMAIL    — admin login email  (required)
//    ADMIN_PASSWORD — admin login password (required unless GENERATE_ADMIN_PASSWORD=true)
//    GENERATE_ADMIN_PASSWORD — set "true" to auto-generate a 24-char password
//
//  Usage:
//    npm run init:admin                         # uses env vars
//    GENERATE_ADMIN_PASSWORD=true npm run init:admin   # auto-generates password
//
//  This script is IDEMPOTENT: if an admin already exists it exits cleanly.
//  A database trigger installed on the first run prevents any future INSERT
//  into the admins table, enforcing the single-admin invariant at the DB level.
// ──────────────────────────────────────────────────────────────

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const GENERATE = process.env.GENERATE_ADMIN_PASSWORD === "true";

(async () => {
  if (!EMAIL) {
    logger.error("ADMIN_EMAIL is required. Set it in your .env or environment.");
    process.exit(1);
  }

  if (!PASSWORD && !GENERATE) {
    logger.error(
      "ADMIN_PASSWORD is required. Set it in your .env or environment, " +
      "or set GENERATE_ADMIN_PASSWORD=true to auto-generate one."
    );
    process.exit(1);
  }

  const okDb = await testConnection();
  if (!okDb) {
    logger.error("Cannot connect to database. Aborting.");
    process.exit(1);
  }

  try {
    // ── 1. Check if admin already exists ────────────────────────
    const { rows: existing } = await pool.query(
      "SELECT id, email FROM admins WHERE deleted_at IS NULL LIMIT 1"
    );
    if (existing.length) {
      logger.info(`Admin already exists (${existing[0].email}). Skipping creation.`);
      // Still install the trigger in case it was missed on a prior run.
      await installSingleAdminTrigger(pool);
      process.exit(0);
    }

    // ── 2. Resolve password ─────────────────────────────────────
    let password = PASSWORD;
    if (GENERATE) {
      password = crypto.randomBytes(18).toString("base64url"); // 24 chars
      logger.info(`Generated admin password: ${password}`);
    }

    // ── 3. Validate password strength ───────────────────────────
    if (password.length < 12) {
      logger.error("Admin password must be at least 12 characters.");
      process.exit(1);
    }

    // ── 4. Create the admin ─────────────────────────────────────
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO admins (name, email, password_hash, role)
       VALUES ('Administrator', $1, $2, 'admin')`,
      [EMAIL, hash]
    );
    logger.info(`Admin created: ${EMAIL}`);

    // ── 5. Install single-admin DB trigger ──────────────────────
    await installSingleAdminTrigger(pool);

    // ── 6. Print credentials ────────────────────────────────────
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("  PRODUCTION ADMIN CREDENTIALS");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info(`  Email:    ${EMAIL}`);
    logger.info(`  Password: ${password}`);
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("  Save these credentials securely. They will not be shown again.");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (e) {
    logger.error("Production init failed:", e.message);
    process.exit(1);
  }
})();

// Installs a PostgreSQL trigger that prevents inserting more than one row
// into the admins table. Idempotent — drops and recreates only if missing.
async function installSingleAdminTrigger(client) {
  const fnSql = `
    CREATE OR REPLACE FUNCTION prevent_multi_admin()
    RETURNS TRIGGER AS $$
    BEGIN
      IF (SELECT COUNT(*) FROM admins WHERE deleted_at IS NULL) >= 1 THEN
        RAISE EXCEPTION 'Only one admin account is allowed in production';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  const trigSql = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_single_admin'
      ) THEN
        CREATE TRIGGER trg_single_admin
          BEFORE INSERT ON admins
          FOR EACH ROW
          EXECUTE FUNCTION prevent_multi_admin();
      END IF;
    END
    $$;
  `;

  await client.query(fnSql);
  await client.query(trigSql);
  logger.info("Single-admin trigger installed on admins table.");
}

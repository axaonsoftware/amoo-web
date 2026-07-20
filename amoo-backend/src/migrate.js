require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool, testConnection } = require("./config/db");
const logger = require("./utils/logger");

// Applies the consolidated schema.sql idempotently.
// Splits the script into individual statements so we don't need multipleStatements.

(async () => {
  const okDb = await testConnection();
  if (!okDb) {
    logger.error("Cannot connect to database. Aborting migration.");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

  // Re-extract statements here (function above returns but we call inline).
  const statements = [];
  let buf = "";
  let inString = false;
  let quote = "";
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inString) {
      buf += ch;
      if (ch === quote && sql[i - 1] !== "\\") inString = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = true;
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === ";") {
      if (buf.trim()) statements.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) statements.push(buf.trim());

  const conn = await pool.getConnection();
  try {
    for (const stmt of statements) {
      if (!stmt) continue;
      await conn.query(stmt);
    }

    // Add new columns to pre-existing tables BEFORE creating indexes (idempotent).
    const columnAdds = [
      ["users", "reset_otp", "VARCHAR(12)"],
      ["users", "reset_otp_expires", "DATETIME"],
      ["users", "updated_at", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
      ["users", "token_version", "INT NOT NULL DEFAULT 0"],
      ["users", "verify_token", "VARCHAR(64)"],
      ["users", "verify_token_expires", "DATETIME"],
      ["users", "deleted_at", "DATETIME"],
      ["admins", "token_version", "INT NOT NULL DEFAULT 0"],
      ["users", "failed_attempts", "INT NOT NULL DEFAULT 0"],
      ["users", "locked_until", "DATETIME"],
      ["admins", "failed_attempts", "INT NOT NULL DEFAULT 0"],
      ["admins", "locked_until", "DATETIME"],
      ["experts", "deleted_at", "DATETIME"],
      ["services", "deleted_at", "DATETIME"],
      ["packages", "deleted_at", "DATETIME"],
      ["testimonials", "deleted_at", "DATETIME"],
      ["reports", "status", "ENUM('pending','ready','rejected') NOT NULL DEFAULT 'pending'"],
      ["reports", "deleted_at", "DATETIME"],
      ["subscriptions", "auto_renew", "TINYINT(1) NOT NULL DEFAULT 0"],
      ["contacts", "reply", "TEXT"],
      ["conversations", "last_message_at", "DATETIME"],
      ["bookings", "slot_id", "INT"],
      ["payments", "gateway", "VARCHAR(40)"],
      ["payments", "subscription_id", "INT"],
    ];
    for (const [table, col, def] of columnAdds) {
      const [existing] = await conn.query(
        "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1",
        [table, col]
      );
      if (existing.length) continue;
      await conn.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    }

    // Extend the subscriptions `status` ENUM to allow 'pending-payment'
    // (idempotent: only alter if the value isn't already present).
    try {
      const [enumRows] = await conn.query(
        "SELECT COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'status' LIMIT 1"
      );
      const enumDef = enumRows[0] && enumRows[0].COLUMN_TYPE;
      if (enumDef && !/pending-payment/.test(enumDef)) {
        await conn.query(
          "ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','expired','cancelled','pending-payment') NOT NULL DEFAULT 'active'"
        );
      }
    } catch (e) {
      if (!/duplicate|already exists/i.test(e.message)) throw e;
    }

    // Indexes — created defensively (older MySQL lacks CREATE INDEX IF NOT EXISTS).
    const indexes = [
      // Primary keys auto-indexed — secondary indexes below
      ["idx_users_email", "users", "email"],
      ["idx_users_status", "users", "status"],
      ["idx_users_role", "users", "role"],
      ["idx_users_deleted", "users", "deleted_at"],
      ["idx_bookings_user", "bookings", "user_id"],
      ["idx_bookings_expert", "bookings", "expert_id"],
      ["idx_bookings_service", "bookings", "service_id"],
      ["idx_bookings_slot", "bookings", "slot_id"],
      ["idx_bookings_status", "bookings", "status"],
      ["idx_bookings_date", "bookings", "date"],
      ["idx_payments_user", "payments", "user_id"],
      ["idx_payments_booking", "payments", "booking_id"],
      ["idx_payments_sub", "payments", "subscription_id"],
      ["idx_payments_status", "payments", "status"],
      ["idx_payments_method", "payments", "method"],
      ["idx_reports_user", "reports", "user_id"],
      ["idx_reports_status", "reports", "status"],
      ["idx_reports_type", "reports", "type"],
      ["idx_reports_deleted", "reports", "deleted_at"],
      ["idx_slots_expert", "slots", "expert_id"],
      ["idx_slots_date", "slots", "date"],
      ["idx_wallet_user", "wallets", "user_id"],
      ["idx_wallet_txn", "wallet_transactions", "wallet_id"],
      ["idx_sub_user", "subscriptions", "user_id"],
      ["idx_sub_status", "subscriptions", "status"],
      ["idx_sub_expires", "subscriptions", "expires_at"],
      ["idx_notif_user", "notifications", "user_id"],
      ["idx_notif_read", "notifications", "is_read"],
      ["idx_contact_status", "contacts", "status"],
      ["idx_experts_status", "experts", "status"],
      ["idx_experts_deleted", "experts", "deleted_at"],
      ["idx_services_status", "services", "status"],
      ["idx_services_cat", "services", "category"],
      ["idx_services_deleted", "services", "deleted_at"],
      ["idx_packages_deleted", "packages", "deleted_at"],
      ["idx_testimonials_deleted", "testimonials", "deleted_at"],
      ["idx_coupon_code", "coupons", "code"],
      ["idx_messages_conv", "messages", "conversation_id"],
      ["idx_messages_sender", "messages", "sender_id"],
      ["idx_audit_actor", "audit_log", "actor_id"],
      ["idx_audit_action", "audit_log", "action"],
      ["idx_audit_entity", "audit_log", "entity"],
    ];
    for (const [name, table, col] of indexes) {
      const [existing] = await conn.query(
        "SELECT INDEX_NAME FROM information_schema.statistics WHERE table_schema = DATABASE() AND index_name = ? LIMIT 1",
        [name]
      );
      if (existing.length) continue;
      try {
        await conn.query(`CREATE INDEX ${name} ON ${table} (${col})`);
      } catch (e) {
        if (!/duplicate|already exists/i.test(e.message)) throw e;
      }
    }

    logger.info(`Migration applied: ${statements.length} statements executed. Schema is up to date.`);
    process.exit(0);
  } catch (e) {
    logger.error("Migration failed:", e.message);
    process.exit(1);
  } finally {
    conn.release();
  }
})();

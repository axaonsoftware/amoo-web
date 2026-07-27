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
    // Skip -- line comments (handles semicolons inside comments)
    if (ch === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i + 2);
      if (nl === -1) break; // rest of file is a comment
      i = nl;
      buf += "\n";
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const stmt of statements) {
      if (!stmt) continue;
      await client.query(stmt);
    }

    // Add new columns to pre-existing tables BEFORE creating indexes (idempotent).
    const columnAdds = [
      ["users", "reset_otp", "VARCHAR(12)"],
      ["users", "reset_otp_expires", "TIMESTAMP"],
      ["users", "reset_otp_attempts", "INT NOT NULL DEFAULT 0"],
      ["users", "updated_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
      ["users", "token_version", "INT NOT NULL DEFAULT 0"],
      ["users", "verify_token", "VARCHAR(64)"],
      ["users", "verify_token_expires", "TIMESTAMP"],
      ["users", "deleted_at", "TIMESTAMP"],
      ["admins", "token_version", "INT NOT NULL DEFAULT 0"],
      ["users", "failed_attempts", "INT NOT NULL DEFAULT 0"],
      ["users", "locked_until", "TIMESTAMP"],
      ["admins", "failed_attempts", "INT NOT NULL DEFAULT 0"],
      ["admins", "locked_until", "TIMESTAMP"],
      ["experts", "deleted_at", "TIMESTAMP"],
      ["experts", "password_hash", "VARCHAR(255)"],
      ["experts", "token_version", "INT NOT NULL DEFAULT 0"],
      ["experts", "verified", "BOOLEAN NOT NULL DEFAULT false"],
      ["experts", "verify_token", "VARCHAR(64)"],
      ["experts", "verify_token_expires", "TIMESTAMP"],
      ["experts", "failed_attempts", "INT NOT NULL DEFAULT 0"],
      ["experts", "locked_until", "TIMESTAMP"],
      ["users", "refresh_jti", "VARCHAR(64)"],
      ["admins", "refresh_jti", "VARCHAR(64)"],
      ["experts", "refresh_jti", "VARCHAR(64)"],
      ["services", "deleted_at", "TIMESTAMP"],
      ["packages", "deleted_at", "TIMESTAMP"],
      ["testimonials", "deleted_at", "TIMESTAMP"],
      ["reports", "status", "VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','rejected'))"],
      ["reports", "deleted_at", "TIMESTAMP"],
      ["subscriptions", "auto_renew", "BOOLEAN NOT NULL DEFAULT false"],
      ["contacts", "reply", "TEXT"],
      ["conversations", "last_message_at", "TIMESTAMP"],
      ["bookings", "slot_id", "INT"],
      ["payments", "gateway", "VARCHAR(40)"],
      ["payments", "subscription_id", "INT"],
      ["payments", "gateway_order_id", "VARCHAR(255)"],
      ["payments", "refund_id", "VARCHAR(255)"],
      ["payments", "refunded_at", "TIMESTAMP"],
      ["users", "dob", "DATE"],
      ["users", "tob", "TIME"],
      ["users", "birthplace", "VARCHAR(255)"],
      ["users", "gender", "VARCHAR(20)"],
      ["users", "language", "VARCHAR(40)"],
      ["users", "country", "VARCHAR(80)"],
      ["users", "state", "VARCHAR(80)"],
      ["users", "city", "VARCHAR(80)"],
      ["users", "address", "VARCHAR(255)"],
      ["audit_log", "ip_address", "VARCHAR(45)"],
      ["audit_log", "user_agent", "VARCHAR(512)"],
      ["audit_log", "page_or_route", "VARCHAR(255)"],
    ];
    for (const [table, col, def] of columnAdds) {
      const { rows } = await client.query(
        "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2 LIMIT 1",
        [table, col]
      );
      if (rows.length) continue;
      await client.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    }

    // ── Chat participant model (migration 006) ────────────────────────────
    // The original `conversations` modelled both sides as `users` rows, but the
    // route passes an `experts.id` as the participant. Those are separate id
    // sequences, so every insert either violated the FK or silently attached the
    // thread to an unrelated user. Rebuild as (user_id, expert_id).
    //
    // Rows in the old table are, by construction, either absent or pointing at
    // the wrong person — so they are never migrated. If any exist we stop and
    // ask for a human decision rather than destroy data unattended.
    const { rows: convCols } = await client.query(
      "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'conversations'"
    );
    const hasLegacyChat = convCols.some((c) => c.COLUMN_NAME === "user_a");
    if (hasLegacyChat) {
      const { rows: [{ n }] } = await client.query("SELECT COUNT(*)::int AS n FROM conversations");
      if (n > 0) {
        logger.error(
          `Refusing to rebuild 'conversations': ${n} legacy row(s) present. ` +
          "Those rows reference users.id where an experts.id was intended and cannot be " +
          "reliably remapped. Inspect them, then drop the tables manually and re-run: " +
          "DROP TABLE messages; DROP TABLE conversations;"
        );
        process.exit(1);
      }
      logger.info("Rebuilding empty legacy chat tables (user_a/user_b -> user_id/expert_id)...");
      await client.query("DROP TABLE IF EXISTS messages");
      await client.query("DROP TABLE IF EXISTS conversations");
      await client.query(`
        CREATE TABLE conversations (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          expert_id INT NOT NULL,
          last_message_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
          UNIQUE (user_id, expert_id)
        )`);
      await client.query("CREATE INDEX idx_conversations_user ON conversations (user_id)");
      await client.query("CREATE INDEX idx_conversations_expert ON conversations (expert_id)");
      await client.query("CREATE INDEX idx_conversations_last_message ON conversations (last_message_at)");
      await client.query(`
        CREATE TABLE messages (
          id SERIAL PRIMARY KEY,
          conversation_id INT NOT NULL,
          sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'expert', 'admin')),
          sender_id INT NOT NULL,
          content TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )`);
      await client.query("CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at)");
      await client.query("CREATE INDEX idx_messages_unread ON messages (conversation_id, is_read, sender_type)");
      logger.info("Chat tables rebuilt.");
    }

    // Extend the subscriptions `status` CHECK to allow 'pending-payment'
    // (idempotent: drop and recreate the constraint).
    try {
      await client.query("ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check");
      await client.query("ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'expired', 'cancelled', 'pending-payment'))");
      await client.query("ALTER TABLE subscriptions ALTER COLUMN status SET NOT NULL");
      await client.query("ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'active'");
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
      ["idx_payments_gateway_order", "payments", "gateway_order_id"],
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
      ["idx_audit_page", "audit_log", "page_or_route"],
      ["idx_audit_actor_type", "audit_log", "actor_type"],
      ["idx_coupon_usage_coupon", "coupon_usages", "coupon_id"],
      ["idx_coupon_usage_booking", "coupon_usages", "booking_id"],
      ["idx_coupon_usage_user", "coupon_usages", "user_id"],
    ];
    for (const [name, table, col] of indexes) {
      const { rows } = await client.query(
        "SELECT indexname AS index_name FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1",
        [name]
      );
      if (rows.length) continue;
      try {
        await client.query(`CREATE INDEX ${name} ON ${table} (${col})`);
      } catch (e) {
        if (!/duplicate|already exists/i.test(e.message)) throw e;
      }
    }

    await client.query("COMMIT");
    logger.info(`Migration applied: ${statements.length} statements executed. Schema is up to date.`);
    process.exit(0);
  } catch (e) {
    await client.query("ROLLBACK");
    logger.error("Migration failed:", e.message);
    process.exit(1);
  } finally {
    client.release();
  }
})();

const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionString: env.db.url || undefined,
  max: env.isProd ? 20 : 10,
  idleTimeoutMillis: 30000,
  allowExitOnIdle: false,
  // Fail fast when the database is unreachable instead of letting a request
  // hang past the Express-level 30s response timeout.
  connectionTimeoutMillis: env.isProd ? 10000 : 5000,
  // Kill queries that run away; the app-level response timeout only tells the
  // client, it does not cancel the query or free the connection.
  statement_timeout: env.isProd ? 15000 : 0,
  // Managed databases (RDS etc.) typically require TLS. pg will also honour an
  // sslmode=require in DATABASE_URL; DB_SSL=true covers the component-vars path.
  ...(env.db.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Set the session timezone on every new connection. The `options` libpq param
// is silently ignored by the pure-JS pg driver used on Alpine, so we set it
// via SQL instead. All timestamp comparisons (booking dates, subscription
// expiry, refund windows) rely on IST being the session timezone.
pool.on("connect", (client) => {
  client.query("SET TIME ZONE 'Asia/Kolkata'").catch((err) => {
    logger.warn("[db] failed to set timezone:", err.message);
  });
});

// Retry connection a few times on boot (handles Postgres not-yet-ready in containers).
async function testConnection(retries = 5, delayMs = 2000) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      logger.info("[db] PostgreSQL connection OK");
      return true;
    } catch (err) {
      lastErr = err;
      logger.warn(`[db] connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  logger.error("[db] could not connect after retries:", lastErr?.message);
  return false;
}

module.exports = { pool, testConnection };
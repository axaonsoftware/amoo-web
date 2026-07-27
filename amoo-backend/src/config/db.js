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
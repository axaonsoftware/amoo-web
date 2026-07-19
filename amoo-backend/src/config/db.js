const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.isProd ? 20 : 10,
  queueLimit: 0,
  charset: "utf8mb4",
  enableKeepAlive: true,
  // `namedPlaceholders` lets us write :name style params
  namedPlaceholders: false,
});

// Retry connection a few times on boot (handles MySQL not-yet-ready in containers).
async function testConnection(retries = 5, delayMs = 2000) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      await conn.query("SELECT 1");
      conn.release();
      console.log("[db] MySQL connection OK");
      return true;
    } catch (err) {
      lastErr = err;
      console.warn(`[db] connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error("[db] could not connect after retries:", lastErr?.message);
  return false;
}

module.exports = { pool, testConnection };

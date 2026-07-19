require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "amoo_db",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

async function testConnection() {
  const conn = await pool.getConnection();
  await conn.query("SELECT 1");
  conn.release();
  console.log("[db] MySQL connection OK");
}

module.exports = { pool, testConnection };

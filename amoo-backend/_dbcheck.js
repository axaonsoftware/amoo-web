require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
const q = async (s, p) => (await pool.query(s, p)).rows;
(async () => {
  console.log("admins:", JSON.stringify(await q("SELECT id,email,failed_attempts,locked_until,token_version FROM admins")));
  console.log("expert8:", JSON.stringify(await q("SELECT id,email,status,failed_attempts,locked_until,token_version FROM experts WHERE id=8")));
  console.log("users:", JSON.stringify(await q("SELECT id,email,failed_attempts,locked_until,token_version FROM users WHERE id IN (4,18)")));
  console.log("tob col:", JSON.stringify(await q("SELECT data_type FROM information_schema.columns WHERE table_name='users' AND column_name='tob'")));
  console.log("slots:", JSON.stringify(await q("SELECT id,expert_id,date,start_time,status FROM slots ORDER BY date LIMIT 10")));
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });

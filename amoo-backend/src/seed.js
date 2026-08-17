require("dotenv").config();
const logger = require("./utils/logger");

// SECURITY: this script inserts demo accounts with well-known passwords. It must
// never run against production data. Checked before ./config/db is required, so
// we neither load production config nor open a connection.
if (process.env.NODE_ENV === "production") {
  logger.error(
    "Refusing to seed: NODE_ENV=production. This script inserts demo accounts with known passwords."
  );
  process.exit(1);
}

const bcrypt = require("bcryptjs");
const { pool, testConnection } = require("./config/db");
const { insertContentData } = require("./seed-content");

async function seed() {
  logger.info("Seeding database...");

  // Admin
  // SECURITY: `id = id` is a deliberate no-op. Re-seeding must never overwrite
  // an existing admin's password hash — updating it here would reset a strong
  // password back to the well-known seed value.
  const adminHash = await bcrypt.hash("admin123", 12);
  await pool.query(
    `INSERT INTO admins (name, email, password_hash, role)
       VALUES ('Admin', 'admin@amooguru.com', $1, 'admin')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
    [adminHash]
  );

  // Users
  const userHash = await bcrypt.hash("user123", 12);
  const users = [
    ["Vedika Desai", "vedika.desai@gmail.com", "+91 98765 43210", "premium", "active", true],
    ["Rahul Sharma", "rahulsharma@gmail.com", "+91 87654 32109", "premium", "active", true],
    ["Neha Verma", "neha.verma@gmail.com", "+91 91234 56789", "free", "active", false],
    ["Amit Patel", "amit.patel@gmail.com", "+91 99887 76655", "consultant", "active", true],
    ["Pooja Mehta", "pooja.mehta@gmail.com", "+91 88776 65544", "premium", "blocked", true],
  ];
  for (const u of users) {
    const row = [u[0], u[1], u[2], userHash, u[3], u[4], u[5]];
    await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, status, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
      row
    );
  }

  // Experts
  const expertHash = await bcrypt.hash("expert123", 12);
  const experts = [
    ["Ast. Neha Sharma", "neha@amooguru.com", "Vedic Astrology", "vedic", 4.8],
    ["Ast. Pooja Mehta", "pooja@amooguru.com", "Tarot Expert", "tarot", 4.7],
    ["Ast. Vikram Joshi", "vikram@amooguru.com", "Numerology Expert", "numerology", 4.9],
    ["Ast. Anjali Singh", "anjali@amooguru.com", "Vastu Expert", "vastu", 4.6],
  ];
  for (const e of experts) {
    await pool.query(
      `INSERT INTO experts (name, email, password_hash, verified, role_title, specialties, rating)
       VALUES ($1, $2, $3, true, $4, $5, $6) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
      [e[0], e[1], expertHash, e[2], e[3], e[4]]
    );
  }

  // Content rows (services, packages, coupons, testimonials, blogs, faqs) live in
  // seed-content.js so migrate.js can seed the same content in production.
  // insertContentData inserts only when absent and never touches admin edits.
  await insertContentData(pool);

  // Slots for expert 1
  for (let d = 0; d < 3; d++) {
    const date = new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
    for (const [start, end] of [["09:00:00", "09:30:00"], ["10:00:00", "10:30:00"], ["11:00:00", "11:30:00"]]) {
      await pool.query(
        "INSERT INTO slots (expert_id, date, start_time, end_time, status) VALUES ($1, $2, $3, $4, 'available') ON CONFLICT DO NOTHING",
        [1, date, start, end]
      );
    }
  }

  // Wallet for first user
  await pool.query(
    `INSERT INTO wallets (user_id, balance) VALUES (1, 1500) ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance`
  );
  await pool.query(
    "INSERT INTO wallet_transactions (wallet_id, amount, type, reason) SELECT id, 1500, 'credit', 'Welcome bonus' FROM wallets WHERE user_id = 1 AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.wallet_id = wallets.id)"
  );

  // Subscription for first user
  const subExists = await pool.query(
    "SELECT 1 FROM subscriptions WHERE user_id = $1 AND package_id = $2",
    [1, 1]
  );
  if (!subExists.rows.length) {
    await pool.query(
      `INSERT INTO subscriptions (user_id, package_id, plan_name, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '90 days')`,
      [1, 1, 'Premium Healing Package']
    );
  }

  // Notifications
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES
     (1, 'Booking confirmed', 'Your Kundli Reading is confirmed.', 'booking'),
     (1, 'New report ready', 'Your Numerology report is ready to download.', 'report'),
     (NULL, 'Festive offer', 'Get 20% off on all Tarot readings this week!', 'offer')`
  );

  // Contacts
  await pool.query(
    `INSERT INTO contacts (name, email, phone, subject, message) VALUES
     ('Guest User', 'guest@example.com', '+91 90000 00000', 'Service query', 'Want to know about Reiki healing.')`
  );

logger.info("Seed complete.");
  logger.info("Admin login:   admin@amooguru.com / admin123");
  logger.info("User login:    vedika.desai@gmail.com / user123");
  logger.info("Expert login:  neha@amooguru.com / expert123");
}

(async () => {
  const okDb = await testConnection();
  if (!okDb) {
    logger.error("Cannot connect to database. Aborting seed.");
    process.exit(1);
  }
  try {
    await seed();
    process.exit(0);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();

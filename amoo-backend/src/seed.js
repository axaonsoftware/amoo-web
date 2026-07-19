require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

async function seed() {
  console.log("Seeding database...");

  // Admin
  const adminHash = await bcrypt.hash("admin123", 10);
  await pool.query(
    `INSERT INTO admins (name, email, password_hash, role)
     VALUES ('Admin', 'admin@amooguru.com', ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [adminHash]
  );

  // Users
  const userHash = await bcrypt.hash("user123", 10);
  const users = [
    ["Vedika Desai", "vedika.desai@gmail.com", "+91 98765 43210", "premium", "active", 1],
    ["Rahul Sharma", "rahulsharma@gmail.com", "+91 87654 32109", "premium", "active", 1],
    ["Neha Verma", "neha.verma@gmail.com", "+91 91234 56789", "free", "active", 0],
    ["Amit Patel", "amit.patel@gmail.com", "+91 99887 76655", "consultant", "active", 1],
    ["Pooja Mehta", "pooja.mehta@gmail.com", "+91 88776 65544", "premium", "blocked", 1],
  ];
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, status, verified)
       VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [u[0], u[1], u[2], userHash, u[3], u[4], u[5]]
    );
  }

  // Experts
  const experts = [
    ["Ast. Neha Sharma", "neha@amooguru.com", "Vedic Astrology", "vedic", 4.8],
    ["Ast. Pooja Mehta", "pooja@amooguru.com", "Tarot Expert", "tarot", 4.7],
    ["Ast. Vikram Joshi", "vikram@amooguru.com", "Numerology Expert", "numerology", 4.9],
    ["Ast. Anjali Singh", "anjali@amooguru.com", "Vastu Expert", "vastu", 4.6],
  ];
  for (const e of experts) {
    await pool.query(
      `INSERT INTO experts (name, email, role_title, specialties, rating)
       VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      e
    );
  }

  // Services
  const services = [
    ["Numerology Report", "Complete life path analysis", "/imagesP/name_numerology.png", "Numerology", "Report", 999, "Instant", "Active", 325],
    ["Tarot Reading", "3 Card Spread", "/imagesP/tarot_reading.png", "Tarot", "Consultation", 799, "30 mins", "Active", 286],
    ["Kundli Reading", "Vedic Birth Chart Analysis", "/imagesP/kundli_generator.png", "Astrology", "Consultation", 1499, "60 mins", "Active", 412],
    ["Reiki Healing Session", "Distance Healing Therapy", "/imagesP/reiki_healer.png", "Healing", "Consultation", 999, "45 mins", "Active", 198],
    ["Vastu Consultation", "Home & Office Vastu", "/imagesP/vastu_analyzer.png", "Vastu", "Consultation", 1299, "60 mins", "Active", 167],
    ["AI Astro Chat", "Ask Any Astrology Question", "/imagesP/ai_astro_chat.png", "AI Services", "Chat", 199, "Per Chat", "Active", 642],
    ["Past Life Reading", "Past Life Analysis", "/imagesP/past_life_analysis.png", "Spiritual", "Report", 1199, "Instant", "Inactive", 54],
    ["Aura Report", "Energy Aura Analysis", "/imagesP/aura_scanner.png", "Healing", "Report", 599, "Instant", "Active", 213],
  ];
  for (const s of services) {
    await pool.query(
      `INSERT INTO services (name, sub, img, category, type, price, duration, status, bookings)
       VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      s
    );
  }

  // Packages
  await pool.query(
    `INSERT INTO packages (name, description, price, duration_days, status)
     VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    ["Premium Healing Package", "Unlimited reiki + tarot for 3 months", 4999, 90, "Active"]
  );

  // Wallet for first user
  await pool.query(
    `INSERT INTO wallets (user_id, balance) VALUES (1, 1500) ON DUPLICATE KEY UPDATE balance = VALUES(balance)`
  );
  await pool.query(
    "INSERT INTO wallet_transactions (wallet_id, amount, type, reason) VALUES (1, 1500, 'credit', 'Welcome bonus')"
  );

  // Subscription for first user
  await pool.query(
    `INSERT INTO subscriptions (user_id, plan_name, expires_at)
     VALUES (1, 'Premium Healing Package', DATE_ADD(NOW(), INTERVAL 90 DAY))
     ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name)`
  );

  // Notifications
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES
     (1, 'Booking confirmed', 'Your Kundli Reading is confirmed for 18 May.', 'booking'),
     (1, 'New report ready', 'Your Numerology report is ready to download.', 'report'),
     (NULL, 'Festive offer', 'Get 20% off on all Tarot readings this week!', 'offer')`
  );

  // Contacts
  await pool.query(
    `INSERT INTO contacts (name, email, phone, subject, message) VALUES
     ('Guest User', 'guest@example.com', '+91 90000 00000', 'Service query', 'Want to know about Reiki healing.')`
  );

  console.log("Seed complete.");
  console.log("Admin login: admin@amooguru.com / admin123");
  console.log("User  login: vedika.desai@gmail.com / user123");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });

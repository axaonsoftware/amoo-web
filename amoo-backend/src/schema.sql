-- ============================================================
--  Amoo Guru — consolidated production schema
--
--  PREFERRED:  npm run migrate
--    Applies this file AND the incremental column/index/structural steps in
--    src/migrate.js, idempotently, against a new OR an existing database.
--
--  Direct use:  mysql -u root -p < src/schema.sql
--    Only valid for a brand-new database. CREATE TABLE IF NOT EXISTS does not
--    alter an existing table, so running this against a database created by an
--    earlier version silently leaves it missing newer columns.
--
--  This file is now self-sufficient for a fresh install: it previously omitted
--  experts' auth columns, users.dob/tob/birthplace, payments.refund_id /
--  refunded_at and audit_log's request-context columns, all of which the
--  application writes to — so a database built from this file alone crashed on
--  expert login, profile saves, refunds and every audit write.
--  Idempotent: uses CREATE TABLE IF NOT EXISTS.
-- ============================================================

CREATE DATABASE IF NOT EXISTS amoo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE amoo_db;

-- --------------------------------------------------------
-- Users (end customers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL UNIQUE,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255),
  avatar          VARCHAR(512),
  role            ENUM('free','premium','consultant') NOT NULL DEFAULT 'free',
  status          ENUM('active','blocked','pending') NOT NULL DEFAULT 'pending',
  -- Birth details, used by the report generators (kundali/numerology).
  dob             DATE,
  tob             TIME,
  birthplace      VARCHAR(255),
  -- Profile fields surfaced by the account-profile form. Free-text rather than
  -- ENUMs: the UI offers a fixed list today, but adding an option must not
  -- require a schema migration.
  gender          VARCHAR(20),
  language        VARCHAR(40),
  country         VARCHAR(80),
  state           VARCHAR(80),
  city            VARCHAR(80),
  address         VARCHAR(255),
  verified        TINYINT(1) NOT NULL DEFAULT 0,
  token_version   INT NOT NULL DEFAULT 0,
  verify_token    VARCHAR(64),
  verify_token_expires DATETIME,
  reset_otp       VARCHAR(12),
  reset_otp_expires DATETIME,
  reset_otp_attempts INT NOT NULL DEFAULT 0,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until    DATETIME,
  deleted_at      DATETIME,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Admins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(40) NOT NULL DEFAULT 'admin',
  token_version INT NOT NULL DEFAULT 0,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until    DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Experts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS experts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  avatar        VARCHAR(512),
  -- Auth columns. Experts sign in at /astrologer-login; an admin sets the
  -- password via POST /api/experts/:id/set-password. Previously these lived
  -- only in migrations/004, so a database built from this file alone had no
  -- experts.password_hash and every expert login crashed.
  password_hash VARCHAR(255),
  token_version INT NOT NULL DEFAULT 0,
  verified      TINYINT(1) NOT NULL DEFAULT 0,
  verify_token  VARCHAR(64),
  verify_token_expires DATETIME,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until  DATETIME,
  role_title    VARCHAR(120),
  bio           TEXT,
  specialties   VARCHAR(255),
  rating        DECIMAL(2,1) DEFAULT 0.0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  deleted_at    DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_experts_status (status, deleted_at)
);

-- --------------------------------------------------------
-- Services
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  sub         VARCHAR(255),
  img         VARCHAR(512),
  category    ENUM('Numerology','Tarot','Astrology','Healing','Vastu','AI Services','Spiritual') NOT NULL,
  type        ENUM('Report','Consultation','Chat') NOT NULL,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration    VARCHAR(40),
  status      ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  bookings    INT NOT NULL DEFAULT 0,
  deleted_at  DATETIME,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_services_status (status, deleted_at),
  INDEX idx_services_category (category)
);

-- --------------------------------------------------------
-- Availability slots
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS slots (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  expert_id  INT NOT NULL,
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME,
  status     ENUM('available','booked','blocked') NOT NULL DEFAULT 'available',
  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
  INDEX idx_slots_expert_date (expert_id, date),
  INDEX idx_slots_status (status)
);

-- --------------------------------------------------------
-- Bookings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(40) NOT NULL UNIQUE,
  user_id     INT NOT NULL,
  expert_id   INT,
  service_id  INT NOT NULL,
  slot_id     INT,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  mode        VARCHAR(40),
  amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment     ENUM('Paid','Pending') NOT NULL DEFAULT 'Pending',
  status      ENUM('upcoming','completed','cancelled','pending-payment') NOT NULL DEFAULT 'upcoming',
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (expert_id)  REFERENCES experts(id)  ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_id)    REFERENCES slots(id)    ON DELETE SET NULL,
  INDEX idx_bookings_user_id (user_id),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_date (date),
  INDEX idx_bookings_expert_id (expert_id),
  INDEX idx_bookings_service_id (service_id)
);

-- --------------------------------------------------------
-- Packages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  deleted_at    DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Subscriptions
--  NOTE: must be created before `payments`, which carries a foreign key
--  referencing subscriptions(id). MySQL rejects a FK to a table that does
--  not exist yet, and migrate.js runs these statements in file order.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  package_id    INT,
  plan_name     VARCHAR(120),
  status        ENUM('active','expired','cancelled','pending-payment') NOT NULL DEFAULT 'active',
  auto_renew    TINYINT(1) NOT NULL DEFAULT 0,
  started_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
  INDEX idx_subscriptions_user_id (user_id),
  INDEX idx_subscriptions_status (status)
);

-- --------------------------------------------------------
-- Payments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  booking_id    INT,
  subscription_id INT,
  user_id       INT,
  amount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  method        VARCHAR(40),
  gateway       VARCHAR(40),
  status        ENUM('success','pending','failed','refunded') NOT NULL DEFAULT 'pending',
  txn_id        VARCHAR(120),
  gateway_order_id VARCHAR(255),
  -- Refund bookkeeping, written by POST /api/payments/:id/refund.
  refund_id     VARCHAR(255),
  refunded_at   DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_payments_booking_id (booking_id),
  INDEX idx_payments_user_id (user_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_txn_id (txn_id),
  -- POST /api/payments/verify and the gateway webhook both look a payment up by
  -- this column; without an index each settlement was a full table scan.
  INDEX idx_payments_gateway_order (gateway_order_id)
);

-- --------------------------------------------------------
-- Refunds
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  payment_id  INT NOT NULL,
  user_id     INT,
  amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  reason      VARCHAR(255),
  status      ENUM('pending','processed','failed') NOT NULL DEFAULT 'pending',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_refunds_payment_id (payment_id)
);

-- --------------------------------------------------------
-- Coupons / discounts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(30) NOT NULL UNIQUE,
  description     VARCHAR(255),
  discount_type   ENUM('percent','flat') NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,
  min_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses        INT,
  used_count      INT NOT NULL DEFAULT 0,
  expires_at      DATETIME,
  active          TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Coupon usage ledger
--  Coupon redemptions used to be recorded as zero-amount rows in `payments`,
--  which inflated the transaction counts in revenue reporting. They live here
--  instead. The UNIQUE key on booking_id makes redemption idempotent and stops
--  two coupons stacking discounts onto one booking.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupon_usages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id       INT NOT NULL,
  booking_id      INT NOT NULL,
  user_id         INT,
  discount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_before   DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_after    DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_coupon_usages_booking (booking_id),
  FOREIGN KEY (coupon_id)  REFERENCES coupons(id)  ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_coupon_usages_coupon_id (coupon_id),
  INDEX idx_coupon_usages_user_id (user_id)
);

-- --------------------------------------------------------
-- Reports
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  service_id  INT,
  type        VARCHAR(60),
  title       VARCHAR(200),
  content     MEDIUMTEXT,
  file_url    VARCHAR(512),
  status      ENUM('pending','ready','rejected') NOT NULL DEFAULT 'pending',
  is_favorite TINYINT(1) NOT NULL DEFAULT 0,
  downloaded  TINYINT(1) NOT NULL DEFAULT 0,
  chakra_data JSON,
  deleted_at  DATETIME,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  INDEX idx_reports_user_id (user_id),
  INDEX idx_reports_status (status)
);

-- --------------------------------------------------------
-- Conversations & Messages (chat)
-- --------------------------------------------------------
-- A conversation is explicitly (customer, expert) — the only pairing
-- POST /api/chat/conversations has ever allowed. It was previously modelled as
-- two `users` rows, but the route passes an `experts.id` as the second
-- participant, and those are separate id sequences: every insert either
-- violated the FK or attached the thread to an unrelated user who happened to
-- share the number. See migrations/006_fix_chat_participants.sql.
CREATE TABLE IF NOT EXISTS conversations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  expert_id        INT NOT NULL,
  last_message_at  DATETIME,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
  -- Makes "start or resume a conversation" idempotent without a lock.
  UNIQUE KEY uniq_conversation_pair (user_id, expert_id),
  INDEX idx_conversations_user (user_id),
  INDEX idx_conversations_expert (expert_id),
  INDEX idx_conversations_last_message (last_message_at)
);

-- sender_id has no FK: the sender may live in `users`, `experts` or `admins`,
-- which a single foreign key cannot express. The (sender_type, sender_id) pair
-- is validated in the route before insert.
CREATE TABLE IF NOT EXISTS messages (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id  INT NOT NULL,
  sender_type      ENUM('user','expert','admin') NOT NULL,
  sender_id        INT NOT NULL,
  content          TEXT NOT NULL,
  is_read          TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation (conversation_id, created_at),
  INDEX idx_messages_unread (conversation_id, is_read, sender_type)
);

-- --------------------------------------------------------
-- Testimonials
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  name        VARCHAR(120),
  avatar      VARCHAR(512),
  comment     TEXT,
  rating      TINYINT(1) DEFAULT 5,
  status      ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  deleted_at  DATETIME,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)    ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  title       VARCHAR(200) NOT NULL,
  message     TEXT,
  type        VARCHAR(40) DEFAULT 'info',
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read)
);

-- --------------------------------------------------------
-- Contacts / enquiries
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL,
  phone       VARCHAR(20),
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  reply       TEXT,
  status      ENUM('new','replied','closed') NOT NULL DEFAULT 'new',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Uploads
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploads (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT,
  original_name  VARCHAR(255),
  stored_name    VARCHAR(255) NOT NULL,
  path           VARCHAR(512) NOT NULL,
  mime           VARCHAR(120),
  size           INT,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_uploads_user_id (user_id)
);

-- --------------------------------------------------------
-- Wallets
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL UNIQUE,
  balance    DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency   VARCHAR(8) NOT NULL DEFAULT 'INR',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  wallet_id   INT NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  type        ENUM('credit','debit') NOT NULL,
  reason      VARCHAR(120),
  ref         VARCHAR(64),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  INDEX idx_wallet_tx_wallet_id (wallet_id)
);

-- --------------------------------------------------------
-- Blogs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  title         VARCHAR(500) NOT NULL,
  excerpt       TEXT,
  content       LONGTEXT,
  category      VARCHAR(100),
  image         VARCHAR(500),
  author        VARCHAR(255),
  author_avatar VARCHAR(500),
  read_time     VARCHAR(50),
  views         INT NOT NULL DEFAULT 0,
  status        ENUM('draft','published') NOT NULL DEFAULT 'published',
  deleted_at    DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blogs_slug (slug),
  INDEX idx_blogs_category (category),
  INDEX idx_blogs_status (status, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- FAQs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faqs_category (category),
  KEY idx_faqs_active_sort (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Webhook event ledger (payment gateway idempotency)
--
-- Deduplication used to be done by scanning audit_log with
-- `meta->>'$.idempotency_key' = ?`, which has no index (a JSON path expression
-- cannot use one without a generated column) — a full table scan on every
-- webhook, against a table that grows forever. Worse, the audit write was
-- fire-and-forget, so two concurrent retries could both find nothing and both
-- settle the payment.
--
-- The UNIQUE key here makes the check atomic: the second INSERT fails with
-- ER_DUP_ENTRY and that caller stops, with no read-then-write race.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  idempotency_key VARCHAR(255) NOT NULL,
  event          VARCHAR(120),
  payment_id     INT,
  received_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_webhook_idempotency (idempotency_key),
  INDEX idx_webhook_received (received_at)
);

-- --------------------------------------------------------
-- Audit log
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT,
  actor_type  VARCHAR(20) DEFAULT 'system',
  action      VARCHAR(60) NOT NULL,
  entity      VARCHAR(60),
  entity_id   INT,
  meta        JSON,
  -- Request context captured by utils/audit.js. These were written by the code
  -- but existed only in migrate.js, so a database built from this file alone
  -- failed every audit insert with "Unknown column 'ip_address'".
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(512),
  page_or_route VARCHAR(255),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_actor (actor_id, actor_type),
  INDEX idx_audit_entity (entity, entity_id),
  INDEX idx_audit_action (action)
);

-- --------------------------------------------------------

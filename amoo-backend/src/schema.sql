-- ============================================================
--  Amoo Guru — consolidated production schema (PostgreSQL)
--
--  PREFERRED:  npm run migrate
--    Applies this file AND the incremental column/index/structural steps in
--    src/migrate.js, idempotently, against a new OR an existing database.
--
--  Direct use:  psql -U root -d amoo_db < src/schema.sql
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

-- --------------------------------------------------------
-- Users (end customers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL UNIQUE,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255),
  avatar          VARCHAR(512),
  role            VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (role IN ('free','premium','consultant')),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active','blocked','pending')),
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
  verified        BOOLEAN NOT NULL DEFAULT false,
  token_version   INTEGER NOT NULL DEFAULT 0,
  refresh_jti     VARCHAR(64),
  verify_token    VARCHAR(64),
  verify_token_expires TIMESTAMP,
  reset_otp       VARCHAR(64),
  reset_otp_expires TIMESTAMP,
  reset_otp_attempts INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMP,
  deleted_at      TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Admins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(40) NOT NULL DEFAULT 'admin',
  token_version INTEGER NOT NULL DEFAULT 0,
  refresh_jti   VARCHAR(64),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMP,
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Experts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS experts (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  avatar        VARCHAR(512),
  -- Auth columns. Experts sign in at /astrologer-login; an admin sets the
  -- password via POST /api/experts/:id/set-password. Previously these lived
  -- only in migrations/004, so a database built from this file alone had no
  -- experts.password_hash and every expert login crashed.
  password_hash VARCHAR(255),
  token_version INTEGER NOT NULL DEFAULT 0,
  refresh_jti   VARCHAR(64),
  verified      BOOLEAN NOT NULL DEFAULT false,
  verify_token  VARCHAR(64),
  verify_token_expires TIMESTAMP,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until  TIMESTAMP,
  role_title    VARCHAR(120),
  bio           TEXT,
  specialties   VARCHAR(255),
  rating        DECIMAL(2,1) DEFAULT 0.0,
  status        VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Services
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  sub         VARCHAR(255),
  img         VARCHAR(512),
  category    VARCHAR(40) NOT NULL CHECK (category IN ('Numerology','Tarot','Astrology','Healing','Vastu','AI Services','Spiritual')),
  type        VARCHAR(20) NOT NULL CHECK (type IN ('Report','Consultation','Chat')),
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration    VARCHAR(40),
  status      VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  bookings    INTEGER NOT NULL DEFAULT 0,
  deleted_at  TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Availability slots
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS slots (
  id         SERIAL PRIMARY KEY,
  expert_id  INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME,
  status     VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','booked','blocked'))
);

-- --------------------------------------------------------
-- Bookings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id          SERIAL PRIMARY KEY,
  booking_ref VARCHAR(40) NOT NULL UNIQUE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id   INTEGER REFERENCES experts(id) ON DELETE SET NULL,
  service_id  INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  slot_id     INTEGER REFERENCES slots(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  mode        VARCHAR(40),
  amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment     VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payment IN ('Paid','Pending')),
  status      VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','cancelled','pending-payment')),
  notes       TEXT,
  -- Client-supplied idempotency key (retries of POST /api/bookings).
  -- Server generates a deterministic key from request params when none is
  -- provided, so concurrent/retried identical requests collide on the UNIQUE
  -- constraint instead of silently creating duplicates.
  idempotency_key VARCHAR(64) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_bookings_idempotency UNIQUE (user_id, idempotency_key)
);

-- --------------------------------------------------------
-- Packages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER,
  status        VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Subscriptions
--  NOTE: must be created before `payments`, which carries a foreign key
--  referencing subscriptions(id).
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id    INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  plan_name     VARCHAR(120),
  status        VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','pending-payment')),
  auto_renew    BOOLEAN NOT NULL DEFAULT false,
  started_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP
);

-- --------------------------------------------------------
-- Payments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id            SERIAL PRIMARY KEY,
  booking_id    INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  method        VARCHAR(40),
  gateway       VARCHAR(40),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('success','pending','failed','refunded','refund_pending')),
  txn_id        VARCHAR(120),
  gateway_order_id VARCHAR(255),
  -- Refund bookkeeping, written by POST /api/payments/:id/refund.
  refund_id     VARCHAR(255),
  refunded_at   TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Refunds
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
  id          SERIAL PRIMARY KEY,
  payment_id  INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  reason      VARCHAR(255),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processed','failed')),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Coupons / discounts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(30) NOT NULL UNIQUE,
  description     VARCHAR(255),
  discount_type   VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent','flat')),
  discount_value  DECIMAL(10,2) NOT NULL,
  min_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses        INTEGER,
  used_count      INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMP,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Coupon usage ledger
--  Coupon redemptions used to be recorded as zero-amount rows in `payments`,
--  which inflated the transaction counts in revenue reporting. They live here
--  instead. The UNIQUE key on booking_id makes redemption idempotent and stops
--  two coupons stacking discounts onto one booking.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupon_usages (
  id              SERIAL PRIMARY KEY,
  coupon_id       INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  booking_id      INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  discount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_before   DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_after    DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Reports
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id  INTEGER REFERENCES services(id) ON DELETE SET NULL,
  type        VARCHAR(60),
  title       VARCHAR(200),
  content     TEXT,
  file_url    VARCHAR(512),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','rejected')),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  downloaded  BOOLEAN NOT NULL DEFAULT false,
  chakra_data jsonb,
  deleted_at  TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id        INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  last_message_at  TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Makes "start or resume a conversation" idempotent without a lock.
  UNIQUE (user_id, expert_id)
);

-- sender_id has no FK: the sender may live in `users`, `experts` or `admins`,
-- which a single foreign key cannot express. The (sender_type, sender_id) pair
-- is validated in the route before insert.
CREATE TABLE IF NOT EXISTS messages (
  id               SERIAL PRIMARY KEY,
  conversation_id  INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type      VARCHAR(20) NOT NULL CHECK (sender_type IN ('user','expert','admin')),
  sender_id        INTEGER NOT NULL,
  content          TEXT NOT NULL,
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Testimonials
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name        VARCHAR(120),
  avatar      VARCHAR(512),
  comment     TEXT,
  rating      INTEGER DEFAULT 5,
  status      VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  deleted_at  TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  message     TEXT,
  type        VARCHAR(40) DEFAULT 'info',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Contacts / enquiries
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL,
  phone       VARCHAR(20),
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  reply       TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new','replied','closed')),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Uploads
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploads (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  original_name  VARCHAR(255),
  stored_name    VARCHAR(255) NOT NULL,
  path           VARCHAR(512) NOT NULL,
  mime           VARCHAR(120),
  size           INTEGER,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Wallets
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance    DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency   VARCHAR(8) NOT NULL DEFAULT 'INR',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          SERIAL PRIMARY KEY,
  wallet_id   INTEGER NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount      DECIMAL(10,2) NOT NULL,
  type        VARCHAR(10) NOT NULL CHECK (type IN ('credit','debit')),
  reason      VARCHAR(120),
  ref         VARCHAR(64),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Blogs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  title         VARCHAR(500) NOT NULL,
  excerpt       TEXT,
  content       TEXT,
  category      VARCHAR(100),
  image         VARCHAR(500),
  author        VARCHAR(255),
  author_avatar VARCHAR(500),
  read_time     VARCHAR(50),
  views         INTEGER NOT NULL DEFAULT 0,
  status        VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- FAQs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
-- error code 23505 (unique_violation) and that caller stops, with no read-then-write race.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
  id             SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  event          VARCHAR(120),
  payment_id     INTEGER,
  received_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Audit log
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  actor_id    INTEGER,
  actor_type  VARCHAR(20) DEFAULT 'system',
  action      VARCHAR(60) NOT NULL,
  entity      VARCHAR(60),
  entity_id   INTEGER,
  meta        JSONB,
  -- Request context captured by utils/audit.js. These were written by the code
  -- but existed only in migrate.js, so a database built from this file alone
  -- failed every audit insert with "Unknown column 'ip_address'".
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(512),
  page_or_route VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Secondary indexes (kept in sync with the defensive index list in
-- src/migrate.js so a database built from this file alone is indexed too).
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users (deleted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_expert ON bookings (expert_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings (service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings (slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_sub ON payments (subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments (method);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order ON payments (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports (type);
CREATE INDEX IF NOT EXISTS idx_reports_deleted ON reports (deleted_at);
CREATE INDEX IF NOT EXISTS idx_slots_expert ON slots (expert_id);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots (date);
CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_txn ON wallet_transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_sub_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_sub_expires ON subscriptions (expires_at);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_experts_status ON experts (status);
CREATE INDEX IF NOT EXISTS idx_experts_deleted ON experts (deleted_at);
CREATE INDEX IF NOT EXISTS idx_services_status ON services (status);
CREATE INDEX IF NOT EXISTS idx_services_cat ON services (category);
CREATE INDEX IF NOT EXISTS idx_services_deleted ON services (deleted_at);
CREATE INDEX IF NOT EXISTS idx_packages_deleted ON packages (deleted_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_deleted ON testimonials (deleted_at);
CREATE INDEX IF NOT EXISTS idx_coupon_code ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log (entity);
CREATE INDEX IF NOT EXISTS idx_audit_page ON audit_log (page_or_route);
CREATE INDEX IF NOT EXISTS idx_audit_actor_type ON audit_log (actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_log (actor_id, actor_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_id ON audit_log (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usages (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_booking ON coupon_usages (booking_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usages (user_id);

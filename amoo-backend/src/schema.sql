-- Amoo Guru backend schema
-- Run: mysql -u root -p < src/schema.sql
-- Or from the MySQL CLI: source src/schema.sql

CREATE DATABASE IF NOT EXISTS amoo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE amoo_db;

-- --------------------------------------------------------
-- Users (end customers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255),
  avatar        VARCHAR(512),
  role          ENUM('free','premium','consultant') NOT NULL DEFAULT 'free',
  status        ENUM('active','blocked','pending') NOT NULL DEFAULT 'pending',
  verified      TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Experts / Astrologers / Consultants
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS experts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  avatar        VARCHAR(512),
  role_title    VARCHAR(120),                -- e.g. "Vedic Astrology"
  bio           TEXT,
  specialties   VARCHAR(255),                -- comma separated service keys
  rating        DECIMAL(2,1) DEFAULT 0.0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Services (numerology, tarot, kundli, reiki, vastu, etc.)
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
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Availability slots for experts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS slots (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  expert_id  INT NOT NULL,
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME,
  status     ENUM('available','booked','blocked') NOT NULL DEFAULT 'available',
  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Bookings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(32) NOT NULL UNIQUE,   -- BOOK-2143
  user_id     INT NOT NULL,
  expert_id   INT,
  service_id  INT NOT NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  mode        VARCHAR(40),                    -- chat / video / in-person
  amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment     ENUM('Paid','Pending') NOT NULL DEFAULT 'Pending',
  status      ENUM('upcoming','completed','cancelled','pending-payment') NOT NULL DEFAULT 'upcoming',
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (expert_id)  REFERENCES experts(id)  ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Payments / transactions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  booking_id    INT,
  user_id       INT,
  amount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  method        VARCHAR(40),                  -- card / upi / wallet
  status        ENUM('success','pending','failed','refunded') NOT NULL DEFAULT 'pending',
  txn_id        VARCHAR(120),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Packages & offers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INT,
  status      ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Reports generated for users (kundli, numerology, tarot, reiki)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  service_id  INT,
  type        VARCHAR(60),                    -- kundli / numerology / tarot / reiki
  title       VARCHAR(200),
  content     MEDIUMTEXT,
  file_url    VARCHAR(512),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
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
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Admin users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user     ON bookings(user_id);
CREATE INDEX idx_bookings_expert   ON bookings(expert_id);
CREATE INDEX idx_bookings_service  ON bookings(service_id);
CREATE INDEX idx_payments_user     ON payments(user_id);
CREATE INDEX idx_reports_user      ON reports(user_id);
CREATE INDEX idx_slots_expert      ON slots(expert_id);

-- --------------------------------------------------------
-- Wallet (per user balance + transactions)
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
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Subscriptions (user plan linkage)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  package_id    INT,
  plan_name     VARCHAR(120),
  status        ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
  started_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Contact / enquiry messages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL,
  phone       VARCHAR(20),
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  status      ENUM('new','replied','closed') NOT NULL DEFAULT 'new',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Uploaded files
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploads (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  original_name VARCHAR(255),
  stored_name VARCHAR(255) NOT NULL,
  path        VARCHAR(512) NOT NULL,
  mime        VARCHAR(120),
  size        INT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_wallet_user        ON wallets(user_id);
CREATE INDEX idx_sub_user           ON subscriptions(user_id);
CREATE INDEX idx_notif_user         ON notifications(user_id);
CREATE INDEX idx_contact_status     ON contacts(status);

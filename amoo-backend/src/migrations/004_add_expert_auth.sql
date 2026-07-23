-- Migration 004: Add auth columns to experts table
-- Run: mysql -u root -p < src/migrations/004_add_expert_auth.sql

ALTER TABLE experts ADD COLUMN password_hash VARCHAR(255) AFTER avatar;
ALTER TABLE experts ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER password_hash;
ALTER TABLE experts ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0 AFTER token_version;
ALTER TABLE experts ADD COLUMN verify_token VARCHAR(64) AFTER verified;
ALTER TABLE experts ADD COLUMN verify_token_expires DATETIME AFTER verify_token;
ALTER TABLE experts ADD COLUMN failed_attempts INT NOT NULL DEFAULT 0 AFTER verify_token_expires;
ALTER TABLE experts ADD COLUMN locked_until DATETIME AFTER failed_attempts;

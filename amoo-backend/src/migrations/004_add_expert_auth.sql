-- Migration 004: Add auth columns to experts table
-- Run: psql -U root -d amoo_db < src/migrations/004_add_expert_auth.sql

ALTER TABLE experts ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE experts ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS verify_token VARCHAR(64);
ALTER TABLE experts ADD COLUMN IF NOT EXISTS verify_token_expires TIMESTAMP;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

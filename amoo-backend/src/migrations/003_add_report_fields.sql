-- Migration 003: Add is_favorite, downloaded, and chakra_data to reports table
-- Run: psql -U root -d amoo_db < src/migrations/003_add_report_fields.sql

ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS downloaded BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS chakra_data JSONB;

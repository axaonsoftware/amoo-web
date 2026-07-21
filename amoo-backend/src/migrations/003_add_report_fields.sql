-- Migration 003: Add is_favorite, downloaded, and chakra_data to reports table
-- Run: mysql -u root -p < src/migrations/003_add_report_fields.sql

ALTER TABLE reports ADD COLUMN is_favorite TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
ALTER TABLE reports ADD COLUMN downloaded TINYINT(1) NOT NULL DEFAULT 0 AFTER is_favorite;
ALTER TABLE reports ADD COLUMN chakra_data JSON AFTER downloaded;

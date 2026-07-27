-- Migration 005: Add the remaining account-profile fields to users
-- Run: psql -U root -d amoo_db < src/migrations/005_add_profile_fields.sql
--
-- These columns back the "Personal Information" card in the user dashboard.
-- Before this migration the form posted gender/language/country/state/city/
-- address to PATCH /api/users/me, where the Joi validator (stripUnknown: true)
-- silently discarded them — the save reported success and stored nothing.
--
-- `npm run migrate` applies the same changes idempotently via the columnAdds
-- table in src/migrate.js; this file is the standalone equivalent, matching the
-- convention of migrations 003/004.

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender   VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country  VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state    VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city     VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address  VARCHAR(255);

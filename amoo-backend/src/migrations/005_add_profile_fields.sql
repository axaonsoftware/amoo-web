-- Migration 005: Add the remaining account-profile fields to users
-- Run: mysql -u root -p amoo_db < src/migrations/005_add_profile_fields.sql
--
-- These columns back the "Personal Information" card in the user dashboard.
-- Before this migration the form posted gender/language/country/state/city/
-- address to PATCH /api/users/me, where the Joi validator (stripUnknown: true)
-- silently discarded them — the save reported success and stored nothing.
--
-- `npm run migrate` applies the same changes idempotently via the columnAdds
-- table in src/migrate.js; this file is the standalone equivalent, matching the
-- convention of migrations 003/004. Re-running it errors on duplicate columns.

ALTER TABLE users ADD COLUMN gender   VARCHAR(20)  AFTER status;
ALTER TABLE users ADD COLUMN language VARCHAR(40)  AFTER gender;
ALTER TABLE users ADD COLUMN country  VARCHAR(80)  AFTER language;
ALTER TABLE users ADD COLUMN state    VARCHAR(80)  AFTER country;
ALTER TABLE users ADD COLUMN city     VARCHAR(80)  AFTER state;
ALTER TABLE users ADD COLUMN address  VARCHAR(255) AFTER city;

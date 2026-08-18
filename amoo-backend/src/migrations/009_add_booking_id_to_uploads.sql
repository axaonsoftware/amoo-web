-- Add booking_id to uploads so files can be associated with bookings.
-- Idempotent: IF NOT EXISTS prevents errors on re-runs.
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_booking_id ON uploads (booking_id);

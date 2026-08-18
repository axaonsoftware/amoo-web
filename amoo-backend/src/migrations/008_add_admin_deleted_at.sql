-- Soft-delete support for admins table
ALTER TABLE admins ADD COLUMN deleted_at TIMESTAMP;

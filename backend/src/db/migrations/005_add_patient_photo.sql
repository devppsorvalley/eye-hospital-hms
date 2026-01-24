-- Migration 005: Add photo field to patients table
-- Purpose: Store patient photos as base64 encoded strings

-- Add photo column (TEXT to store base64 data, can be large)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo TEXT;

-- Add comment for documentation
COMMENT ON COLUMN patients.photo IS 'Patient photo stored as base64 encoded string (JPEG format)';

-- Migration tracking
INSERT INTO migrations (migration_file, applied_at)
VALUES ('005_add_patient_photo.sql', NOW())
ON CONFLICT (migration_file) DO NOTHING;

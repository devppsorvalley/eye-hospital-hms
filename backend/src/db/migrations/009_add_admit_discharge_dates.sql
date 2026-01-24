-- Migration: Add admit_date and discharge_date to bills table
-- Date: 2026-01-11
-- Description: Add optional admit and discharge dates for inpatient billing

BEGIN;

-- Add admit_date and discharge_date columns
ALTER TABLE bills 
  ADD COLUMN IF NOT EXISTS admit_date DATE,
  ADD COLUMN IF NOT EXISTS discharge_date DATE;

-- Add index for admit_date queries
CREATE INDEX IF NOT EXISTS idx_bills_admit_date ON bills(admit_date) WHERE admit_date IS NOT NULL;

COMMIT;

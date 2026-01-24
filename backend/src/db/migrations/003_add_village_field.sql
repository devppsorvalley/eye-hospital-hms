-- Migration: Add village field to patients table
-- Date: 2026-01-05
-- Description: Add village/city column separate from district

-- Add village column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS village VARCHAR(100);

-- Create index on village for faster searches
CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(village);

-- Update existing records: if they have district but no village, copy district to village
UPDATE patients 
SET village = district 
WHERE village IS NULL AND district IS NOT NULL;

-- Migration 005: Fix doctors, visit types, and remove unique constraints
-- 1. Clean up duplicate doctors (keep one of each)
-- 2. Remove unique constraint on doctor name (multiple doctors can have same name)
-- 3. Update visit types to correct values
-- 4. Remove unique constraint on visit_types

-- First, clean up existing duplicates manually
DELETE FROM doctors WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
    FROM doctors
  ) t WHERE t.rn > 1
);

-- Remove unique constraint on doctors name
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_name_unique;

-- Remove unique constraint on visit_types name  
ALTER TABLE visit_types DROP CONSTRAINT IF EXISTS visit_types_name_unique;

-- Clear existing visit types
DELETE FROM visit_types;

-- Insert correct visit types
INSERT INTO visit_types (name, default_amount, is_active) VALUES
('New', 30, true),
('Follow-up', 0, true),
('Express', 250, true),
('ECHS', 300, true)
ON CONFLICT DO NOTHING;

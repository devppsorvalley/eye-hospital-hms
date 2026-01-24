-- Migration: Update visit_types to align with UI expectations
-- This replaces the old visit types with standard OPD visit types

-- First, clear existing visit types (safe because we'll recreate them)
TRUNCATE visit_types RESTART IDENTITY CASCADE;

-- Insert standard visit types aligned with UI
INSERT INTO visit_types (name, default_amount, is_active) VALUES
  ('New Visit', 100.00, true),
  ('Follow-up', 50.00, true),
  ('Emergency', 200.00, true),
  ('General Checkup', 100.00, true),
  ('Cataract Consultation', 150.00, true),
  ('Post-Op Review', 75.00, true);

-- Verify
SELECT * FROM visit_types ORDER BY id;

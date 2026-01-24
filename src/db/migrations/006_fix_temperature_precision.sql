-- Migration 006: Fix temperature column precision
-- Purpose: Allow temperatures up to 999.99 (currently limited to 99.99)

-- Change temperature from DECIMAL(4,2) to DECIMAL(5,2)
ALTER TABLE patients ALTER COLUMN temperature TYPE DECIMAL(5,2);

-- Update comment
COMMENT ON COLUMN patients.temperature IS 'Patient temperature in Celsius, stored as DECIMAL(5,2) to allow up to 999.99';

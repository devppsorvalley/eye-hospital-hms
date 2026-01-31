-- Migration: Add missing patient fields
-- Adds: tehsil, block, age, chief_complaint, vitals (weight, spo2, temperature, pulse, bp)

-- Add location fields
ALTER TABLE patients ADD COLUMN IF NOT EXISTS tehsil VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS block VARCHAR(100);

-- Add age as integer (in addition to age_text for calculated display)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add chief complaint
ALTER TABLE patients ADD COLUMN IF NOT EXISTS chief_complaint TEXT;

-- Add vitals
ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);  -- kg, e.g., 65.5
ALTER TABLE patients ADD COLUMN IF NOT EXISTS spo2 INTEGER;          -- percentage, e.g., 98
ALTER TABLE patients ADD COLUMN IF NOT EXISTS temperature DECIMAL(4,2); -- celsius, e.g., 98.6
ALTER TABLE patients ADD COLUMN IF NOT EXISTS pulse INTEGER;         -- bpm, e.g., 72
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bp VARCHAR(20);        -- e.g., "120/80"

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_patients_tehsil ON patients(tehsil);
CREATE INDEX IF NOT EXISTS idx_patients_block ON patients(block);
CREATE INDEX IF NOT EXISTS idx_patients_age ON patients(age);

-- Comments for documentation
COMMENT ON COLUMN patients.tehsil IS 'Tehsil (sub-district) of patient residence';
COMMENT ON COLUMN patients.block IS 'Block (administrative division) of patient residence';
COMMENT ON COLUMN patients.age IS 'Patient age in years (integer)';
COMMENT ON COLUMN patients.chief_complaint IS 'Primary eye complaint or reason for visit';
COMMENT ON COLUMN patients.weight IS 'Patient weight in kilograms';
COMMENT ON COLUMN patients.spo2 IS 'Blood oxygen saturation percentage';
COMMENT ON COLUMN patients.temperature IS 'Body temperature in Celsius';
COMMENT ON COLUMN patients.pulse IS 'Pulse rate in beats per minute';
COMMENT ON COLUMN patients.bp IS 'Blood pressure reading (systolic/diastolic)';

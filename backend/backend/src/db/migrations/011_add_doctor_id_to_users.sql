-- Migration 011: Add doctor_id to users table
-- Links user accounts to doctors master data

-- Add doctor_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_doctor_id ON users(doctor_id);

-- Update existing doctor user to link with Dr. Rohan Sharma (id=1)
-- This assumes the 'doctor' user (id=6 or username='doctor') should map to first doctor
UPDATE users 
SET doctor_id = 1 
WHERE role_id = (SELECT id FROM roles WHERE name = 'DOCTOR') 
  AND doctor_id IS NULL;

-- Add comment
COMMENT ON COLUMN users.doctor_id IS 'Foreign key to doctors table - links doctor users to their doctor profile';

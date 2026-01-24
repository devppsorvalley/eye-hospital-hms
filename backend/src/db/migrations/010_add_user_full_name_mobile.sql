-- Migration: Add full_name and mobile fields to users table
-- Description: Users need full name for display and mobile for contact

-- Add full_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);

-- Add mobile column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Add index on mobile for search
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

-- Update existing users to set full_name = username if null
UPDATE users 
SET full_name = username 
WHERE full_name IS NULL;

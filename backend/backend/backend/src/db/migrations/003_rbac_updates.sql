-- Migration 003: RBAC Updates
-- 1. Add cancelled_at column to bills for soft delete
-- 2. Update roles (rename RECEPTION to OPERATOR, remove BILLING)

-- ============================================================================
-- ADD CANCELLED_AT TO BILLS TABLE
-- ============================================================================
ALTER TABLE bills 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- ============================================================================
-- UPDATE ROLES
-- ============================================================================

-- Rename RECEPTION to OPERATOR (update existing users first)
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'OPERATOR')
WHERE role_id = (SELECT id FROM roles WHERE name = 'RECEPTION');

-- Update role name
UPDATE roles SET name = 'OPERATOR' WHERE name = 'RECEPTION';

-- Remove BILLING role (first update any users with BILLING role to OPERATOR)
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'OPERATOR')
WHERE role_id = (SELECT id FROM roles WHERE name = 'BILLING');

-- Delete BILLING role
DELETE FROM roles WHERE name = 'BILLING';

-- Ensure we have exactly 3 roles
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('DOCTOR') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('OPERATOR') ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bills_cancelled_at ON bills(cancelled_at) WHERE cancelled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bills_active ON bills(bill_date) WHERE cancelled_at IS NULL;

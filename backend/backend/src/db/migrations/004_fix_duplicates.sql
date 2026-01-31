-- Migration 004: Fix duplicate doctors and add unique constraint
-- 1. Remove duplicate doctors
-- 2. Add unique constraint on doctor name

-- Remove duplicates, keeping only the first occurrence
DELETE FROM doctors 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM doctors 
  GROUP BY LOWER(TRIM(name))
);

-- Add unique constraint on doctor name (case-insensitive)
ALTER TABLE doctors 
ADD CONSTRAINT doctors_name_unique UNIQUE (name);

-- Do the same for visit_types
DELETE FROM visit_types 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM visit_types 
  GROUP BY LOWER(TRIM(name))
);

ALTER TABLE visit_types 
ADD CONSTRAINT visit_types_name_unique UNIQUE (name);

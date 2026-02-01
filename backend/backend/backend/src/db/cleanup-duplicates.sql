-- Remove duplicate doctors keeping only the first occurrence of each name
DELETE FROM doctors 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM doctors 
  GROUP BY name
);

-- Verify no duplicates remain
SELECT name, COUNT(*) as count
FROM doctors
GROUP BY name
HAVING COUNT(*) > 1;

import { pool } from '../../config/db.js';
import { mastersQueries } from './masters.sql.js';

/**
 * Get all active doctors
 */
export async function getDoctors() {
  const result = await pool.query(mastersQueries.getDoctors);
  return result.rows;
}

/**
 * Get all active visit types
 */
export async function getVisitTypes() {
  const result = await pool.query(mastersQueries.getVisitTypes);
  return result.rows;
}

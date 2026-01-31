import { pool } from '../../config/db.js';
import { opdQueries } from './opd.sql.js';

/**
 * Delete OPD queue entry and reset serial numbers
 * @param {number} id - OPD entry ID
 * @returns {object} deleted entry info
 */
export async function deleteOPDEntry(id) {
  // First get the entry to know which doctor/date to reset
  const checkResult = await pool.query('SELECT id, doctor_id, visit_date FROM opd_queue WHERE id = $1', [id]);
  
  if (checkResult.rows.length === 0) {
    const err = new Error('OPD entry not found');
    err.statusCode = 404;
    throw err;
  }

  const { doctor_id, visit_date } = checkResult.rows[0];

  // Delete the entry
  const result = await pool.query(opdQueries.deleteOPD, [id]);

  // Reset serial numbers for this doctor on this date
  await pool.query(
    `UPDATE opd_queue 
     SET serial_no = subquery.new_serial 
     FROM (
       SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_serial 
       FROM opd_queue 
       WHERE doctor_id = $1 AND visit_date = $2
     ) AS subquery 
     WHERE opd_queue.id = subquery.id`,
    [doctor_id, visit_date]
  );

  return result.rows[0];
}

/**
 * Create OPD queue entry
 * @param {object} opdData
 * @returns {object} created OPD record
 */
export async function createOPDEntry(opdData) {
  const { uhid, doctor_id, visit_type_id, visit_date } = opdData;

  // Get visit type details for amount
  const visitTypeResult = await pool.query(opdQueries.getVisitTypeById, [visit_type_id]);
  const visitType = visitTypeResult.rows[0];

  if (!visitType) {
    const err = new Error('Invalid visit type');
    err.statusCode = 400;
    throw err;
  }

  // Get next serial number
  const serialResult = await pool.query(opdQueries.getNextSerialNumber, [visit_date, doctor_id]);
  const serial_no = serialResult.rows[0].next_serial;

  const result = await pool.query(opdQueries.createOPD, [
    uhid,
    doctor_id,
    visitType.name,
    visit_type_id,
    visitType.default_amount,
    serial_no,
    visit_date,
  ]);

  return result.rows[0];
}

/**
 * Get OPD record by ID with full details
 * @param {number} id
 * @returns {object} OPD record with patient and doctor info
 */
export async function getOPDById(id) {
  const result = await pool.query(opdQueries.getOPDById, [id]);
  const record = result.rows[0];

  if (!record) {
    const err = new Error('OPD record not found');
    err.statusCode = 404;
    throw err;
  }

  return record;
}

/**
 * Get OPD queue with filters
 * @param {object} filters - { visit_date, doctor_id, status, page, limit }
 * @returns {object} paginated OPD records
 */
export async function getOPDQueue(filters) {
  const { visit_date = null, doctor_id = null, status = null, page = 1, limit = 20 } = filters;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  // Get total count
  const countResult = await pool.query(opdQueries.countOPD, [visit_date, doctor_id, status]);
  const total = countResult.rows[0]?.total || 0;

  // Get paginated records
  const result = await pool.query(opdQueries.getOPDQueue, [
    visit_date,
    doctor_id,
    status,
    limitNum,
    offset,
  ]);

  return {
    data: result.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: parseInt(total),
      pages: Math.ceil(parseInt(total) / limitNum),
    },
  };
}

/**
 * Get patient's OPD records
 * @param {string} uhid
 * @param {number} page
 * @param {number} limit
 * @returns {object} paginated patient OPD records
 */
export async function getPatientOPD(uhid, page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  // Get total count
  const countResult = await pool.query(opdQueries.countPatientOPD, [uhid]);
  const total = countResult.rows[0]?.total || 0;

  // Get paginated records
  const result = await pool.query(opdQueries.getPatientOPD, [uhid, limitNum, offset]);

  return {
    data: result.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: parseInt(total),
      pages: Math.ceil(parseInt(total) / limitNum),
    },
  };
}

/**
 * Update OPD status
 * @param {number} id
 * @param {string} status - waiting, in-progress, completed, cancelled
 * @returns {object} updated OPD record
 */
export async function updateOPDStatus(id, status) {
  const validStatuses = ['waiting', 'in-progress', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  // Convert to uppercase for database (WAITING, IN_PROGRESS, COMPLETED)
  const dbStatus = status.replace('-', '_').toUpperCase();

  const result = await pool.query(opdQueries.updateOPDStatus, [id, dbStatus]);

  if (result.rows.length === 0) {
    const err = new Error('OPD record not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Get all doctors
 * @returns {array} list of doctors
 */
export async function getDoctors() {
  const result = await pool.query(opdQueries.getDoctors);
  return result.rows;
}

/**
 * Get all visit types
 * @returns {array} list of visit types
 */
export async function getVisitTypes() {
  const result = await pool.query(opdQueries.getVisitTypes);
  return result.rows;
}

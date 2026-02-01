import { pool } from '../../config/db.js';
import { consultationQueries } from './consultation.sql.js';

/**
 * Create consultation from OPD queue entry
 * @param {object} consultationData
 * @returns {object} created consultation
 */
export async function createConsultation(consultationData) {
  const { uhid, doctor_id, opd_id, diagnosis, treatment_plan, followup_instructions } =
    consultationData;

  // Validate patient exists
  const patientResult = await pool.query('SELECT uhid FROM patients WHERE uhid = $1 LIMIT 1', [
    uhid,
  ]);
  if (patientResult.rows.length === 0) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }

  // Validate doctor exists
  const doctorResult = await pool.query('SELECT id FROM doctors WHERE id = $1 LIMIT 1', [
    doctor_id,
  ]);
  if (doctorResult.rows.length === 0) {
    const err = new Error('Doctor not found');
    err.statusCode = 400;
    throw err;
  }

  // Validate OPD entry exists (optional, but recommended)
  if (opd_id) {
    const opdResult = await pool.query('SELECT id FROM opd_queue WHERE id = $1 LIMIT 1', [
      opd_id,
    ]);
    if (opdResult.rows.length === 0) {
      const err = new Error('OPD entry not found');
      err.statusCode = 400;
      throw err;
    }
  }

  const result = await pool.query(consultationQueries.createConsultation, [
    uhid,
    doctor_id,
    opd_id || null,
    diagnosis || null,
    treatment_plan || null,
    followup_instructions || null,
  ]);

  return result.rows[0];
}

/**
 * Get consultation by ID with full details
 * @param {number} id
 * @returns {object} consultation record
 */
export async function getConsultationById(id) {
  const result = await pool.query(consultationQueries.getConsultationById, [id]);
  const record = result.rows[0];

  if (!record) {
    const err = new Error('Consultation not found');
    err.statusCode = 404;
    throw err;
  }

  // Get ICD codes
  const icdResult = await pool.query(consultationQueries.getConsultationICDs, [id]);

  return {
    ...record,
    icd_codes: icdResult.rows,
  };
}

/**
 * List consultations with pagination and filters
 * @param {object} filters - { uhid, doctor_id, date }
 * @param {number} page
 * @param {number} limit
 * @returns {object} paginated results
 */
export async function listConsultations(filters = {}, page = 1, limit = 20) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const { uhid = null, doctor_id = null, date = null } = filters;

  const result = await pool.query(consultationQueries.listConsultations, [
    uhid,
    doctor_id,
    date,
    limitNum,
    offset,
  ]);

  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

  return {
    data: result.rows.map((row) => {
      const { total_count, ...rest } = row;
      return rest;
    }),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get patient's consultation history
 * @param {string} uhid
 * @param {number} page
 * @param {number} limit
 * @returns {object} paginated results
 */
export async function getPatientConsultations(uhid, page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  // Get total count
  const countResult = await pool.query(consultationQueries.countPatientConsultations, [uhid]);
  const total = countResult.rows[0]?.total || 0;

  // Get paginated records
  const result = await pool.query(consultationQueries.getPatientConsultations, [
    uhid,
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
 * Update consultation
 * @param {number} id
 * @param {object} updateData
 * @returns {object} updated record
 */
export async function updateConsultation(id, updateData) {
  const { diagnosis, treatment_plan, followup_instructions } = updateData;

  // Verify consultation exists
  const existResult = await pool.query(
    'SELECT id FROM consultations WHERE id = $1 LIMIT 1',
    [id]
  );
  if (existResult.rows.length === 0) {
    const err = new Error('Consultation not found');
    err.statusCode = 404;
    throw err;
  }

  const result = await pool.query(consultationQueries.updateConsultation, [
    id,
    diagnosis,
    treatment_plan,
    followup_instructions,
  ]);

  if (result.rows.length === 0) {
    const err = new Error('Failed to update consultation');
    err.statusCode = 500;
    throw err;
  }

  // Get updated record with ICD codes
  return getConsultationById(id);
}

/**
 * Add ICD code to consultation
 * @param {number} consultationId
 * @param {number} icdId
 * @returns {object} consultation with updated ICD codes
 */
export async function addConsultationICD(consultationId, icdId) {
  // Verify consultation exists
  const consultResult = await pool.query(
    'SELECT id FROM consultations WHERE id = $1 LIMIT 1',
    [consultationId]
  );
  if (consultResult.rows.length === 0) {
    const err = new Error('Consultation not found');
    err.statusCode = 404;
    throw err;
  }

  // Verify ICD code exists
  const icdResult = await pool.query(consultationQueries.getICDCodeById, [icdId]);
  if (icdResult.rows.length === 0) {
    const err = new Error('ICD code not found');
    err.statusCode = 400;
    throw err;
  }

  await pool.query(consultationQueries.addConsultationICD, [consultationId, icdId]);

  // Return updated consultation
  return getConsultationById(consultationId);
}

/**
 * Remove ICD code from consultation
 * @param {number} consultationId
 * @param {number} icdId
 * @returns {object} consultation with updated ICD codes
 */
export async function removeConsultationICD(consultationId, icdId) {
  // Verify consultation exists
  const consultResult = await pool.query(
    'SELECT id FROM consultations WHERE id = $1 LIMIT 1',
    [consultationId]
  );
  if (consultResult.rows.length === 0) {
    const err = new Error('Consultation not found');
    err.statusCode = 404;
    throw err;
  }

  await pool.query(consultationQueries.removeConsultationICD, [consultationId, icdId]);

  // Return updated consultation
  return getConsultationById(consultationId);
}

/**
 * Get all ICD codes for dropdown
 * @returns {array} list of ICD codes
 */
export async function getAllICDCodes() {
  const result = await pool.query(consultationQueries.getAllICDCodes);
  return result.rows;
}

/**
 * Search ICD codes
 * @param {string} searchTerm
 * @returns {array} filtered ICD codes
 */
export async function searchICDCodes(searchTerm) {
  const result = await pool.query(consultationQueries.searchICDCodes, [
    `%${searchTerm}%`,
  ]);
  return result.rows;
}

/**
 * Delete consultation
 * @param {number} id
 * @returns {object} deleted consultation ID
 */
export async function deleteConsultation(id) {
  const result = await pool.query(consultationQueries.deleteConsultation, [id]);

  if (result.rows.length === 0) {
    const err = new Error('Consultation not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

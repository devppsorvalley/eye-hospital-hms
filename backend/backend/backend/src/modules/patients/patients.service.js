import { pool } from '../../config/db.js';
import { patientQueries } from './patients.sql.js';

/**
 * Register a new patient
 * @param {object} patientData
 * @returns {object} created patient
 */
export async function registerPatient(patientData) {
  const {
    first_name,
    middle_name,
    last_name,
    gender,
    dob,
    phone,
    address,
    district,
    tehsil,
    block,
    village,
    age,
    chief_complaint,
    weight,
    spo2,
    temperature,
    pulse,
    bp,
    patient_category,
    guardian_name,
    relation_to_patient,
    alternate_phone,
    photo,
  } = patientData;

  // Generate UHID
  const uhid = await generateUHID();

  // Calculate age text from DOB if provided
  const ageText = dob ? calculateAge(dob) : null;

  const result = await pool.query(patientQueries.createPatient, [
    uhid,
    first_name,
    middle_name || null,
    last_name,
    gender,
    dob || null,
    ageText,
    age || null,
    phone,
    address,
    district || null,
    tehsil || null,
    block || null,
    village || null,
    chief_complaint || null,
    weight || null,
    spo2 || null,
    temperature || null,
    pulse || null,
    bp || null,
    patient_category || null,
    guardian_name || null,
    relation_to_patient || null,
    alternate_phone || null,
    photo || null,
  ]);

  return result.rows[0];
}

/**
 * Search patients with pagination
 * @param {string} searchTerm
 * @param {string} village
 * @param {number} page
 * @param {number} limit
 * @returns {object} paginated results with total count
 */
export async function searchPatients(searchTerm, village, page, limit) {
  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.query(patientQueries.countPatients, [
    searchTerm || null,
    village || null,
  ]);
  const total = countResult.rows[0]?.total || 0;

  // Get paginated results
  const result = await pool.query(patientQueries.searchPatients, [
    searchTerm || null,
    village || null,
    limit,
    offset,
  ]);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get patient by UHID
 * @param {string} uhid
 * @returns {object} patient details
 */
export async function getPatientByUHID(uhid) {
  const result = await pool.query(patientQueries.findByUHID, [uhid]);
  const patient = result.rows[0];

  if (!patient) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }

  return patient;
}

/**
 * Update patient
 * @param {string} uhid
 * @param {object} updateData
 * @returns {object} updated patient
 */
export async function updatePatient(uhid, updateData) {
  const {
    first_name,
    middle_name,
    last_name,
    gender,
    dob,
    age,
    phone,
    address,
    district,
    tehsil,
    block,
    village,
    chief_complaint,
    weight,
    spo2,
    temperature,
    pulse,
    bp,
    patient_category,
    guardian_name,
    relation_to_patient,
    alternate_phone,
    photo,
  } = updateData;

  // Log photo in service

  const result = await pool.query(patientQueries.updatePatient, [
    uhid,
    first_name || null,
    middle_name || null,
    last_name || null,
    gender || null,
    dob || null,
    age || null,
    phone || null,
    address || null,
    district || null,
    tehsil || null,
    block || null,
    village || null,
    chief_complaint || null,
    weight || null,
    spo2 || null,
    temperature || null,
    pulse || null,
    bp || null,
    patient_category || null,
    guardian_name || null,
    relation_to_patient || null,
    alternate_phone || null,
    photo || null,
  ]);

  if (result.rows.length === 0) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Get patient visit history
 * @param {string} uhid
 * @returns {array} visit records
 */
export async function getPatientVisitHistory(uhid) {
  // Verify patient exists
  await getPatientByUHID(uhid);

  const result = await pool.query(patientQueries.getVisitHistory, [uhid]);
  return result.rows;
}

/**
 * Delete patient (soft delete)
 * @param {string} uhid
 * @returns {object} confirmation
 */
export async function deletePatient(uhid) {
  const result = await pool.query(patientQueries.deletePatient, [uhid]);

  if (result.rows.length === 0) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    message: 'Patient deleted successfully',
    uhid: result.rows[0].uhid,
  };
}

/**
 * Generate unique UHID
 * Format: 97xx (starting from 9700)
 */
async function generateUHID() {
  const result = await pool.query(patientQueries.getMaxUHID);
  const maxUHID = result.rows[0]?.max_uhid;

  const nextNumber = (maxUHID ? parseInt(maxUHID) : 9699) + 1;
  return String(nextNumber);
}

/**
 * Calculate age from DOB
 * @param {string} dob - ISO date string
 * @returns {string} age text (e.g., "30 years", "5 months")
 */
function calculateAge(dob) {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    return `${days || 0} day${days !== 1 ? 's' : ''}`;
  }
}

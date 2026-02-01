import axios from './axios';

/**
 * Get all ICD codes from master
 */
export const getICDCodes = async () => {
  const response = await axios.get('/consultations/masters/icd-codes');
  return response.data;
};

/**
 * Search ICD codes by term
 */
export const searchICDCodes = async (searchTerm) => {
  const response = await axios.get(`/consultations/masters/icd-search?search=${searchTerm}`);
  return response.data;
};

/**
 * Get today's OPD queue for a specific doctor
 */
export const getTodayOPDQueue = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const response = await axios.get(`/opd?doctor_id=${doctorId}&visit_date=${today}`);
  return response.data;
};

/**
 * Get all consultations for a patient
 */
export const getPatientConsultations = async (uhid) => {
  const response = await axios.get(`/consultations/patient/${uhid}`);
  return response.data;
};

/**
 * Create a new consultation
 */
export const createConsultation = async (consultationData) => {
  const response = await axios.post('/consultations', consultationData);
  return response.data;
};

/**
 * Update an existing consultation
 */
export const updateConsultation = async (id, consultationData) => {
  const response = await axios.put(`/consultations/${id}`, consultationData);
  return response.data;
};

/**
 * Get consultation by ID
 */
export const getConsultationById = async (id) => {
  const response = await axios.get(`/consultations/${id}`);
  return response.data;
};

/**
 * Add ICD code to consultation
 */
export const addICDCode = async (consultationId, icdId) => {
  const response = await axios.post(`/consultations/${consultationId}/icd`, { icd_id: icdId });
  return response.data;
};

/**
 * Remove ICD code from consultation
 */
export const removeICDCode = async (consultationId, icdId) => {
  const response = await axios.delete(`/consultations/${consultationId}/icd/${icdId}`);
  return response.data;
};

/**
 * Get all consultations with filters
 */
export const getConsultations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.uhid) params.append('uhid', filters.uhid);
  if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
  if (filters.date) params.append('date', filters.date);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await axios.get(`/consultations?${params.toString()}`);
  return response.data;
};

/**
 * Delete consultation (ADMIN only)
 */
export const deleteConsultation = async (id) => {
  const response = await axios.delete(`/consultations/${id}`);
  return response.data;
};

/**
 * Update OPD queue status
 * @param {number} opdId - OPD queue entry ID
 * @param {string} status - New status (WAITING, IN_PROGRESS, COMPLETED, CANCELLED)
 * @returns {Promise}
 */
export const updateOPDStatus = async (opdId, status) => {
  // Convert status to lowercase with hyphens for backend validation
  const normalizedStatus = status.toLowerCase().replace('_', '-');
  const response = await axios.put(`/opd/${opdId}/status`, { status: normalizedStatus });
  return response.data;
};

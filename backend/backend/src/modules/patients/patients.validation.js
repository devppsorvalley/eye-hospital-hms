/**
 * Input validation for patients module
 */

const genderOptions = ['Male', 'Female', 'Other'];

/**
 * Validate patient registration input
 */
export function validatePatientRegistration(data) {
  const errors = [];

  // Required fields
  if (!data.first_name || typeof data.first_name !== 'string') {
    errors.push('first_name is required and must be a string');
  }
  if (!data.last_name || typeof data.last_name !== 'string') {
    errors.push('last_name is required and must be a string');
  }
  if (!data.gender || !genderOptions.includes(data.gender)) {
    errors.push(`gender is required and must be one of: ${genderOptions.join(', ')}`);
  }
  
  // DOB is now optional
  if (data.dob && !isValidDate(data.dob)) {
    errors.push('dob must be a valid date (YYYY-MM-DD) if provided');
  }
  
  // Phone validation - must be 10 digits if not the default
  const phoneClean = String(data.phone || '').replace(/\D/g, '');
  if (!phoneClean || phoneClean.length !== 10) {
    errors.push('phone is required and must be exactly 10 digits');
  }
  
  // Village validation - can be empty string (for quick save) or a non-empty string
  if (data.village !== undefined && data.village !== null && typeof data.village !== 'string') {
    errors.push('village must be a string if provided');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  // Optional fields validation
  if (data.alternate_phone && !/^\d{10}$/.test(String(data.alternate_phone).replace(/\D/g, ''))) {
    return { error: { details: [{ message: 'alternate_phone must be 10 digits if provided' }] } };
  }

  // Age validation if DOB provided (should be between 0 and 150)
  if (data.dob) {
    const birthDate = new Date(data.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 0 || age > 150) {
      return { error: { details: [{ message: 'dob must result in valid age (0-150 years)' }] } };
    }
  }

  return {
    value: {
      first_name: data.first_name.trim(),
      middle_name: data.middle_name ? data.middle_name.trim() : null,
      last_name: data.last_name.trim(),
      gender: data.gender,
      dob: data.dob || null,
      phone: phoneClean,
      address: data.address ? data.address.trim() : null,
      district: data.district ? data.district.trim() : null,
      tehsil: data.tehsil ? data.tehsil.trim() : null,
      block: data.block ? data.block.trim() : null,
      village: data.village ? data.village.trim() : '',
      age: data.age ? parseInt(data.age, 10) : null,
      chief_complaint: data.chief_complaint ? data.chief_complaint.trim() : null,
      weight: data.weight ? parseFloat(data.weight) : null,
      spo2: data.spo2 ? parseInt(data.spo2, 10) : null,
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      pulse: data.pulse ? parseInt(data.pulse, 10) : null,
      bp: data.bp ? data.bp.trim() : null,
      patient_category: data.patient_category ? data.patient_category.trim() : null,
      guardian_name: data.guardian_name ? data.guardian_name.trim() : null,
      relation_to_patient: data.relation_to_patient ? data.relation_to_patient.trim() : null,
      alternate_phone: data.alternate_phone ? String(data.alternate_phone).replace(/\D/g, '') : null,
      photo: data.photo || null,
    },
  };
}

/**
 * Validate patient update input
 */
export function validatePatientUpdate(data) {
  const errors = [];

  // Validate individual fields if provided
  if (data.first_name && typeof data.first_name !== 'string') {
    errors.push('first_name must be a string');
  }
  if (data.last_name && typeof data.last_name !== 'string') {
    errors.push('last_name must be a string');
  }
  if (data.gender && !genderOptions.includes(data.gender)) {
    errors.push(`gender must be one of: ${genderOptions.join(', ')}`);
  }
  if (data.dob && !isValidDate(data.dob)) {
    errors.push('dob must be a valid date (YYYY-MM-DD) if provided');
  }
  if (data.phone) {
    const phoneClean = String(data.phone).replace(/\D/g, '');
    if (phoneClean.length !== 10) {
      errors.push('phone must be exactly 10 digits');
    }
  }
  if (data.alternate_phone && !/^\d{10}$/.test(String(data.alternate_phone).replace(/\D/g, ''))) {
    errors.push('alternate_phone must be 10 digits');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return {
    value: {
      first_name: data.first_name ? data.first_name.trim() : undefined,
      middle_name: data.middle_name ? data.middle_name.trim() : undefined,
      last_name: data.last_name ? data.last_name.trim() : undefined,
      gender: data.gender,
      dob: data.dob || undefined,
      phone: data.phone ? String(data.phone).replace(/\D/g, '') : undefined,
      address: data.address ? data.address.trim() : undefined,
      district: data.district ? data.district.trim() : undefined,
      tehsil: data.tehsil ? data.tehsil.trim() : undefined,
      block: data.block ? data.block.trim() : undefined,
      village: data.village ? data.village.trim() : undefined,
      age: data.age ? parseInt(data.age, 10) : undefined,
      chief_complaint: data.chief_complaint ? data.chief_complaint.trim() : undefined,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      spo2: data.spo2 ? parseInt(data.spo2, 10) : undefined,
      temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      pulse: data.pulse ? parseInt(data.pulse, 10) : undefined,
      bp: data.bp ? data.bp.trim() : undefined,
      patient_category: data.patient_category ? data.patient_category.trim() : undefined,
      guardian_name: data.guardian_name ? data.guardian_name.trim() : undefined,
      relation_to_patient: data.relation_to_patient ? data.relation_to_patient.trim() : undefined,
      alternate_phone: data.alternate_phone ? String(data.alternate_phone).replace(/\D/g, '') : undefined,
      photo: data.photo || undefined,
    },
  };
}

/**
 * Check if string is valid ISO date
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

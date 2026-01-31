/**
 * Input validation for Consultation module
 */

/**
 * Validate consultation creation
 */
export function validateConsultationCreation(data) {
  const errors = [];

  // Required fields
  if (!data.uhid || typeof data.uhid !== 'string') {
    errors.push('uhid is required and must be a string');
  }
  if (!data.doctor_id || !Number.isInteger(data.doctor_id)) {
    errors.push('doctor_id is required and must be an integer');
  }
  if (data.opd_id && !Number.isInteger(data.opd_id)) {
    errors.push('opd_id must be an integer if provided');
  }

  // Optional fields
  if (data.diagnosis && typeof data.diagnosis !== 'string') {
    errors.push('diagnosis must be a string');
  }
  if (data.treatment_plan && typeof data.treatment_plan !== 'string') {
    errors.push('treatment_plan must be a string');
  }
  if (data.followup_instructions && typeof data.followup_instructions !== 'string') {
    errors.push('followup_instructions must be a string');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return {
    value: {
      uhid: data.uhid.trim(),
      doctor_id: parseInt(data.doctor_id),
      opd_id: data.opd_id ? parseInt(data.opd_id) : null,
      diagnosis: data.diagnosis ? data.diagnosis.trim() : null,
      treatment_plan: data.treatment_plan ? data.treatment_plan.trim() : null,
      followup_instructions: data.followup_instructions
        ? data.followup_instructions.trim()
        : null,
    },
  };
}

/**
 * Validate consultation update
 */
export function validateConsultationUpdate(data) {
  const errors = [];

  // At least one field must be provided
  if (
    !data.diagnosis &&
    !data.treatment_plan &&
    !data.followup_instructions
  ) {
    errors.push('At least one of: diagnosis, treatment_plan, or followup_instructions is required');
  }

  // Validate field types
  if (data.diagnosis && typeof data.diagnosis !== 'string') {
    errors.push('diagnosis must be a string');
  }
  if (data.treatment_plan && typeof data.treatment_plan !== 'string') {
    errors.push('treatment_plan must be a string');
  }
  if (data.followup_instructions && typeof data.followup_instructions !== 'string') {
    errors.push('followup_instructions must be a string');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return {
    value: {
      diagnosis: data.diagnosis ? data.diagnosis.trim() : undefined,
      treatment_plan: data.treatment_plan ? data.treatment_plan.trim() : undefined,
      followup_instructions: data.followup_instructions
        ? data.followup_instructions.trim()
        : undefined,
    },
  };
}

/**
 * Validate ICD code addition
 */
export function validateICDAddition(data) {
  const errors = [];

  if (!data.icd_id || !Number.isInteger(data.icd_id)) {
    errors.push('icd_id is required and must be an integer');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return {
    value: {
      icd_id: parseInt(data.icd_id),
    },
  };
}

/**
 * Validate ICD code search
 */
export function validateICDSearch(data) {
  const errors = [];

  if (!data.search || typeof data.search !== 'string') {
    errors.push('search is required and must be a string');
  }

  if (data.search && data.search.length < 2) {
    errors.push('search term must be at least 2 characters');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return {
    value: {
      search: data.search.trim(),
    },
  };
}

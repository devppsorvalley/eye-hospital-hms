/**
 * Input validation for OPD module
 */

/**
 * Validate OPD entry creation
 */
export function validateOPDCreation(data) {
  const errors = [];

  // Required fields
  if (!data.uhid || typeof data.uhid !== 'string') {
    errors.push('uhid is required and must be a string');
  }
  if (!data.doctor_id || !Number.isInteger(data.doctor_id)) {
    errors.push('doctor_id is required and must be an integer');
  }
  if (!data.visit_type_id || !Number.isInteger(data.visit_type_id)) {
    errors.push('visit_type_id is required and must be an integer');
  }
  if (!data.visit_date || !isValidDate(data.visit_date)) {
    errors.push('visit_date is required and must be a valid date (YYYY-MM-DD)');
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return {
    value: {
      uhid: data.uhid.trim(),
      doctor_id: parseInt(data.doctor_id),
      visit_type_id: parseInt(data.visit_type_id),
      visit_date: data.visit_date,
    },
  };
}

/**
 * Validate OPD status update
 */
export function validateOPDStatusUpdate(data) {
  const errors = [];
  const validStatuses = ['waiting', 'in-progress', 'completed', 'cancelled'];

  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push(`status is required and must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return { error: { details: errors.map((msg) => ({ message: msg })) } };
  }

  return { value: { status: data.status } };
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

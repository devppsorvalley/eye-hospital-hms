/**
 * Billing Validation
 * Input validation for billing operations
 */

/**
 * Validate bill creation data
 */
export function validateBillCreation(data) {
  const errors = [];

  if (!data.uhid || typeof data.uhid !== 'string') {
    errors.push('UHID is required and must be a string');
  }

  if (!data.patient_name || typeof data.patient_name !== 'string') {
    errors.push('Patient name is required and must be a string');
  }

  if (!data.bill_type || !['Cash', 'UPI', 'Card', 'Ayushman', 'TPA', 'ESIS', 'ECHS', 'Golden Card'].includes(data.bill_type)) {
    errors.push('Bill type is required and must be one of: Cash, UPI, Card, Ayushman, TPA, ESIS, ECHS, Golden Card');
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one bill item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.charge_name || typeof item.charge_name !== 'string') {
        errors.push(`Item ${index + 1}: Charge name is required`);
      }
      if (!item.rate || typeof item.rate !== 'number' || item.rate <= 0) {
        errors.push(`Item ${index + 1}: Rate must be a positive number`);
      }
      if (item.qty && (typeof item.qty !== 'number' || item.qty <= 0)) {
        errors.push(`Item ${index + 1}: Quantity must be a positive number`);
      }
    });
  }

  if (data.discount_amount && (typeof data.discount_amount !== 'number' || data.discount_amount < 0)) {
    errors.push('Discount amount must be a non-negative number');
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }
}

/**
 * Validate bill update data
 */
export function validateBillUpdate(data) {
  const errors = [];

  if (data.discount_amount && (typeof data.discount_amount !== 'number' || data.discount_amount < 0)) {
    errors.push('Discount amount must be a non-negative number');
  }

  if (data.net_amount && (typeof data.net_amount !== 'number' || data.net_amount < 0)) {
    errors.push('Net amount must be a non-negative number');
  }

  if (data.upi_reference && typeof data.upi_reference !== 'string') {
    errors.push('UPI reference must be a string');
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }
}

/**
 * Validate bill ID
 */
export function validateBillId(billId) {
  const errors = [];

  if (!billId || typeof billId !== 'string' || isNaN(parseInt(billId))) {
    errors.push('Bill ID must be a valid number');
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }
}

/**
 * Validate pagination and filtering parameters
 */
export function validateListParams(params) {
  const errors = [];

  if (params.limit && (typeof params.limit !== 'number' || params.limit <= 0 || params.limit > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  if (params.offset && (typeof params.offset !== 'number' || params.offset < 0)) {
    errors.push('Offset must be a non-negative number');
  }

  if (params.fromDate && isNaN(Date.parse(params.fromDate))) {
    errors.push('From date must be a valid date');
  }

  if (params.toDate && isNaN(Date.parse(params.toDate))) {
    errors.push('To date must be a valid date');
  }

  if (params.billType && typeof params.billType !== 'string') {
    errors.push('Bill type must be a string');
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }
}

/**
 * Validate UHID for patient bills
 */
export function validateUHID(uhid) {
  const errors = [];

  if (!uhid || typeof uhid !== 'string') {
    errors.push('UHID must be a valid string');
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }
}

/**
 * Validate search term
 */
export function validateSearchTerm(searchTerm) {
  const errors = [];

  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
    errors.push('Search term must be a non-empty string');
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.errors = errors;
    throw err;
  }
}

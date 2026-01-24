// Type validators
export const isString = (v) => typeof v === 'string';
export const isNumber = (v) => typeof v === 'number' && !isNaN(v);
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v) => /^[0-9\-\+\(\)\s]{10,}$/.test(v);
export const isDate = (v) => !isNaN(Date.parse(v));

// Auth validators
export const validateUsername = (username) => {
  if (!isString(username) || username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers, and underscores');
  }
  return true;
};

export const validatePassword = (password) => {
  if (!isString(password) || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};

// Patient validators
export const validateUHID = (uhid) => {
  if (!isString(uhid) || uhid.trim().length === 0) {
    throw new Error('UHID is required');
  }
  return true;
};

export const validatePhone = (phone) => {
  if (!isPhone(phone)) {
    throw new Error('Invalid phone number');
  }
  return true;
};


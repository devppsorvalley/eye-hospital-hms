/**
 * Permissions constants and helpers for frontend
 * Must match backend/src/config/constants.js
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  OPERATOR: 'OPERATOR',
};

export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_EDIT: 'dashboard:edit',

  // Patient/Registration permissions
  PATIENT_CREATE: 'patient:create',
  PATIENT_VIEW: 'patient:view',
  PATIENT_EDIT: 'patient:edit',

  // OPD permissions
  OPD_CREATE: 'opd:create',
  OPD_VIEW: 'opd:view',
  OPD_EDIT: 'opd:edit',

  // Consultation permissions
  CONSULTATION_VIEW: 'consultation:view',
  CONSULTATION_EDIT: 'consultation:edit',

  // Billing permissions
  BILLING_CREATE: 'billing:create',
  BILLING_VIEW: 'billing:view',
  BILLING_EDIT: 'billing:edit',
  BILLING_CANCEL: 'billing:cancel',

  // Masters permissions
  MASTERS_VIEW: 'masters:view',
  MASTERS_EDIT: 'masters:edit',

  // User management permissions
  USERS_VIEW: 'users:view',
  USERS_EDIT: 'users:edit',
};

/**
 * Check if user has a specific permission
 * @param {object} user - User object with permissions array
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param {object} user - User object with permissions array
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !user.permissions) return false;
  return permissions.some(perm => user.permissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 * @param {object} user - User object with permissions array
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !user.permissions) return false;
  return permissions.every(perm => user.permissions.includes(perm));
}

/**
 * Check if user has a specific role
 * @param {object} user - User object with role
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !user.role) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 * @param {object} user - User object with role
 * @param {string[]} roles - Array of roles
 * @returns {boolean}
 */
export function hasAnyRole(user, roles) {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}

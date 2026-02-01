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

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EDIT,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_VIEW,
    PERMISSIONS.PATIENT_EDIT,
    PERMISSIONS.OPD_CREATE,
    PERMISSIONS.OPD_VIEW,
    PERMISSIONS.OPD_EDIT,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_EDIT,
    PERMISSIONS.BILLING_CANCEL,
    PERMISSIONS.MASTERS_VIEW,
    PERMISSIONS.MASTERS_EDIT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT,
    // NOTE: Admin cannot access consultation at all
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.DASHBOARD_VIEW, // Read-only
    PERMISSIONS.OPD_VIEW, // Can view OPD queue to see waiting patients
    PERMISSIONS.OPD_EDIT, // Can update OPD status when consulting patients
    PERMISSIONS.CONSULTATION_VIEW,
    PERMISSIONS.CONSULTATION_EDIT,
  ],
  [ROLES.OPERATOR]: [
    PERMISSIONS.DASHBOARD_VIEW, // Read-only
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_VIEW,
    PERMISSIONS.PATIENT_EDIT,
    PERMISSIONS.OPD_CREATE,
    PERMISSIONS.OPD_VIEW,
    PERMISSIONS.OPD_EDIT,
    PERMISSIONS.BILLING_CREATE, // Can create bills
    PERMISSIONS.BILLING_VIEW,
    // NOTE: Operator cannot edit or cancel bills
  ],
};

// Default route after login based on role
export const ROLE_DEFAULT_ROUTES = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.DOCTOR]: '/consultation',
  [ROLES.OPERATOR]: '/opd',
};

/**
 * Get all permissions for a specific role
 * @param {string} role - User role
 * @returns {string[]} - Array of permission strings
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

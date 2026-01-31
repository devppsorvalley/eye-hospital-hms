/**
 * Permission-based RBAC Middleware
 * Checks if user has specific permissions
 */

import { ROLE_PERMISSIONS } from '../config/constants.js';

/**
 * Middleware to check if user has required permission(s)
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions
 * @param {boolean} requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 */
export function permissionMiddleware(requiredPermissions, requireAll = false) {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get permissions for user's role
      const userPermissions = ROLE_PERMISSIONS[user.role] || [];

      // Convert single permission to array for uniform handling
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      let hasPermission = false;

      if (requireAll) {
        // User must have ALL required permissions
        hasPermission = permissions.every(perm => userPermissions.includes(perm));
      } else {
        // User needs at least ONE of the required permissions
        hasPermission = permissions.some(perm => userPermissions.includes(perm));
      }

      if (!hasPermission) {
        return res.status(403).json({
          message: 'Access denied. Insufficient permissions.',
          required: permissions,
        });
      }

      next();
    } catch (err) {
      console.error('[Permission Middleware Error]', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Helper function to get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]} - Array of permissions
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has specific permission
 * @param {object} user - User object with role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param {object} user - User object with role
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !user.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.some(perm => userPermissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 * @param {object} user - User object with role
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !user.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.every(perm => userPermissions.includes(perm));
}

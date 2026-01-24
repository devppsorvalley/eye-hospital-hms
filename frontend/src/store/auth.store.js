import { hasPermission, hasAnyPermission, hasRole, hasAnyRole } from '../utils/permissions';

// Simple auth store using localStorage
export const authStore = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
  
  // Role-based checks
  hasRole: (role) => {
    const user = authStore.getUser();
    return hasRole(user, role);
  },
  hasAnyRole: (roles) => {
    const user = authStore.getUser();
    return hasAnyRole(user, roles);
  },
  
  // Permission-based checks
  hasPermission: (permission) => {
    const user = authStore.getUser();
    return hasPermission(user, permission);
  },
  hasAnyPermission: (permissions) => {
    const user = authStore.getUser();
    return hasAnyPermission(user, permissions);
  },
  
  // Get default route for user's role
  getDefaultRoute: () => {
    const user = authStore.getUser();
    return user?.defaultRoute || '/dashboard';
  },
};

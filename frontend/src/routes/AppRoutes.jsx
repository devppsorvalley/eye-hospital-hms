import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authStore } from '../store/auth.store';
import { ROLES, PERMISSIONS } from '../utils/permissions';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Registration from '../pages/Registration/Registration';
import OPD from '../pages/OPD/OPD';
import Consultation from '../pages/Consultation/Consultation';
import Billing from '../pages/Billing/Billing';
import ServiceChargesMaster from '../pages/Masters/ServiceChargesMaster';
import UserManagement from '../pages/Masters/UserManagement';

const ProtectedRoute = ({ children, requiredPermissions = [], requiredRoles = [], requireAll = false }) => {
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasAccess = requireAll
      ? requiredRoles.every(role => authStore.hasRole(role))
      : authStore.hasAnyRole(requiredRoles);
    
    if (!hasAccess) {
      return <Navigate to={authStore.getDefaultRoute()} />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every(perm => authStore.hasPermission(perm))
      : authStore.hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return <Navigate to={authStore.getDefaultRoute()} />;
    }
  }

  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registration"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.PATIENT_CREATE]}>
              <Registration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opd"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.OPD_VIEW]}>
              <OPD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultation"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.CONSULTATION_VIEW]}>
              <Consultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.BILLING_VIEW]}>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masters/service-charges"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.MASTERS_VIEW]}>
              <ServiceChargesMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masters/users"
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={authStore.isAuthenticated() ? authStore.getDefaultRoute() : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

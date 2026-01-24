import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import opdRoutes from './modules/opd/opd.routes.js';
import consultationRoutes from './modules/consultation/consultation.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import mastersRoutes from './modules/masters/masters.routes.js';

const router = express.Router();

// Auth routes (no auth required for login/logout)
router.use('/auth', authRoutes);

// Protected routes (require authentication via middleware in respective modules)
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/opd', opdRoutes);
router.use('/consultations', consultationRoutes);
router.use('/billing', billingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/masters', mastersRoutes);

export default router;


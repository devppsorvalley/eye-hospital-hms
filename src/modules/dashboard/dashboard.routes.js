import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import rbacMiddleware from '../../middleware/rbac.middleware.js';
import * as dashboardController from './dashboard.controller.js';

const router = express.Router();

/**
 * GET /api/v1/dashboard - Complete dashboard
 * Required roles: ADMIN, DOCTOR
 */
router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR', 'OPERATOR']),
  dashboardController.getDashboardController
);

/**
 * GET /api/v1/dashboard/overview - KPI cards
 * Required roles: ADMIN, DOCTOR, OPERATOR
 */
router.get(
  '/overview',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR', 'OPERATOR']),
  dashboardController.getOverviewController
);

/**
 * GET /api/v1/dashboard/opd - OPD metrics
 * Required roles: ADMIN, DOCTOR
 */
router.get(
  '/opd',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR']),
  dashboardController.getOPDMetricsController
);

/**
 * GET /api/v1/dashboard/billing - Billing metrics
 * Required roles: ADMIN, BILLING
 */
router.get(
  '/billing',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'BILLING']),
  dashboardController.getBillingMetricsController
);

/**
 * GET /api/v1/dashboard/trends - 7-day trends
 * Required roles: ADMIN
 */
router.get(
  '/trends',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  dashboardController.getTrendsController
);

/**
 * GET /api/v1/dashboard/consultations - Consultation metrics
 * Required roles: ADMIN, DOCTOR
 */
router.get(
  '/consultations',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR']),
  dashboardController.getConsultationsController
);

/**
 * GET /api/v1/dashboard/demographics - Patient demographics
 * Required roles: ADMIN
 */
router.get(
  '/demographics',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  dashboardController.getDemographicsController
);

/**
 * GET /api/v1/dashboard/follow-up - Follow-up vs new analysis
 * Required roles: ADMIN, DOCTOR
 */
router.get(
  '/follow-up',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR']),
  dashboardController.getFollowUpAnalysisController
);

export default router;

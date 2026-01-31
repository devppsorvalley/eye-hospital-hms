import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import rbacMiddleware from '../../middleware/rbac.middleware.js';
import { permissionMiddleware } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../../config/constants.js';
import * as billingController from './billing.controller.js';

const router = express.Router();

/**
 * GET /api/v1/billing/masters/categories - Get all service categories
 * Required roles: All authenticated users
 * NOTE: Must come before /:id routes
 */
router.get(
  '/masters/categories',
  authMiddleware,
  billingController.getServiceCategoriesController
);

/**
 * GET /api/v1/billing/masters/service-charges - Get all service charges
 * Required roles: All authenticated users
 * NOTE: Must come before /:id routes
 */
router.get(
  '/masters/service-charges',
  authMiddleware,
  billingController.getServiceChargesController
);

/**
 * POST /api/v1/billing/masters/service-charges - Create service charge
 * Required roles: ADMIN
 */
router.post(
  '/masters/service-charges',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  billingController.createServiceChargeController
);

/**
 * PUT /api/v1/billing/masters/service-charges/:id - Update service charge
 * Required roles: ADMIN
 */
router.put(
  '/masters/service-charges/:id',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  billingController.updateServiceChargeController
);

/**
 * DELETE /api/v1/billing/masters/service-charges/:id - Delete service charge
 * Required roles: ADMIN
 */
router.delete(
  '/masters/service-charges/:id',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  billingController.deleteServiceChargeController
);

/**
 * GET /api/v1/billing/masters/service-charges/search - Search service charges
 * Required roles: All authenticated users
 */
router.get(
  '/masters/service-charges/search',
  authMiddleware,
  billingController.searchServiceChargesController
);

/**
 * GET /api/v1/billing/patient/:uhid - Get patient bills
 * Required roles: All authenticated users
 * NOTE: Must come before /:id routes
 */
router.get(
  '/patient/:uhid',
  authMiddleware,
  billingController.getPatientBillsController
);

/**
 * POST /api/v1/billing - Create bill
 * Required permissions: billing:create (OPERATOR, ADMIN)
 */
router.post(
  '/',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.BILLING_CREATE),
  billingController.createBillController
);

/**
 * GET /api/v1/billing - List bills
 * Required permissions: billing:view
 */
router.get(
  '/',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.BILLING_VIEW),
  billingController.listBillsController
);

/**
 * GET /api/v1/billing/:id - Get bill by ID
 * Required permissions: billing:view
 */
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.BILLING_VIEW),
  billingController.getBillController
);

/**
 * PUT /api/v1/billing/:id - Update bill
 * Required permissions: billing:edit (ADMIN only)
 */
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.BILLING_EDIT),
  billingController.updateBillController
);

/**
 * POST /api/v1/billing/:id/cancel - Cancel bill
 * Required permissions: billing:cancel (ADMIN only)
 */
router.post(
  '/:id/cancel',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.BILLING_CANCEL),
  billingController.cancelBillController
);

export default router;

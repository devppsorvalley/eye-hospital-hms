import express from 'express';
import {
  createController,
  queueController,
  getController,
  updateStatusController,
  deleteController,
  patientOPDController,
  getDoctorsController,
  getVisitTypesController,
} from './opd.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import rbacMiddleware from '../../middleware/rbac.middleware.js';
import { permissionMiddleware } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/opd
 * Create OPD queue entry (OPERATOR, DOCTOR, ADMIN)
 */
router.post('/', permissionMiddleware(PERMISSIONS.OPD_CREATE), createController);

/**
 * GET /api/v1/opd
 * Get OPD queue (OPERATOR, DOCTOR, ADMIN)
 * Query params: visit_date, doctor_id, status, page, limit
 */
router.get('/', permissionMiddleware(PERMISSIONS.OPD_VIEW), queueController);

/**
 * DELETE /api/v1/opd/:id
 * Remove OPD entry and reset serial numbers (OPERATOR, ADMIN)
 */
router.delete('/:id', permissionMiddleware(PERMISSIONS.OPD_EDIT), deleteController);

/**
 * GET /api/v1/opd/masters/doctors
 * Get doctors list (all authenticated users)
 */
router.get('/masters/doctors', getDoctorsController);

/**
 * GET /api/v1/opd/masters/visit-types
 * Get visit types list (all authenticated users)
 */
router.get('/masters/visit-types', getVisitTypesController);

/**
 * GET /api/v1/opd/patient/:uhid
 * Get patient's OPD records (DOCTOR, OPERATOR, ADMIN)
 */
router.get('/patient/:uhid', permissionMiddleware(PERMISSIONS.OPD_VIEW), patientOPDController);

/**
 * GET /api/v1/opd/:id
 * Get OPD record by ID (DOCTOR, OPERATOR, ADMIN)
 */
router.get('/:id', permissionMiddleware(PERMISSIONS.OPD_VIEW), getController);

/**
 * PUT /api/v1/opd/:id/status
 * Update OPD status (DOCTOR, OPERATOR, ADMIN)
 */
router.put('/:id/status', permissionMiddleware(PERMISSIONS.OPD_EDIT), updateStatusController);

export default router;

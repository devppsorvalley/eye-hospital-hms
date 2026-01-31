import express from 'express';
import {
  registerController,
  searchController,
  getController,
  updateController,
  visitHistoryController,
  deleteController,
} from './patients.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import rbacMiddleware from '../../middleware/rbac.middleware.js';
import { permissionMiddleware } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/patients
 * Register new patient (OPERATOR, ADMIN)
 */
router.post('/', permissionMiddleware(PERMISSIONS.PATIENT_CREATE), registerController);

/**
 * GET /api/v1/patients
 * Search patients (OPERATOR, DOCTOR, ADMIN)
 * Query params: search, village, page, limit
 */
router.get('/', permissionMiddleware(PERMISSIONS.PATIENT_VIEW), searchController);

/**
 * GET /api/v1/patients/:uhid
 * Get patient details (all authenticated users with patient:view permission)
 */
router.get('/:uhid', permissionMiddleware(PERMISSIONS.PATIENT_VIEW), getController);

/**
 * GET /api/v1/patients/:uhid/visits
 * Get patient visit history (DOCTOR, OPERATOR, ADMIN)
 */
router.get('/:uhid/visits', permissionMiddleware(PERMISSIONS.PATIENT_VIEW), visitHistoryController);

/**
 * PUT /api/v1/patients/:uhid
 * Update patient (OPERATOR, ADMIN)
 */
router.put('/:uhid', permissionMiddleware(PERMISSIONS.PATIENT_EDIT), updateController);

/**
 * DELETE /api/v1/patients/:uhid
 * Soft delete patient (ADMIN only)
 */
router.delete('/:uhid', rbacMiddleware(['ADMIN']), deleteController);

export default router;

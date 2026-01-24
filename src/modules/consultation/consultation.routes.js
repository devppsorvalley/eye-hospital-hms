import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import rbacMiddleware from '../../middleware/rbac.middleware.js';
import { permissionMiddleware } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../../config/constants.js';
import * as consultationController from './consultation.controller.js';
import * as aiFeedbackController from './aiFeedback.controller.js';

const router = express.Router();

/**
 * POST /api/v1/consultations - Create consultation
 * Required permissions: consultation:edit (DOCTOR only)
 */
router.post(
  '/',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_EDIT),
  consultationController.createConsultationController
);

/**
 * GET /api/v1/consultations - List consultations
 * Required permissions: consultation:view (DOCTOR only)
 */
router.get(
  '/',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_VIEW),
  consultationController.listConsultationsController
);

/**
 * GET /api/v1/consultations/masters/icd-codes - Get all ICD codes
 * Required permissions: consultation:view (DOCTOR only)
 */
router.get(
  '/masters/icd-codes',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_VIEW),
  consultationController.getAllICDCodesController
);

/**
 * GET /api/v1/consultations/masters/icd-search - Search ICD codes
 * Required permissions: consultation:view (DOCTOR only)
 */
router.get(
  '/masters/icd-search',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_VIEW),
  consultationController.searchICDCodesController
);

/**
 * GET /api/v1/consultations/patient/:uhid - Get patient consultations
 * Required permissions: consultation:view (DOCTOR only)
 */
router.get(
  '/patient/:uhid',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_VIEW),
  consultationController.getPatientConsultationsController
);

/**
 * GET /api/v1/consultations/:id - Get consultation by ID
 * Required permissions: consultation:view (DOCTOR only)
 */
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_VIEW),
  consultationController.getConsultationController
);

/**
 * PUT /api/v1/consultations/:id - Update consultation
 * Required permissions: consultation:edit (DOCTOR only)
 */
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware(PERMISSIONS.CONSULTATION_EDIT),
  consultationController.updateConsultationController
);

/**
 * POST /api/v1/consultations/:id/icd - Add ICD code
 * Required roles: ADMIN, DOCTOR
 */
router.post(
  '/:id/icd',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR']),
  consultationController.addICDController
);

/**
 * DELETE /api/v1/consultations/:id/icd/:icd_id - Remove ICD code
 * Required roles: ADMIN, DOCTOR
 */
router.delete(
  '/:id/icd/:icd_id',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR']),
  consultationController.removeICDController
);

/**
 * GET /api/v1/consultations/masters/icd-codes - Get all ICD codes
 * Required roles: All authenticated users
 */
router.get(
  '/masters/icd-codes',
  authMiddleware,
  consultationController.getAllICDCodesController
);

/**
 * GET /api/v1/consultations/masters/icd-search - Search ICD codes
 * Required roles: All authenticated users
 */
router.get(
  '/masters/icd-search',
  authMiddleware,
  consultationController.searchICDCodesController
);

/**
 * DELETE /api/v1/consultations/:id - Delete consultation
 * Required roles: ADMIN
 */
router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  consultationController.deleteConsultationController
);

/**
 * POST /api/v1/consultations/ai-feedback - Submit AI recommendation feedback
 * Required roles: DOCTOR, ADMIN
 */
router.post(
  '/ai-feedback',
  authMiddleware,
  rbacMiddleware(['ADMIN', 'DOCTOR']),
  aiFeedbackController.submitAIFeedback
);

/**
 * GET /api/v1/consultations/ai-feedback/stats - Get AI feedback statistics
 * Required roles: ADMIN
 */
router.get(
  '/ai-feedback/stats',
  authMiddleware,
  rbacMiddleware(['ADMIN']),
  aiFeedbackController.getAIFeedbackStats
);

export default router;

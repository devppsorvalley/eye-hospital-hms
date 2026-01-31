import express from 'express';
import { getDoctorsController, getVisitTypesController } from './masters.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// All masters routes require authentication
router.use(authMiddleware);

// GET /api/v1/masters/doctors
router.get('/doctors', getDoctorsController);

// GET /api/v1/masters/visit-types
router.get('/visit-types', getVisitTypesController);

export default router;

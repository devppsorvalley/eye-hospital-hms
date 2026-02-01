import express from 'express';
import { listPatients } from './patient.controller.js';
const router = express.Router();
router.get('/', listPatients);
export default router;

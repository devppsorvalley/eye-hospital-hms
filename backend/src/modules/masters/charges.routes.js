import express from 'express';
import { listCharges } from './charges.controller.js';
const router = express.Router();
router.get('/', listCharges);
export default router;

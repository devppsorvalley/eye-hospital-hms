import express from 'express';
import { listBills } from './billing.controller.js';
const router = express.Router();
router.get('/', listBills);
export default router;

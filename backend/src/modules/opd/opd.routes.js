import express from 'express';
import { listOPD } from './opd.controller.js';
const router = express.Router();
router.get('/', listOPD);
export default router;

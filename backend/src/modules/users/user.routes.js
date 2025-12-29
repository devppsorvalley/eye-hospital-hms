import express from 'express';
import { listUsers } from './user.controller.js';
const router = express.Router();
router.get('/', listUsers);
export default router;

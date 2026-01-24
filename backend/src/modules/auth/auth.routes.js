import express from 'express';
import {
  loginController,
  logoutController,
  changePasswordController,
  getMeController,
} from './auth.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public endpoints
router.post('/login', loginController);
router.post('/logout', logoutController);

// Protected endpoints (require authentication)
router.post('/change-password', authMiddleware, changePasswordController);
router.get('/me', authMiddleware, getMeController);

export default router;


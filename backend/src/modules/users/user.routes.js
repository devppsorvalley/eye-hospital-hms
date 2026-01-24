import express from 'express';
import * as userController from './user.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import rbacMiddleware from '../../middleware/rbac.middleware.js';

const router = express.Router();

// All user management routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(rbacMiddleware(['ADMIN']));

// GET all users
router.get('/', userController.listUsers);

// GET user by ID
router.get('/:id', userController.getUserById);

// POST create new user
router.post('/', userController.createUser);

// PUT update user
router.put('/:id', userController.updateUser);

// PATCH toggle user status
router.patch('/:id/status', userController.toggleUserStatus);

// PATCH reset password
router.patch('/:id/password', userController.resetPassword);

// DELETE user
router.delete('/:id', userController.deleteUser);

export default router;

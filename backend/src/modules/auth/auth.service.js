import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db.js';
import { authQueries } from './auth.sql.js';import { getPermissionsForRole, ROLE_DEFAULT_ROUTES } from '../../config/constants.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Login user and return JWT token
 * @param {string} username
 * @param {string} password
 * @returns {object} token and user info
 */
export async function login(username, password) {
  // Validate inputs
  if (!username || !password) {
    const err = new Error('Username and password are required');
    err.statusCode = 400;
    throw err;
  }

  // Find user
  const result = await pool.query(authQueries.findByUsername, [username]);
  const user = result.rows[0];

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  // Check if user is active
  if (!user.is_active) {
    const err = new Error('User account is disabled');
    err.statusCode = 403;
    throw err;
  }

  // Verify password
  const passwordValid = await bcryptjs.compare(password, user.password_hash);
  if (!passwordValid) {
    const err = new Error('Invalid password');
    err.statusCode = 401;
    throw err;
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      doctor_id: user.doctor_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Get permissions for user's role
  const permissions = getPermissionsForRole(user.role);
  const defaultRoute = ROLE_DEFAULT_ROUTES[user.role] || '/dashboard';

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      doctor_id: user.doctor_id,
      permissions,
      defaultRoute,
    },
  };
}

/**
 * Change user password
 * @param {number} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {object} user info
 */
export async function changePassword(userId, oldPassword, newPassword) {
  // Validate inputs
  if (!oldPassword || !newPassword) {
    const err = new Error('Old and new passwords are required');
    err.statusCode = 400;
    throw err;
  }

  if (newPassword.length < 6) {
    const err = new Error('New password must be at least 6 characters');
    err.statusCode = 400;
    throw err;
  }

  // Find user
  const result = await pool.query(authQueries.findById, [userId]);
  const user = result.rows[0];

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Verify old password (for security, we don't have it in the findById query)
  // Re-fetch with password hash
  const fullUserResult = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );
  const fullUser = fullUserResult.rows[0];

  const oldPasswordValid = await bcryptjs.compare(oldPassword, fullUser.password_hash);
  if (!oldPasswordValid) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  // Hash new password
  const passwordHash = await bcryptjs.hash(newPassword, 10);

  // Update password
  const updateResult = await pool.query(authQueries.updatePassword, [
    passwordHash,
    userId,
  ]);

  // Fetch updated user info (including role name)
  const updatedUser = await getUserById(userId);

  return {
    message: 'Password changed successfully',
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    },
  };
}

/**
 * Get user by ID
 * @param {number} userId
 * @returns {object} user info
 */
export async function getUserById(userId) {
  const result = await pool.query(authQueries.findById, [userId]);
  const user = result.rows[0];

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
}


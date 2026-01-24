import bcryptjs from 'bcryptjs';
import { pool } from '../../config/db.js';
import { userQueries } from './user.sql.js';

/**
 * Get all users
 */
export async function getAllUsers() {
  const result = await pool.query(userQueries.getAllUsers);
  return result.rows;
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const result = await pool.query(userQueries.getUserById, [userId]);
  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

/**
 * Create new user
 */
export async function createUser(userData) {
  const { username, full_name, mobile, password, role, is_active } = userData;

  // Check if username already exists
  const existingUser = await pool.query(userQueries.getUserByUsername, [username]);
  if (existingUser.rows.length > 0) {
    const err = new Error('Username already exists');
    err.statusCode = 400;
    throw err;
  }

  // Get role ID from role name
  const roleResult = await pool.query(userQueries.getRoleIdByName, [role]);
  if (roleResult.rows.length === 0) {
    const err = new Error(`Invalid role: ${role}`);
    err.statusCode = 400;
    throw err;
  }
  const roleId = roleResult.rows[0].id;

  // Hash password
  const passwordHash = await bcryptjs.hash(password, 10);

  // Create user
  const result = await pool.query(userQueries.createUser, [
    username,
    full_name || username,
    mobile || null,
    passwordHash,
    roleId,
    is_active !== undefined ? is_active : true,
  ]);

  const newUser = result.rows[0];
  
  // Get role name for response
  const roleNameResult = await pool.query(userQueries.getUserById, [newUser.id]);
  return roleNameResult.rows[0];
}

/**
 * Update user
 */
export async function updateUser(userId, userData) {
  const { full_name, mobile, role, is_active, password } = userData;

  // Check if user exists
  await getUserById(userId);

  // Get role ID from role name
  const roleResult = await pool.query(userQueries.getRoleIdByName, [role]);
  if (roleResult.rows.length === 0) {
    const err = new Error(`Invalid role: ${role}`);
    err.statusCode = 400;
    throw err;
  }
  const roleId = roleResult.rows[0].id;

  // Update user basic info
  await pool.query(userQueries.updateUser, [
    userId,
    full_name,
    mobile || null,
    roleId,
    is_active !== undefined ? is_active : true,
  ]);

  // Update password if provided
  if (password) {
    const passwordHash = await bcryptjs.hash(password, 10);
    await pool.query(userQueries.updatePassword, [userId, passwordHash]);
  }

  // Return updated user with role name
  const result = await pool.query(userQueries.getUserById, [userId]);
  return result.rows[0];
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId, isActive) {
  // Check if user exists
  await getUserById(userId);

  const result = await pool.query(userQueries.toggleUserStatus, [userId, isActive]);
  return result.rows[0];
}

/**
 * Reset user password
 */
export async function resetPassword(userId, newPassword) {
  // Check if user exists
  await getUserById(userId);

  // Hash new password
  const passwordHash = await bcryptjs.hash(newPassword, 10);

  const result = await pool.query(userQueries.updatePassword, [userId, passwordHash]);
  return result.rows[0];
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  // Check if user exists
  await getUserById(userId);

  const result = await pool.query(userQueries.deleteUser, [userId]);
  
  if (result.rows.length === 0) {
    const err = new Error('Failed to delete user');
    err.statusCode = 500;
    throw err;
  }

  return result.rows[0];
}

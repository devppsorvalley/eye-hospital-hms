/**
 * SQL queries for user management
 */

export const userQueries = {
  // Get all users with role information
  getAllUsers: `
    SELECT 
      u.id,
      u.username,
      u.full_name,
      u.mobile,
      u.is_active,
      u.created_at,
      u.updated_at,
      u.last_login_at,
      r.name as role
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `,

  // Get user by ID
  getUserById: `
    SELECT 
      u.id,
      u.username,
      u.full_name,
      u.mobile,
      u.role_id,
      u.is_active,
      u.created_at,
      u.updated_at,
      u.last_login_at,
      r.name as role
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
  `,

  // Get user by username
  getUserByUsername: `
    SELECT 
      u.id,
      u.username,
      u.role_id,
      u.is_active,
      r.name as role
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.username = $1
  `,

  // Get role ID by role name
  getRoleIdByName: `
    SELECT id FROM roles WHERE UPPER(name) = UPPER($1)
  `,

  // Create new user
  createUser: `
    INSERT INTO users (username, full_name, mobile, password_hash, role_id, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, full_name, mobile, role_id, is_active, created_at
  `,

  // Update user
  updateUser: `
    UPDATE users
    SET 
      full_name = $2,
      mobile = $3,
      role_id = $4,
      is_active = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username, full_name, mobile, role_id, is_active, updated_at
  `,

  // Update user password
  updatePassword: `
    UPDATE users
    SET 
      password_hash = $2,
      password_changed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username
  `,

  // Toggle user active status
  toggleUserStatus: `
    UPDATE users
    SET 
      is_active = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username, is_active
  `,

  // Delete user (hard delete - use cautiously)
  deleteUser: `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, username
  `,
};

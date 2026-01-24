// SQL queries for auth module
export const authQueries = {
  // Find user by username
  findByUsername: `
    SELECT u.id, u.username, u.password_hash, u.is_active, r.name AS role, u.doctor_id, u.created_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.username = $1
    LIMIT 1
  `,

  // Create user (for registration if needed)
  createUser: `
    INSERT INTO users (username, password_hash, role_id, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, username, role_id
  `,

  // Update password
  updatePassword: `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, username, role_id
  `,

  // Find user by ID
  findById: `
    SELECT u.id, u.username, r.name AS role, u.doctor_id, u.created_at
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
    LIMIT 1
  `
};

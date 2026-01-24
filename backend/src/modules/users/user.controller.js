import * as userService from './user.service.js';

/**
 * Get all users
 */
export async function listUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      const err = new Error('Valid user ID is required');
      err.statusCode = 400;
      throw err;
    }

    const user = await userService.getUserById(parseInt(id));
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new user
 */
export async function createUser(req, res, next) {
  try {
    const { username, full_name, password, role, mobile, is_active } = req.body;

    // Validate required fields
    if (!username || !password || !role) {
      const err = new Error('username, password, and role are required');
      err.statusCode = 400;
      throw err;
    }

    const userData = {
      username: username.trim().toLowerCase(),
      full_name: full_name?.trim() || username.trim(),
      mobile: mobile?.trim() || null,
      password,
      role: role.toUpperCase(),
      is_active: is_active !== undefined ? is_active : true,
    };

    const user = await userService.createUser(userData);
    res.status(201).json({ 
      message: 'User created successfully', 
      user 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { full_name, role, mobile, is_active, password } = req.body;

    if (!id || isNaN(id)) {
      const err = new Error('Valid user ID is required');
      err.statusCode = 400;
      throw err;
    }

    if (!role) {
      const err = new Error('role is required');
      err.statusCode = 400;
      throw err;
    }

    const userData = {
      full_name: full_name?.trim() || null,
      mobile: mobile?.trim() || null,
      role: role.toUpperCase(),
      is_active: is_active !== undefined ? is_active : true,
    };

    // Only include password if provided
    if (password && password.trim()) {
      userData.password = password;
    }

    const user = await userService.updateUser(parseInt(id), userData);
    res.json({ 
      message: 'User updated successfully', 
      user 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id || isNaN(id)) {
      const err = new Error('Valid user ID is required');
      err.statusCode = 400;
      throw err;
    }

    if (is_active === undefined) {
      const err = new Error('is_active is required');
      err.statusCode = 400;
      throw err;
    }

    const user = await userService.toggleUserStatus(parseInt(id), is_active);
    res.json({ 
      message: 'User status updated successfully', 
      user 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset user password
 */
export async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!id || isNaN(id)) {
      const err = new Error('Valid user ID is required');
      err.statusCode = 400;
      throw err;
    }

    if (!password || !password.trim()) {
      const err = new Error('password is required');
      err.statusCode = 400;
      throw err;
    }

    await userService.resetPassword(parseInt(id), password);
    res.json({ 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      const err = new Error('Valid user ID is required');
      err.statusCode = 400;
      throw err;
    }

    await userService.deleteUser(parseInt(id));
    res.json({ 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
}

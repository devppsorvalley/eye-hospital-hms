import * as authService from './auth.service.js';

/**
 * POST /auth/login
 * Login user and receive JWT token
 */
export async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 * Logout user (stateless - frontend clears token)
 */
export function logoutController(req, res) {
  res.status(200).json({
    message: 'Logout successful. Please clear the token on your client.',
  });
}

/**
 * POST /auth/change-password
 * Change user password (requires authentication)
 */
export async function changePasswordController(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await authService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me
 * Get current user info (requires authentication)
 */
export async function getMeController(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);

    res.status(200).json({
      message: 'User info retrieved',
      user,
    });
  } catch (err) {
    next(err);
  }
}


/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, Request, Response } from 'express';
import authService from '../services/authService.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// User registration
router.post('/register', validateUserRegistration, async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName, role } = req.body;
    
    const authResponse = await authService.register({
      email,
      username,
      password,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: authResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

// User login
router.post('/login', validateUserLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const authResponse = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: authResponse
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    await authService.changePassword(req.user!.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password change failed'
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Password reset request failed'
    });
  }
});

// User logout (client-side token removal)
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the token. In a more secure implementation, you might
    // maintain a blacklist of tokens or use shorter-lived tokens with refresh tokens
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

export default router;
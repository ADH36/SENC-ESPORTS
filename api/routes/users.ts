import { Router, Request, Response } from 'express';
import userService from '../services/userService.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user profile (already handled in auth routes, but keeping for consistency)
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'User not found'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;
    
    const updatedUser = await userService.updateUser(req.user!.id, {
      firstName,
      lastName,
      avatarUrl
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed'
    });
  }
});

// Get user by ID (public profile)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    // Return limited public information
    const publicUser = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role
    };

    res.json({
      success: true,
      data: { user: publicUser }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'User not found'
    });
  }
});

// Admin routes

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await userService.getAllUsers(page, limit);

    res.json({
      success: true,
      data: {
        users: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users'
    });
  }
});

// Deactivate user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deactivating themselves
    if (userId === req.user!.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    await userService.deactivateUser(userId);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate user'
    });
  }
});

export default router;
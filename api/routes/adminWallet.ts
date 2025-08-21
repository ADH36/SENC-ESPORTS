import { Router, Request, Response } from 'express';
import walletService from '../services/walletService.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all wallet requests (admin only)
router.get('/requests', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const result = await walletService.getAllWalletRequests(page, limit, status);

    res.json({
      success: true,
      data: {
        requests: result.requests,
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
      error: error instanceof Error ? error.message : 'Failed to get wallet requests'
    });
  }
});

// Get wallet request by ID (admin only)
router.get('/requests/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const request = await walletService.getWalletRequestById(req.params.id);

    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Wallet request not found'
    });
  }
});

// Process wallet request (approve/reject) (admin only)
router.patch('/requests/:id/process', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { action, adminNotes } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be approve or reject'
      });
    }

    const processedRequest = await walletService.processWalletRequest(
      req.params.id,
      req.user!.id,
      action,
      adminNotes
    );

    res.json({
      success: true,
      message: `Wallet request ${action}d successfully`,
      data: { request: processedRequest }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process wallet request'
    });
  }
});

// Get all wallets (admin only)
router.get('/wallets', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await walletService.getAllWallets(page, limit);

    res.json({
      success: true,
      data: {
        wallets: result.wallets,
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
      error: error instanceof Error ? error.message : 'Failed to get wallets'
    });
  }
});

// Get wallet by user ID (admin only)
router.get('/wallets/user/:userId', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.params.userId);

    res.json({
      success: true,
      data: { wallet }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Wallet not found'
    });
  }
});

// Manual balance adjustment (admin only)
router.post('/wallets/:userId/adjust', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, description } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Description is required for manual adjustments'
      });
    }

    // Limit adjustment amounts
    const adjustmentAmount = parseFloat(amount);
    if (Math.abs(adjustmentAmount) > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Adjustment amount cannot exceed $50,000'
      });
    }

    const transaction = await walletService.manualAdjustBalance(
      req.params.userId,
      adjustmentAmount,
      req.user!.id,
      description.trim()
    );

    res.json({
      success: true,
      message: 'Balance adjusted successfully',
      data: { transaction }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to adjust balance'
    });
  }
});

// Get user's wallet transactions (admin only)
router.get('/wallets/:userId/transactions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await walletService.getWalletTransactions(req.params.userId, page, limit);

    res.json({
      success: true,
      data: {
        transactions: result.transactions,
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
      error: error instanceof Error ? error.message : 'Failed to get wallet transactions'
    });
  }
});

// Get user's wallet requests (admin only)
router.get('/wallets/:userId/requests', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await walletService.getUserWalletRequests(req.params.userId, page, limit);

    res.json({
      success: true,
      data: {
        requests: result.requests,
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
      error: error instanceof Error ? error.message : 'Failed to get wallet requests'
    });
  }
});

// Create wallet for user (admin only)
router.post('/wallets/:userId/create', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.createWallet(req.params.userId);

    res.status(201).json({
      success: true,
      message: 'Wallet created successfully',
      data: { wallet }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create wallet'
    });
  }
});

export default router;
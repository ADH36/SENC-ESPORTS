import { Router, Request, Response } from 'express';
import walletService from '../services/walletService.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user's wallet
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let wallet;
    try {
      wallet = await walletService.getWalletByUserId(req.user!.id);
    } catch (error) {
      // If wallet doesn't exist, create one
      if (error instanceof Error && error.message === 'Wallet not found') {
        wallet = await walletService.createWallet(req.user!.id);
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      data: { wallet }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wallet'
    });
  }
});

// Create wallet request (deposit/withdrawal)
router.post('/requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, userNotes, paymentMethod, paymentDetails } = req.body;

    // Validation
    if (!type || !['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request type. Must be deposit or withdrawal'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Amount limits
    if (amount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Amount cannot exceed $10,000'
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Minimum amount is $1'
      });
    }

    const request = await walletService.createWalletRequest(req.user!.id, {
      type,
      amount: parseFloat(amount),
      userNotes,
      paymentMethod,
      paymentDetails
    });

    res.status(201).json({
      success: true,
      message: 'Wallet request created successfully',
      data: { request }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create wallet request'
    });
  }
});

// Get user's wallet requests
router.get('/requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await walletService.getUserWalletRequests(req.user!.id, page, limit);

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

// Get wallet request by ID
router.get('/requests/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const request = await walletService.getWalletRequestById(req.params.id);
    
    // Ensure user can only access their own requests
    if (request.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

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

// Cancel wallet request
router.patch('/requests/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const request = await walletService.getWalletRequestById(req.params.id);
    
    // Ensure user can only cancel their own requests
    if (request.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Can only cancel pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only cancel pending requests'
      });
    }

    // Update request status to cancelled
    await walletService.processWalletRequest(req.params.id, req.user!.id, 'reject', 'Cancelled by user');

    res.json({
      success: true,
      message: 'Wallet request cancelled successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel wallet request'
    });
  }
});

// Get user's wallet transactions
router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await walletService.getWalletTransactions(req.user!.id, page, limit);

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

export default router;
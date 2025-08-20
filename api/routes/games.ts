import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import * as gameService from '../services/gameService';

const router = express.Router();

// Get all active games (public)
router.get('/', async (req, res) => {
  try {
    const games = await gameService.getAllActiveGames();
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get all games (admin only)
router.get('/admin', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const games = await gameService.getAllGames();
    res.json(games);
  } catch (error) {
    console.error('Error fetching all games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const game = await gameService.getGameById(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Create new game (admin only)
router.post('/',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('image_url').optional().isURL().withMessage('Image URL must be valid'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
  ],
  async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, description, image_url, status } = req.body;
      const game = await gameService.createGame({
        name,
        description,
        image_url,
        status: status || 'active'
      });
      
      res.status(201).json(game);
    } catch (error) {
      console.error('Error creating game:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Game name already exists' });
      }
      res.status(500).json({ error: 'Failed to create game' });
    }
  }
);

// Update game (admin only)
router.put('/:id',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('image_url').optional().isURL().withMessage('Image URL must be valid'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
  ],
  async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const gameId = parseInt(req.params.id);
      const updateData = req.body;
      
      const game = await gameService.updateGame(gameId, updateData);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      console.error('Error updating game:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Game name already exists' });
      }
      res.status(500).json({ error: 'Failed to update game' });
    }
  }
);

// Delete game (admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const gameId = parseInt(req.params.id);
    const success = await gameService.deleteGame(gameId);
    
    if (!success) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

export default router;
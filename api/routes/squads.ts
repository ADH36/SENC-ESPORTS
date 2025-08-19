import { Router, Request, Response } from 'express';
import squadService from '../services/squadService.js';
import { authenticateToken, requirePlayer, AuthRequest } from '../middleware/auth.js';
import { validateSquadCreation } from '../middleware/validation.js';

const router = Router();

// Get all squads
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const game = req.query.game as string;
    
    const result = await squadService.getAllSquads(page, limit, game);

    res.json({
      success: true,
      data: {
        squads: result.squads,
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
      error: error instanceof Error ? error.message : 'Failed to get squads'
    });
  }
});

// Create new squad
router.post('/', authenticateToken, requirePlayer, validateSquadCreation, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, game, isRecruiting } = req.body;
    
    const squad = await squadService.createSquad({
      name,
      description,
      game,
      captainId: req.user!.id,
      isRecruiting
    });

    res.status(201).json({
      success: true,
      message: 'Squad created successfully',
      data: { squad }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Squad creation failed'
    });
  }
});

// Get squad by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const squad = await squadService.getSquadById(req.params.id);
    
    res.json({
      success: true,
      data: { squad }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Squad not found'
    });
  }
});

// Update squad
router.put('/:id', authenticateToken, requirePlayer, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, game, isRecruiting, logoUrl } = req.body;
    
    const squad = await squadService.updateSquad(
      req.params.id,
      { name, description, game, isRecruiting, logoUrl },
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Squad updated successfully',
      data: { squad }

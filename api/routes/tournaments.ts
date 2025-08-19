import { Router, Request, Response } from 'express';
import tournamentService from '../services/tournamentService.js';
import { authenticateToken, requireManager, requirePlayer, AuthRequest } from '../middleware/auth.js';
import { validateTournamentCreation } from '../middleware/validation.js';

const router = Router();

// Get all tournaments
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const game = req.query.game as string;
    
    const result = await tournamentService.getAllTournaments(page, limit, status, game);

    res.json({
      success: true,
      data: {
        tournaments: result.tournaments,
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
      error: error instanceof Error ? error.message : 'Failed to get tournaments'
    });
  }
});

// Create new tournament (manager/admin only)
router.post('/', authenticateToken, requireManager, validateTournamentCreation, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      game,
      format,
      maxParticipants,
      prizePool,
      rules,
      registrationDeadline,
      startDate,
      endDate
    } = req.body;
    
    const tournament = await tournamentService.createTournament({
      name,
      game,
      format,
      maxParticipants,
      prizePool,
      rules,
      registrationDeadline: new Date(registrationDeadline),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      managerId: req.user!.id
    });

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: { tournament }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Tournament creation failed'
    });
  }
});

// Get tournament by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tournament = await tournamentService.getTournamentById(req.params.id);
    
    res.json({
      success: true,
      data: { tournament }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Tournament not found'
    });
  }
});

// Update tournament (manager/admin only)
router.put('/:id', authenticateToken, requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      game,
      format,
      maxParticipants,
      prizePool,
      rules,
      registrationDeadline,
      startDate,
      endDate,
      status,
      bannerUrl
    } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (game) updateData.game = game;
    if (format) updateData.format = format;
    if (maxParticipants) updateData.maxParticipants = maxParticipants;
    if (prizePool !== undefined) updateData.prizePool = prizePool;
    if (rules !== undefined) updateData.rules = rules;
    if (registrationDeadline) updateData.registrationDeadline = new Date(registrationDeadline);
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : undefined;
    if (status) updateData.status = status;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    
    const tournament = await tournamentService.updateTournament(
      req.params.id,
      updateData,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Tournament updated successfully',
      data: { tournament }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Tournament update failed'
    });
  }
});

// Delete tournament (manager/admin only)
router.delete('/:id', authenticateToken, requireManager, async (req: AuthRequest, res: Response) => {
  try {
    await tournamentService.deleteTournament(req.params.id, req.user!.id);

    res.json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Tournament deletion failed'
    });
  }
});

// Register for tournament
router.post('/:id/register', authenticateToken, requirePlayer, async (req: AuthRequest, res: Response) => {
  try {
    const { squadId } = req.body;
    
    const registration = await tournamentService.registerForTournament(
      req.params.id,
      req.user!.id,
      squadId
    );

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      data: { registration }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

// Get tournament registrations (manager/admin only)
router.get('/:id/registrations', authenticateToken, requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const registrations = await tournamentService.getTournamentRegistrations(req.params.id);
    
    res.json({
      success: true,
      data: { registrations }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Tournament not found'
    });
  }
});

// Update registration status (manager/admin only)
router.put('/registrations/:registrationId', authenticateToken, requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either approved or rejected'
      });
    }

    await tournamentService.updateRegistrationStatus(
      req.params.registrationId,
      status,
      req.user!.id
    );

    res.json({
      success: true,
      message: `Registration ${status} successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update registration status'
    });
  }
});

export default router;
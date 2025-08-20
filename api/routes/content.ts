import { Router, Request, Response } from 'express';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth.js';
import contentService from '../services/contentService.js';
import { validateYouTubeUrl } from '../middleware/validation.js';

const router = Router();

// Get all content items
router.get('/', async (req: Request, res: Response) => {
  try {
    const contentItems = await contentService.getAllContent();

    res.json({
      success: true,
      data: { contentItems }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get content items'
    });
  }
});

// Get content items for a tournament
router.get('/tournament/:tournamentId', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { type } = req.query;
    
    const contentItems = await contentService.getContentByTournament(
      tournamentId,
      type as string
    );

    res.json({
      success: true,
      data: { contentItems }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get content items'
    });
  }
});

// Create or update bracket content
router.post('/tournament/:tournamentId/bracket', 
  authenticateToken, 
  requireManager, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { tournamentId } = req.params;
      const { bracketData, title, description } = req.body;
      
      if (!bracketData) {
        return res.status(400).json({
          success: false,
          error: 'Bracket data is required'
        });
      }

      const contentItem = await contentService.createOrUpdateBracket({
        tournamentId,
        bracketData,
        title: title || 'Tournament Bracket',
        description,
        userId: req.user!.id
      });

      res.json({
        success: true,
        message: 'Bracket updated successfully',
        data: { contentItem }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update bracket'
      });
    }
  }
);

// Create YouTube embed
router.post('/tournament/:tournamentId/youtube', 
  authenticateToken, 
  requireManager,
  validateYouTubeUrl,
  async (req: AuthRequest, res: Response) => {
    try {
      const { tournamentId } = req.params;
      const { youtubeUrl, title, description, embedType } = req.body;
      
      const contentItem = await contentService.createYouTubeEmbed({
        tournamentId,
        youtubeUrl,
        title: title || 'Tournament Video',
        description,
        embedType: embedType || 'highlight',
        userId: req.user!.id
      });

      res.status(201).json({
        success: true,
        message: 'YouTube embed created successfully',
        data: { contentItem }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create YouTube embed'
      });
    }
  }
);

// Update YouTube embed
router.put('/youtube/:embedId', 
  authenticateToken, 
  requireManager,
  validateYouTubeUrl,
  async (req: AuthRequest, res: Response) => {
    try {
      const { embedId } = req.params;
      const { youtubeUrl, title, description, embedType, isActive } = req.body;
      
      const contentItem = await contentService.updateYouTubeEmbed(embedId, {
        youtubeUrl,
        title,
        description,
        embedType,
        isActive,
        userId: req.user!.id
      });

      res.json({
        success: true,
        message: 'YouTube embed updated successfully',
        data: { contentItem }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update YouTube embed'
      });
    }
  }
);

// Delete content item
router.delete('/:contentId', 
  authenticateToken, 
  requireManager, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { contentId } = req.params;
      
      await contentService.deleteContent(contentId, req.user!.id);

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete content'
      });
    }
  }
);

// Get audit trail for content
router.get('/:contentId/audit', 
  authenticateToken, 
  requireManager, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { contentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const auditLogs = await contentService.getAuditTrail(contentId, page, limit);

      res.json({
        success: true,
        data: { auditLogs }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get audit trail'
      });
    }
  }
);

// Get all audit logs for a tournament
router.get('/tournament/:tournamentId/audit', 
  authenticateToken, 
  requireManager, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { tournamentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const auditLogs = await contentService.getTournamentAuditTrail(tournamentId, page, limit);

      res.json({
        success: true,
        data: { auditLogs }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tournament audit trail'
      });
    }
  }
);

export default router;
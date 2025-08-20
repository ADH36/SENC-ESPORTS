import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import os from 'os';
import process from 'process';

const router = Router();

// Helper function to format uptime
function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
  const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
}

// Helper function to get CPU usage percentage
function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime();
    
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage);
      const endTime = process.hrtime(startTime);
      
      const totalTime = endTime[0] * 1000000 + endTime[1] / 1000; // microseconds
      const totalCpuTime = endUsage.user + endUsage.system; // microseconds
      
      const cpuPercent = Math.round((totalCpuTime / totalTime) * 100);
      resolve(Math.min(cpuPercent, 100)); // Cap at 100%
    }, 100);
  });
}

// Helper function to get memory usage percentage
function getMemoryUsage(): number {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  return Math.round((usedMemory / totalMemory) * 100);
}

// Helper function to get active connections (simplified)
function getActiveConnections(): number {
  // In a real application, you might track this through middleware or connection pools
  // For now, we'll return a simulated value based on process stats
  const loadAvg = os.loadavg()[0];
  return Math.round(loadAvg * 100) + Math.floor(Math.random() * 50);
}

// Get system statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('GET /api/system/stats - Request received');
    
    // Get server uptime
    const serverUptime = formatUptime(os.uptime());
    
    // Get CPU usage (async)
    const cpuUsage = await getCpuUsage();
    
    // Get memory usage
    const memoryUsage = getMemoryUsage();
    
    // Get active connections
    const activeConnections = getActiveConnections();
    
    const systemStats = {
      serverUptime,
      cpuUsage,
      memoryUsage,
      activeConnections,
      timestamp: new Date().toISOString()
    };
    
    console.log('System stats collected:', systemStats);
    
    res.json({
      success: true,
      data: systemStats
    });
  } catch (error) {
    console.error('Error in GET /api/system/stats:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get system statistics'
    });
  }
});

export default router;
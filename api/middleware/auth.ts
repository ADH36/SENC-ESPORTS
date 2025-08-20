import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('authenticateToken middleware - Request URL:', req.url);
    console.log('authenticateToken middleware - Headers:', req.headers);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Auth header:', authHeader);
    console.log('Extracted token:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('No token provided, returning 401');
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('Token decoded successfully:', decoded);
    
    // Get user from database
    const user = await db('users')
      .where({ id: decoded.userId, is_active: true })
      .first();
    
    console.log('User from database:', user);

    if (!user) {
      console.log('User not found or inactive, returning 401');
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    
    console.log('Authentication successful, user:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('requireRole middleware - Required roles:', roles);
    console.log('requireRole middleware - User:', req.user);
    
    if (!req.user) {
      console.log('No user in request, returning 401');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized. User role:', req.user.role, 'Required roles:', roles);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    console.log('Role authorization successful');
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireManager = requireRole(['manager', 'admin']);
export const requirePlayer = requireRole(['player', 'manager', 'admin']);
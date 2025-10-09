import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest, JWTPayload } from '../types';
import { StaffModel, StaffAuthModel } from '../models';

// Generate JWT token
export const generateToken = (userId: string, roles: string[] = []): string => {
  return jwt.sign(
    { 
      userId, 
      roles,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET!,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get staff authentication from MongoDB
      const staffAuth = await StaffAuthModel.findOne({ 
        authId: decoded.userId, 
        isActive: true 
      }).populate('staffId');

      if (!staffAuth) {
        res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
        return;
      }

      // Get staff details
      const staff = await StaffModel.findOne({ 
        staffId: staffAuth.staffId, 
        status: 'active' 
      });

      if (!staff) {
        res.status(401).json({
          success: false,
          error: 'Staff member not found or inactive'
        });
        return;
      }

      // Add user info to request
      req.user = {
        userId: staffAuth.authId,
        staffId: staffAuth.staffId,
        username: staffAuth.username,
        email: staffAuth.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
        position: staff.position,
        roles: staffAuth.roles || [],
        permissions: staffAuth.permissions || []
      };

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Permission-based authorization middleware
export const checkPermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Check if user has the required permission
      const userPermissions = req.user.permissions || [];
      
      if (!userPermissions.includes(permission)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        
        // Get staff authentication from MongoDB
        const staffAuth = await StaffAuthModel.findOne({ 
          authId: decoded.userId, 
          isActive: true 
        });

        if (staffAuth) {
          // Get staff details
          const staff = await StaffModel.findOne({ 
            staffId: staffAuth.staffId, 
            status: 'active' 
          });

          if (staff) {
            req.user = {
              userId: staffAuth.authId,
              staffId: staffAuth.staffId,
              username: staffAuth.username,
              email: staffAuth.email,
              firstName: staff.firstName,
              lastName: staff.lastName,
              department: staff.department,
              position: staff.position,
              roles: staffAuth.roles || [],
              permissions: staffAuth.permissions || []
            };
          }
        }
      } catch (error) {
        // Token is invalid, but we continue without user info
        logger.warn('Invalid token in optional auth:', (error as Error).message);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next();
  }
};

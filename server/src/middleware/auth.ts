import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getRow } from '../database/connection';
import { logger } from '../utils/logger';
import { AuthRequest, JWTPayload } from '../types';

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
      
      // Get user from database
      const user = await getRow(
        'SELECT u.*, s.first_name, s.last_name, s.department, s.position FROM users u LEFT JOIN staff s ON u.staff_id = s.staff_id WHERE u.user_id = ? AND u.is_active = 1',
        [decoded.userId]
      );

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
        return;
      }

      // Get user roles
      const roles = await getRow(
        'SELECT GROUP_CONCAT(role_name) as roles FROM user_roles WHERE user_id = ?',
        [decoded.userId]
      );

      // Add user info to request
      req.user = {
        userId: user.user_id,
        staffId: user.staff_id,
        patientId: user.patient_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.department,
        position: user.position,
        roles: roles?.roles ? roles.roles.split(',') : []
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

      // Get user permissions based on roles
      const permissions = await getRow(
        `SELECT GROUP_CONCAT(p.permission_name) as permissions 
         FROM user_roles ur 
         JOIN role_permissions rp ON ur.role_name = rp.role_name 
         JOIN permissions p ON rp.permission_name = p.permission_name 
         WHERE ur.user_id = ?`,
        [req.user.userId]
      );

      const userPermissions = permissions?.permissions ? permissions.permissions.split(',') : [];
      
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
        const user = await getRow(
          'SELECT u.*, s.first_name, s.last_name, s.department, s.position FROM users u LEFT JOIN staff s ON u.staff_id = s.staff_id WHERE u.user_id = ? AND u.is_active = 1',
          [decoded.userId]
        );

        if (user) {
          const roles = await getRow(
            'SELECT GROUP_CONCAT(role_name) as roles FROM user_roles WHERE user_id = ?',
            [decoded.userId]
          );

          req.user = {
            userId: user.user_id,
            staffId: user.staff_id,
            patientId: user.patient_id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            department: user.department,
            position: user.position,
            roles: roles?.roles ? roles.roles.split(',') : []
          };
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

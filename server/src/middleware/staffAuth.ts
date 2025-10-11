import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { StaffAuthRequest, JWTPayload } from '../types';
import { StaffModel, StaffAuthModel } from '../models';
import { getEnvConfig } from '../utils/env';

// Generate JWT token for staff
export const generateStaffToken = (authId: string, staffId: string, username: string, roles: string[] = []): string => {
  const config = getEnvConfig();
  const payload = { 
    authId,
    staffId,
    username,
    roles,
    userType: 'staff',
    iat: Math.floor(Date.now() / 1000)
  };
  return jwt.sign(payload, config.JWT_SECRET, { 
    expiresIn: '8h'
  });
};

// Verify JWT token for staff
export const verifyStaffToken = (token: string): JWTPayload => {
  try {
    const config = getEnvConfig();
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    if (decoded.userType !== 'staff') {
      throw new Error('Invalid token type for staff');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid staff token');
  }
};

// Staff authentication middleware
export const authenticateStaff = async (req: StaffAuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
        error: 'Access token required for staff authentication'
      });
      return;
    }

    try {
      // Verify token
      const decoded = verifyStaffToken(token);
      
      // Get staff authentication from MongoDB
      const staffAuth = await StaffAuthModel.findOne({ 
        authId: decoded.authId, 
        isActive: true 
      });

      if (!staffAuth) {
        res.status(401).json({
          success: false,
          error: 'Staff authentication not found or inactive'
        });
        return;
      }

      // Check if account is locked
      if ((staffAuth as any).lockedUntil && new Date((staffAuth as any).lockedUntil) > new Date()) {
        res.status(423).json({
          success: false,
          error: 'Staff account is temporarily locked'
        });
        return;
      }

      // Get staff details
      const staff = await StaffModel.findOne({ 
        staffId: (staffAuth as any).staffId, 
        status: 'active' 
      });

      if (!staff) {
        res.status(401).json({
          success: false,
          error: 'Staff member not found or inactive'
        });
        return;
      }

      // Add staff info to request
      req.user = {
        authId: (staffAuth as any).authId,
        staffId: (staffAuth as any).staffId,
        username: (staffAuth as any).username,
        email: (staffAuth as any).email,
        roles: (staffAuth as any).roles || [],
        permissions: (staffAuth as any).permissions || []
      };

      next();
    } catch (error) {
      logger.error('Staff token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid staff authentication token'
      });
    }
  } catch (error) {
    logger.error('Staff authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Staff authentication failed'
    });
  }
};

// Role-based authorization middleware for staff
export const authorizeStaff = (...roles: string[]) => {
  return (req: StaffAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Staff authentication required'
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Insufficient role permissions'
      });
      return;
    }

    next();
  };
};

// Permission-based authorization middleware for staff
export const checkStaffPermission = (permission: string) => {
  return (req: StaffAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Staff authentication required'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Optional staff authentication middleware (doesn't fail if no token)
export const optionalStaffAuth = async (req: StaffAuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyStaffToken(token);
        
        // Get staff authentication from MongoDB
        const staffAuth = await StaffAuthModel.findOne({ 
          authId: decoded.authId, 
          isActive: true 
        });

        if (staffAuth) {
          // Get staff details
          const staff = await StaffModel.findOne({ 
            staffId: (staffAuth as any).staffId, 
            status: 'active' 
          });

          if (staff) {
            req.user = {
              authId: (staffAuth as any).authId,
              staffId: (staffAuth as any).staffId,
              username: (staffAuth as any).username,
              email: (staffAuth as any).email,
              roles: (staffAuth as any).roles || [],
              permissions: (staffAuth as any).permissions || []
            };
          }
        }
      } catch (error) {
        // Token is invalid, but we continue without user info
        logger.warn('Invalid staff token in optional auth:', (error as Error).message);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional staff authentication error:', error);
    next();
  }
};

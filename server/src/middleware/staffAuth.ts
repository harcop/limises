import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { getRow } from '../database/connection';
import { logger } from '../utils/logger';
import { StaffAuthRequest, StaffAuth, JWTPayload } from '../types';

// Generate JWT token for staff
export const generateStaffToken = (authId: string, staffId: string, username: string, roles: string[] = []): string => {
  return jwt.sign(
    { 
      authId,
      staffId,
      username,
      roles,
      userType: 'staff',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET!,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '8h' // Shorter expiry for staff
    }
  );
};

// Verify JWT token for staff
export const verifyStaffToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
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
      
      // Get staff authentication from database
      const staffAuth = await getRow(
        `SELECT sa.*, s.first_name, s.last_name, s.department, s.position, s.status as staff_status
         FROM staff_auth sa 
         JOIN staff s ON sa.staff_id = s.staff_id 
         WHERE sa.auth_id = ? AND sa.is_active = 1 AND s.status = 'active'`,
        [decoded.authId]
      );

      if (!staffAuth) {
        res.status(401).json({
          success: false,
          error: 'Staff authentication not found or inactive'
        });
        return;
      }

      // Check if account is locked
      if (staffAuth.locked_until && new Date(staffAuth.locked_until) > new Date()) {
        res.status(423).json({
          success: false,
          error: 'Staff account is temporarily locked'
        });
        return;
      }

      // Get staff roles
      const roles = await getRow(
        `SELECT GROUP_CONCAT(sr.role_name) as roles 
         FROM staff_role_assignments sra 
         JOIN staff_roles sr ON sra.role_id = sr.role_id 
         WHERE sra.staff_id = ? AND sra.is_active = 1 AND sr.is_active = 1`,
        [staffAuth.staff_id]
      );

      // Get staff permissions
      const permissions = await getRow(
        `SELECT GROUP_CONCAT(p.permission_name) as permissions 
         FROM staff_role_assignments sra 
         JOIN staff_roles sr ON sra.role_id = sr.role_id 
         JOIN role_permissions rp ON sr.role_id = rp.role_id 
         JOIN permissions p ON rp.permission_id = p.permission_id 
         WHERE sra.staff_id = ? AND sra.is_active = 1 AND sr.is_active = 1 AND p.is_active = 1`,
        [staffAuth.staff_id]
      );

      // Add staff info to request
      req.user = {
        authId: staffAuth.auth_id,
        staffId: staffAuth.staff_id,
        username: staffAuth.username,
        email: staffAuth.email,
        roles: roles?.roles ? roles.roles.split(',') : [],
        permissions: permissions?.permissions ? permissions.permissions.split(',') : []
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
export const optionalStaffAuth = async (req: StaffAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyStaffToken(token);
        const staffAuth = await getRow(
          `SELECT sa.*, s.first_name, s.last_name, s.department, s.position, s.status as staff_status
           FROM staff_auth sa 
           JOIN staff s ON sa.staff_id = s.staff_id 
           WHERE sa.auth_id = ? AND sa.is_active = 1 AND s.status = 'active'`,
          [decoded.authId]
        );

        if (staffAuth) {
          const roles = await getRow(
            `SELECT GROUP_CONCAT(sr.role_name) as roles 
             FROM staff_role_assignments sra 
             JOIN staff_roles sr ON sra.role_id = sr.role_id 
             WHERE sra.staff_id = ? AND sra.is_active = 1 AND sr.is_active = 1`,
            [staffAuth.staff_id]
          );

          const permissions = await getRow(
            `SELECT GROUP_CONCAT(p.permission_name) as permissions 
             FROM staff_role_assignments sra 
             JOIN staff_roles sr ON sra.role_id = sr.role_id 
             JOIN role_permissions rp ON sr.role_id = rp.role_id 
             JOIN permissions p ON rp.permission_id = p.permission_id 
             WHERE sra.staff_id = ? AND sra.is_active = 1 AND sr.is_active = 1 AND p.is_active = 1`,
            [staffAuth.staff_id]
          );

          req.user = {
            authId: staffAuth.auth_id,
            staffId: staffAuth.staff_id,
            username: staffAuth.username,
            email: staffAuth.email,
            roles: roles?.roles ? roles.roles.split(',') : [],
            permissions: permissions?.permissions ? permissions.permissions.split(',') : []
          };
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

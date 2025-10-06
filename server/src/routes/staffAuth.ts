import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { generateStaffToken, authenticateStaff } from '../middleware/staffAuth';
import { runQuery, getRow } from '../database/connection';
import { generateId, generateStaffId, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest } from '../types';

const router = express.Router();

// Validation middleware
const validateStaffLogin = [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

const validateStaffRegister = [
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required'),
  body('department').trim().isLength({ min: 1, max: 100 }).withMessage('Department is required'),
  body('position').trim().isLength({ min: 1, max: 100 }).withMessage('Position is required'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
];

const validatePasswordChange = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];

// @route   POST /api/staff/auth/login
// @desc    Authenticate staff and get token
// @access  Public
router.post('/login', validateStaffLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { username, password } = req.body;

    // Get staff authentication from database
    const staffAuth = await getRow(
      `SELECT sa.*, s.first_name, s.last_name, s.department, s.position, s.status as staff_status
       FROM staff_auth sa 
       JOIN staff s ON sa.staff_id = s.staff_id 
       WHERE sa.username = ? AND sa.is_active = 1 AND s.status = 'active'`,
      [username]
    );

    if (!staffAuth) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Check if account is locked
    if (staffAuth.locked_until && new Date(staffAuth.locked_until) > new Date()) {
      res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, staffAuth.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = staffAuth.failed_login_attempts + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 minutes after 5 failed attempts
      
      await runQuery(
        'UPDATE staff_auth SET failed_login_attempts = ?, locked_until = ? WHERE auth_id = ?',
        [failedAttempts, lockUntil, staffAuth.auth_id]
      );

      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Reset failed login attempts on successful login
    await runQuery(
      'UPDATE staff_auth SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE auth_id = ?',
      [staffAuth.auth_id]
    );

    // Get staff roles
    const roles = await getRow(
      `SELECT GROUP_CONCAT(sr.role_name) as roles 
       FROM staff_role_assignments sra 
       JOIN staff_roles sr ON sra.role_id = sr.role_id 
       WHERE sra.staff_id = ? AND sra.is_active = 1 AND sr.is_active = 1`,
      [staffAuth.staff_id]
    );

    const userRoles = roles?.roles ? roles.roles.split(',') : [];

    // Generate JWT token
    const token = generateStaffToken(staffAuth.auth_id, staffAuth.staff_id, staffAuth.username, userRoles);

    logger.info(`Staff logged in: ${username} (${staffAuth.staff_id})`);

    res.json({
      success: true,
      message: 'Staff login successful',
      token,
      user: {
        authId: staffAuth.auth_id,
        staffId: staffAuth.staff_id,
        username: staffAuth.username,
        email: staffAuth.email,
        firstName: staffAuth.first_name,
        lastName: staffAuth.last_name,
        department: staffAuth.department,
        position: staffAuth.position,
        roles: userRoles
      }
    });

  } catch (error) {
    logger.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during staff login'
    });
  }
});

// @route   POST /api/staff/auth/register
// @desc    Register a new staff member
// @access  Private (Admin only)
router.post('/register', authenticateStaff, async (req: StaffAuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    // Check if user has admin role
    if (!req.user?.roles.includes('admin')) {
      res.status(403).json({
        success: false,
        error: 'Only administrators can register new staff members'
      });
      return;
    }

    const { username, password, email, firstName, lastName, department, position, hireDate, ...additionalData } = req.body;

    // Check if username or email already exists
    const existingAuth = await getRow(
      'SELECT auth_id FROM staff_auth WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingAuth) {
      res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate IDs
    const staffId = generateStaffId();
    const authId = generateId('AUTH', 6);

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Create staff record
      await runQuery(
        `INSERT INTO staff (
          staff_id, employee_id, first_name, last_name, email, department, position, 
          hire_date, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
        [
          staffId,
          generateId('EMP', 6),
          sanitizeString(firstName),
          sanitizeString(lastName),
          sanitizeString(email),
          sanitizeString(department),
          sanitizeString(position),
          hireDate
        ]
      );

      // Create staff authentication record
      await runQuery(
        `INSERT INTO staff_auth (
          auth_id, staff_id, username, email, password_hash, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [authId, staffId, sanitizeString(username), sanitizeString(email), passwordHash]
      );

      // Assign default role (staff)
      const defaultRole = await getRow('SELECT role_id FROM staff_roles WHERE role_name = ?', ['staff']);
      if (defaultRole) {
        await runQuery(
          `INSERT INTO staff_role_assignments (
            assignment_id, staff_id, role_id, assigned_by, assigned_date, created_at
          ) VALUES (?, ?, ?, ?, CURRENT_DATE, CURRENT_TIMESTAMP)`,
          [generateId('ASGN', 6), staffId, defaultRole.role_id, req.user.staffId]
        );
      }

      await runQuery('COMMIT');

      logger.info(`Staff registered: ${username} (${staffId}) by ${req.user.username}`);

      res.status(201).json({
        success: true,
        message: 'Staff member registered successfully',
        staff: {
          staffId,
          authId,
          username,
          email,
          firstName,
          lastName,
          department,
          position
        }
      });

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Staff registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during staff registration'
    });
  }
});

// @route   GET /api/staff/auth/me
// @desc    Get current staff profile
// @access  Private
router.get('/me', authenticateStaff, async (req: StaffAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Staff authentication required'
      });
      return;
    }

    const { staffId } = req.user;

    // Get staff details
    const staff = await getRow(
      `SELECT s.*, sa.username, sa.email_verified, sa.last_login, sa.two_factor_enabled
       FROM staff s 
       JOIN staff_auth sa ON s.staff_id = sa.staff_id
       WHERE s.staff_id = ?`,
      [staffId]
    );

    if (!staff) {
      res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
      return;
    }

    // Get staff roles
    const roles = await getRow(
      `SELECT GROUP_CONCAT(sr.role_name) as roles 
       FROM staff_role_assignments sra 
       JOIN staff_roles sr ON sra.role_id = sr.role_id 
       WHERE sra.staff_id = ? AND sra.is_active = 1 AND sr.is_active = 1`,
      [staffId]
    );

    const userRoles = roles?.roles ? roles.roles.split(',') : [];

    res.json({
      success: true,
      staff: {
        staffId: staff.staff_id,
        employeeId: staff.employee_id,
        username: staff.username,
        email: staff.email,
        firstName: staff.first_name,
        lastName: staff.last_name,
        middleName: staff.middle_name,
        phone: staff.phone,
        department: staff.department,
        position: staff.position,
        hireDate: staff.hire_date,
        employmentType: staff.employment_type,
        status: staff.status,
        emailVerified: staff.email_verified,
        lastLogin: staff.last_login,
        twoFactorEnabled: staff.two_factor_enabled,
        roles: userRoles,
        createdAt: staff.created_at
      }
    });

  } catch (error) {
    logger.error('Get staff profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving staff profile'
    });
  }
});

// @route   PUT /api/staff/auth/change-password
// @desc    Change staff password
// @access  Private
router.put('/change-password', authenticateStaff, validatePasswordChange, async (req: StaffAuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Staff authentication required'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const { authId } = req.user;

    // Get current staff authentication
    const staffAuth = await getRow(
      'SELECT password_hash FROM staff_auth WHERE auth_id = ?',
      [authId]
    );

    if (!staffAuth) {
      res.status(404).json({
        success: false,
        error: 'Staff authentication not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, staffAuth.password_hash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await runQuery(
      'UPDATE staff_auth SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE auth_id = ?',
      [newPasswordHash, authId]
    );

    logger.info(`Password changed for staff: ${req.user.username} (${req.user.staffId})`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change staff password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    });
  }
});

// @route   POST /api/staff/auth/logout
// @desc    Logout staff (client-side token removal)
// @access  Private
router.post('/logout', authenticateStaff, async (req: StaffAuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      logger.info(`Staff logged out: ${req.user.username} (${req.user.staffId})`);
    }

    res.json({
      success: true,
      message: 'Staff logout successful'
    });

  } catch (error) {
    logger.error('Staff logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during staff logout'
    });
  }
});

export default router;

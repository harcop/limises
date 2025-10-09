import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { generateToken } from '../middleware/auth';
import { runQuery, getRow } from '../database/connection';
import { generateId, generateStaffId, generatePatientId, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

const router = express.Router();

// Validation middleware
const validateLogin = [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

const validateRegister = [
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('userType').isIn(['staff', 'patient']).withMessage('User type must be staff or patient'),
];

const validatePasswordChange = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
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

    // Get user from database
    const user = await getRow(
      `SELECT u.*, s.first_name, s.last_name, s.department, s.position, p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM users u 
       LEFT JOIN staff s ON u.staff_id = s.staff_id 
       LEFT JOIN patients p ON u.patient_id = p.patient_id
       WHERE u.username = ? AND u.is_active = 1`,
      [username]
    );

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Get user roles
    const roles = await getRow(
      'SELECT GROUP_CONCAT(role_name) as roles FROM user_roles WHERE user_id = ?',
      [user.user_id]
    );

    const userRoles = roles?.roles ? roles.roles.split(',') : [];

    // Generate JWT token
    const token = generateToken(user.user_id, userRoles);

    logger.info(`User logged in: ${username} (${user.user_id})`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        userType: user.staff_id ? 'staff' : 'patient',
        firstName: user.first_name || user.patient_first_name,
        lastName: user.last_name || user.patient_last_name,
        department: user.department,
        position: user.position,
        roles: userRoles
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, async (req: Request, res: Response): Promise<void> => {
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

    const { username, password, email, userType, ...additionalData } = req.body;

    // Check if user already exists
    const existingUser = await getRow(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this username or email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = generateId('USER', 6);

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Create user record
      await runQuery(
        'INSERT INTO users (user_id, username, password_hash, email, is_active, created_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)',
        [userId, sanitizeString(username), passwordHash, sanitizeString(email)]
      );

      let staffId: string | null = null;
      let patientId: string | null = null;

      if (userType === 'staff') {
        // Create staff record
        staffId = generateStaffId();
        await runQuery(
          `INSERT INTO staff (
            staff_id, user_id, first_name, last_name, email, department, position, 
            hire_date, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active', CURRENT_TIMESTAMP)`,
          [
            staffId,
            userId,
            sanitizeString(additionalData.firstName),
            sanitizeString(additionalData.lastName),
            sanitizeString(email),
            sanitizeString(additionalData.department),
            sanitizeString(additionalData.position)
          ]
        );

        // Update user with staff_id
        await runQuery(
          'UPDATE users SET staff_id = ? WHERE user_id = ?',
          [staffId, userId]
        );

        // Assign default role
        await runQuery(
          'INSERT INTO user_roles (user_id, role_name, assigned_date) VALUES (?, ?, CURRENT_DATE)',
          [userId, 'staff']
        );
      } else if (userType === 'patient') {
        // Create patient record
        patientId = generatePatientId();
        await runQuery(
          `INSERT INTO patients (
            patient_id, user_id, first_name, last_name, date_of_birth, gender, 
            phone, email, address, city, state, zip_code, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
          [
            patientId,
            userId,
            sanitizeString(additionalData.firstName),
            sanitizeString(additionalData.lastName),
            additionalData.dateOfBirth,
            additionalData.gender,
            sanitizeString(additionalData.phone),
            sanitizeString(email),
            sanitizeString(additionalData.address),
            sanitizeString(additionalData.city),
            sanitizeString(additionalData.state),
            sanitizeString(additionalData.zipCode)
          ]
        );

        // Update user with patient_id
        await runQuery(
          'UPDATE users SET patient_id = ? WHERE user_id = ?',
          [patientId, userId]
        );

        // Assign patient role
        await runQuery(
          'INSERT INTO user_roles (user_id, role_name, assigned_date) VALUES (?, ?, CURRENT_DATE)',
          [userId, 'patient']
        );
      }

      await runQuery('COMMIT');

      logger.info(`User registered: ${username} (${userId}) as ${userType}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          userId,
          username,
          email,
          userType,
          staffId,
          patientId
        }
      });

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { userId } = req.user;

    // Get user details
    const user = await getRow(
      `SELECT u.*, s.first_name, s.last_name, s.department, s.position, s.phone as staff_phone,
              p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone
       FROM users u 
       LEFT JOIN staff s ON u.staff_id = s.staff_id 
       LEFT JOIN patients p ON u.patient_id = p.patient_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Get user roles
    const roles = await getRow(
      'SELECT GROUP_CONCAT(role_name) as roles FROM user_roles WHERE user_id = ?',
      [userId]
    );

    const userRoles = roles?.roles ? roles.roles.split(',') : [];

    res.json({
      success: true,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        userType: user.staff_id ? 'staff' : 'patient',
        firstName: user.first_name || user.patient_first_name,
        lastName: user.last_name || user.patient_last_name,
        phone: user.staff_phone || user.patient_phone,
        department: user.department,
        position: user.position,
        roles: userRoles,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving user profile'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', validatePasswordChange, async (req: AuthRequest, res: Response): Promise<void> => {
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
        error: 'Authentication required'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    // Get current user
    const user = await getRow(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
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
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [newPasswordHash, userId]
    );

    logger.info(`Password changed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      logger.info(`User logged out: ${req.user.username} (${req.user.userId})`);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
});

export default router;

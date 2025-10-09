import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { generateStaffToken, authenticateStaff } from '../middleware/staffAuth';
import { generateId, generateStaffId, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest } from '../types';
import { StaffModel, StaffAuthModel } from '../models';

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

    // Get staff authentication from MongoDB
    const staffAuth = await StaffAuthModel.findOne({ 
      username: username, 
      isActive: true 
    });

    if (!staffAuth) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Check if account is locked
    if (staffAuth.lockedUntil && new Date(staffAuth.lockedUntil) > new Date()) {
      res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, staffAuth.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = staffAuth.failedLoginAttempts + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 minutes after 5 failed attempts
      
      await StaffAuthModel.findOneAndUpdate(
        { authId: staffAuth.authId },
        { 
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockUntil
        }
      );

      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
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

    // Reset failed login attempts on successful login
    await StaffAuthModel.findOneAndUpdate(
      { authId: staffAuth.authId },
      { 
        failedLoginAttempts: 0, 
        lockedUntil: null, 
        lastLogin: new Date()
      }
    );

    // Generate JWT token
    const token = generateStaffToken(staffAuth.authId, staffAuth.staffId, staffAuth.username, staffAuth.roles || []);

    logger.info(`Staff logged in: ${username} (${staffAuth.staffId})`);

    res.json({
      success: true,
      message: 'Staff login successful',
      token,
      user: {
        authId: staffAuth.authId,
        staffId: staffAuth.staffId,
        username: staffAuth.username,
        email: staffAuth.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
        position: staff.position,
        roles: staffAuth.roles || []
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
    const existingAuth = await StaffAuthModel.findOne({
      $or: [{ username }, { email }]
    });

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

    try {
      // Create staff record
      const staff = new StaffModel({
        staffId,
        employeeId: generateId('EMP', 6),
        firstName: sanitizeString(firstName),
        lastName: sanitizeString(lastName),
        email: sanitizeString(email),
        department: sanitizeString(department),
        position: sanitizeString(position),
        hireDate: new Date(hireDate),
        employmentType: 'full_time',
        status: 'active'
      });

      await staff.save();

      // Create staff authentication record
      const staffAuth = new StaffAuthModel({
        authId,
        staffId,
        username: sanitizeString(username),
        email: sanitizeString(email),
        password: passwordHash,
        isActive: true,
        roles: ['staff']
      });

      await staffAuth.save();

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
      logger.error('Staff registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during staff registration'
      });
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
    const staff = await StaffModel.findOne({ staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
      return;
    }

    // Get staff authentication details
    const staffAuth = await StaffAuthModel.findOne({ staffId });

    if (!staffAuth) {
      res.status(404).json({
        success: false,
        error: 'Staff authentication not found'
      });
      return;
    }

    res.json({
      success: true,
      staff: {
        staffId: staff.staffId,
        employeeId: staff.employeeId,
        username: staffAuth.username,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        middleName: staff.middleName,
        phone: staff.phone,
        department: staff.department,
        position: staff.position,
        hireDate: staff.hireDate,
        employmentType: staff.employmentType,
        status: staff.status,
        emailVerified: staffAuth.emailVerified,
        lastLogin: staffAuth.lastLogin,
        twoFactorEnabled: staffAuth.twoFactorEnabled,
        roles: staffAuth.roles || [],
        createdAt: staff.createdAt
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
    const staffAuth = await StaffAuthModel.findOne({ authId });

    if (!staffAuth) {
      res.status(404).json({
        success: false,
        error: 'Staff authentication not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, staffAuth.password);
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
    await StaffAuthModel.findOneAndUpdate(
      { authId },
      { password: newPasswordHash }
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

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { generateToken } from '../middleware/auth';
import { generateId, generateStaffId, generatePatientId, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';
import { StaffModel, StaffAuthModel, PatientModel } from '../models';

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

    // Try to find staff authentication first
    let staffAuth = await StaffAuthModel.findOne({ 
      username: username, 
      isActive: true 
    });

    if (staffAuth) {
      // Check password
      const isPasswordValid = await bcrypt.compare(password, staffAuth.password);
      if (!isPasswordValid) {
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

      // Generate JWT token
      const token = generateToken(staffAuth.authId, staffAuth.roles || []);

      logger.info(`Staff logged in: ${username} (${staffAuth.authId})`);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          userId: staffAuth.authId,
          username: staffAuth.username,
          email: staffAuth.email,
          userType: 'staff',
          firstName: staff.firstName,
          lastName: staff.lastName,
          department: staff.department,
          position: staff.position,
          roles: staffAuth.roles || []
        }
      });
      return;
    }

    // If not staff, try patient authentication (if implemented)
    // For now, return error for non-staff users
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
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
    const existingStaffAuth = await StaffAuthModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingStaffAuth) {
      res.status(400).json({
        success: false,
        error: 'User with this username or email already exists'
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
      if (userType === 'staff') {
        // Create staff record
        const staff = new StaffModel({
          staffId,
          employeeId: generateId('EMP', 6),
          firstName: sanitizeString(additionalData.firstName),
          lastName: sanitizeString(additionalData.lastName),
          email: sanitizeString(email),
          department: sanitizeString(additionalData.department),
          position: sanitizeString(additionalData.position),
          hireDate: new Date(),
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

        logger.info(`Staff registered: ${username} (${authId})`);

        res.status(201).json({
          success: true,
          message: 'Staff registered successfully',
          user: {
            userId: authId,
            username,
            email,
            userType: 'staff',
            staffId
          }
        });
      } else if (userType === 'patient') {
        // Create patient record
        const patientId = generatePatientId();
        const patient = new PatientModel({
          patientId,
          firstName: sanitizeString(additionalData.firstName),
          lastName: sanitizeString(additionalData.lastName),
          dateOfBirth: additionalData.dateOfBirth,
          gender: additionalData.gender,
          phone: sanitizeString(additionalData.phone),
          email: sanitizeString(email),
          address: sanitizeString(additionalData.address),
          city: sanitizeString(additionalData.city),
          state: sanitizeString(additionalData.state),
          zipCode: sanitizeString(additionalData.zipCode),
          status: 'active'
        });

        await patient.save();

        logger.info(`Patient registered: ${username} (${patientId})`);

        res.status(201).json({
          success: true,
          message: 'Patient registered successfully',
          user: {
            userId: patientId,
            username,
            email,
            userType: 'patient',
            patientId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid user type'
        });
      }

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during registration'
      });
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

    // Get staff authentication details
    const staffAuth = await StaffAuthModel.findOne({ authId: userId });

    if (!staffAuth) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Get staff details
    const staff = await StaffModel.findOne({ staffId: staffAuth.staffId });

    if (!staff) {
      res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        userId: staffAuth.authId,
        username: staffAuth.username,
        email: staffAuth.email,
        userType: 'staff',
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        department: staff.department,
        position: staff.position,
        roles: staffAuth.roles || [],
        isActive: staffAuth.isActive,
        createdAt: staffAuth.createdAt
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

    // Get current staff authentication
    const staffAuth = await StaffAuthModel.findOne({ authId: userId });

    if (!staffAuth) {
      res.status(404).json({
        success: false,
        error: 'User not found'
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
      { authId: userId },
      { password: newPasswordHash }
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

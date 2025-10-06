import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateStaff, validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateStaffId,
  formatDate, 
  formatTime 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/staff
// @desc    Create a new staff member
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), validateStaff, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      department,
      position,
      hireDate,
      salary
    } = req.body;

    // Check if email already exists
    const existingStaff = await getRow(
      'SELECT staff_id FROM staff WHERE email = ?',
      [email]
    );

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        error: 'Staff member with this email already exists'
      });
    }

    // Generate staff ID
    const staffId = generateStaffId();

    await runQuery(
      `INSERT INTO staff (
        staff_id, first_name, last_name, middle_name, email, phone, address, city, state, zip_code,
        department, position, hire_date, salary, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
      [
        staffId,
        firstName,
        lastName,
        middleName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        department,
        position,
        formatDate(hireDate),
        salary
      ]
    );

    logger.info(`Staff member created: ${staffId} - ${firstName} ${lastName} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: {
        staffId,
        firstName,
        lastName,
        email,
        department,
        position,
        status: 'active'
      }
    });

  } catch (error) {
    logger.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating staff member'
    });
  }
});

// @route   GET /api/staff
// @desc    Get all staff members with filters
// @access  Private (Staff only)
router.get('/', authenticate, authorize('receptionist', 'admin', 'manager'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      department,
      position,
      status,
      search
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (department) {
      whereClause += ' AND department = ?';
      params.push(department);
    }

    if (position) {
      whereClause += ' AND position = ?';
      params.push(position);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM staff ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get staff members
    const staff = await getAll(
      `SELECT 
        staff_id, first_name, last_name, middle_name, email, phone, department, position,
        hire_date, status, created_at
       FROM staff 
       ${whereClause}
       ORDER BY last_name, first_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving staff members'
    });
  }
});

// @route   GET /api/staff/:staffId
// @desc    Get staff member by ID
// @access  Private (Staff only)
router.get('/:staffId', authenticate, authorize('receptionist', 'admin', 'manager'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;

    const staff = await getRow(
      'SELECT * FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      staff
    });

  } catch (error) {
    logger.error('Get staff member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving staff member'
    });
  }
});

// @route   PUT /api/staff/:staffId
// @desc    Update staff member
// @access  Private (Admin only)
router.put('/:staffId', authenticate, authorize('admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;
    const updates = req.body;

    // Check if staff member exists
    const existingStaff = await getRow(
      'SELECT staff_id FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Check for email conflicts if email is being updated
    if (updates.email) {
      const emailConflict = await getRow(
        'SELECT staff_id FROM staff WHERE email = ? AND staff_id != ?',
        [updates.email, staffId]
      );

      if (emailConflict) {
        return res.status(400).json({
          success: false,
          error: 'Another staff member with this email already exists'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'email', 'phone', 'address', 'city', 'state', 'zipCode',
      'department', 'position', 'hireDate', 'salary', 'status'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        if (key === 'hireDate') {
          updateValues.push(formatDate(value));
        } else {
          updateValues.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(staffId);

    await runQuery(
      `UPDATE staff SET ${updateFields.join(', ')} WHERE staff_id = ?`,
      updateValues
    );

    logger.info(`Staff member updated: ${staffId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    logger.error('Update staff member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating staff member'
    });
  }
});

// @route   POST /api/staff/:staffId/schedule
// @desc    Add staff schedule
// @access  Private (Admin, Manager only)
router.post('/:staffId/schedule', authenticate, authorize('admin', 'manager'), validateId, [
  require('express-validator').body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Valid day of week is required'),
  require('express-validator').body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM format)'),
  require('express-validator').body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM format)'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { staffId } = req.params;
    const {
      dayOfWeek,
      startTime,
      endTime,
      breakStartTime,
      breakEndTime,
      isAvailable
    } = req.body;

    // Check if staff member exists
    const staff = await getRow(
      'SELECT staff_id, first_name, last_name FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Check if schedule already exists for this day
    const existingSchedule = await getRow(
      'SELECT schedule_id FROM staff_schedules WHERE staff_id = ? AND day_of_week = ?',
      [staffId, dayOfWeek]
    );

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        error: 'Schedule already exists for this day'
      });
    }

    // Generate schedule ID
    const scheduleId = `SCHED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await runQuery(
      `INSERT INTO staff_schedules (
        schedule_id, staff_id, day_of_week, start_time, end_time, break_start_time, break_end_time,
        is_available, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        scheduleId,
        staffId,
        dayOfWeek,
        formatTime(startTime),
        formatTime(endTime),
        breakStartTime ? formatTime(breakStartTime) : null,
        breakEndTime ? formatTime(breakEndTime) : null,
        isAvailable !== false ? 1 : 0
      ]
    );

    logger.info(`Staff schedule added: ${scheduleId} for staff ${staffId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Staff schedule added successfully',
      schedule: {
        scheduleId,
        staffId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable !== false
      }
    });

  } catch (error) {
    logger.error('Add staff schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding staff schedule'
    });
  }
});

// @route   GET /api/staff/:staffId/schedule
// @desc    Get staff member's schedule
// @access  Private (Staff only)
router.get('/:staffId/schedule', authenticate, authorize('receptionist', 'admin', 'manager'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;

    // Check if staff member exists
    const staff = await getRow(
      'SELECT staff_id, first_name, last_name FROM staff WHERE staff_id = ?',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    const schedule = await getAll(
      'SELECT * FROM staff_schedules WHERE staff_id = ? ORDER BY day_of_week',
      [staffId]
    );

    res.json({
      success: true,
      staff: {
        staffId: staff.staff_id,
        firstName: staff.first_name,
        lastName: staff.last_name
      },
      schedule
    });

  } catch (error) {
    logger.error('Get staff schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving staff schedule'
    });
  }
});

// @route   GET /api/staff/departments
// @desc    Get all departments
// @access  Private (Staff only)
router.get('/departments', authenticate, authorize('receptionist', 'admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await getAll(
      'SELECT DISTINCT department FROM staff WHERE department IS NOT NULL AND department != "" ORDER BY department'
    );

    res.json({
      success: true,
      departments: departments.map(dept => dept.department)
    });

  } catch (error) {
    logger.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving departments'
    });
  }
});

// @route   GET /api/staff/positions
// @desc    Get all positions
// @access  Private (Staff only)
router.get('/positions', authenticate, authorize('receptionist', 'admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const positions = await getAll(
      'SELECT DISTINCT position FROM staff WHERE position IS NOT NULL AND position != "" ORDER BY position'
    );

    res.json({
      success: true,
      positions: positions.map(pos => pos.position)
    });

  } catch (error) {
    logger.error('Get positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving positions'
    });
  }
});

// @route   GET /api/staff/stats
// @desc    Get staff statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get staff statistics by department
    const departmentStats = await getAll(
      `SELECT 
        department,
        COUNT(*) as total_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_staff,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_staff
       FROM staff 
       WHERE department IS NOT NULL AND department != ""
       GROUP BY department
       ORDER BY department`
    );

    // Get staff statistics by position
    const positionStats = await getAll(
      `SELECT 
        position,
        COUNT(*) as total_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff
       FROM staff 
       WHERE position IS NOT NULL AND position != ""
       GROUP BY position
       ORDER BY position`
    );

    // Get overall statistics
    const overallStats = await getRow(
      `SELECT 
        COUNT(*) as total_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_staff,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_staff,
        COUNT(DISTINCT department) as total_departments,
        COUNT(DISTINCT position) as total_positions
       FROM staff`
    );

    res.json({
      success: true,
      stats: {
        overall: overallStats,
        byDepartment: departmentStats,
        byPosition: positionStats
      }
    });

  } catch (error) {
    logger.error('Get staff stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving staff statistics'
    });
  }
});

export default router;

import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateId,
  formatDate, 
  formatTime 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/opd/visits
// @desc    Create a new OPD visit
// @access  Private (Receptionist, Nurse only)
router.post('/visits', authenticate, authorize('receptionist', 'nurse', 'admin'), [
  require('express-validator').body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  require('express-validator').body('visitDate').isISO8601().withMessage('Valid visit date is required'),
  require('express-validator').body('chiefComplaint').optional().trim().isLength({ max: 1000 }).withMessage('Chief complaint must be less than 1000 characters'),
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

    const {
      patientId,
      appointmentId,
      visitDate,
      chiefComplaint,
      vitalSigns,
      notes
    } = req.body;

    // Check if patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
    }

    // Check if appointment exists (if provided)
    if (appointmentId) {
      const appointment = await getRow(
        'SELECT appointment_id FROM appointments WHERE appointment_id = ? AND patient_id = ?',
        [appointmentId, patientId]
      );

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found for this patient'
        });
      }
    }

    // Generate visit ID
    const visitId = generateId('OPD', 6);

    await runQuery(
      `INSERT INTO opd_visits (
        visit_id, patient_id, appointment_id, visit_date, check_in_time,
        chief_complaint, vital_signs, status, notes, created_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 'checked_in', ?, CURRENT_TIMESTAMP)`,
      [
        visitId,
        patientId,
        appointmentId || null,
        formatDate(visitDate),
        chiefComplaint,
        vitalSigns ? JSON.stringify(vitalSigns) : null,
        notes
      ]
    );

    logger.info(`OPD visit created: ${visitId} for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: 'OPD visit created successfully',
      visit: {
        visitId,
        patientId,
        appointmentId,
        visitDate,
        status: 'checked_in',
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name
        }
      }
    });

  } catch (error) {
    logger.error('Create OPD visit error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating OPD visit'
    });
  }
});

// @route   GET /api/opd/visits
// @desc    Get OPD visits with filters
// @access  Private (Staff only)
router.get('/visits', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      visitDate,
      status,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND ov.patient_id = ?';
      params.push(patientId);
    }

    if (visitDate) {
      whereClause += ' AND ov.visit_date = ?';
      params.push(formatDate(visitDate));
    }

    if (status) {
      whereClause += ' AND ov.status = ?';
      params.push(status);
    }

    if (startDate && endDate) {
      whereClause += ' AND ov.visit_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM opd_visits ov
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get OPD visits
    const visits = await getAll(
      `SELECT 
        ov.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone,
        a.appointment_date, a.start_time, a.end_time, a.appointment_type
       FROM opd_visits ov
       LEFT JOIN patients p ON ov.patient_id = p.patient_id
       LEFT JOIN appointments a ON ov.appointment_id = a.appointment_id
       ${whereClause}
       ORDER BY ov.visit_date DESC, ov.check_in_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Parse vital signs JSON
    const visitsWithParsedData = visits.map(visit => ({
      ...visit,
      vitalSigns: visit.vital_signs ? JSON.parse(visit.vital_signs) : null
    }));

    res.json({
      success: true,
      visits: visitsWithParsedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get OPD visits error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving OPD visits'
    });
  }
});

// @route   GET /api/opd/visits/:visitId
// @desc    Get OPD visit by ID
// @access  Private (Staff only)
router.get('/visits/:visitId', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { visitId } = req.params;

    const visit = await getRow(
      `SELECT 
        ov.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender, p.phone, p.email,
        a.appointment_date, a.start_time, a.end_time, a.appointment_type, a.reason_for_visit
       FROM opd_visits ov
       LEFT JOIN patients p ON ov.patient_id = p.patient_id
       LEFT JOIN appointments a ON ov.appointment_id = a.appointment_id
       WHERE ov.visit_id = ?`,
      [visitId]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        error: 'OPD visit not found'
      });
    }

    // Parse vital signs JSON
    const visitWithParsedData = {
      ...visit,
      vitalSigns: visit.vital_signs ? JSON.parse(visit.vital_signs) : null
    };

    res.json({
      success: true,
      visit: visitWithParsedData
    });

  } catch (error) {
    logger.error('Get OPD visit error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving OPD visit'
    });
  }
});

// @route   PUT /api/opd/visits/:visitId
// @desc    Update OPD visit
// @access  Private (Staff only)
router.put('/visits/:visitId', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { visitId } = req.params;
    const updates = req.body;

    // Check if visit exists
    const existingVisit = await getRow(
      'SELECT * FROM opd_visits WHERE visit_id = ?',
      [visitId]
    );

    if (!existingVisit) {
      return res.status(404).json({
        success: false,
        error: 'OPD visit not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'chiefComplaint', 'vitalSigns', 'status', 'notes', 'checkOutTime'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        if (key === 'vitalSigns') {
          updateValues.push(JSON.stringify(value));
        } else if (key === 'checkOutTime') {
          updateValues.push(value);
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
    updateValues.push(visitId);

    await runQuery(
      `UPDATE opd_visits SET ${updateFields.join(', ')} WHERE visit_id = ?`,
      updateValues
    );

    logger.info(`OPD visit ${visitId} updated by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'OPD visit updated successfully'
    });

  } catch (error) {
    logger.error('Update OPD visit error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating OPD visit'
    });
  }
});

// @route   POST /api/opd/queue
// @desc    Add patient to OPD queue
// @access  Private (Receptionist, Nurse only)
router.post('/queue', authenticate, authorize('receptionist', 'nurse', 'admin'), [
  require('express-validator').body('visitId').trim().isLength({ min: 1 }).withMessage('Visit ID is required'),
  require('express-validator').body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
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

    const { visitId, staffId, estimatedWaitTime } = req.body;

    // Check if visit exists
    const visit = await getRow(
      'SELECT * FROM opd_visits WHERE visit_id = ? AND status = "checked_in"',
      [visitId]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        error: 'OPD visit not found or already processed'
      });
    }

    // Check if staff exists
    const staff = await getRow(
      'SELECT staff_id, first_name, last_name FROM staff WHERE staff_id = ? AND status = "active"',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found or inactive'
      });
    }

    // Get next queue position
    const lastQueue = await getRow(
      'SELECT MAX(queue_position) as max_position FROM opd_queue WHERE staff_id = ? AND DATE(created_at) = CURRENT_DATE',
      [staffId]
    );

    const queuePosition = (lastQueue.max_position || 0) + 1;

    // Generate queue ID
    const queueId = generateId('QUEUE', 6);

    await runQuery(
      `INSERT INTO opd_queue (
        queue_id, visit_id, staff_id, queue_position, estimated_wait_time,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'waiting', CURRENT_TIMESTAMP)`,
      [queueId, visitId, staffId, queuePosition, estimatedWaitTime || 30]
    );

    // Update visit status
    await runQuery(
      'UPDATE opd_visits SET status = "in_queue", updated_at = CURRENT_TIMESTAMP WHERE visit_id = ?',
      [visitId]
    );

    logger.info(`Patient added to OPD queue: ${queueId} for visit ${visitId}`);

    res.status(201).json({
      success: true,
      message: 'Patient added to queue successfully',
      queue: {
        queueId,
        visitId,
        staffId,
        queuePosition,
        estimatedWaitTime: estimatedWaitTime || 30,
        status: 'waiting'
      }
    });

  } catch (error) {
    logger.error('Add to OPD queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding patient to queue'
    });
  }
});

// @route   GET /api/opd/queue
// @desc    Get OPD queue for staff member
// @access  Private (Staff only)
router.get('/queue', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { staffId, status = 'waiting' } = req.query;

    let whereClause = 'WHERE oq.status = ?';
    let params = [status];

    if (staffId) {
      whereClause += ' AND oq.staff_id = ?';
      params.push(staffId);
    }

    const queue = await getAll(
      `SELECT 
        oq.*, 
        ov.visit_id, ov.visit_date, ov.chief_complaint, ov.vital_signs,
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone,
        s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM opd_queue oq
       LEFT JOIN opd_visits ov ON oq.visit_id = ov.visit_id
       LEFT JOIN patients p ON ov.patient_id = p.patient_id
       LEFT JOIN staff s ON oq.staff_id = s.staff_id
       ${whereClause}
       ORDER BY oq.queue_position ASC`,
      params
    );

    // Parse vital signs JSON
    const queueWithParsedData = queue.map(item => ({
      ...item,
      vitalSigns: item.vital_signs ? JSON.parse(item.vital_signs) : null
    }));

    res.json({
      success: true,
      queue: queueWithParsedData
    });

  } catch (error) {
    logger.error('Get OPD queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving OPD queue'
    });
  }
});

// @route   PUT /api/opd/queue/:queueId/status
// @desc    Update queue status
// @access  Private (Staff only)
router.put('/queue/:queueId/status', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { queueId } = req.params;
    const { status } = req.body;

    if (!['waiting', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be waiting, in_progress, completed, or cancelled'
      });
    }

    const queueItem = await getRow(
      'SELECT * FROM opd_queue WHERE queue_id = ?',
      [queueId]
    );

    if (!queueItem) {
      return res.status(404).json({
        success: false,
        error: 'Queue item not found'
      });
    }

    const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const updateValues = [status];

    // Set timestamps based on status
    if (status === 'in_progress') {
      updateFields.push('started_at = CURRENT_TIMESTAMP');
    } else if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }

    updateValues.push(queueId);

    await runQuery(
      `UPDATE opd_queue SET ${updateFields.join(', ')} WHERE queue_id = ?`,
      updateValues
    );

    // Update visit status accordingly
    if (status === 'in_progress') {
      await runQuery(
        'UPDATE opd_visits SET status = "with_doctor", updated_at = CURRENT_TIMESTAMP WHERE visit_id = ?',
        [queueItem.visit_id]
      );
    } else if (status === 'completed') {
      await runQuery(
        'UPDATE opd_visits SET status = "completed", check_out_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE visit_id = ?',
        [queueItem.visit_id]
      );
    }

    logger.info(`OPD queue status updated: ${queueId} to ${status} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Queue status updated successfully'
    });

  } catch (error) {
    logger.error('Update queue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating queue status'
    });
  }
});

// @route   GET /api/opd/stats
// @desc    Get OPD statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE ov.visit_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get visit statistics
    const visitStats = await getRow(
      `SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN ov.status = 'completed' THEN 1 END) as completed_visits,
        COUNT(CASE WHEN ov.status = 'in_queue' THEN 1 END) as in_queue_visits,
        COUNT(CASE WHEN ov.status = 'with_doctor' THEN 1 END) as with_doctor_visits,
        AVG(CASE WHEN ov.check_out_time IS NOT NULL THEN 
          (julianday(ov.check_out_time) - julianday(ov.check_in_time)) * 24 * 60 
        END) as avg_wait_time_minutes
       FROM opd_visits ov
       ${dateFilter}`,
      params
    );

    // Get queue statistics
    const queueStats = await getRow(
      `SELECT 
        COUNT(*) as total_in_queue,
        AVG(estimated_wait_time) as avg_estimated_wait_time,
        AVG(CASE WHEN completed_at IS NOT NULL THEN 
          (julianday(completed_at) - julianday(created_at)) * 24 * 60 
        END) as avg_actual_wait_time_minutes
       FROM opd_queue oq
       LEFT JOIN opd_visits ov ON oq.visit_id = ov.visit_id
       ${dateFilter}`,
      params
    );

    res.json({
      success: true,
      stats: {
        visits: visitStats,
        queue: queueStats
      }
    });

  } catch (error) {
    logger.error('Get OPD stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving OPD statistics'
    });
  }
});

export default router;

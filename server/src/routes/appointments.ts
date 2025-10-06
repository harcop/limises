import express, { Request, Response, NextFunction } from 'express';
const moment = require('moment');
import { authenticate, authorize } from '../middleware/auth';
import { validateAppointment, validateId, validatePagination, validateDateRange } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateAppointmentId, 
  formatDate, 
  formatTime, 
  hasTimeConflict,
  calculateAppointmentDuration,
  addMinutesToTime,
  isWithinBusinessHours
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (Staff only)
router.post('/', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validateAppointment, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      staffId,
      appointmentDate,
      startTime,
      endTime,
      appointmentType,
      reasonForVisit,
      notes,
      roomNumber
    } = req.body;

    // Validate appointment date is not in the past
    const appointmentDateTime = new Date(`${appointmentDate} ${startTime}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot schedule appointments in the past'
      });
    }

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

    // Check if staff exists and is active
    const staff = await getRow(
      'SELECT staff_id, first_name, last_name, department, position FROM staff WHERE staff_id = ? AND status = "active"',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found or inactive'
      });
    }

    // Check for time conflicts
    const conflictingAppointment = await getRow(
      `SELECT appointment_id, start_time, end_time 
       FROM appointments 
       WHERE staff_id = ? AND appointment_date = ? AND status IN ('scheduled', 'confirmed') 
       AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`,
      [staffId, formatDate(appointmentDate), endTime, startTime, startTime, endTime]
    );

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'Time conflict with existing appointment',
        conflict: {
          appointmentId: conflictingAppointment.appointment_id,
          startTime: conflictingAppointment.start_time,
          endTime: conflictingAppointment.end_time
        }
      });
    }

    // Check if time is within business hours
    if (!isWithinBusinessHours(startTime)) {
      return res.status(400).json({
        success: false,
        error: 'Appointments can only be scheduled during business hours (8 AM - 5 PM)'
      });
    }

    // Generate appointment ID
    const appointmentId = generateAppointmentId();

    await runQuery(
      `INSERT INTO appointments (
        appointment_id, patient_id, staff_id, appointment_date, start_time, end_time,
        appointment_type, status, reason_for_visit, notes, room_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        appointmentId,
        patientId,
        staffId,
        formatDate(appointmentDate),
        formatTime(startTime),
        formatTime(endTime),
        appointmentType,
        reasonForVisit,
        notes,
        roomNumber
      ]
    );

    logger.info(`Appointment created: ${appointmentId} for patient ${patientId} with staff ${staffId}`);

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment: {
        appointmentId,
        patientId,
        staffId,
        appointmentDate,
        startTime,
        endTime,
        appointmentType,
        status: 'scheduled',
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name
        },
        staff: {
          firstName: staff.first_name,
          lastName: staff.last_name,
          department: staff.department,
          position: staff.position
        }
      }
    });

  } catch (error) {
    logger.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating appointment'
    });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments with filters
// @access  Private (Staff only)
router.get('/', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePagination, validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      staffId,
      appointmentDate,
      startDate,
      endDate,
      status,
      appointmentType,
      department
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND a.patient_id = ?';
      params.push(patientId);
    }

    if (staffId) {
      whereClause += ' AND a.staff_id = ?';
      params.push(staffId);
    }

    if (appointmentDate) {
      whereClause += ' AND a.appointment_date = ?';
      params.push(formatDate(appointmentDate));
    }

    if (startDate && endDate) {
      whereClause += ' AND a.appointment_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (appointmentType) {
      whereClause += ' AND a.appointment_type = ?';
      params.push(appointmentType);
    }

    if (department) {
      whereClause += ' AND s.department = ?';
      params.push(department);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM appointments a
       LEFT JOIN staff s ON a.staff_id = s.staff_id
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get appointments
    const appointments = await getAll(
      `SELECT 
        a.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department, s.position
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.patient_id
       LEFT JOIN staff s ON a.staff_id = s.staff_id
       ${whereClause}
       ORDER BY a.appointment_date DESC, a.start_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving appointments'
    });
  }
});

// @route   GET /api/appointments/available-slots
// @desc    Get available appointment slots
// @access  Private (Staff only)
router.get('/available-slots', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { staffId, appointmentDate, appointmentType } = req.query;

    if (!staffId || !appointmentDate || !appointmentType) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID, appointment date, and appointment type are required'
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

    // Get staff schedule for the day
    const dayOfWeek = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const schedule = await getRow(
      'SELECT * FROM staff_schedules WHERE staff_id = ? AND day_of_week = ? AND is_available = 1',
      [staffId, dayOfWeek]
    );

    if (!schedule) {
      return res.status(400).json({
        success: false,
        error: 'Staff member is not available on this day'
      });
    }

    // Get existing appointments for the day
    const existingAppointments = await getAll(
      'SELECT start_time, end_time FROM appointments WHERE staff_id = ? AND appointment_date = ? AND status IN ("scheduled", "confirmed")',
      [staffId, formatDate(appointmentDate)]
    );

    // Calculate appointment duration
    const duration = calculateAppointmentDuration(appointmentType);

    // Generate available slots
    const availableSlots = [];
    const startTime = moment(schedule.start_time, 'HH:mm:ss');
    const endTime = moment(schedule.end_time, 'HH:mm:ss');
    const breakStart = schedule.break_start_time ? moment(schedule.break_start_time, 'HH:mm:ss') : null;
    const breakEnd = schedule.break_end_time ? moment(schedule.break_end_time, 'HH:mm:ss') : null;

    let currentTime = startTime.clone();

    while (currentTime.clone().add(duration, 'minutes').isSameOrBefore(endTime)) {
      const slotStart = currentTime.format('HH:mm');
      const slotEnd = currentTime.clone().add(duration, 'minutes').format('HH:mm');

      // Check if slot conflicts with break time
      const isDuringBreak = breakStart && breakEnd && 
        currentTime.isBefore(breakEnd) && 
        currentTime.clone().add(duration, 'minutes').isAfter(breakStart);

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(apt => 
        hasTimeConflict(slotStart, slotEnd, apt.start_time, apt.end_time)
      );

      if (!isDuringBreak && !hasConflict) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          duration: duration
        });
      }

      currentTime.add(30, 'minutes'); // 30-minute intervals
    }

    res.json({
      success: true,
      availableSlots,
      staff: {
        staffId: staff.staff_id,
        firstName: staff.first_name,
        lastName: staff.last_name
      },
      appointmentDate,
      appointmentType
    });

  } catch (error) {
    logger.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving available slots'
    });
  }
});

// @route   GET /api/appointments/:appointmentId
// @desc    Get appointment by ID
// @access  Private (Staff only)
router.get('/:appointmentId', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;

    const appointment = await getRow(
      `SELECT 
        a.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone, p.email as patient_email,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department, s.position
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.patient_id
       LEFT JOIN staff s ON a.staff_id = s.staff_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment
    });

  } catch (error) {
    logger.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving appointment'
    });
  }
});

// @route   PUT /api/appointments/:appointmentId
// @desc    Update appointment
// @access  Private (Staff only)
router.put('/:appointmentId', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const updates = req.body;

    // Check if appointment exists
    const existingAppointment = await getRow(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check if appointment can be modified
    if (existingAppointment.status === 'completed' || existingAppointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify completed or cancelled appointments'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'staffId', 'appointmentDate', 'startTime', 'endTime', 
      'appointmentType', 'reasonForVisit', 'notes', 'roomNumber', 'status'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        if (key === 'appointmentDate') {
          updateValues.push(formatDate(value));
        } else if (key === 'startTime' || key === 'endTime') {
          updateValues.push(formatTime(value));
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
    updateValues.push(appointmentId);

    await runQuery(
      `UPDATE appointments SET ${updateFields.join(', ')} WHERE appointment_id = ?`,
      updateValues
    );

    logger.info(`Appointment ${appointmentId} updated by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    logger.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating appointment'
    });
  }
});

// @route   PUT /api/appointments/:appointmentId/confirm
// @desc    Confirm appointment
// @access  Private (Staff only)
router.put('/:appointmentId/confirm', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;

    const appointment = await getRow(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'Only scheduled appointments can be confirmed'
      });
    }

    await runQuery(
      'UPDATE appointments SET status = "confirmed", updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?',
      [appointmentId]
    );

    logger.info(`Appointment ${appointmentId} confirmed by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Appointment confirmed successfully'
    });

  } catch (error) {
    logger.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error confirming appointment'
    });
  }
});

// @route   PUT /api/appointments/:appointmentId/cancel
// @desc    Cancel appointment
// @access  Private (Staff only)
router.put('/:appointmentId/cancel', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await getRow(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Appointment is already completed or cancelled'
      });
    }

    await runQuery(
      'UPDATE appointments SET status = "cancelled", notes = ?, updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?',
      [reason || 'Appointment cancelled', appointmentId]
    );

    logger.info(`Appointment ${appointmentId} cancelled by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    logger.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error cancelling appointment'
    });
  }
});

// @route   PUT /api/appointments/:appointmentId/complete
// @desc    Mark appointment as completed
// @access  Private (Staff only)
router.put('/:appointmentId/complete', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;

    const appointment = await getRow(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Appointment is already completed'
      });
    }

    await runQuery(
      'UPDATE appointments SET status = "completed", notes = ?, updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?',
      [notes || appointment.notes, appointmentId]
    );

    logger.info(`Appointment ${appointmentId} completed by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Appointment completed successfully'
    });

  } catch (error) {
    logger.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error completing appointment'
    });
  }
});

// @route   GET /api/appointments/staff/:staffId/schedule
// @desc    Get staff member's schedule
// @access  Private (Staff only)
router.get('/staff/:staffId/schedule', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const appointments = await getAll(
      `SELECT 
        a.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.staff_id = ? AND a.appointment_date BETWEEN ? AND ?
       ORDER BY a.appointment_date, a.start_time`,
      [staffId, formatDate(startDate), formatDate(endDate)]
    );

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    logger.error('Get staff schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving staff schedule'
    });
  }
});

export default router;

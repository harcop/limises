import { Request, Response } from 'express';
import { AppointmentModel, PatientModel, StaffModel } from '../../models';
import { getRow, getAll, runQuery } from '../../../database/legacy';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

const moment = require('moment');
const { 
  generateAppointmentId, 
  formatDate, 
  formatTime, 
  hasTimeConflict,
  calculateAppointmentDuration,
  isWithinBusinessHours
} = require('../../../utils/helpers');

export class AppointmentsController {
  // @route   POST /api/appointments
  // @desc    Create a new appointment
  // @access  Private (Staff only)
  static async createAppointment(req: AuthRequest, res: Response) {
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
      const patient = await PatientModel.findOne({ 
        patientId, 
        status: 'active' 
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found or inactive'
        });
      }

      // Check if staff exists
      const staff = await StaffModel.findOne({ 
        staffId, 
        status: 'active' 
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found or inactive'
        });
      }

      // Generate appointment ID
      const appointmentId = generateAppointmentId();

      // Create appointment
      const appointment = new AppointmentModel({
        appointmentId,
        patientId,
        staffId,
        appointmentDate,
        startTime,
        endTime: endTime || calculateAppointmentDuration(startTime, appointmentType),
        appointmentType,
        reasonForVisit,
        notes,
        roomNumber,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      });

      await appointment.save();

      logger.info(`Appointment ${appointmentId} created for patient ${patientId} with staff ${staffId}`);

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
            firstName: patient.firstName,
            lastName: patient.lastName
          },
          staff: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            department: staff.department,
            position: staff.position
          }
        }
      });

    } catch (error) {
      logger.error('Create appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating appointment'
      });
    }
  }

  // @route   GET /api/appointments
  // @desc    Get appointments with filters
  // @access  Private (Staff only)
  static async getAppointments(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        staffId,
        appointmentDate,
        startDate,
        endDate,
        status,
        appointmentType
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (patientId) filter.patientId = patientId;
      if (staffId) filter.staffId = staffId;
      if (appointmentDate) filter.appointmentDate = appointmentDate;
      if (status) filter.status = status;
      if (appointmentType) filter.appointmentType = appointmentType;

      // Date range filter
      if (startDate || endDate) {
        filter.appointmentDate = {};
        if (startDate) filter.appointmentDate.$gte = startDate;
        if (endDate) filter.appointmentDate.$lte = endDate;
      }

      // Get appointments with pagination
      const appointments = await AppointmentModel.find(filter)
        .populate('patientId', 'firstName lastName')
        .populate('staffId', 'firstName lastName department position')
        .sort({ appointmentDate: -1, startTime: -1 })
        .skip(offset)
        .limit(limit);

      const total = await AppointmentModel.countDocuments(filter);

      res.json({
        success: true,
        data: appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get appointments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving appointments'
      });
    }
  }

  // @route   GET /api/appointments/available-slots
  // @desc    Get available appointment slots for a specific date and staff
  // @access  Private (Staff only)
  static async getAvailableSlots(req: AuthRequest, res: Response) {
    try {
      const { staffId, appointmentDate, duration = 30 } = req.query;

      if (!staffId || !appointmentDate) {
        return res.status(400).json({
          success: false,
          error: 'Staff ID and appointment date are required'
        });
      }

      // Check if staff exists
      const staff = await StaffModel.findOne({ 
        staffId, 
        status: 'active' 
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found or inactive'
        });
      }

      // Get staff schedule for the day
      const dayOfWeek = new Date(appointmentDate as string).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
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
        [staffId, appointmentDate]
      );

      // Generate available slots
      const availableSlots: any[] = [];
      const startTime = moment(`${appointmentDate} ${schedule.start_time}`);
      const endTime = moment(`${appointmentDate} ${schedule.end_time}`);
      const breakStart = schedule.break_start_time ? moment(`${appointmentDate} ${schedule.break_start_time}`) : null;
      const breakEnd = schedule.break_end_time ? moment(`${appointmentDate} ${schedule.break_end_time}`) : null;

      let currentTime = startTime.clone();

      while (currentTime.clone().add(duration, 'minutes').isSameOrBefore(endTime)) {
        const slotStart = currentTime.format('HH:mm');
        const slotEnd = currentTime.clone().add(duration, 'minutes').format('HH:mm');

        // Check if slot is during break time
        const isDuringBreak = breakStart && breakEnd && 
          currentTime.isBefore(breakEnd) && 
          currentTime.clone().add(duration, 'minutes').isAfter(breakStart);

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some((apt: any) => 
          hasTimeConflict(slotStart, slotEnd, apt.start_time, apt.end_time)
        );

        if (!isDuringBreak && !hasConflict) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
            duration: parseInt(duration as string)
          });
        }

        currentTime.add(15, 'minutes'); // 15-minute intervals
      }

      res.json({
        success: true,
        data: {
          staffId,
          appointmentDate,
          availableSlots,
          totalSlots: availableSlots.length
        }
      });

    } catch (error) {
      logger.error('Get available slots error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving available slots'
      });
    }
  }

  // @route   GET /api/appointments/:appointmentId
  // @desc    Get a specific appointment
  // @access  Private (Staff only)
  static async getAppointment(req: AuthRequest, res: Response) {
    try {
      const { appointmentId } = req.params;

      const appointment = await AppointmentModel.findOne({ appointmentId })
        .populate('patientId', 'firstName lastName phone email')
        .populate('staffId', 'firstName lastName department position');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      res.json({
        success: true,
        data: appointment
      });

    } catch (error) {
      logger.error('Get appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving appointment'
      });
    }
  }

  // @route   PUT /api/appointments/:appointmentId
  // @desc    Update an appointment
  // @access  Private (Staff only)
  static async updateAppointment(req: AuthRequest, res: Response) {
    try {
      const { appointmentId } = req.params;
      const updateData = req.body;

      // Check if appointment exists
      const appointment = await AppointmentModel.findOne({ appointmentId });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      // Update appointment
      const updatedAppointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).populate('patientId', 'firstName lastName')
       .populate('staffId', 'firstName lastName department position');

      logger.info(`Appointment ${appointmentId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment
      });

    } catch (error) {
      logger.error('Update appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating appointment'
      });
    }
  }

  // @route   PUT /api/appointments/:appointmentId/confirm
  // @desc    Confirm an appointment
  // @access  Private (Staff only)
  static async confirmAppointment(req: AuthRequest, res: Response) {
    try {
      const { appointmentId } = req.params;

      const appointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId, status: 'scheduled' },
        { 
          status: 'confirmed',
          updatedAt: new Date().toISOString()
        },
        { new: true }
      ).populate('patientId', 'firstName lastName phone')
       .populate('staffId', 'firstName lastName department');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found or already processed'
        });
      }

      logger.info(`Appointment ${appointmentId} confirmed by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Appointment confirmed successfully',
        data: appointment
      });

    } catch (error) {
      logger.error('Confirm appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error confirming appointment'
      });
    }
  }

  // @route   PUT /api/appointments/:appointmentId/cancel
  // @desc    Cancel an appointment
  // @access  Private (Staff only)
  static async cancelAppointment(req: AuthRequest, res: Response) {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;

      const appointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId, status: { $in: ['scheduled', 'confirmed'] } },
        { 
          status: 'cancelled',
          cancellationReason: reason,
          updatedAt: new Date().toISOString()
        },
        { new: true }
      ).populate('patientId', 'firstName lastName phone')
       .populate('staffId', 'firstName lastName department');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found or cannot be cancelled'
        });
      }

      logger.info(`Appointment ${appointmentId} cancelled by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: appointment
      });

    } catch (error) {
      logger.error('Cancel appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error cancelling appointment'
      });
    }
  }

  // @route   PUT /api/appointments/:appointmentId/complete
  // @desc    Mark an appointment as completed
  // @access  Private (Doctor/Nurse/Admin only)
  static async completeAppointment(req: AuthRequest, res: Response) {
    try {
      const { appointmentId } = req.params;
      const { notes, followUpRequired } = req.body;

      const appointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId, status: { $in: ['scheduled', 'confirmed', 'in_progress'] } },
        { 
          status: 'completed',
          completionNotes: notes,
          followUpRequired: followUpRequired || false,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { new: true }
      ).populate('patientId', 'firstName lastName phone')
       .populate('staffId', 'firstName lastName department');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found or cannot be completed'
        });
      }

      logger.info(`Appointment ${appointmentId} completed by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Appointment completed successfully',
        data: appointment
      });

    } catch (error) {
      logger.error('Complete appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error completing appointment'
      });
    }
  }

  // @route   GET /api/appointments/staff/:staffId/schedule
  // @desc    Get staff schedule for a specific date range
  // @access  Private (Staff only)
  static async getStaffSchedule(req: AuthRequest, res: Response) {
    try {
      const { staffId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }

      // Get appointments for the date range
      const appointments = await getAll(
        `SELECT a.*, p.first_name, p.last_name, p.phone 
         FROM appointments a 
         JOIN patients p ON a.patient_id = p.patient_id 
         WHERE a.staff_id = ? AND a.appointment_date BETWEEN ? AND ? 
         ORDER BY a.appointment_date, a.start_time`,
        [staffId, startDate, endDate]
      );

      res.json({
        success: true,
        data: {
          staffId,
          startDate,
          endDate,
          appointments,
          totalAppointments: appointments.length
        }
      });

    } catch (error) {
      logger.error('Get staff schedule error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving staff schedule'
      });
    }
  }
}

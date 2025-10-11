import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { AppointmentsService } from '../services/AppointmentsService';
import { AuthRequest } from '../../../types';

export class AppointmentsController extends BaseController {
  private service: AppointmentsService;

  constructor() {
    super('AppointmentsController');
    this.service = new AppointmentsService();
  }

  // Appointment management routes
  createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const appointmentData = req.body;
      const result = await this.service.createAppointment(appointmentData);
      this.sendSuccessResponse(res, result, 'Appointment scheduled successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create appointment', statusCode);
    }
  };

  getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters = {
        patientId: req.query['patientId'] as string,
        staffId: req.query['staffId'] as string,
        appointmentDate: req.query['appointmentDate'] as string,
        appointmentType: req.query['appointmentType'] as string,
        status: req.query['status'] as string,
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string,
        roomNumber: req.query['roomNumber'] as string
      };

      const pagination = {
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 20
      };

      const result = await this.service.getAppointments(filters, pagination);
      res.json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: result.appointments,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve appointments', statusCode);
    }
  };

  getAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      const result = await this.service.getAppointment(appointmentId);
      this.sendSuccessResponse(res, result, 'Appointment retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve appointment', statusCode);
    }
  };

  updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      const updateData = req.body;
      const result = await this.service.updateAppointment(appointmentId, updateData);
      this.sendSuccessResponse(res, result, 'Appointment updated successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to update appointment', statusCode);
    }
  };

  cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      const { reason } = req.body;
      const result = await this.service.cancelAppointment(appointmentId, reason);
      this.sendSuccessResponse(res, result, 'Appointment cancelled successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to cancel appointment', statusCode);
    }
  };

  rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      const { newDate, newAppointmentTime, newDuration } = req.body;
      const result = await this.service.rescheduleAppointment(appointmentId, newDate, newAppointmentTime, newDuration);
      this.sendSuccessResponse(res, result, 'Appointment rescheduled successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to reschedule appointment', statusCode);
    }
  };

  // Statistics and reports
  getAppointmentStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters = {
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string
      };
      const result = await this.service.getAppointmentStats(filters);
      this.sendSuccessResponse(res, result, 'Appointment statistics retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve appointment statistics', statusCode);
    }
  };

  getStaffSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { staffId } = req.params;
      if (!staffId) {
        throw new Error('Staff ID is required');
      }
      const { date } = req.query;
      
      if (!date) {
        throw new Error('Date parameter is required');
      }

      const result = await this.service.getStaffSchedule(staffId, date as string);
      this.sendSuccessResponse(res, result, 'Staff schedule retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve staff schedule', statusCode);
    }
  };

  getAvailableTimeSlots = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { staffId } = req.params;
      if (!staffId) {
        throw new Error('Staff ID is required');
      }
      const { date, duration } = req.query;
      
      if (!date) {
        throw new Error('Date parameter is required');
      }

      const durationMinutes = duration ? parseInt(duration as string) : 30;
      const result = await this.service.getAvailableTimeSlots(staffId, date as string, durationMinutes);
      this.sendSuccessResponse(res, result, 'Available time slots retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve available time slots', statusCode);
    }
  };
}

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
    await this.handleAsyncOperation(
      res,
      async () => {
        const appointmentData = req.body;
        return await this.service.createAppointment(appointmentData);
      },
      'Appointment scheduled successfully',
      'Failed to create appointment',
      201
    );
  };

  getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handlePaginatedOperation(
      res,
      async () => {
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
        return {
          data: result.appointments,
          pagination: result.pagination
        };
      },
      'Appointments retrieved successfully'
    );
  };

  getAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { appointmentId } = req.params;
        if (!appointmentId) {
          throw new Error('Appointment ID is required');
        }
        return await this.service.getAppointment(appointmentId);
      },
      'Appointment retrieved successfully',
      'Failed to retrieve appointment'
    );
  };

  updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { appointmentId } = req.params;
        if (!appointmentId) {
          throw new Error('Appointment ID is required');
        }
        const updateData = req.body;
        return await this.service.updateAppointment(appointmentId, updateData);
      },
      'Appointment updated successfully',
      'Failed to update appointment'
    );
  };

  cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { appointmentId } = req.params;
        if (!appointmentId) {
          throw new Error('Appointment ID is required');
        }
        const { reason } = req.body;
        return await this.service.cancelAppointment(appointmentId, reason);
      },
      'Appointment cancelled successfully',
      'Failed to cancel appointment'
    );
  };

  rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { appointmentId } = req.params;
        if (!appointmentId) {
          throw new Error('Appointment ID is required');
        }
        const { newDate, newAppointmentTime, newDuration } = req.body;
        return await this.service.rescheduleAppointment(appointmentId, newDate, newAppointmentTime, newDuration);
      },
      'Appointment rescheduled successfully',
      'Failed to reschedule appointment'
    );
  };

  // Statistics and reports
  getAppointmentStats = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const filters = {
          startDate: req.query['startDate'] as string,
          endDate: req.query['endDate'] as string
        };
        return await this.service.getAppointmentStats(filters);
      },
      'Appointment statistics retrieved successfully',
      'Failed to retrieve appointment statistics'
    );
  };

  getStaffSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { staffId } = req.params;
        if (!staffId) {
          throw new Error('Staff ID is required');
        }
        const { date } = req.query;
        
        if (!date) {
          throw new Error('Date parameter is required');
        }

        return await this.service.getStaffSchedule(staffId, date as string);
      },
      'Staff schedule retrieved successfully',
      'Failed to retrieve staff schedule'
    );
  };

  getAvailableTimeSlots = async (req: AuthRequest, res: Response): Promise<void> => {
    await this.handleAsyncOperation(
      res,
      async () => {
        const { staffId } = req.params;
        if (!staffId) {
          throw new Error('Staff ID is required');
        }
        const { date, duration } = req.query;
        
        if (!date) {
          throw new Error('Date parameter is required');
        }

        const durationMinutes = duration ? parseInt(duration as string) : 30;
        return await this.service.getAvailableTimeSlots(staffId, date as string, durationMinutes);
      },
      'Available time slots retrieved successfully',
      'Failed to retrieve available time slots'
    );
  };
}

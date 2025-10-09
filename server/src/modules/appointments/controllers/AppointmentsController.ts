import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { AppointmentsService } from '../services/AppointmentsService';
import { AuthRequest } from '../../../types';

export class AppointmentsController extends BaseController {
  constructor() {
    super(new AppointmentsService(), 'AppointmentsController');
  }

  // Appointment management routes
  createAppointment = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const appointmentData = req.body;
    const result = await this.service.createAppointment(appointmentData);
    this.sendSuccess(res, { appointment: result }, 'Appointment scheduled successfully', 201);
  });

  getAppointments = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      staffId: req.query.staffId as string,
      appointmentDate: req.query.appointmentDate as string,
      appointmentType: req.query.appointmentType as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      roomNumber: req.query.roomNumber as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await this.service.getAppointments(filters, pagination);
    this.sendSuccess(res, result);
  });

  getAppointment = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { appointmentId } = req.params;
    const appointment = await this.service.getAppointment(appointmentId);
    this.sendSuccess(res, { appointment });
  });

  updateAppointment = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { appointmentId } = req.params;
      const updateData = req.body;
    const updatedAppointment = await this.service.updateAppointment(appointmentId, updateData);
    this.sendSuccess(res, { appointment: updatedAppointment }, 'Appointment updated successfully');
  });

  cancelAppointment = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { appointmentId } = req.params;
      const { reason } = req.body;
    await this.service.cancelAppointment(appointmentId, reason);
    this.sendSuccess(res, null, 'Appointment cancelled successfully');
  });

  rescheduleAppointment = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { appointmentId } = req.params;
    const { newDate, newStartTime, newEndTime } = req.body;
    const rescheduledAppointment = await this.service.rescheduleAppointment(appointmentId, newDate, newStartTime, newEndTime);
    this.sendSuccess(res, { appointment: rescheduledAppointment }, 'Appointment rescheduled successfully');
  });

  // Statistics and reports
  getAppointmentStats = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const stats = await this.service.getAppointmentStats(filters);
    this.sendSuccess(res, stats);
  });

  getStaffSchedule = this.handleAsync(async (req: AuthRequest, res: Response) => {
      const { staffId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      this.sendError(res, 'Date parameter is required', 400);
      return;
    }

    const schedule = await this.service.getStaffSchedule(staffId, date as string);
    this.sendSuccess(res, { schedule });
  });

  getAvailableTimeSlots = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { staffId } = req.params;
    const { date, duration } = req.query;
    
    if (!date) {
      this.sendError(res, 'Date parameter is required', 400);
      return;
    }

    const durationMinutes = duration ? parseInt(duration as string) : 30;
    const timeSlots = await this.service.getAvailableTimeSlots(staffId, date as string, durationMinutes);
    this.sendSuccess(res, { timeSlots });
  });
}

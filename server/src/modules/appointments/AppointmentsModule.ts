import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateAppointment, validateDateRange } from '../../middleware/validation';
import { AppointmentsController } from './controllers/AppointmentsController';

export class AppointmentsModule extends BaseModule {
  constructor() {
    super('AppointmentsModule');
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Appointments module is active',
        module: 'AppointmentsModule',
        timestamp: new Date().toISOString()
      });
    });

    // Appointment routes
    this.router.post('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateAppointment, 
      AppointmentsController.createAppointment
    );

    this.router.get('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      validateDateRange, 
      AppointmentsController.getAppointments
    );

    this.router.get('/available-slots', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      AppointmentsController.getAvailableSlots
    );

    this.router.get('/:appointmentId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      AppointmentsController.getAppointment
    );

    this.router.put('/:appointmentId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      AppointmentsController.updateAppointment
    );

    this.router.put('/:appointmentId/confirm', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      AppointmentsController.confirmAppointment
    );

    this.router.put('/:appointmentId/cancel', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      AppointmentsController.cancelAppointment
    );

    this.router.put('/:appointmentId/complete', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      AppointmentsController.completeAppointment
    );

    this.router.get('/staff/:staffId/schedule', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      AppointmentsController.getStaffSchedule
    );

    this.log('info', 'Appointments module routes initialized');
  }
}

import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateAppointment, validateDateRange } from '../../middleware/validation';
import { AppointmentsController } from './controllers/AppointmentsController';

export class AppointmentsModule extends BaseModule {
  private controller: AppointmentsController;

  constructor() {
    super('AppointmentsModule');
    this.controller = new AppointmentsController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Appointment routes
    this.router.post('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateAppointment, 
      this.controller.createAppointment
    );

    this.router.get('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      validateDateRange, 
      this.controller.getAppointments
    );

    this.router.get('/available-slots', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getAvailableTimeSlots
    );

    this.router.get('/:appointmentId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.getAppointment
    );

    this.router.put('/:appointmentId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.updateAppointment
    );

    this.router.put('/:appointmentId/confirm', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.updateAppointment
    );

    this.router.put('/:appointmentId/cancel', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.cancelAppointment
    );

    this.router.put('/:appointmentId/complete', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.updateAppointment
    );

    this.router.get('/staff/:staffId/schedule', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getStaffSchedule
    );

    this.log('info', 'Appointments module routes initialized');
  }
}

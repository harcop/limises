import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validatePatient, validatePatientUpdate, validateInsurance } from '../../middleware/validation';
import { PatientsController } from './controllers/PatientsController';

export class PatientsModule extends BaseModule {
  private controller: PatientsController;

  constructor() {
    super('PatientsModule');
    this.controller = new PatientsController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Patient routes
    this.router.post('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePatient, 
      this.controller.createPatient
    );

    this.router.get('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      this.controller.getPatients
    );

    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getPatientStats
    );

    this.router.get('/:patientId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.getPatient
    );

    this.router.put('/:patientId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      validatePatientUpdate, 
      this.controller.updatePatient
    );

    this.router.delete('/:patientId', 
      authorize('admin'), 
      validateId, 
      this.controller.deactivatePatient
    );

    this.router.get('/:patientId/insurance', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.getPatientInsurance
    );

    this.router.post('/:patientId/insurance', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      validateInsurance, 
      this.controller.addPatientInsurance
    );

    this.log('info', 'Patients module routes initialized');
  }
}

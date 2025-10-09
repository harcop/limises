import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../../middleware/auth';
import { validateId, validatePagination, validatePatient, validatePatientUpdate, validateInsurance } from '../../../middleware/validation';
import { PatientsController } from './controllers/PatientsController';

export class PatientsModule extends BaseModule {
  constructor() {
    super('PatientsModule');
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Patients module is active',
        module: 'PatientsModule',
        timestamp: new Date().toISOString()
      });
    });

    // Patient routes
    this.router.post('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePatient, 
      PatientsController.createPatient
    );

    this.router.get('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      PatientsController.getPatients
    );

    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      PatientsController.getPatientStats
    );

    this.router.get('/:patientId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      PatientsController.getPatient
    );

    this.router.put('/:patientId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      validatePatientUpdate, 
      PatientsController.updatePatient
    );

    this.router.delete('/:patientId', 
      authorize('admin'), 
      validateId, 
      PatientsController.deactivatePatient
    );

    this.router.get('/:patientId/insurance', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      PatientsController.getPatientInsurance
    );

    this.router.post('/:patientId/insurance', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      validateInsurance, 
      PatientsController.addPatientInsurance
    );

    this.log('info', 'Patients module routes initialized');
  }
}

import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateClinicalNote, validatePrescription } from '../../middleware/validation';
import { ClinicalController } from './controllers/ClinicalController';

export class ClinicalModule extends BaseModule {
  private controller: ClinicalController;

  constructor() {
    super('ClinicalModule');
    this.controller = new ClinicalController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Clinical note routes
    this.router.post('/notes', 
      authorize('doctor', 'nurse', 'admin'), 
      validateClinicalNote, 
      this.controller.createClinicalNote
    );

    this.router.get('/notes', 
      authorize('doctor', 'nurse', 'admin'), 
      validatePagination, 
      this.controller.getClinicalNotes
    );

    this.router.get('/notes/:noteId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.getClinicalNote
    );

    this.router.put('/notes/:noteId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.updateClinicalNote
    );

    this.router.put('/notes/:noteId/sign', 
      authorize('doctor', 'admin'), 
      validateId, 
      this.controller.signClinicalNote
    );

    // Prescription routes
    this.router.post('/prescriptions', 
      authorize('doctor', 'admin'), 
      validatePrescription, 
      this.controller.createPrescription
    );

    this.router.get('/prescriptions', 
      authorize('doctor', 'nurse', 'admin'), 
      validatePagination, 
      this.controller.getPrescriptions
    );

    this.router.get('/prescriptions/:prescriptionId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.getPrescription
    );

    this.router.put('/prescriptions/:prescriptionId', 
      authorize('doctor', 'admin'), 
      validateId, 
      this.controller.updatePrescription
    );

    // Drug master routes
    this.router.get('/drugs', 
      authorize('doctor', 'nurse', 'admin'), 
      validatePagination, 
      this.controller.getDrugs
    );

    this.router.get('/drugs/:drugId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.getDrug
    );

    this.log('info', 'Clinical module routes initialized');
  }
}

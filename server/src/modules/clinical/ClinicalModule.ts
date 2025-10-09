import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateClinicalNote, validatePrescription } from '../../middleware/validation';
import { ClinicalController } from './controllers/ClinicalController';

export class ClinicalModule extends BaseModule {
  constructor() {
    super('ClinicalModule');
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Clinical module is active',
        module: 'ClinicalModule',
        timestamp: new Date().toISOString()
      });
    });

    // Clinical note routes
    this.router.post('/notes', 
      authorize('doctor', 'nurse', 'admin'), 
      validateClinicalNote, 
      ClinicalController.createClinicalNote
    );

    this.router.get('/notes', 
      authorize('doctor', 'nurse', 'admin'), 
      validatePagination, 
      ClinicalController.getClinicalNotes
    );

    this.router.get('/notes/:noteId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      ClinicalController.getClinicalNote
    );

    this.router.put('/notes/:noteId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      ClinicalController.updateClinicalNote
    );

    this.router.put('/notes/:noteId/sign', 
      authorize('doctor', 'admin'), 
      validateId, 
      ClinicalController.signClinicalNote
    );

    // Prescription routes
    this.router.post('/prescriptions', 
      authorize('doctor', 'admin'), 
      validatePrescription, 
      ClinicalController.createPrescription
    );

    this.router.get('/prescriptions', 
      authorize('doctor', 'nurse', 'admin'), 
      validatePagination, 
      ClinicalController.getPrescriptions
    );

    this.router.get('/prescriptions/:prescriptionId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      ClinicalController.getPrescription
    );

    this.router.put('/prescriptions/:prescriptionId', 
      authorize('doctor', 'admin'), 
      validateId, 
      ClinicalController.updatePrescription
    );

    // Drug master routes
    this.router.get('/drugs', 
      authorize('doctor', 'nurse', 'admin'), 
      validatePagination, 
      ClinicalController.getDrugs
    );

    this.router.get('/drugs/:drugId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      ClinicalController.getDrug
    );

    this.log('info', 'Clinical module routes initialized');
  }
}

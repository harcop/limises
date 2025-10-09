import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateLabOrder } from '../../middleware/validation';
import { LaboratoryController } from './controllers/LaboratoryController';

export class LaboratoryModule extends BaseModule {
  constructor() {
    super('LaboratoryModule');
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Laboratory module is active',
        module: 'LaboratoryModule',
        timestamp: new Date().toISOString()
      });
    });

    // Lab order routes
    this.router.post('/orders', 
      authorize('doctor', 'nurse', 'admin'), 
      validateLabOrder, 
      LaboratoryController.createLabOrder
    );

    this.router.get('/orders', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      validatePagination, 
      LaboratoryController.getLabOrders
    );

    this.router.get('/orders/:orderId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      validateId, 
      LaboratoryController.getLabOrder
    );

    this.router.put('/orders/:orderId', 
      authorize('doctor', 'nurse', 'admin', 'lab_technician'), 
      validateId, 
      LaboratoryController.updateLabOrder
    );

    // Lab sample routes
    this.router.post('/samples', 
      authorize('lab_technician', 'admin'), 
      LaboratoryController.createLabSample
    );

    this.router.get('/samples', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      validatePagination, 
      LaboratoryController.getLabSamples
    );

    // Lab result routes
    this.router.post('/results', 
      authorize('lab_technician', 'pathologist', 'admin'), 
      LaboratoryController.createLabResult
    );

    this.router.get('/results', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician', 'pathologist'), 
      validatePagination, 
      LaboratoryController.getLabResults
    );

    // Statistics
    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      LaboratoryController.getLabStats
    );

    this.log('info', 'Laboratory module routes initialized');
  }
}

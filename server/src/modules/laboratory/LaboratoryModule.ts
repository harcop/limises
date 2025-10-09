import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateLabOrder } from '../../middleware/validation';
import { LaboratoryController } from './controllers/LaboratoryController';

export class LaboratoryModule extends BaseModule {
  private controller: LaboratoryController;

  constructor() {
    super('LaboratoryModule');
    this.controller = new LaboratoryController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Lab order routes
    this.router.post('/orders', 
      authorize('doctor', 'nurse', 'admin'), 
      validateLabOrder, 
      this.controller.createLabOrder
    );

    this.router.get('/orders', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      validatePagination, 
      this.controller.getLabOrders
    );

    this.router.get('/orders/:orderId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      validateId, 
      this.controller.getLabOrder
    );

    this.router.put('/orders/:orderId', 
      authorize('doctor', 'nurse', 'admin', 'lab_technician'), 
      validateId, 
      this.controller.updateLabOrder
    );

    // Lab sample routes
    this.router.post('/samples', 
      authorize('lab_technician', 'admin'), 
      this.controller.createLabSample
    );

    this.router.get('/samples', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      validatePagination, 
      this.controller.getLabSamples
    );

    // Lab result routes
    this.router.post('/results', 
      authorize('lab_technician', 'pathologist', 'admin'), 
      this.controller.createLabResult
    );

    this.router.get('/results', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician', 'pathologist'), 
      validatePagination, 
      this.controller.getLabResults
    );

    // Statistics
    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'lab_technician'), 
      this.controller.getLabStats
    );

    this.log('info', 'Laboratory module routes initialized');
  }
}

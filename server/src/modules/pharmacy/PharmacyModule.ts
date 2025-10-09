import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { PharmacyController } from './controllers/PharmacyController';

export class PharmacyModule extends BaseModule {
  private controller: PharmacyController;

  constructor() {
    super('PharmacyModule');
    this.controller = new PharmacyController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Drug master routes
    this.router.post('/drugs', 
      authorize('admin', 'pharmacist'), 
      this.controller.addDrug
    );

    this.router.get('/drugs', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validatePagination, 
      this.controller.getDrugs
    );

    this.router.get('/drugs/:drugId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validateId, 
      this.controller.getDrug
    );

    this.router.put('/drugs/:drugId', 
      authorize('admin', 'pharmacist'), 
      validateId, 
      this.controller.updateDrug
    );

    this.router.delete('/drugs/:drugId', 
      authorize('admin'), 
      validateId, 
      this.controller.deactivateDrug
    );

    // Inventory routes
    this.router.get('/inventory', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validatePagination, 
      this.controller.getInventory
    );

    this.router.post('/inventory', 
      authorize('admin', 'pharmacist'), 
      this.controller.addInventoryItem
    );

    // Dispense routes
    this.router.get('/dispenses', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validatePagination, 
      this.controller.getDispenses
    );

    this.router.post('/dispenses', 
      authorize('pharmacist', 'admin'), 
      this.controller.dispenseMedication
    );

    // Statistics
    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      this.controller.getPharmacyStats
    );

    this.log('info', 'Pharmacy module routes initialized');
  }
}

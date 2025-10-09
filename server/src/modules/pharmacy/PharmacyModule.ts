import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { PharmacyController } from './controllers/PharmacyController';

export class PharmacyModule extends BaseModule {
  constructor() {
    super('PharmacyModule');
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Pharmacy module is active',
        module: 'PharmacyModule',
        timestamp: new Date().toISOString()
      });
    });

    // Drug master routes
    this.router.post('/drugs', 
      authorize('admin', 'pharmacist'), 
      PharmacyController.addDrug
    );

    this.router.get('/drugs', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validatePagination, 
      PharmacyController.getDrugs
    );

    this.router.get('/drugs/:drugId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validateId, 
      PharmacyController.getDrug
    );

    this.router.put('/drugs/:drugId', 
      authorize('admin', 'pharmacist'), 
      validateId, 
      PharmacyController.updateDrug
    );

    this.router.delete('/drugs/:drugId', 
      authorize('admin'), 
      validateId, 
      PharmacyController.deactivateDrug
    );

    // Inventory routes
    this.router.get('/inventory', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validatePagination, 
      PharmacyController.getInventory
    );

    this.router.post('/inventory', 
      authorize('admin', 'pharmacist'), 
      PharmacyController.addInventoryItem
    );

    // Dispense routes
    this.router.get('/dispenses', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      validatePagination, 
      PharmacyController.getDispenses
    );

    this.router.post('/dispenses', 
      authorize('pharmacist', 'admin'), 
      PharmacyController.dispenseMedication
    );

    // Statistics
    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse', 'pharmacist'), 
      PharmacyController.getPharmacyStats
    );

    this.log('info', 'Pharmacy module routes initialized');
  }
}

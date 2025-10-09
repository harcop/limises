import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateCharge, validatePayment } from '../../middleware/validation';
import { BillingController } from './controllers/BillingController';

export class BillingModule extends BaseModule {
  constructor() {
    super('BillingModule');
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Billing module is active',
        module: 'BillingModule',
        timestamp: new Date().toISOString()
      });
    });

    // Billing routes
    this.router.post('/charges', 
      authorize('receptionist', 'doctor', 'nurse', 'admin'), 
      validateCharge, 
      BillingController.createCharge
    );

    this.router.get('/charges', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      BillingController.getCharges
    );

    this.router.get('/charges/:chargeId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      BillingController.getCharge
    );

    this.router.put('/charges/:chargeId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      BillingController.updateCharge
    );

    this.router.post('/payments', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePayment, 
      BillingController.createPayment
    );

    this.router.get('/payments', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      BillingController.getPayments
    );

    this.router.get('/accounts/:accountId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      BillingController.getBillingAccount
    );

    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      BillingController.getBillingStats
    );

    this.log('info', 'Billing module routes initialized');
  }
}

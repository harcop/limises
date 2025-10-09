import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateCharge, validatePayment } from '../../middleware/validation';
import { BillingController } from './controllers/BillingController';

export class BillingModule extends BaseModule {
  private controller: BillingController;

  constructor() {
    super('BillingModule');
    this.controller = new BillingController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Billing routes
    this.router.post('/charges', 
      authorize('receptionist', 'doctor', 'nurse', 'admin'), 
      validateCharge, 
      this.controller.createCharge
    );

    this.router.get('/charges', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      this.controller.getCharges
    );

    this.router.get('/charges/:chargeId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.getCharge
    );

    this.router.put('/charges/:chargeId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.updateBillingAccount
    );

    this.router.post('/payments', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePayment, 
      this.controller.createPayment
    );

    this.router.get('/payments', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      this.controller.getPayments
    );

    this.router.get('/accounts/:accountId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.getBillingAccount
    );

    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getBillingStats
    );

    this.log('info', 'Billing module routes initialized');
  }
}

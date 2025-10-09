import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';

export class IpdModule extends BaseModule {
  constructor() {
    super('IpdModule');
  }

  protected initializeRoutes(): void {
    this.router.use(authenticate);

    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'IPD module is active',
        module: 'IpdModule',
        timestamp: new Date().toISOString()
      });
    });

    // Basic IPD routes - can be expanded later
    this.router.get('/', (req, res) => {
      res.json({ success: true, message: 'IPD routes active' });
    });

    this.log('info', 'IPD module routes initialized');
  }
}

import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';

export class EmergencyModule extends BaseModule {
  constructor() {
    super('EmergencyModule');
  }

  protected initializeRoutes(): void {
    this.router.use(authenticate);

    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Emergency module is active',
        module: 'EmergencyModule',
        timestamp: new Date().toISOString()
      });
    });

    // Basic Emergency routes - can be expanded later
    this.router.get('/', (req, res) => {
      res.json({ success: true, message: 'Emergency routes active' });
    });

    this.log('info', 'Emergency module routes initialized');
  }
}

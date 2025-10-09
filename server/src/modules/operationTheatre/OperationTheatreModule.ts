import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';

export class OperationTheatreModule extends BaseModule {
  constructor() {
    super('OperationTheatreModule');
  }

  protected initializeRoutes(): void {
    this.router.use(authenticate);

    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Operation Theatre module is active',
        module: 'OperationTheatreModule',
        timestamp: new Date().toISOString()
      });
    });

    // Basic OT routes - can be expanded later
    this.router.get('/', (req, res) => {
      res.json({ success: true, message: 'Operation Theatre routes active' });
    });

    this.log('info', 'Operation Theatre module routes initialized');
  }
}

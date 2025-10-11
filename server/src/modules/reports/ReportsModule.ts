import { BaseModule } from '../base/Module';
import { authenticate } from '../../middleware/auth';

export class ReportsModule extends BaseModule {
  constructor() {
    super('ReportsModule');
  }

  protected initializeRoutes(): void {
    this.router.use(authenticate);

    // Initialize health check
    this.initializeHealthCheck();

    // Basic Reports routes - can be expanded later
    this.router.get('/', (_req, res) => {
      res.json({ success: true, message: 'Reports routes active' });
    });

    this.log('info', 'Reports module routes initialized');
  }
}

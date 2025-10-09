import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateStaff } from '../../middleware/validation';
import { StaffController } from './controllers/StaffController';

export class StaffModule extends BaseModule {
  private controller: StaffController;

  constructor() {
    super('StaffModule');
    this.controller = new StaffController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Staff module is active',
        module: 'StaffModule',
        timestamp: new Date().toISOString()
      });
    });

    // Staff routes
    this.router.post('/', 
      authorize('admin'), 
      validateStaff, 
      this.controller.createStaff
    );

    this.router.get('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      this.controller.getStaff
    );

    this.router.get('/departments', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getDepartments
    );

    this.router.get('/positions', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getPositions
    );

    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      this.controller.getStaffStats
    );

    this.router.get('/:staffId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      this.controller.getStaffMember
    );

    this.router.put('/:staffId', 
      authorize('admin'), 
      validateId, 
      this.controller.updateStaff
    );

    this.router.delete('/:staffId', 
      authorize('admin'), 
      validateId, 
      this.controller.deactivateStaff
    );

    this.log('info', 'Staff module routes initialized');
  }
}

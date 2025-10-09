import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination, validateStaff } from '../../middleware/validation';
import { StaffController } from './controllers/StaffController';

export class StaffModule extends BaseModule {
  constructor() {
    super('StaffModule');
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
      StaffController.createStaff
    );

    this.router.get('/', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validatePagination, 
      StaffController.getStaff
    );

    this.router.get('/departments', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      StaffController.getDepartments
    );

    this.router.get('/positions', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      StaffController.getPositions
    );

    this.router.get('/stats', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      StaffController.getStaffStats
    );

    this.router.get('/:staffId', 
      authorize('receptionist', 'admin', 'doctor', 'nurse'), 
      validateId, 
      StaffController.getStaffMember
    );

    this.router.put('/:staffId', 
      authorize('admin'), 
      validateId, 
      StaffController.updateStaff
    );

    this.router.delete('/:staffId', 
      authorize('admin'), 
      validateId, 
      StaffController.deactivateStaff
    );

    this.log('info', 'Staff module routes initialized');
  }
}

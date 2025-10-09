import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { OPDController } from './controllers/OPDController';

export class OpdModule extends BaseModule {
  private controller: OPDController;

  constructor() {
    super('OpdModule');
    this.controller = new OPDController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'OPD module is active',
        module: 'OpdModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // OPD VISIT MANAGEMENT
    // ==============================================

    // @route   POST /api/opd/visits
    // @desc    Create a new OPD visit
    // @access  Private (Receptionist, Doctor, Nurse, Admin)
    this.router.post('/visits', 
      authorize('receptionist', 'doctor', 'nurse', 'admin'), 
      this.controller.createOPDVisit
    );

    // @route   GET /api/opd/visits
    // @desc    Get OPD visits with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/visits', 
      validatePagination, 
      this.controller.getOPDVisits
    );

    // @route   GET /api/opd/visits/:visitId
    // @desc    Get a specific OPD visit
    // @access  Private (All Staff)
    this.router.get('/visits/:visitId', 
      validateId, 
      this.controller.getOPDVisitById
    );

    // @route   PUT /api/opd/visits/:visitId
    // @desc    Update an OPD visit
    // @access  Private (Doctor, Nurse, Admin)
    this.router.put('/visits/:visitId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.updateOPDVisit
    );

    // @route   PUT /api/opd/visits/:visitId/complete
    // @desc    Complete an OPD visit
    // @access  Private (Doctor, Nurse, Admin)
    this.router.put('/visits/:visitId/complete', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.completeOPDVisit
    );

    // ==============================================
    // QUEUE MANAGEMENT
    // ==============================================

    // @route   POST /api/opd/queue
    // @desc    Add patient to OPD queue
    // @access  Private (Receptionist, Nurse, Admin)
    this.router.post('/queue', 
      authorize('receptionist', 'nurse', 'admin'), 
      this.controller.addToQueue
    );

    // @route   GET /api/opd/queue
    // @desc    Get OPD queue
    // @access  Private (All Staff)
    this.router.get('/queue', 
      this.controller.getQueue
    );

    // @route   PUT /api/opd/queue/:queueId/status
    // @desc    Update queue status
    // @access  Private (Doctor, Nurse, Admin)
    this.router.put('/queue/:queueId/status', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.updateQueueStatus
    );

    // @route   GET /api/opd/queue/stats
    // @desc    Get queue statistics
    // @access  Private (All Staff)
    this.router.get('/queue/stats', 
      this.controller.getQueueStats
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/opd/dashboard
    // @desc    Get OPD dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getOPDDashboardStats
    );

    // @route   GET /api/opd/stats
    // @desc    Get OPD statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getOPDStats
    );

    this.log('info', 'OPD module routes initialized');
  }
}

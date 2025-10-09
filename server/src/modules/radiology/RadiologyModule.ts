import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { RadiologyController } from './controllers/RadiologyController';

export class RadiologyModule extends BaseModule {
  private controller: RadiologyController;

  constructor() {
    super('RadiologyModule');
    this.controller = new RadiologyController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Radiology module is active',
        module: 'RadiologyModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // RADIOLOGY ORDER MANAGEMENT
    // ==============================================

    // @route   POST /api/radiology/orders
    // @desc    Create a new radiology order
    // @access  Private (Doctor, Admin)
    this.router.post('/orders', 
      authorize('doctor', 'admin'), 
      this.controller.createRadiologyOrder
    );

    // @route   GET /api/radiology/orders
    // @desc    Get radiology orders with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/orders', 
      validatePagination, 
      this.controller.getRadiologyOrders
    );

    // @route   GET /api/radiology/orders/:orderId
    // @desc    Get a specific radiology order
    // @access  Private (All Staff)
    this.router.get('/orders/:orderId', 
      validateId, 
      this.controller.getRadiologyOrderById
    );

    // @route   PUT /api/radiology/orders/:orderId
    // @desc    Update a radiology order
    // @access  Private (Doctor, Admin)
    this.router.put('/orders/:orderId', 
      authorize('doctor', 'admin'), 
      validateId, 
      this.controller.updateRadiologyOrder
    );

    // ==============================================
    // RADIOLOGY STUDY MANAGEMENT
    // ==============================================

    // @route   POST /api/radiology/studies
    // @desc    Create a new radiology study
    // @access  Private (Radiologist, Admin)
    this.router.post('/studies', 
      authorize('radiologist', 'admin'), 
      this.controller.createRadiologyStudy
    );

    // @route   GET /api/radiology/studies
    // @desc    Get radiology studies with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/studies', 
      validatePagination, 
      this.controller.getRadiologyStudies
    );

    // @route   GET /api/radiology/studies/:studyId
    // @desc    Get a specific radiology study
    // @access  Private (All Staff)
    this.router.get('/studies/:studyId', 
      validateId, 
      this.controller.getRadiologyStudyById
    );

    // @route   PUT /api/radiology/studies/:studyId
    // @desc    Update a radiology study
    // @access  Private (Radiologist, Admin)
    this.router.put('/studies/:studyId', 
      authorize('radiologist', 'admin'), 
      validateId, 
      this.controller.updateRadiologyStudy
    );

    // @route   PUT /api/radiology/studies/:studyId/start
    // @desc    Start radiology study
    // @access  Private (Technologist, Admin)
    this.router.put('/studies/:studyId/start', 
      authorize('technologist', 'admin'), 
      validateId, 
      this.controller.startRadiologyStudy
    );

    // @route   PUT /api/radiology/studies/:studyId/complete
    // @desc    Complete radiology study
    // @access  Private (Radiologist, Admin)
    this.router.put('/studies/:studyId/complete', 
      authorize('radiologist', 'admin'), 
      validateId, 
      this.controller.completeRadiologyStudy
    );

    // ==============================================
    // RADIOLOGY EQUIPMENT MANAGEMENT
    // ==============================================

    // @route   POST /api/radiology/equipment
    // @desc    Create a new radiology equipment
    // @access  Private (Admin, Manager)
    this.router.post('/equipment', 
      authorize('admin', 'manager'), 
      this.controller.createRadiologyEquipment
    );

    // @route   GET /api/radiology/equipment
    // @desc    Get radiology equipment with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/equipment', 
      validatePagination, 
      this.controller.getRadiologyEquipment
    );

    // @route   GET /api/radiology/equipment/available
    // @desc    Get available radiology equipment
    // @access  Private (All Staff)
    this.router.get('/equipment/available', 
      this.controller.getAvailableEquipment
    );

    // @route   GET /api/radiology/equipment/:equipmentId
    // @desc    Get a specific radiology equipment
    // @access  Private (All Staff)
    this.router.get('/equipment/:equipmentId', 
      validateId, 
      this.controller.getRadiologyEquipmentById
    );

    // @route   PUT /api/radiology/equipment/:equipmentId
    // @desc    Update radiology equipment
    // @access  Private (Admin, Manager)
    this.router.put('/equipment/:equipmentId', 
      authorize('admin', 'manager'), 
      validateId, 
      this.controller.updateRadiologyEquipment
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/radiology/dashboard
    // @desc    Get radiology dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getRadiologyDashboardStats
    );

    // @route   GET /api/radiology/study-types/stats
    // @desc    Get study type statistics
    // @access  Private (All Staff)
    this.router.get('/study-types/stats', 
      this.controller.getStudyTypeStats
    );

    // @route   GET /api/radiology/equipment/utilization
    // @desc    Get equipment utilization statistics
    // @access  Private (All Staff)
    this.router.get('/equipment/utilization', 
      this.controller.getEquipmentUtilizationStats
    );

    // @route   GET /api/radiology/stats
    // @desc    Get radiology statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getRadiologyStats
    );

    this.log('info', 'Radiology module routes initialized');
  }
}

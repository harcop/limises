import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { HRController } from './controllers/HRController';

export class HumanResourcesModule extends BaseModule {
  private controller: HRController;

  constructor() {
    super('HumanResourcesModule');
    this.controller = new HRController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Human Resources module is active',
        module: 'HumanResourcesModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // EMPLOYEE RECORD MANAGEMENT
    // ==============================================

    // @route   POST /api/hr/employees
    // @desc    Create a new employee record
    // @access  Private (Admin, HR Manager)
    this.router.post('/employees', 
      authorize('admin', 'hr_manager'), 
      this.controller.createEmployeeRecord
    );

    // @route   GET /api/hr/employees
    // @desc    Get employee records with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/employees', 
      validatePagination, 
      this.controller.getEmployeeRecords
    );

    // @route   GET /api/hr/employees/:employeeId
    // @desc    Get a specific employee record
    // @access  Private (All Staff)
    this.router.get('/employees/:employeeId', 
      validateId, 
      this.controller.getEmployeeRecordById
    );

    // @route   PUT /api/hr/employees/:employeeId
    // @desc    Update an employee record
    // @access  Private (Admin, HR Manager)
    this.router.put('/employees/:employeeId', 
      authorize('admin', 'hr_manager'), 
      validateId, 
      this.controller.updateEmployeeRecord
    );

    // ==============================================
    // LEAVE REQUEST MANAGEMENT
    // ==============================================

    // @route   POST /api/hr/leave-requests
    // @desc    Create a new leave request
    // @access  Private (All Staff)
    this.router.post('/leave-requests', 
      this.controller.createLeaveRequest
    );

    // @route   GET /api/hr/leave-requests
    // @desc    Get leave requests with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/leave-requests', 
      validatePagination, 
      this.controller.getLeaveRequests
    );

    // @route   GET /api/hr/leave-requests/:leaveId
    // @desc    Get a specific leave request
    // @access  Private (All Staff)
    this.router.get('/leave-requests/:leaveId', 
      validateId, 
      this.controller.getLeaveRequestById
    );

    // @route   PUT /api/hr/leave-requests/:leaveId
    // @desc    Update a leave request
    // @access  Private (All Staff)
    this.router.put('/leave-requests/:leaveId', 
      validateId, 
      this.controller.updateLeaveRequest
    );

    // @route   PUT /api/hr/leave-requests/:leaveId/approve
    // @desc    Approve or reject a leave request
    // @access  Private (Admin, HR Manager, Manager)
    this.router.put('/leave-requests/:leaveId/approve', 
      authorize('admin', 'hr_manager', 'manager'), 
      validateId, 
      this.controller.approveLeaveRequest
    );

    // ==============================================
    // PERFORMANCE REVIEW MANAGEMENT
    // ==============================================

    // @route   POST /api/hr/performance-reviews
    // @desc    Create a new performance review
    // @access  Private (Admin, HR Manager, Manager)
    this.router.post('/performance-reviews', 
      authorize('admin', 'hr_manager', 'manager'), 
      this.controller.createPerformanceReview
    );

    // @route   GET /api/hr/performance-reviews
    // @desc    Get performance reviews with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/performance-reviews', 
      validatePagination, 
      this.controller.getPerformanceReviews
    );

    // @route   GET /api/hr/performance-reviews/:reviewId
    // @desc    Get a specific performance review
    // @access  Private (All Staff)
    this.router.get('/performance-reviews/:reviewId', 
      validateId, 
      this.controller.getPerformanceReviewById
    );

    // @route   PUT /api/hr/performance-reviews/:reviewId
    // @desc    Update a performance review
    // @access  Private (Admin, HR Manager, Manager)
    this.router.put('/performance-reviews/:reviewId', 
      authorize('admin', 'hr_manager', 'manager'), 
      validateId, 
      this.controller.updatePerformanceReview
    );

    // ==============================================
    // TRAINING RECORD MANAGEMENT
    // ==============================================

    // @route   POST /api/hr/training-records
    // @desc    Create a new training record
    // @access  Private (Admin, HR Manager)
    this.router.post('/training-records', 
      authorize('admin', 'hr_manager'), 
      this.controller.createTrainingRecord
    );

    // @route   GET /api/hr/training-records
    // @desc    Get training records with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/training-records', 
      validatePagination, 
      this.controller.getTrainingRecords
    );

    // @route   GET /api/hr/training-records/:trainingId
    // @desc    Get a specific training record
    // @access  Private (All Staff)
    this.router.get('/training-records/:trainingId', 
      validateId, 
      this.controller.getTrainingRecordById
    );

    // @route   PUT /api/hr/training-records/:trainingId
    // @desc    Update a training record
    // @access  Private (Admin, HR Manager)
    this.router.put('/training-records/:trainingId', 
      authorize('admin', 'hr_manager'), 
      validateId, 
      this.controller.updateTrainingRecord
    );

    // @route   PUT /api/hr/training-records/:trainingId/complete
    // @desc    Complete a training record
    // @access  Private (Admin, HR Manager)
    this.router.put('/training-records/:trainingId/complete', 
      authorize('admin', 'hr_manager'), 
      validateId, 
      this.controller.completeTraining
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/hr/dashboard
    // @desc    Get HR dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getHRDashboardStats
    );

    // @route   GET /api/hr/leave/stats
    // @desc    Get leave statistics
    // @access  Private (All Staff)
    this.router.get('/leave/stats', 
      this.controller.getLeaveStats
    );

    // @route   GET /api/hr/performance/stats
    // @desc    Get performance statistics
    // @access  Private (All Staff)
    this.router.get('/performance/stats', 
      this.controller.getPerformanceStats
    );

    // @route   GET /api/hr/stats
    // @desc    Get HR statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getHRStats
    );

    this.log('info', 'Human Resources module routes initialized');
  }
}

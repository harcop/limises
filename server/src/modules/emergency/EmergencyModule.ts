import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { EmergencyController } from './controllers/EmergencyController';

export class EmergencyModule extends BaseModule {
  private controller: EmergencyController;

  constructor() {
    super('EmergencyModule');
    this.controller = new EmergencyController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Emergency module is active',
        module: 'EmergencyModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // EMERGENCY VISIT MANAGEMENT
    // ==============================================

    // @route   POST /api/emergency/visits
    // @desc    Create a new emergency visit
    // @access  Private (Doctor, Nurse, Admin)
    this.router.post('/visits', 
      authorize('doctor', 'nurse', 'admin'), 
      this.controller.createEmergencyVisit
    );

    // @route   GET /api/emergency/visits
    // @desc    Get emergency visits with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/visits', 
      validatePagination, 
      this.controller.getEmergencyVisits
    );

    // @route   GET /api/emergency/visits/:visitId
    // @desc    Get a specific emergency visit
    // @access  Private (All Staff)
    this.router.get('/visits/:visitId', 
      validateId, 
      this.controller.getEmergencyVisitById
    );

    // @route   PUT /api/emergency/visits/:visitId
    // @desc    Update an emergency visit
    // @access  Private (Doctor, Nurse, Admin)
    this.router.put('/visits/:visitId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.updateEmergencyVisit
    );

    // ==============================================
    // AMBULANCE SERVICE MANAGEMENT
    // ==============================================

    // @route   POST /api/emergency/ambulances
    // @desc    Create a new ambulance service
    // @access  Private (Admin, Manager)
    this.router.post('/ambulances', 
      authorize('admin', 'manager'), 
      this.controller.createAmbulanceService
    );

    // @route   GET /api/emergency/ambulances
    // @desc    Get ambulance services with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/ambulances', 
      validatePagination, 
      this.controller.getAmbulanceServices
    );

    // @route   GET /api/emergency/ambulances/available
    // @desc    Get available ambulances
    // @access  Private (All Staff)
    this.router.get('/ambulances/available', 
      this.controller.getAvailableAmbulances
    );

    // @route   GET /api/emergency/ambulances/:serviceId
    // @desc    Get a specific ambulance service
    // @access  Private (All Staff)
    this.router.get('/ambulances/:serviceId', 
      validateId, 
      this.controller.getAmbulanceServiceById
    );

    // @route   PUT /api/emergency/ambulances/:serviceId
    // @desc    Update an ambulance service
    // @access  Private (Admin, Manager)
    this.router.put('/ambulances/:serviceId', 
      authorize('admin', 'manager'), 
      validateId, 
      this.controller.updateAmbulanceService
    );

    // ==============================================
    // EMERGENCY CALL MANAGEMENT
    // ==============================================

    // @route   POST /api/emergency/calls
    // @desc    Create a new emergency call
    // @access  Private (Receptionist, Admin)
    this.router.post('/calls', 
      authorize('receptionist', 'admin'), 
      this.controller.createEmergencyCall
    );

    // @route   GET /api/emergency/calls
    // @desc    Get emergency calls with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/calls', 
      validatePagination, 
      this.controller.getEmergencyCalls
    );

    // @route   GET /api/emergency/calls/:callId
    // @desc    Get a specific emergency call
    // @access  Private (All Staff)
    this.router.get('/calls/:callId', 
      validateId, 
      this.controller.getEmergencyCallById
    );

    // @route   PUT /api/emergency/calls/:callId
    // @desc    Update an emergency call
    // @access  Private (Receptionist, Admin)
    this.router.put('/calls/:callId', 
      authorize('receptionist', 'admin'), 
      validateId, 
      this.controller.updateEmergencyCall
    );

    // @route   PUT /api/emergency/calls/:callId/dispatch
    // @desc    Dispatch ambulance for emergency call
    // @access  Private (Receptionist, Admin)
    this.router.put('/calls/:callId/dispatch', 
      authorize('receptionist', 'admin'), 
      validateId, 
      this.controller.dispatchAmbulance
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/emergency/dashboard
    // @desc    Get emergency dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getEmergencyDashboardStats
    );

    // @route   GET /api/emergency/triage/stats
    // @desc    Get triage statistics
    // @access  Private (All Staff)
    this.router.get('/triage/stats', 
      this.controller.getTriageStats
    );

    // @route   GET /api/emergency/stats
    // @desc    Get emergency statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getEmergencyStats
    );

    this.log('info', 'Emergency module routes initialized');
  }
}

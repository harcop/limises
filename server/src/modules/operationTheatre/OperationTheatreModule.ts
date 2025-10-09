import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { OTController } from './controllers/OTController';

export class OperationTheatreModule extends BaseModule {
  private controller: OTController;

  constructor() {
    super('OperationTheatreModule');
    this.controller = new OTController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Operation Theatre module is active',
        module: 'OperationTheatreModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // OPERATION THEATRE MANAGEMENT
    // ==============================================

    // @route   POST /api/ot/theatres
    // @desc    Create a new operation theatre
    // @access  Private (Admin, Manager)
    this.router.post('/theatres', 
      authorize('admin', 'manager'), 
      this.controller.createOperationTheatre
    );

    // @route   GET /api/ot/theatres
    // @desc    Get operation theatres with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/theatres', 
      validatePagination, 
      this.controller.getOperationTheatres
    );

    // @route   GET /api/ot/theatres/:theatreId
    // @desc    Get a specific operation theatre
    // @access  Private (All Staff)
    this.router.get('/theatres/:theatreId', 
      validateId, 
      this.controller.getOperationTheatreById
    );

    // @route   PUT /api/ot/theatres/:theatreId
    // @desc    Update an operation theatre
    // @access  Private (Admin, Manager)
    this.router.put('/theatres/:theatreId', 
      authorize('admin', 'manager'), 
      validateId, 
      this.controller.updateOperationTheatre
    );

    // ==============================================
    // SURGICAL PROCEDURE MANAGEMENT
    // ==============================================

    // @route   POST /api/ot/procedures
    // @desc    Create a new surgical procedure
    // @access  Private (Admin, Manager, Doctor)
    this.router.post('/procedures', 
      authorize('admin', 'manager', 'doctor'), 
      this.controller.createSurgicalProcedure
    );

    // @route   GET /api/ot/procedures
    // @desc    Get surgical procedures with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/procedures', 
      validatePagination, 
      this.controller.getSurgicalProcedures
    );

    // @route   GET /api/ot/procedures/:procedureId
    // @desc    Get a specific surgical procedure
    // @access  Private (All Staff)
    this.router.get('/procedures/:procedureId', 
      validateId, 
      this.controller.getSurgicalProcedureById
    );

    // @route   PUT /api/ot/procedures/:procedureId
    // @desc    Update a surgical procedure
    // @access  Private (Admin, Manager, Doctor)
    this.router.put('/procedures/:procedureId', 
      authorize('admin', 'manager', 'doctor'), 
      validateId, 
      this.controller.updateSurgicalProcedure
    );

    // ==============================================
    // OT SCHEDULE MANAGEMENT
    // ==============================================

    // @route   POST /api/ot/schedules
    // @desc    Create a new OT schedule
    // @access  Private (Doctor, Admin)
    this.router.post('/schedules', 
      authorize('doctor', 'admin'), 
      this.controller.createOTSchedule
    );

    // @route   GET /api/ot/schedules
    // @desc    Get OT schedules with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/schedules', 
      validatePagination, 
      this.controller.getOTSchedules
    );

    // @route   GET /api/ot/schedules/:scheduleId
    // @desc    Get a specific OT schedule
    // @access  Private (All Staff)
    this.router.get('/schedules/:scheduleId', 
      validateId, 
      this.controller.getOTScheduleById
    );

    // @route   PUT /api/ot/schedules/:scheduleId
    // @desc    Update an OT schedule
    // @access  Private (Doctor, Admin)
    this.router.put('/schedules/:scheduleId', 
      authorize('doctor', 'admin'), 
      validateId, 
      this.controller.updateOTSchedule
    );

    // @route   PUT /api/ot/schedules/:scheduleId/start
    // @desc    Start surgery
    // @access  Private (Doctor, Admin)
    this.router.put('/schedules/:scheduleId/start', 
      authorize('doctor', 'admin'), 
      validateId, 
      this.controller.startSurgery
    );

    // @route   PUT /api/ot/schedules/:scheduleId/complete
    // @desc    Complete surgery
    // @access  Private (Doctor, Admin)
    this.router.put('/schedules/:scheduleId/complete', 
      authorize('doctor', 'admin'), 
      validateId, 
      this.controller.completeSurgery
    );

    // ==============================================
    // TEAM ASSIGNMENT MANAGEMENT
    // ==============================================

    // @route   POST /api/ot/team-assignments
    // @desc    Create a new OT team assignment
    // @access  Private (Doctor, Admin)
    this.router.post('/team-assignments', 
      authorize('doctor', 'admin'), 
      this.controller.createOTTeamAssignment
    );

    // @route   GET /api/ot/schedules/:scheduleId/team
    // @desc    Get OT team assignments for a schedule
    // @access  Private (All Staff)
    this.router.get('/schedules/:scheduleId/team', 
      validateId, 
      this.controller.getOTTeamAssignments
    );

    // ==============================================
    // CONSUMABLE TRACKING
    // ==============================================

    // @route   POST /api/ot/consumables
    // @desc    Record OT consumable usage
    // @access  Private (Nurse, Technician, Admin)
    this.router.post('/consumables', 
      authorize('nurse', 'technician', 'admin'), 
      this.controller.createOTConsumable
    );

    // @route   GET /api/ot/schedules/:scheduleId/consumables
    // @desc    Get OT consumables for a schedule
    // @access  Private (All Staff)
    this.router.get('/schedules/:scheduleId/consumables', 
      validateId, 
      this.controller.getOTConsumables
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/ot/dashboard
    // @desc    Get OT dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getOTDashboardStats
    );

    // @route   GET /api/ot/theatres/utilization
    // @desc    Get theatre utilization statistics
    // @access  Private (All Staff)
    this.router.get('/theatres/utilization', 
      this.controller.getTheatreUtilizationStats
    );

    // @route   GET /api/ot/stats
    // @desc    Get OT statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getOTStats
    );

    this.log('info', 'Operation Theatre module routes initialized');
  }
}

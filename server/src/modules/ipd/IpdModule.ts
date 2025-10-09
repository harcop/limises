import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { IPDController } from './controllers/IPDController';

export class IpdModule extends BaseModule {
  private controller: IPDController;

  constructor() {
    super('IpdModule');
    this.controller = new IPDController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'IPD module is active',
        module: 'IpdModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // WARD MANAGEMENT
    // ==============================================

    // @route   POST /api/ipd/wards
    // @desc    Create a new ward
    // @access  Private (Admin, Manager)
    this.router.post('/wards', 
      authorize('admin', 'manager'), 
      this.controller.createWard
    );

    // @route   GET /api/ipd/wards
    // @desc    Get wards with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/wards', 
      validatePagination, 
      this.controller.getWards
    );

    // @route   GET /api/ipd/wards/:wardId
    // @desc    Get a specific ward
    // @access  Private (All Staff)
    this.router.get('/wards/:wardId', 
      validateId, 
      this.controller.getWardById
    );

    // @route   PUT /api/ipd/wards/:wardId
    // @desc    Update a ward
    // @access  Private (Admin, Manager)
    this.router.put('/wards/:wardId', 
      authorize('admin', 'manager'), 
      validateId, 
      this.controller.updateWard
    );

    // ==============================================
    // BED MANAGEMENT
    // ==============================================

    // @route   POST /api/ipd/beds
    // @desc    Create a new bed
    // @access  Private (Admin, Manager)
    this.router.post('/beds', 
      authorize('admin', 'manager'), 
      this.controller.createBed
    );

    // @route   GET /api/ipd/beds
    // @desc    Get beds with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/beds', 
      validatePagination, 
      this.controller.getBeds
    );

    // @route   GET /api/ipd/beds/available
    // @desc    Get available beds
    // @access  Private (All Staff)
    this.router.get('/beds/available', 
      this.controller.getAvailableBeds
    );

    // @route   GET /api/ipd/beds/:bedId
    // @desc    Get a specific bed
    // @access  Private (All Staff)
    this.router.get('/beds/:bedId', 
      validateId, 
      this.controller.getBedById
    );

    // @route   PUT /api/ipd/beds/:bedId
    // @desc    Update a bed
    // @access  Private (Admin, Manager)
    this.router.put('/beds/:bedId', 
      authorize('admin', 'manager'), 
      validateId, 
      this.controller.updateBed
    );

    // ==============================================
    // IPD ADMISSION MANAGEMENT
    // ==============================================

    // @route   POST /api/ipd/admissions
    // @desc    Create a new IPD admission
    // @access  Private (Doctor, Nurse, Admin)
    this.router.post('/admissions', 
      authorize('doctor', 'nurse', 'admin'), 
      this.controller.createIPDAdmission
    );

    // @route   GET /api/ipd/admissions
    // @desc    Get IPD admissions with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/admissions', 
      validatePagination, 
      this.controller.getIPDAdmissions
    );

    // @route   GET /api/ipd/admissions/:admissionId
    // @desc    Get a specific IPD admission
    // @access  Private (All Staff)
    this.router.get('/admissions/:admissionId', 
      validateId, 
      this.controller.getIPDAdmissionById
    );

    // @route   PUT /api/ipd/admissions/:admissionId
    // @desc    Update an IPD admission
    // @access  Private (Doctor, Nurse, Admin)
    this.router.put('/admissions/:admissionId', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.updateIPDAdmission
    );

    // @route   PUT /api/ipd/admissions/:admissionId/discharge
    // @desc    Discharge a patient
    // @access  Private (Doctor, Nurse, Admin)
    this.router.put('/admissions/:admissionId/discharge', 
      authorize('doctor', 'nurse', 'admin'), 
      validateId, 
      this.controller.dischargePatient
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/ipd/dashboard
    // @desc    Get IPD dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getIPDDashboardStats
    );

    // @route   GET /api/ipd/wards/occupancy
    // @desc    Get ward occupancy statistics
    // @access  Private (All Staff)
    this.router.get('/wards/occupancy', 
      this.controller.getWardOccupancyStats
    );

    // @route   GET /api/ipd/stats
    // @desc    Get IPD statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getIPDStats
    );

    this.log('info', 'IPD module routes initialized');
  }
}

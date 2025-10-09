import { Router } from 'express';
import { BaseModule } from '../base/Module';
import { authenticate, authorize } from '../../middleware/auth';
import { validateId, validatePagination } from '../../middleware/validation';
import { SystemIntegrationController } from './controllers/SystemIntegrationController';

export class SystemIntegrationModule extends BaseModule {
  private controller: SystemIntegrationController;

  constructor() {
    super('SystemIntegrationModule');
    this.controller = new SystemIntegrationController();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authenticate);

    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'System Integration module is active',
        module: 'SystemIntegrationModule',
        timestamp: new Date().toISOString()
      });
    });

    // ==============================================
    // SYSTEM INTEGRATION MANAGEMENT
    // ==============================================

    // @route   POST /api/integration/systems
    // @desc    Create a new system integration
    // @access  Private (Admin, System Admin)
    this.router.post('/systems', 
      authorize('admin', 'system_admin'), 
      this.controller.createSystemIntegration
    );

    // @route   GET /api/integration/systems
    // @desc    Get system integrations with filtering and pagination
    // @access  Private (All Staff)
    this.router.get('/systems', 
      validatePagination, 
      this.controller.getSystemIntegrations
    );

    // @route   GET /api/integration/systems/:integrationId
    // @desc    Get a specific system integration
    // @access  Private (All Staff)
    this.router.get('/systems/:integrationId', 
      validateId, 
      this.controller.getSystemIntegrationById
    );

    // @route   PUT /api/integration/systems/:integrationId
    // @desc    Update a system integration
    // @access  Private (Admin, System Admin)
    this.router.put('/systems/:integrationId', 
      authorize('admin', 'system_admin'), 
      validateId, 
      this.controller.updateSystemIntegration
    );

    // @route   POST /api/integration/test
    // @desc    Test a system integration
    // @access  Private (Admin, System Admin)
    this.router.post('/test', 
      authorize('admin', 'system_admin'), 
      this.controller.testSystemIntegration
    );

    // @route   POST /api/integration/systems/:integrationId/sync
    // @desc    Sync a system integration
    // @access  Private (Admin, System Admin)
    this.router.post('/systems/:integrationId/sync', 
      authorize('admin', 'system_admin'), 
      validateId, 
      this.controller.syncSystemIntegration
    );

    // ==============================================
    // SECURITY AUDIT MANAGEMENT
    // ==============================================

    // @route   POST /api/integration/security-audits
    // @desc    Create a new security audit entry
    // @access  Private (System - Internal Use)
    this.router.post('/security-audits', 
      this.controller.createSecurityAudit
    );

    // @route   GET /api/integration/security-audits
    // @desc    Get security audits with filtering and pagination
    // @access  Private (Admin, Security Officer)
    this.router.get('/security-audits', 
      authorize('admin', 'security_officer'), 
      validatePagination, 
      this.controller.getSecurityAudits
    );

    // @route   GET /api/integration/security-audits/:auditId
    // @desc    Get a specific security audit
    // @access  Private (Admin, Security Officer)
    this.router.get('/security-audits/:auditId', 
      authorize('admin', 'security_officer'), 
      validateId, 
      this.controller.getSecurityAuditById
    );

    // ==============================================
    // DASHBOARD & ANALYTICS
    // ==============================================

    // @route   GET /api/integration/dashboard
    // @desc    Get system integration dashboard statistics
    // @access  Private (All Staff)
    this.router.get('/dashboard', 
      this.controller.getSystemIntegrationDashboardStats
    );

    // @route   GET /api/integration/security/stats
    // @desc    Get security audit statistics
    // @access  Private (Admin, Security Officer)
    this.router.get('/security/stats', 
      authorize('admin', 'security_officer'), 
      this.controller.getSecurityAuditStats
    );

    // @route   GET /api/integration/health
    // @desc    Get system health status
    // @access  Private (All Staff)
    this.router.get('/health/status', 
      this.controller.getSystemHealthStatus
    );

    // @route   GET /api/integration/stats
    // @desc    Get system integration statistics
    // @access  Private (All Staff)
    this.router.get('/stats', 
      this.controller.getSystemIntegrationStats
    );

    this.log('info', 'System Integration module routes initialized');
  }
}

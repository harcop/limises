import express, { Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticateStaff, authorizeStaff, checkStaffPermission } from '../middleware/staffAuth';
import { runQuery, getRow, getAll } from '../database/connection';
import { generateId, formatDateTime, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest, ApiResponse, SystemIntegration, SecurityAudit, DatabaseRow } from '../types';
import {
  validateId,
  validatePagination,
  validateDateRange
} from '../middleware/validation';

const router = express.Router();

// ==============================================
// SYSTEM INTEGRATIONS
// ==============================================

// @route   POST /api/integration/systems
// @desc    Create a new system integration
// @access  Private (System Admin)
router.post('/systems', authenticateStaff, authorizeStaff('system_admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<SystemIntegration>>): Promise<void> => {
  try {
    const {
      systemName,
      systemType,
      endpoint,
      authenticationType,
      syncFrequency,
      configuration
    } = req.body;

    const integrationId = generateId('INT', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO system_integrations (
        integration_id, system_name, system_type, endpoint, authentication_type,
        status, sync_frequency, configuration, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        integrationId, sanitizeString(systemName), systemType, sanitizeString(endpoint),
        authenticationType, 'inactive', syncFrequency, configuration ? JSON.stringify(configuration) : null, createdAt
      ]
    );

    // Get the created integration
    const newIntegration = await getRow<DatabaseRow>('SELECT * FROM system_integrations WHERE integration_id = ?', [integrationId]);

    res.status(201).json({
      success: true,
      message: 'System integration created successfully',
      data: {
        integrationId: newIntegration!.integration_id,
        systemName: newIntegration!.system_name,
        systemType: newIntegration!.system_type,
        endpoint: newIntegration!.endpoint,
        authenticationType: newIntegration!.authentication_type,
        status: newIntegration!.status,
        lastSync: newIntegration!.last_sync,
        syncFrequency: newIntegration!.sync_frequency,
        configuration: newIntegration!.configuration,
        createdAt: newIntegration!.created_at,
        updatedAt: newIntegration!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create system integration error:', error);
    res.status(500).json({ success: false, error: 'Server error creating system integration' });
  }
});

// @route   GET /api/integration/systems
// @desc    Get all system integrations
// @access  Private (System Admin)
router.get('/systems', authenticateStaff, authorizeStaff('system_admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<SystemIntegration[]>>): Promise<void> => {
  try {
    const status = req.query.status as string;
    const systemType = req.query.systemType as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (systemType) {
      whereClause += ' AND system_type = ?';
      params.push(systemType);
    }

    const integrations = await getAll<DatabaseRow>(
      `SELECT * FROM system_integrations ${whereClause} ORDER BY system_name`,
      params
    );

    const formattedIntegrations = integrations.map(integration => ({
      integrationId: integration.integration_id,
      systemName: integration.system_name,
      systemType: integration.system_type,
      endpoint: integration.endpoint,
      authenticationType: integration.authentication_type,
      status: integration.status,
      lastSync: integration.last_sync,
      syncFrequency: integration.sync_frequency,
      configuration: integration.configuration,
      createdAt: integration.created_at,
      updatedAt: integration.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedIntegrations
    });
  } catch (error) {
    logger.error('Get system integrations error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving system integrations' });
  }
});

// @route   PUT /api/integration/systems/:id/status
// @desc    Update system integration status
// @access  Private (System Admin)
router.put('/systems/:id/status', authenticateStaff, authorizeStaff('system_admin'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<SystemIntegration>>): Promise<void> => {
  try {
    const integrationId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive', 'error', 'maintenance'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status value' });
      return;
    }

    // Check if integration exists
    const existingIntegration = await getRow<DatabaseRow>('SELECT * FROM system_integrations WHERE integration_id = ?', [integrationId]);
    if (!existingIntegration) {
      res.status(404).json({ success: false, error: 'System integration not found' });
      return;
    }

    const updatedAt = formatDateTime(new Date());

    await runQuery(
      'UPDATE system_integrations SET status = ?, updated_at = ? WHERE integration_id = ?',
      [status, updatedAt, integrationId]
    );

    // Get updated integration
    const updatedIntegration = await getRow<DatabaseRow>('SELECT * FROM system_integrations WHERE integration_id = ?', [integrationId]);

    res.status(200).json({
      success: true,
      message: 'System integration status updated successfully',
      data: {
        integrationId: updatedIntegration!.integration_id,
        systemName: updatedIntegration!.system_name,
        systemType: updatedIntegration!.system_type,
        endpoint: updatedIntegration!.endpoint,
        authenticationType: updatedIntegration!.authentication_type,
        status: updatedIntegration!.status,
        lastSync: updatedIntegration!.last_sync,
        syncFrequency: updatedIntegration!.sync_frequency,
        configuration: updatedIntegration!.configuration,
        createdAt: updatedIntegration!.created_at,
        updatedAt: updatedIntegration!.updated_at
      }
    });
  } catch (error) {
    logger.error('Update system integration status error:', error);
    res.status(500).json({ success: false, error: 'Server error updating system integration status' });
  }
});

// ==============================================
// SECURITY AUDIT
// ==============================================

// @route   GET /api/integration/security/audit
// @desc    Get security audit logs
// @access  Private (Security Admin)
router.get('/security/audit', authenticateStaff, authorizeStaff('security_admin'), validatePagination, validateDateRange, async (req: StaffAuthRequest, res: Response<ApiResponse<SecurityAudit[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const success = req.query.success as string;
    const action = req.query.action as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }
    if (success !== undefined) {
      whereClause += ' AND success = ?';
      params.push(success === 'true' ? 1 : 0);
    }
    if (action) {
      whereClause += ' AND action = ?';
      params.push(action);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM security_audit ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get audit logs
    const auditLogs = await getAll<DatabaseRow>(
      `SELECT * FROM security_audit ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedAuditLogs = auditLogs.map(audit => ({
      auditId: audit.audit_id,
      userId: audit.user_id,
      action: audit.action,
      resource: audit.resource,
      ipAddress: audit.ip_address,
      userAgent: audit.user_agent,
      success: audit.success === 1,
      details: audit.details,
      createdAt: audit.created_at
    }));

    res.status(200).json({
      success: true,
      data: formattedAuditLogs,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get security audit logs error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving security audit logs' });
  }
});

// ==============================================
// SYSTEM HEALTH
// ==============================================

// @route   GET /api/integration/health
// @desc    Get system health status
// @access  Private (System Admin)
router.get('/health', authenticateStaff, authorizeStaff('system_admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    // Get database status
    const dbStatus = await getRow<DatabaseRow>('SELECT 1 as status');
    const dbHealthy = !!dbStatus;

    // Get active integrations count
    const activeIntegrations = await getRow<DatabaseRow>('SELECT COUNT(*) as count FROM system_integrations WHERE status = ?', ['active']);
    const totalIntegrations = await getRow<DatabaseRow>('SELECT COUNT(*) as count FROM system_integrations');

    // Get recent audit logs count (last 24 hours)
    const recentAudits = await getRow<DatabaseRow>(
      'SELECT COUNT(*) as count FROM security_audit WHERE created_at >= datetime("now", "-1 day")'
    );

    // Get failed audit logs count (last 24 hours)
    const failedAudits = await getRow<DatabaseRow>(
      'SELECT COUNT(*) as count FROM security_audit WHERE created_at >= datetime("now", "-1 day") AND success = 0'
    );

    const healthStatus = {
      overall: dbHealthy ? 'healthy' : 'unhealthy',
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        healthy: dbHealthy
      },
      integrations: {
        total: totalIntegrations?.count || 0,
        active: activeIntegrations?.count || 0,
        inactive: (totalIntegrations?.count || 0) - (activeIntegrations?.count || 0)
      },
      security: {
        totalAudits24h: recentAudits?.count || 0,
        failedAudits24h: failedAudits?.count || 0,
        successRate: recentAudits?.count > 0 ? 
          ((recentAudits.count - (failedAudits?.count || 0)) / recentAudits.count * 100).toFixed(2) + '%' : 
          '100%'
      },
      timestamp: formatDateTime(new Date())
    };

    res.status(200).json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    logger.error('Get system health error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving system health' });
  }
});

// ==============================================
// API DOCUMENTATION
// @route   GET /api/integration/docs
// @desc    Get API documentation
// @access  Private (System Admin)
router.get('/docs', authenticateStaff, authorizeStaff('system_admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<any>>): Promise<void> => {
  try {
    const apiDocs = {
      version: '1.0.0',
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
      endpoints: {
        authentication: {
          staff: {
            login: 'POST /api/staff/auth/login',
            register: 'POST /api/staff/auth/register',
            profile: 'GET /api/staff/auth/me',
            changePassword: 'PUT /api/staff/auth/change-password',
            logout: 'POST /api/staff/auth/logout'
          },
          patient: {
            login: 'POST /api/patient/auth/login',
            register: 'POST /api/patient/auth/register',
            verifyEmail: 'POST /api/patient/auth/verify-email',
            profile: 'GET /api/patient/auth/me',
            changePassword: 'PUT /api/patient/auth/change-password',
            logout: 'POST /api/patient/auth/logout'
          }
        },
        patientManagement: {
          patients: 'GET /api/patients',
          createPatient: 'POST /api/patients',
          getPatient: 'GET /api/patients/:id',
          updatePatient: 'PUT /api/patients/:id',
          deletePatient: 'DELETE /api/patients/:id'
        },
        appointments: {
          appointments: 'GET /api/appointments',
          createAppointment: 'POST /api/appointments',
          getAppointment: 'GET /api/appointments/:id',
          updateAppointment: 'PUT /api/appointments/:id',
          cancelAppointment: 'PUT /api/appointments/:id/cancel'
        },
        clinical: {
          notes: 'GET /api/clinical/notes',
          createNote: 'POST /api/clinical/notes',
          prescriptions: 'GET /api/clinical/prescriptions',
          createPrescription: 'POST /api/clinical/prescriptions'
        },
        emergency: {
          visits: 'GET /api/emergency/visits',
          createVisit: 'POST /api/emergency/visits',
          ambulances: 'GET /api/emergency/ambulances',
          calls: 'GET /api/emergency/calls',
          dispatch: 'PUT /api/emergency/calls/:id/dispatch'
        },
        operationTheatre: {
          theatres: 'GET /api/ot/theatres',
          procedures: 'GET /api/ot/procedures',
          schedules: 'GET /api/ot/schedules',
          createSchedule: 'POST /api/ot/schedules',
          teamAssignments: 'GET /api/ot/schedules/:id/team'
        },
        radiology: {
          orders: 'GET /api/radiology/orders',
          createOrder: 'POST /api/radiology/orders',
          studies: 'GET /api/radiology/studies',
          equipment: 'GET /api/radiology/equipment'
        },
        humanResources: {
          employees: 'GET /api/hr/employees',
          leaveRequests: 'GET /api/hr/leave-requests',
          performanceReviews: 'GET /api/hr/performance-reviews',
          trainingRecords: 'GET /api/hr/training-records'
        },
        systemIntegration: {
          systems: 'GET /api/integration/systems',
          health: 'GET /api/integration/health',
          securityAudit: 'GET /api/integration/security/audit'
        }
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <token>',
        tokenExpiry: {
          staff: '8 hours',
          patient: '24 hours'
        }
      },
      responseFormat: {
        success: {
          success: true,
          message: 'Operation completed successfully',
          data: 'Response data object'
        },
        error: {
          success: false,
          error: 'Error message',
          details: 'Additional error details'
        }
      }
    };

    res.status(200).json({
      success: true,
      data: apiDocs
    });
  } catch (error) {
    logger.error('Get API documentation error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving API documentation' });
  }
});

export default router;

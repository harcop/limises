import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
import { 
  generateId,
  formatDate,
  sanitizeString
} from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';
import crypto from 'crypto';

const router = express.Router();

// ==============================================
// MULTI-FACTOR AUTHENTICATION
// ==============================================

// @route   POST /api/security/mfa/setup
// @desc    Setup MFA for user
// @access  Private (All Staff)
router.post('/mfa/setup', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mfaType, phoneNumber, email } = req.body;

    // Check if MFA is already enabled
    const existingMFA = await getRow(
      'SELECT * FROM mfa_settings WHERE staff_id = ? AND is_enabled = 1',
      [req.user.staffId]
    );

    if (existingMFA) {
      res.status(400).json({
        success: false,
        error: 'MFA is already enabled for this user'
      });
      return;
    }

    // Generate MFA secret for authenticator apps
    let mfaSecret = null;
    if (mfaType === 'authenticator') {
      mfaSecret = crypto.randomBytes(20).toString('base32');
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    const mfaId = generateId('MFA', 6);

    await runQuery(
      `INSERT INTO mfa_settings (
        mfa_id, staff_id, mfa_type, mfa_secret, mfa_backup_codes,
        is_enabled, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [
        mfaId,
        req.user.staffId,
        mfaType,
        mfaSecret,
        JSON.stringify(backupCodes)
      ]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO enhanced_audit_log (
        audit_id, user_id, action_type, resource_type, resource_id,
        new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, 'create', 'mfa_settings', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        mfaId,
        JSON.stringify({ mfaType, phoneNumber, email }),
        req.ip,
        req.get('User-Agent')
      ]
    );

    logger.info(`MFA setup initiated: ${mfaId} for staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'MFA setup initiated successfully',
      mfa: {
        mfaId,
        mfaType,
        mfaSecret: mfaType === 'authenticator' ? mfaSecret : null,
        backupCodes: backupCodes.slice(0, 5) // Show only first 5 codes
      }
    });

  } catch (error) {
    logger.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error setting up MFA'
    });
  }
});

// @route   POST /api/security/mfa/verify
// @desc    Verify MFA code and enable MFA
// @access  Private (All Staff)
router.post('/mfa/verify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mfaId, verificationCode } = req.body;

    // Get MFA settings
    const mfaSettings = await getRow(
      'SELECT * FROM mfa_settings WHERE mfa_id = ? AND staff_id = ?',
      [mfaId, req.user.staffId]
    );

    if (!mfaSettings) {
      res.status(404).json({
        success: false,
        error: 'MFA settings not found'
      });
      return;
    }

    // Verify the code (simplified verification for demo)
    let isValid = false;
    if (mfaSettings.mfa_type === 'authenticator') {
      // In production, use proper TOTP verification
      isValid = verificationCode.length === 6 && /^\d+$/.test(verificationCode);
    } else if (mfaSettings.mfa_type === 'sms' || mfaSettings.mfa_type === 'email') {
      // In production, verify against sent code
      isValid = verificationCode.length === 6 && /^\d+$/.test(verificationCode);
    }

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
      return;
    }

    // Enable MFA
    await runQuery(
      'UPDATE mfa_settings SET is_enabled = 1, last_used = CURRENT_TIMESTAMP WHERE mfa_id = ?',
      [mfaId]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO enhanced_audit_log (
        audit_id, user_id, action_type, resource_type, resource_id,
        new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, 'update', 'mfa_settings', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        mfaId,
        JSON.stringify({ mfaEnabled: true }),
        req.ip,
        req.get('User-Agent')
      ]
    );

    logger.info(`MFA enabled: ${mfaId} for staff ${req.user.staffId}`);

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });

  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying MFA'
    });
  }
});

// @route   POST /api/security/mfa/challenge
// @desc    Create MFA challenge for login
// @access  Public
router.post('/mfa/challenge', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, mfaType } = req.body;

    // Get MFA settings
    const mfaSettings = await getRow(
      'SELECT * FROM mfa_settings WHERE staff_id = ? AND mfa_type = ? AND is_enabled = 1',
      [staffId, mfaType]
    );

    if (!mfaSettings) {
      res.status(404).json({
        success: false,
        error: 'MFA not enabled for this user'
      });
      return;
    }

    // Generate challenge
    const challengeId = generateId('CHALL', 6);
    const challengeToken = crypto.randomBytes(32).toString('hex');
    const challengeCode = mfaType === 'authenticator' ? null : 
      Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await runQuery(
      `INSERT INTO mfa_challenges (
        challenge_id, staff_id, challenge_type, challenge_code, challenge_token,
        expires_at, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        challengeId,
        staffId,
        mfaType,
        challengeCode,
        challengeToken,
        expiresAt.toISOString(),
        req.ip,
        req.get('User-Agent')
      ]
    );

    // In production, send SMS/email here
    if (mfaType === 'sms' || mfaType === 'email') {
      // Send code via SMS/email service
      logger.info(`MFA code sent: ${challengeCode} to ${staffId}`);
    }

    res.status(201).json({
      success: true,
      message: 'MFA challenge created',
      challenge: {
        challengeId,
        challengeToken,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    logger.error('MFA challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating MFA challenge'
    });
  }
});

// ==============================================
// ENHANCED AUDIT LOGGING
// ==============================================

// @route   GET /api/security/audit/logs
// @desc    Get audit logs with advanced filtering
// @access  Private (Admin, Security Officer)
router.get('/audit/logs', authenticate, authorize('admin', 'security_officer'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const {
      userId,
      actionType,
      resourceType,
      startDate,
      endDate,
      isSensitive,
      riskScore,
      ipAddress
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (userId) {
      whereClause += ' AND eal.user_id = ?';
      params.push(userId);
    }

    if (actionType) {
      whereClause += ' AND eal.action_type = ?';
      params.push(actionType);
    }

    if (resourceType) {
      whereClause += ' AND eal.resource_type = ?';
      params.push(resourceType);
    }

    if (startDate && endDate) {
      whereClause += ' AND DATE(eal.created_at) BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    if (isSensitive !== undefined) {
      whereClause += ' AND eal.is_sensitive = ?';
      params.push(isSensitive === 'true' ? 1 : 0);
    }

    if (riskScore) {
      whereClause += ' AND eal.risk_score >= ?';
      params.push(parseInt(riskScore));
    }

    if (ipAddress) {
      whereClause += ' AND eal.ip_address = ?';
      params.push(ipAddress);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM enhanced_audit_log eal
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get audit logs
    const auditLogs = await getAll(
      `SELECT 
        eal.*, 
        s.first_name as user_first_name, s.last_name as user_last_name,
        s.department, s.position
       FROM enhanced_audit_log eal
       LEFT JOIN staff s ON eal.user_id = s.staff_id
       ${whereClause}
       ORDER BY eal.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving audit logs'
    });
  }
});

// @route   GET /api/security/audit/logs/:auditId
// @desc    Get detailed audit log entry
// @access  Private (Admin, Security Officer)
router.get('/audit/logs/:auditId', authenticate, authorize('admin', 'security_officer'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { auditId } = req.params;

    const auditLog = await getRow(
      `SELECT 
        eal.*, 
        s.first_name as user_first_name, s.last_name as user_last_name,
        s.department, s.position, s.email
       FROM enhanced_audit_log eal
       LEFT JOIN staff s ON eal.user_id = s.staff_id
       WHERE eal.audit_id = ?`,
      [auditId]
    );

    if (!auditLog) {
      res.status(404).json({
        success: false,
        error: 'Audit log not found'
      });
      return;
    }

    res.json({
      success: true,
      auditLog
    });

  } catch (error) {
    logger.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving audit log'
    });
  }
});

// ==============================================
// SECURITY ALERTS
// ==============================================

// @route   GET /api/security/alerts
// @desc    Get security alerts
// @access  Private (Admin, Security Officer)
router.get('/alerts', authenticate, authorize('admin', 'security_officer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertType, alertSeverity, isAcknowledged, isResolved } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (alertType) {
      whereClause += ' AND sa.alert_type = ?';
      params.push(alertType);
    }

    if (alertSeverity) {
      whereClause += ' AND sa.alert_severity = ?';
      params.push(alertSeverity);
    }

    if (isAcknowledged !== undefined) {
      whereClause += ' AND sa.is_acknowledged = ?';
      params.push(isAcknowledged === 'true' ? 1 : 0);
    }

    if (isResolved !== undefined) {
      whereClause += ' AND sa.is_resolved = ?';
      params.push(isResolved === 'true' ? 1 : 0);
    }

    const alerts = await getAll(
      `SELECT 
        sa.*, 
        s.first_name as user_first_name, s.last_name as user_last_name
       FROM security_alerts sa
       LEFT JOIN staff s ON sa.user_id = s.staff_id
       ${whereClause}
       ORDER BY sa.alert_severity DESC, sa.created_at DESC`,
      params
    );

    res.json({
      success: true,
      alerts
    });

  } catch (error) {
    logger.error('Get security alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving security alerts'
    });
  }
});

// @route   PUT /api/security/alerts/:alertId/acknowledge
// @desc    Acknowledge security alert
// @access  Private (Admin, Security Officer)
router.put('/alerts/:alertId/acknowledge', authenticate, authorize('admin', 'security_officer'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertId } = req.params;

    const alert = await getRow(
      'SELECT * FROM security_alerts WHERE alert_id = ?',
      [alertId]
    );

    if (!alert) {
      res.status(404).json({
        success: false,
        error: 'Security alert not found'
      });
      return;
    }

    await runQuery(
      'UPDATE security_alerts SET is_acknowledged = 1, acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP WHERE alert_id = ?',
      [req.user.staffId, alertId]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO enhanced_audit_log (
        audit_id, user_id, action_type, resource_type, resource_id,
        new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, 'update', 'security_alerts', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        alertId,
        JSON.stringify({ acknowledged: true }),
        req.ip,
        req.get('User-Agent')
      ]
    );

    logger.info(`Security alert acknowledged: ${alertId} by staff ${req.user.staffId}`);

    res.json({
      success: true,
      message: 'Security alert acknowledged successfully'
    });

  } catch (error) {
    logger.error('Acknowledge security alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error acknowledging security alert'
    });
  }
});

// ==============================================
// COMPLIANCE MANAGEMENT
// ==============================================

// @route   GET /api/security/compliance/policies
// @desc    Get compliance policies
// @access  Private (Admin, Compliance Officer)
router.get('/compliance/policies', authenticate, authorize('admin', 'compliance_officer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { policyType, isActive } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (policyType) {
      whereClause += ' AND cp.policy_type = ?';
      params.push(policyType);
    }

    if (isActive !== undefined) {
      whereClause += ' AND cp.is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const policies = await getAll(
      `SELECT 
        cp.*, 
        s.first_name as created_by_first_name, s.last_name as created_by_last_name
       FROM compliance_policies cp
       LEFT JOIN staff s ON cp.created_by = s.staff_id
       ${whereClause}
       ORDER BY cp.policy_type, cp.policy_name`,
      params
    );

    res.json({
      success: true,
      policies
    });

  } catch (error) {
    logger.error('Get compliance policies error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving compliance policies'
    });
  }
});

// @route   POST /api/security/compliance/assessments
// @desc    Create compliance assessment
// @access  Private (Admin, Compliance Officer)
router.post('/compliance/assessments', authenticate, authorize('admin', 'compliance_officer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      policyId,
      assessmentType,
      assessmentData,
      findings,
      recommendations
    } = req.body;

    // Validate policy exists
    const policy = await getRow(
      'SELECT * FROM compliance_policies WHERE policy_id = ? AND is_active = 1',
      [policyId]
    );

    if (!policy) {
      res.status(404).json({
        success: false,
        error: 'Compliance policy not found or inactive'
      });
      return;
    }

    const assessmentId = generateId('ASSESS', 6);

    await runQuery(
      `INSERT INTO compliance_assessments (
        assessment_id, policy_id, assessment_type, assessment_status,
        assessment_data, findings, recommendations, assessed_by, assessed_at
      ) VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        assessmentId,
        policyId,
        assessmentType,
        JSON.stringify(assessmentData),
        sanitizeString(findings),
        sanitizeString(recommendations),
        req.user.staffId
      ]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO enhanced_audit_log (
        audit_id, user_id, action_type, resource_type, resource_id,
        new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, 'create', 'compliance_assessments', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        assessmentId,
        JSON.stringify({ policyId, assessmentType }),
        req.ip,
        req.get('User-Agent')
      ]
    );

    logger.info(`Compliance assessment created: ${assessmentId} for policy ${policyId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Compliance assessment created successfully',
      assessment: {
        assessmentId,
        policyId,
        assessmentType,
        assessedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Create compliance assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating compliance assessment'
    });
  }
});

// ==============================================
// SECURITY DASHBOARD
// ==============================================

// @route   GET /api/security/dashboard
// @desc    Get security dashboard data
// @access  Private (Admin, Security Officer)
router.get('/dashboard', authenticate, authorize('admin', 'security_officer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get security metrics
    const securityMetrics = await getAll(
      `SELECT 
        metric_name, metric_type, metric_value, metric_unit, measurement_date
       FROM security_metrics
       ${dateFilter}
       ORDER BY measurement_date DESC, metric_type`,
      params
    );

    // Get active alerts count
    const activeAlertsResult = await getRow(
      'SELECT COUNT(*) as count FROM security_alerts WHERE is_acknowledged = 0 AND is_resolved = 0'
    );

    // Get recent security events
    const recentEvents = await getAll(
      `SELECT 
        se.*, s.first_name, s.last_name
       FROM security_events se
       LEFT JOIN staff s ON se.user_id = s.staff_id
       ORDER BY se.created_at DESC
       LIMIT 10`
    );

    // Get compliance status
    const complianceStatus = await getAll(
      `SELECT 
        cp.policy_type, cp.policy_name,
        AVG(ca.compliance_score) as average_score,
        COUNT(ca.assessment_id) as assessment_count
       FROM compliance_policies cp
       LEFT JOIN compliance_assessments ca ON cp.policy_id = ca.policy_id
       WHERE cp.is_active = 1
       GROUP BY cp.policy_type, cp.policy_name`
    );

    res.json({
      success: true,
      dashboard: {
        securityMetrics,
        activeAlerts: activeAlertsResult.count,
        recentEvents,
        complianceStatus
      }
    });

  } catch (error) {
    logger.error('Get security dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving security dashboard'
    });
  }
});

// ==============================================
// DATA PRIVACY MANAGEMENT
// ==============================================

// @route   GET /api/security/privacy/consent/:patientId
// @desc    Get patient privacy consent
// @access  Private (Medical Staff)
router.get('/privacy/consent/:patientId', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const consentRecords = await getAll(
      `SELECT 
        pc.*, p.first_name, p.last_name
       FROM privacy_consent pc
       LEFT JOIN patients p ON pc.patient_id = p.patient_id
       WHERE pc.patient_id = ?
       ORDER BY pc.created_at DESC`,
      [patientId]
    );

    res.json({
      success: true,
      consentRecords
    });

  } catch (error) {
    logger.error('Get privacy consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving privacy consent'
    });
  }
});

// @route   POST /api/security/privacy/consent
// @desc    Create or update privacy consent
// @access  Private (Medical Staff)
router.post('/privacy/consent', authenticate, authorize('doctor', 'nurse', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      consentType,
      consentStatus,
      consentDetails,
      expiresAt
    } = req.body;

    // Validate patient exists
    const patient = await getRow(
      'SELECT patient_id FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
      return;
    }

    const consentId = generateId('CONSENT', 6);

    await runQuery(
      `INSERT INTO privacy_consent (
        consent_id, patient_id, consent_type, consent_status,
        consent_details, granted_at, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        consentId,
        patientId,
        consentType,
        consentStatus,
        sanitizeString(consentDetails),
        consentStatus === 'granted' ? new Date().toISOString() : null,
        expiresAt ? new Date(expiresAt).toISOString() : null
      ]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO enhanced_audit_log (
        audit_id, user_id, action_type, resource_type, resource_id,
        new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, 'create', 'privacy_consent', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        consentId,
        JSON.stringify({ patientId, consentType, consentStatus }),
        req.ip,
        req.get('User-Agent')
      ]
    );

    logger.info(`Privacy consent created: ${consentId} for patient ${patientId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Privacy consent created successfully',
      consent: {
        consentId,
        patientId,
        consentType,
        consentStatus,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Create privacy consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating privacy consent'
    });
  }
});

export default router;

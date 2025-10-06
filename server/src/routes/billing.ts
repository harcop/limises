import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateCharge, validatePayment, validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateChargeId,
  generatePaymentId,
  generateId,
  formatDate, 
  formatTime,
  formatCurrency
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/billing/charges
// @desc    Create a new charge
// @access  Private (Staff only)
router.post('/charges', authenticate, authorize('receptionist', 'doctor', 'nurse', 'admin'), validateCharge, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      accountId,
      serviceType,
      serviceDescription,
      serviceDate,
      quantity,
      unitPrice,
      totalAmount
    } = req.body;

    // Check if patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
    }

    // Check if billing account exists
    const account = await getRow(
      'SELECT account_id, account_number, balance FROM billing_accounts WHERE account_id = ? AND patient_id = ? AND status = "active"',
      [accountId, patientId]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Billing account not found or inactive'
      });
    }

    // Generate charge ID
    const chargeId = generateChargeId();

    await runQuery(
      `INSERT INTO charges (
        charge_id, patient_id, account_id, service_type, service_description, service_date,
        quantity, unit_price, total_amount, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [
        chargeId,
        patientId,
        accountId,
        serviceType,
        serviceDescription,
        formatDate(serviceDate),
        quantity || 1,
        unitPrice,
        totalAmount
      ]
    );

    // Update account balance
    await runQuery(
      'UPDATE billing_accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE account_id = ?',
      [totalAmount, accountId]
    );

    logger.info(`Charge created: ${chargeId} for patient ${patientId} - ${formatCurrency(totalAmount)}`);

    res.status(201).json({
      success: true,
      message: 'Charge created successfully',
      charge: {
        chargeId,
        patientId,
        accountId,
        serviceType,
        totalAmount,
        status: 'pending',
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name
        }
      }
    });

  } catch (error) {
    logger.error('Create charge error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating charge'
    });
  }
});

// @route   GET /api/billing/charges
// @desc    Get charges with filters
// @access  Private (Staff only)
router.get('/charges', authenticate, authorize('receptionist', 'billing_staff', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      accountId,
      serviceType,
      status,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND c.patient_id = ?';
      params.push(patientId);
    }

    if (accountId) {
      whereClause += ' AND c.account_id = ?';
      params.push(accountId);
    }

    if (serviceType) {
      whereClause += ' AND c.service_type = ?';
      params.push(serviceType);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }

    if (startDate && endDate) {
      whereClause += ' AND c.service_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM charges c
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get charges
    const charges = await getAll(
      `SELECT 
        c.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone,
        ba.account_number
       FROM charges c
       LEFT JOIN patients p ON c.patient_id = p.patient_id
       LEFT JOIN billing_accounts ba ON c.account_id = ba.account_id
       ${whereClause}
       ORDER BY c.service_date DESC, c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      charges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get charges error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving charges'
    });
  }
});

// @route   GET /api/billing/charges/:chargeId
// @desc    Get charge by ID
// @access  Private (Staff only)
router.get('/charges/:chargeId', authenticate, authorize('receptionist', 'billing_staff', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chargeId } = req.params;

    const charge = await getRow(
      `SELECT 
        c.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone, p.email,
        ba.account_number, ba.balance
       FROM charges c
       LEFT JOIN patients p ON c.patient_id = p.patient_id
       LEFT JOIN billing_accounts ba ON c.account_id = ba.account_id
       WHERE c.charge_id = ?`,
      [chargeId]
    );

    if (!charge) {
      return res.status(404).json({
        success: false,
        error: 'Charge not found'
      });
    }

    res.json({
      success: true,
      charge
    });

  } catch (error) {
    logger.error('Get charge error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving charge'
    });
  }
});

// @route   POST /api/billing/payments
// @desc    Record a payment
// @access  Private (Billing Staff, Admin only)
router.post('/payments', authenticate, authorize('billing_staff', 'admin'), validatePayment, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      accountId,
      paymentDate,
      paymentTime,
      paymentMethod,
      paymentAmount,
      referenceNumber,
      notes
    } = req.body;

    // Check if patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
    }

    // Check if billing account exists
    const account = await getRow(
      'SELECT account_id, account_number, balance FROM billing_accounts WHERE account_id = ? AND patient_id = ? AND status = "active"',
      [accountId, patientId]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Billing account not found or inactive'
      });
    }

    // Generate payment ID
    const paymentId = generatePaymentId();

    await runQuery(
      `INSERT INTO payments (
        payment_id, patient_id, account_id, payment_date, payment_time, payment_method,
        payment_amount, reference_number, notes, processed_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        paymentId,
        patientId,
        accountId,
        formatDate(paymentDate),
        paymentTime ? formatTime(paymentTime) : formatTime(new Date().toTimeString().slice(0, 8)),
        paymentMethod,
        paymentAmount,
        referenceNumber,
        notes,
        req.user.staffId
      ]
    );

    // Update account balance
    await runQuery(
      'UPDATE billing_accounts SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE account_id = ?',
      [paymentAmount, accountId]
    );

    logger.info(`Payment recorded: ${paymentId} for patient ${patientId} - ${formatCurrency(paymentAmount)}`);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment: {
        paymentId,
        patientId,
        accountId,
        paymentAmount,
        paymentMethod,
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name
        }
      }
    });

  } catch (error) {
    logger.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error recording payment'
    });
  }
});

// @route   GET /api/billing/payments
// @desc    Get payments with filters
// @access  Private (Staff only)
router.get('/payments', authenticate, authorize('receptionist', 'billing_staff', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      accountId,
      paymentMethod,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND p.patient_id = ?';
      params.push(patientId);
    }

    if (accountId) {
      whereClause += ' AND p.account_id = ?';
      params.push(accountId);
    }

    if (paymentMethod) {
      whereClause += ' AND p.payment_method = ?';
      params.push(paymentMethod);
    }

    if (startDate && endDate) {
      whereClause += ' AND p.payment_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM payments p
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get payments
    const payments = await getAll(
      `SELECT 
        p.*, 
        pt.first_name as patient_first_name, pt.last_name as patient_last_name,
        ba.account_number,
        s.first_name as processed_by_first_name, s.last_name as processed_by_last_name
       FROM payments p
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN billing_accounts ba ON p.account_id = ba.account_id
       LEFT JOIN staff s ON p.processed_by = s.staff_id
       ${whereClause}
       ORDER BY p.payment_date DESC, p.payment_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving payments'
    });
  }
});

// @route   GET /api/billing/accounts/:accountId
// @desc    Get billing account details
// @access  Private (Staff only)
router.get('/accounts/:accountId', authenticate, authorize('receptionist', 'billing_staff', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params;

    const account = await getRow(
      `SELECT 
        ba.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone, p.email
       FROM billing_accounts ba
       LEFT JOIN patients p ON ba.patient_id = p.patient_id
       WHERE ba.account_id = ?`,
      [accountId]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Billing account not found'
      });
    }

    // Get recent charges
    const recentCharges = await getAll(
      `SELECT * FROM charges 
       WHERE account_id = ? 
       ORDER BY service_date DESC, created_at DESC 
       LIMIT 10`,
      [accountId]
    );

    // Get recent payments
    const recentPayments = await getAll(
      `SELECT * FROM payments 
       WHERE account_id = ? 
       ORDER BY payment_date DESC, payment_time DESC 
       LIMIT 10`,
      [accountId]
    );

    res.json({
      success: true,
      account: {
        ...account,
        recentCharges,
        recentPayments
      }
    });

  } catch (error) {
    logger.error('Get billing account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving billing account'
    });
  }
});

// @route   POST /api/billing/insurance-claims
// @desc    Create insurance claim
// @access  Private (Billing Staff, Admin only)
router.post('/insurance-claims', authenticate, authorize('billing_staff', 'admin'), [
  require('express-validator').body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  require('express-validator').body('insuranceId').trim().isLength({ min: 1 }).withMessage('Insurance ID is required'),
  require('express-validator').body('claimDate').isISO8601().withMessage('Valid claim date is required'),
  require('express-validator').body('serviceDateFrom').isISO8601().withMessage('Valid service date from is required'),
  require('express-validator').body('serviceDateTo').isISO8601().withMessage('Valid service date to is required'),
  require('express-validator').body('totalCharges').isDecimal().withMessage('Valid total charges is required'),
  require('express-validator').body('claimAmount').isDecimal().withMessage('Valid claim amount is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      patientId,
      insuranceId,
      claimDate,
      serviceDateFrom,
      serviceDateTo,
      totalCharges,
      claimAmount,
      claimNumber,
      referenceNumber,
      notes
    } = req.body;

    // Check if patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
    }

    // Check if insurance exists
    const insurance = await getRow(
      'SELECT insurance_id, insurance_provider FROM patient_insurance WHERE insurance_id = ? AND patient_id = ? AND status = "active"',
      [insuranceId, patientId]
    );

    if (!insurance) {
      return res.status(404).json({
        success: false,
        error: 'Insurance not found or inactive'
      });
    }

    // Generate claim ID
    const claimId = generateId('CLAIM', 6);

    await runQuery(
      `INSERT INTO insurance_claims (
        claim_id, patient_id, insurance_id, claim_date, service_date_from, service_date_to,
        total_charges, claim_amount, status, claim_number, reference_number, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        claimId,
        patientId,
        insuranceId,
        formatDate(claimDate),
        formatDate(serviceDateFrom),
        formatDate(serviceDateTo),
        totalCharges,
        claimAmount,
        claimNumber,
        referenceNumber,
        notes
      ]
    );

    logger.info(`Insurance claim created: ${claimId} for patient ${patientId} - ${formatCurrency(claimAmount)}`);

    res.status(201).json({
      success: true,
      message: 'Insurance claim created successfully',
      claim: {
        claimId,
        patientId,
        insuranceId,
        insuranceProvider: insurance.insurance_provider,
        claimAmount,
        status: 'submitted',
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name
        }
      }
    });

  } catch (error) {
    logger.error('Create insurance claim error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating insurance claim'
    });
  }
});

// @route   GET /api/billing/insurance-claims
// @desc    Get insurance claims with filters
// @access  Private (Staff only)
router.get('/insurance-claims', authenticate, authorize('billing_staff', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      insuranceId,
      status,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND ic.patient_id = ?';
      params.push(patientId);
    }

    if (insuranceId) {
      whereClause += ' AND ic.insurance_id = ?';
      params.push(insuranceId);
    }

    if (status) {
      whereClause += ' AND ic.status = ?';
      params.push(status);
    }

    if (startDate && endDate) {
      whereClause += ' AND ic.claim_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM insurance_claims ic
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get insurance claims
    const claims = await getAll(
      `SELECT 
        ic.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        pi.insurance_provider, pi.policy_number
       FROM insurance_claims ic
       LEFT JOIN patients p ON ic.patient_id = p.patient_id
       LEFT JOIN patient_insurance pi ON ic.insurance_id = pi.insurance_id
       ${whereClause}
       ORDER BY ic.claim_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      claims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get insurance claims error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving insurance claims'
    });
  }
});

// @route   GET /api/billing/stats
// @desc    Get billing statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE service_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get charge statistics
    const chargeStats = await getRow(
      `SELECT 
        COUNT(*) as total_charges,
        SUM(total_amount) as total_charge_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_charges,
        COUNT(CASE WHEN status = 'billed' THEN 1 END) as billed_charges,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_charges,
        AVG(total_amount) as avg_charge_amount
       FROM charges
       ${dateFilter}`,
      params
    );

    // Get payment statistics
    const paymentStats = await getRow(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(payment_amount) as total_payment_amount,
        COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_payments,
        COUNT(CASE WHEN payment_method = 'credit_card' THEN 1 END) as credit_card_payments,
        COUNT(CASE WHEN payment_method = 'insurance' THEN 1 END) as insurance_payments,
        AVG(payment_amount) as avg_payment_amount
       FROM payments
       ${dateFilter.replace('service_date', 'payment_date')}`,
      params
    );

    // Get account statistics
    const accountStats = await getRow(
      `SELECT 
        COUNT(*) as total_accounts,
        SUM(balance) as total_outstanding_balance,
        COUNT(CASE WHEN balance > 0 THEN 1 END) as accounts_with_balance,
        COUNT(CASE WHEN balance < 0 THEN 1 END) as accounts_with_credit,
        AVG(balance) as avg_account_balance
       FROM billing_accounts
       WHERE status = 'active'`
    );

    res.json({
      success: true,
      stats: {
        charges: chargeStats,
        payments: paymentStats,
        accounts: accountStats
      }
    });

  } catch (error) {
    logger.error('Get billing stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving billing statistics'
    });
  }
});

export default router;

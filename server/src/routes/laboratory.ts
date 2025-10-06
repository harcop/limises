import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateLabOrder, validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateLabOrderId,
  generateId,
  formatDate, 
  formatTime 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/lab/orders
// @desc    Create a new lab order
// @access  Private (Doctor, Nurse only)
router.post('/orders', authenticate, authorize('doctor', 'nurse', 'admin'), validateLabOrder, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      staffId,
      appointmentId,
      admissionId,
      orderDate,
      orderTime,
      testType,
      testDescription,
      priority,
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

    // Check if staff exists
    const staff = await getRow(
      'SELECT staff_id, first_name, last_name FROM staff WHERE staff_id = ? AND status = "active"',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found or inactive'
      });
    }

    // Generate lab order ID
    const orderId = generateLabOrderId();

    await runQuery(
      `INSERT INTO lab_orders (
        order_id, patient_id, staff_id, appointment_id, admission_id, order_date, order_time,
        test_type, test_description, priority, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ordered', ?, CURRENT_TIMESTAMP)`,
      [
        orderId,
        patientId,
        staffId,
        appointmentId || null,
        admissionId || null,
        formatDate(orderDate),
        orderTime ? formatTime(orderTime) : formatTime(new Date().toTimeString().slice(0, 8)),
        testType,
        testDescription,
        priority,
        notes
      ]
    );

    logger.info(`Lab order created: ${orderId} for patient ${patientId} by staff ${staffId}`);

    res.status(201).json({
      success: true,
      message: 'Lab order created successfully',
      order: {
        orderId,
        patientId,
        staffId,
        testType,
        priority,
        status: 'ordered',
        patient: {
          firstName: patient.first_name,
          lastName: patient.last_name
        },
        staff: {
          firstName: staff.first_name,
          lastName: staff.last_name
        }
      }
    });

  } catch (error) {
    logger.error('Create lab order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating lab order'
    });
  }
});

// @route   GET /api/lab/orders
// @desc    Get lab orders with filters
// @access  Private (Staff only)
router.get('/orders', authenticate, authorize('doctor', 'nurse', 'lab_technician', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      staffId,
      testType,
      status,
      priority,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND lo.patient_id = ?';
      params.push(patientId);
    }

    if (staffId) {
      whereClause += ' AND lo.staff_id = ?';
      params.push(staffId);
    }

    if (testType) {
      whereClause += ' AND lo.test_type = ?';
      params.push(testType);
    }

    if (status) {
      whereClause += ' AND lo.status = ?';
      params.push(status);
    }

    if (priority) {
      whereClause += ' AND lo.priority = ?';
      params.push(priority);
    }

    if (startDate && endDate) {
      whereClause += ' AND lo.order_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM lab_orders lo
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get lab orders
    const orders = await getAll(
      `SELECT 
        lo.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department
       FROM lab_orders lo
       LEFT JOIN patients p ON lo.patient_id = p.patient_id
       LEFT JOIN staff s ON lo.staff_id = s.staff_id
       ${whereClause}
       ORDER BY lo.order_date DESC, lo.order_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get lab orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving lab orders'
    });
  }
});

// @route   GET /api/lab/orders/:orderId
// @desc    Get lab order by ID
// @access  Private (Staff only)
router.get('/orders/:orderId', authenticate, authorize('doctor', 'nurse', 'lab_technician', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await getRow(
      `SELECT 
        lo.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender, p.phone,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department
       FROM lab_orders lo
       LEFT JOIN patients p ON lo.patient_id = p.patient_id
       LEFT JOIN staff s ON lo.staff_id = s.staff_id
       WHERE lo.order_id = ?`,
      [orderId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Lab order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    logger.error('Get lab order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving lab order'
    });
  }
});

// @route   PUT /api/lab/orders/:orderId/status
// @desc    Update lab order status
// @access  Private (Lab Technician, Doctor only)
router.put('/orders/:orderId/status', authenticate, authorize('lab_technician', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['ordered', 'collected', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be ordered, collected, in_progress, completed, or cancelled'
      });
    }

    const order = await getRow(
      'SELECT * FROM lab_orders WHERE order_id = ?',
      [orderId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Lab order not found'
      });
    }

    await runQuery(
      'UPDATE lab_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      [status, orderId]
    );

    logger.info(`Lab order status updated: ${orderId} to ${status} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Lab order status updated successfully'
    });

  } catch (error) {
    logger.error('Update lab order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating lab order status'
    });
  }
});

// @route   POST /api/lab/samples
// @desc    Create lab sample
// @access  Private (Lab Technician only)
router.post('/samples', authenticate, authorize('lab_technician', 'admin'), [
  require('express-validator').body('orderId').trim().isLength({ min: 1 }).withMessage('Order ID is required'),
  require('express-validator').body('sampleType').trim().isLength({ min: 1, max: 100 }).withMessage('Sample type is required'),
  require('express-validator').body('collectionDate').isISO8601().withMessage('Valid collection date is required'),
  require('express-validator').body('collectedBy').trim().isLength({ min: 1 }).withMessage('Collected by is required'),
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
      orderId,
      sampleType,
      collectionDate,
      collectionTime,
      collectedBy,
      sampleCondition,
      storageLocation,
      notes
    } = req.body;

    // Check if lab order exists
    const order = await getRow(
      'SELECT * FROM lab_orders WHERE order_id = ?',
      [orderId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Lab order not found'
      });
    }

    // Generate sample ID
    const sampleId = generateId('SAMPLE', 6);

    await runQuery(
      `INSERT INTO lab_samples (
        sample_id, order_id, sample_type, collection_date, collection_time, collected_by,
        sample_condition, storage_location, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'collected', ?, CURRENT_TIMESTAMP)`,
      [
        sampleId,
        orderId,
        sampleType,
        formatDate(collectionDate),
        collectionTime ? formatTime(collectionTime) : formatTime(new Date().toTimeString().slice(0, 8)),
        collectedBy,
        sampleCondition || 'good',
        storageLocation,
        notes
      ]
    );

    // Update order status to collected
    await runQuery(
      'UPDATE lab_orders SET status = "collected", updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      [orderId]
    );

    logger.info(`Lab sample created: ${sampleId} for order ${orderId} by technician ${collectedBy}`);

    res.status(201).json({
      success: true,
      message: 'Lab sample created successfully',
      sample: {
        sampleId,
        orderId,
        sampleType,
        status: 'collected'
      }
    });

  } catch (error) {
    logger.error('Create lab sample error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating lab sample'
    });
  }
});

// @route   GET /api/lab/samples/:orderId
// @desc    Get lab samples for order
// @access  Private (Staff only)
router.get('/samples/:orderId', authenticate, authorize('doctor', 'nurse', 'lab_technician', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const samples = await getAll(
      `SELECT 
        ls.*, s.first_name as collected_by_first_name, s.last_name as collected_by_last_name
       FROM lab_samples ls
       LEFT JOIN staff s ON ls.collected_by = s.staff_id
       WHERE ls.order_id = ?
       ORDER BY ls.collection_date DESC, ls.collection_time DESC`,
      [orderId]
    );

    res.json({
      success: true,
      samples
    });

  } catch (error) {
    logger.error('Get lab samples error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving lab samples'
    });
  }
});

// @route   POST /api/lab/results
// @desc    Create lab result
// @access  Private (Lab Technician, Doctor only)
router.post('/results', authenticate, authorize('lab_technician', 'doctor', 'admin'), [
  require('express-validator').body('orderId').trim().isLength({ min: 1 }).withMessage('Order ID is required'),
  require('express-validator').body('testName').trim().isLength({ min: 1, max: 200 }).withMessage('Test name is required'),
  require('express-validator').body('resultDate').isISO8601().withMessage('Valid result date is required'),
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
      orderId,
      sampleId,
      testName,
      resultValue,
      normalRange,
      unit,
      status,
      verifiedBy,
      resultDate,
      resultTime,
      notes
    } = req.body;

    // Check if lab order exists
    const order = await getRow(
      'SELECT * FROM lab_orders WHERE order_id = ?',
      [orderId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Lab order not found'
      });
    }

    // Generate result ID
    const resultId = generateId('RESULT', 6);

    await runQuery(
      `INSERT INTO lab_results (
        result_id, order_id, sample_id, test_name, result_value, normal_range, unit,
        status, verified_by, verified_at, result_date, result_time, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        resultId,
        orderId,
        sampleId || null,
        testName,
        resultValue,
        normalRange,
        unit,
        status || 'normal',
        verifiedBy || null,
        verifiedBy ? new Date().toISOString() : null,
        formatDate(resultDate),
        resultTime ? formatTime(resultTime) : formatTime(new Date().toTimeString().slice(0, 8)),
        notes
      ]
    );

    // Update order status to completed if all results are in
    const pendingResults = await getRow(
      'SELECT COUNT(*) as count FROM lab_orders lo LEFT JOIN lab_results lr ON lo.order_id = lr.order_id WHERE lo.order_id = ? AND lr.result_id IS NULL',
      [orderId]
    );

    if (pendingResults.count === 0) {
      await runQuery(
        'UPDATE lab_orders SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
        [orderId]
      );
    }

    logger.info(`Lab result created: ${resultId} for order ${orderId}`);

    res.status(201).json({
      success: true,
      message: 'Lab result created successfully',
      result: {
        resultId,
        orderId,
        testName,
        resultValue,
        status: status || 'normal'
      }
    });

  } catch (error) {
    logger.error('Create lab result error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating lab result'
    });
  }
});

// @route   GET /api/lab/results
// @desc    Get lab results with filters
// @access  Private (Staff only)
router.get('/results', authenticate, authorize('doctor', 'nurse', 'lab_technician', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      orderId,
      testName,
      status,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND lo.patient_id = ?';
      params.push(patientId);
    }

    if (orderId) {
      whereClause += ' AND lr.order_id = ?';
      params.push(orderId);
    }

    if (testName) {
      whereClause += ' AND lr.test_name LIKE ?';
      params.push(`%${testName}%`);
    }

    if (status) {
      whereClause += ' AND lr.status = ?';
      params.push(status);
    }

    if (startDate && endDate) {
      whereClause += ' AND lr.result_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM lab_results lr
       LEFT JOIN lab_orders lo ON lr.order_id = lo.order_id
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get lab results
    const results = await getAll(
      `SELECT 
        lr.*, 
        lo.patient_id, lo.test_type,
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        s.first_name as verified_by_first_name, s.last_name as verified_by_last_name
       FROM lab_results lr
       LEFT JOIN lab_orders lo ON lr.order_id = lo.order_id
       LEFT JOIN patients p ON lo.patient_id = p.patient_id
       LEFT JOIN staff s ON lr.verified_by = s.staff_id
       ${whereClause}
       ORDER BY lr.result_date DESC, lr.result_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get lab results error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving lab results'
    });
  }
});

// @route   GET /api/lab/results/:resultId
// @desc    Get lab result by ID
// @access  Private (Staff only)
router.get('/results/:resultId', authenticate, authorize('doctor', 'nurse', 'lab_technician', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resultId } = req.params;

    const result = await getRow(
      `SELECT 
        lr.*, 
        lo.patient_id, lo.test_type, lo.test_description,
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender,
        s.first_name as verified_by_first_name, s.last_name as verified_by_last_name
       FROM lab_results lr
       LEFT JOIN lab_orders lo ON lr.order_id = lo.order_id
       LEFT JOIN patients p ON lo.patient_id = p.patient_id
       LEFT JOIN staff s ON lr.verified_by = s.staff_id
       WHERE lr.result_id = ?`,
      [resultId]
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Lab result not found'
      });
    }

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Get lab result error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving lab result'
    });
  }
});

// @route   PUT /api/lab/results/:resultId/verify
// @desc    Verify lab result
// @access  Private (Doctor only)
router.put('/results/:resultId/verify', authenticate, authorize('doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resultId } = req.params;

    const result = await getRow(
      'SELECT * FROM lab_results WHERE result_id = ?',
      [resultId]
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Lab result not found'
      });
    }

    if (result.verified_by) {
      return res.status(400).json({
        success: false,
        error: 'Lab result is already verified'
      });
    }

    await runQuery(
      'UPDATE lab_results SET verified_by = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE result_id = ?',
      [req.user.staffId, resultId]
    );

    logger.info(`Lab result verified: ${resultId} by doctor ${req.user.staffId}`);

    res.json({
      success: true,
      message: 'Lab result verified successfully'
    });

  } catch (error) {
    logger.error('Verify lab result error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying lab result'
    });
  }
});

// @route   GET /api/lab/stats
// @desc    Get laboratory statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE lo.order_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get order statistics
    const orderStats = await getRow(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN lo.status = 'ordered' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN lo.status = 'collected' THEN 1 END) as collected_orders,
        COUNT(CASE WHEN lo.status = 'in_progress' THEN 1 END) as in_progress_orders,
        COUNT(CASE WHEN lo.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN lo.priority = 'stat' THEN 1 END) as stat_orders,
        COUNT(CASE WHEN lo.priority = 'urgent' THEN 1 END) as urgent_orders
       FROM lab_orders lo
       ${dateFilter}`,
      params
    );

    // Get result statistics
    const resultStats = await getRow(
      `SELECT 
        COUNT(*) as total_results,
        COUNT(CASE WHEN lr.status = 'normal' THEN 1 END) as normal_results,
        COUNT(CASE WHEN lr.status = 'abnormal' THEN 1 END) as abnormal_results,
        COUNT(CASE WHEN lr.status = 'critical' THEN 1 END) as critical_results,
        COUNT(CASE WHEN lr.verified_by IS NOT NULL THEN 1 END) as verified_results
       FROM lab_results lr
       LEFT JOIN lab_orders lo ON lr.order_id = lo.order_id
       ${dateFilter}`,
      params
    );

    res.json({
      success: true,
      stats: {
        orders: orderStats,
        results: resultStats
      }
    });

  } catch (error) {
    logger.error('Get lab stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving laboratory statistics'
    });
  }
});

export default router;

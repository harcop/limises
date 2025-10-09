import { Request, Response } from 'express';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { 
  generateLabOrderId,
  generateId,
  formatDate, 
  formatTime 
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

export class LaboratoryController {
  // @route   POST /api/lab/orders
  // @desc    Create a new lab order
  // @access  Private (Doctor, Nurse only)
  static async createLabOrder(req: AuthRequest, res: Response) {
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

      // Validate required fields
      if (!patientId || !staffId || !testType || !priority) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Generate lab order ID
      const orderId = generateLabOrderId();

      // Create lab order
      const result = await runQuery(
        `INSERT INTO lab_orders (order_id, patient_id, staff_id, appointment_id, admission_id, 
         order_date, order_time, test_type, test_description, priority, status, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ordered', ?, NOW())`,
        [orderId, patientId, staffId, appointmentId, admissionId, orderDate, orderTime, testType, testDescription, priority, notes]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create lab order'
        });
      }

      logger.info(`Lab order ${orderId} created for patient ${patientId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Lab order created successfully',
        data: {
          orderId,
          patientId,
          staffId,
          testType,
          testDescription,
          priority,
          status: 'ordered',
          orderDate,
          orderTime
        }
      });

    } catch (error) {
      logger.error('Create lab order error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating lab order'
      });
    }
  }

  // @route   GET /api/lab/orders
  // @desc    Get lab orders with filters and pagination
  // @access  Private (Staff only)
  static async getLabOrders(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        staffId,
        status,
        priority,
        testType,
        startDate,
        endDate
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (patientId) {
        whereClause += ' AND lo.patient_id = ?';
        params.push(patientId);
      }
      if (staffId) {
        whereClause += ' AND lo.staff_id = ?';
        params.push(staffId);
      }
      if (status) {
        whereClause += ' AND lo.status = ?';
        params.push(status);
      }
      if (priority) {
        whereClause += ' AND lo.priority = ?';
        params.push(priority);
      }
      if (testType) {
        whereClause += ' AND lo.test_type = ?';
        params.push(testType);
      }
      if (startDate) {
        whereClause += ' AND lo.order_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND lo.order_date <= ?';
        params.push(endDate);
      }

      // Get lab orders with pagination
      const orders = await getAll(
        `SELECT lo.*, p.first_name, p.last_name, p.phone, s.first_name as staff_first_name, 
         s.last_name as staff_last_name, s.department 
         FROM lab_orders lo 
         JOIN patients p ON lo.patient_id = p.patient_id 
         JOIN staff s ON lo.staff_id = s.staff_id 
         WHERE ${whereClause} 
         ORDER BY lo.order_date DESC, lo.order_time DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM lab_orders lo WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get lab orders error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving lab orders'
      });
    }
  }

  // @route   GET /api/lab/orders/:orderId
  // @desc    Get a specific lab order
  // @access  Private (Staff only)
  static async getLabOrder(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await getRow(
        `SELECT lo.*, p.first_name, p.last_name, p.phone, p.date_of_birth, p.gender,
         s.first_name as staff_first_name, s.last_name as staff_last_name, s.department 
         FROM lab_orders lo 
         JOIN patients p ON lo.patient_id = p.patient_id 
         JOIN staff s ON lo.staff_id = s.staff_id 
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
        data: order
      });

    } catch (error) {
      logger.error('Get lab order error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving lab order'
      });
    }
  }

  // @route   PUT /api/lab/orders/:orderId
  // @desc    Update a lab order
  // @access  Private (Staff only)
  static async updateLabOrder(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const updateData = req.body;

      // Check if order exists
      const existingOrder = await getRow(
        'SELECT * FROM lab_orders WHERE order_id = ?',
        [orderId]
      );

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          error: 'Lab order not found'
        });
      }

      // Update lab order
      const result = await runQuery(
        `UPDATE lab_orders SET 
         test_type = COALESCE(?, test_type),
         test_description = COALESCE(?, test_description),
         priority = COALESCE(?, priority),
         status = COALESCE(?, status),
         notes = COALESCE(?, notes),
         updated_at = NOW()
         WHERE order_id = ?`,
        [
          updateData.testType,
          updateData.testDescription,
          updateData.priority,
          updateData.status,
          updateData.notes,
          orderId
        ]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update lab order'
        });
      }

      logger.info(`Lab order ${orderId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Lab order updated successfully'
      });

    } catch (error) {
      logger.error('Update lab order error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating lab order'
      });
    }
  }

  // @route   POST /api/lab/samples
  // @desc    Create a new lab sample
  // @access  Private (Lab Technician only)
  static async createLabSample(req: AuthRequest, res: Response) {
    try {
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

      // Validate required fields
      if (!orderId || !sampleType || !collectionDate || !collectionTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

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
      const sampleId = generateId();

      // Create lab sample
      const result = await runQuery(
        `INSERT INTO lab_samples (sample_id, order_id, sample_type, collection_date, 
         collection_time, collected_by, sample_condition, storage_location, status, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'collected', ?, NOW())`,
        [sampleId, orderId, sampleType, collectionDate, collectionTime, collectedBy, sampleCondition, storageLocation, notes]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create lab sample'
        });
      }

      // Update lab order status
      await runQuery(
        'UPDATE lab_orders SET status = "collected", updated_at = NOW() WHERE order_id = ?',
        [orderId]
      );

      logger.info(`Lab sample ${sampleId} created for order ${orderId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Lab sample created successfully',
        data: {
          sampleId,
          orderId,
          sampleType,
          collectionDate,
          collectionTime,
          status: 'collected'
        }
      });

    } catch (error) {
      logger.error('Create lab sample error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating lab sample'
      });
    }
  }

  // @route   GET /api/lab/samples
  // @desc    Get lab samples with filters and pagination
  // @access  Private (Staff only)
  static async getLabSamples(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        orderId,
        sampleType,
        status,
        startDate,
        endDate
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (orderId) {
        whereClause += ' AND ls.order_id = ?';
        params.push(orderId);
      }
      if (sampleType) {
        whereClause += ' AND ls.sample_type = ?';
        params.push(sampleType);
      }
      if (status) {
        whereClause += ' AND ls.status = ?';
        params.push(status);
      }
      if (startDate) {
        whereClause += ' AND ls.collection_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND ls.collection_date <= ?';
        params.push(endDate);
      }

      // Get lab samples with pagination
      const samples = await getAll(
        `SELECT ls.*, lo.test_type, lo.priority, p.first_name, p.last_name 
         FROM lab_samples ls 
         JOIN lab_orders lo ON ls.order_id = lo.order_id 
         JOIN patients p ON lo.patient_id = p.patient_id 
         WHERE ${whereClause} 
         ORDER BY ls.collection_date DESC, ls.collection_time DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM lab_samples ls WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: samples,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get lab samples error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving lab samples'
      });
    }
  }

  // @route   POST /api/lab/results
  // @desc    Create a new lab result
  // @access  Private (Lab Technician, Pathologist only)
  static async createLabResult(req: AuthRequest, res: Response) {
    try {
      const {
        orderId,
        sampleId,
        testName,
        resultValue,
        normalRange,
        unit,
        status,
        verifiedBy,
        notes
      } = req.body;

      // Validate required fields
      if (!orderId || !testName || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

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
      const resultId = generateId();

      // Create lab result
      const result = await runQuery(
        `INSERT INTO lab_results (result_id, order_id, sample_id, test_name, result_value, 
         normal_range, unit, status, verified_by, result_date, result_time, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?, NOW())`,
        [resultId, orderId, sampleId, testName, resultValue, normalRange, unit, status, verifiedBy, notes]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create lab result'
        });
      }

      // Update lab order status
      await runQuery(
        'UPDATE lab_orders SET status = "completed", updated_at = NOW() WHERE order_id = ?',
        [orderId]
      );

      logger.info(`Lab result ${resultId} created for order ${orderId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Lab result created successfully',
        data: {
          resultId,
          orderId,
          testName,
          resultValue,
          status,
          resultDate: new Date().toISOString().split('T')[0],
          resultTime: new Date().toTimeString().split(' ')[0]
        }
      });

    } catch (error) {
      logger.error('Create lab result error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating lab result'
      });
    }
  }

  // @route   GET /api/lab/results
  // @desc    Get lab results with filters and pagination
  // @access  Private (Staff only)
  static async getLabResults(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        orderId,
        patientId,
        testName,
        status,
        startDate,
        endDate
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (orderId) {
        whereClause += ' AND lr.order_id = ?';
        params.push(orderId);
      }
      if (patientId) {
        whereClause += ' AND lo.patient_id = ?';
        params.push(patientId);
      }
      if (testName) {
        whereClause += ' AND lr.test_name = ?';
        params.push(testName);
      }
      if (status) {
        whereClause += ' AND lr.status = ?';
        params.push(status);
      }
      if (startDate) {
        whereClause += ' AND lr.result_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND lr.result_date <= ?';
        params.push(endDate);
      }

      // Get lab results with pagination
      const results = await getAll(
        `SELECT lr.*, lo.patient_id, p.first_name, p.last_name, lo.test_type, lo.priority 
         FROM lab_results lr 
         JOIN lab_orders lo ON lr.order_id = lo.order_id 
         JOIN patients p ON lo.patient_id = p.patient_id 
         WHERE ${whereClause} 
         ORDER BY lr.result_date DESC, lr.result_time DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM lab_results lr 
         JOIN lab_orders lo ON lr.order_id = lo.order_id 
         WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get lab results error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving lab results'
      });
    }
  }

  // @route   GET /api/lab/stats
  // @desc    Get laboratory statistics
  // @access  Private (Staff only)
  static async getLabStats(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = '';
      const params: any[] = [];

      if (startDate && endDate) {
        dateFilter = 'WHERE order_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      // Get order statistics
      const orderStats = await getRow(
        `SELECT 
         COUNT(*) as totalOrders,
         COUNT(CASE WHEN status = 'ordered' THEN 1 END) as pendingOrders,
         COUNT(CASE WHEN status = 'collected' THEN 1 END) as collectedOrders,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
         COUNT(CASE WHEN priority = 'stat' THEN 1 END) as statOrders
         FROM lab_orders ${dateFilter}`,
        params
      );

      // Get result statistics
      const resultStats = await getRow(
        `SELECT 
         COUNT(*) as totalResults,
         COUNT(CASE WHEN status = 'normal' THEN 1 END) as normalResults,
         COUNT(CASE WHEN status = 'abnormal' THEN 1 END) as abnormalResults,
         COUNT(CASE WHEN status = 'critical' THEN 1 END) as criticalResults
         FROM lab_results ${dateFilter}`,
        params
      );

      res.json({
        success: true,
        data: {
          orders: {
            totalOrders: orderStats?.totalOrders || 0,
            pendingOrders: orderStats?.pendingOrders || 0,
            collectedOrders: orderStats?.collectedOrders || 0,
            completedOrders: orderStats?.completedOrders || 0,
            statOrders: orderStats?.statOrders || 0
          },
          results: {
            totalResults: resultStats?.totalResults || 0,
            normalResults: resultStats?.normalResults || 0,
            abnormalResults: resultStats?.abnormalResults || 0,
            criticalResults: resultStats?.criticalResults || 0
          }
        }
      });

    } catch (error) {
      logger.error('Get lab stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving laboratory statistics'
      });
    }
  }
}

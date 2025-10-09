import { BaseService } from '../../base/Service';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { generateLabOrderId, generateId } from '../../../utils/helpers';

export interface CreateLabOrderDto {
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  orderDate: string;
  orderTime: string;
  testType: string;
  testDescription?: string;
  priority: string;
  notes?: string;
}

export interface UpdateLabOrderDto {
  testType?: string;
  testDescription?: string;
  priority?: string;
  status?: string;
  notes?: string;
}

export interface CreateLabSampleDto {
  orderId: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  collectedBy?: string;
  sampleCondition?: string;
  storageLocation?: string;
  notes?: string;
}

export interface CreateLabResultDto {
  orderId: string;
  sampleId?: string;
  testName: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  status: string;
  verifiedBy?: string;
  notes?: string;
}

export interface LabFiltersDto {
  patientId?: string;
  staffId?: string;
  status?: string;
  priority?: string;
  testType?: string;
  startDate?: string;
  endDate?: string;
  orderId?: string;
  sampleType?: string;
  testName?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class LaboratoryService extends BaseService {
  constructor() {
    super('LaboratoryService');
  }

  // Lab Orders
  async createLabOrder(orderData: CreateLabOrderDto): Promise<any> {
    try {
      // Validate required fields
      if (!orderData.patientId || !orderData.staffId || !orderData.testType || !orderData.priority) {
        throw new Error('Missing required fields');
      }

      // Generate lab order ID
      const orderId = generateLabOrderId();

      // Create lab order
      const result = await runQuery(
        `INSERT INTO lab_orders (order_id, patient_id, staff_id, appointment_id, admission_id, 
         order_date, order_time, test_type, test_description, priority, status, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ordered', ?, NOW())`,
        [
          orderId, orderData.patientId, orderData.staffId, orderData.appointmentId, orderData.admissionId,
          orderData.orderDate, orderData.orderTime, orderData.testType, orderData.testDescription,
          orderData.priority, orderData.notes
        ]
      );

      if (!result.acknowledged) {
        throw new Error('Failed to create lab order');
      }

      this.log('info', `Lab order created: ${orderId}`);

      return {
        orderId,
        patientId: orderData.patientId,
        staffId: orderData.staffId,
        testType: orderData.testType,
        testDescription: orderData.testDescription,
        priority: orderData.priority,
        status: 'ordered',
        orderDate: orderData.orderDate,
        orderTime: orderData.orderTime
      };
    } catch (error) {
      this.handleError(error, 'Create lab order');
    }
  }

  async getLabOrders(filters: LabFiltersDto, pagination: PaginationDto): Promise<{ orders: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (filters.patientId) {
        whereClause += ' AND lo.patient_id = ?';
        params.push(filters.patientId);
      }
      if (filters.staffId) {
        whereClause += ' AND lo.staff_id = ?';
        params.push(filters.staffId);
      }
      if (filters.status) {
        whereClause += ' AND lo.status = ?';
        params.push(filters.status);
      }
      if (filters.priority) {
        whereClause += ' AND lo.priority = ?';
        params.push(filters.priority);
      }
      if (filters.testType) {
        whereClause += ' AND lo.test_type = ?';
        params.push(filters.testType);
      }
      if (filters.startDate) {
        whereClause += ' AND lo.order_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        whereClause += ' AND lo.order_date <= ?';
        params.push(filters.endDate);
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

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get lab orders');
    }
  }

  async getLabOrder(orderId: string): Promise<any> {
    try {
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
        throw new Error('Lab order not found');
      }

      return order;
    } catch (error) {
      this.handleError(error, 'Get lab order');
    }
  }

  async updateLabOrder(orderId: string, updateData: UpdateLabOrderDto): Promise<any> {
    try {
      // Check if order exists
      const existingOrder = await getRow(
        'SELECT * FROM lab_orders WHERE order_id = ?',
        [orderId]
      );

      if (!existingOrder) {
        throw new Error('Lab order not found');
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
        throw new Error('Failed to update lab order');
      }

      this.log('info', `Lab order updated: ${orderId}`);
      return { orderId, ...updateData };
    } catch (error) {
      this.handleError(error, 'Update lab order');
    }
  }

  // Lab Samples
  async createLabSample(sampleData: CreateLabSampleDto): Promise<any> {
    try {
      // Validate required fields
      if (!sampleData.orderId || !sampleData.sampleType || !sampleData.collectionDate || !sampleData.collectionTime) {
        throw new Error('Missing required fields');
      }

      // Check if lab order exists
      const order = await getRow(
        'SELECT * FROM lab_orders WHERE order_id = ?',
        [sampleData.orderId]
      );

      if (!order) {
        throw new Error('Lab order not found');
      }

      // Generate sample ID
      const sampleId = generateId('SAMPLE', 6);

      // Create lab sample
      const result = await runQuery(
        `INSERT INTO lab_samples (sample_id, order_id, sample_type, collection_date, 
         collection_time, collected_by, sample_condition, storage_location, status, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'collected', ?, NOW())`,
        [
          sampleId, sampleData.orderId, sampleData.sampleType, sampleData.collectionDate,
          sampleData.collectionTime, sampleData.collectedBy, sampleData.sampleCondition,
          sampleData.storageLocation, sampleData.notes
        ]
      );

      if (!result.acknowledged) {
        throw new Error('Failed to create lab sample');
      }

      // Update lab order status
      await runQuery(
        'UPDATE lab_orders SET status = "collected", updated_at = NOW() WHERE order_id = ?',
        [sampleData.orderId]
      );

      this.log('info', `Lab sample created: ${sampleId}`);

      return {
        sampleId,
        orderId: sampleData.orderId,
        sampleType: sampleData.sampleType,
        collectionDate: sampleData.collectionDate,
        collectionTime: sampleData.collectionTime,
        status: 'collected'
      };
    } catch (error) {
      this.handleError(error, 'Create lab sample');
    }
  }

  async getLabSamples(filters: LabFiltersDto, pagination: PaginationDto): Promise<{ samples: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (filters.orderId) {
        whereClause += ' AND ls.order_id = ?';
        params.push(filters.orderId);
      }
      if (filters.sampleType) {
        whereClause += ' AND ls.sample_type = ?';
        params.push(filters.sampleType);
      }
      if (filters.status) {
        whereClause += ' AND ls.status = ?';
        params.push(filters.status);
      }
      if (filters.startDate) {
        whereClause += ' AND ls.collection_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        whereClause += ' AND ls.collection_date <= ?';
        params.push(filters.endDate);
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

      return {
        samples,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get lab samples');
    }
  }

  // Lab Results
  async createLabResult(resultData: CreateLabResultDto): Promise<any> {
    try {
      // Validate required fields
      if (!resultData.orderId || !resultData.testName || !resultData.status) {
        throw new Error('Missing required fields');
      }

      // Check if lab order exists
      const order = await getRow(
        'SELECT * FROM lab_orders WHERE order_id = ?',
        [resultData.orderId]
      );

      if (!order) {
        throw new Error('Lab order not found');
      }

      // Generate result ID
      const resultId = generateId('RESULT', 6);

      // Create lab result
      const result = await runQuery(
        `INSERT INTO lab_results (result_id, order_id, sample_id, test_name, result_value, 
         normal_range, unit, status, verified_by, result_date, result_time, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?, NOW())`,
        [
          resultId, resultData.orderId, resultData.sampleId, resultData.testName,
          resultData.resultValue, resultData.normalRange, resultData.unit,
          resultData.status, resultData.verifiedBy, resultData.notes
        ]
      );

      if (!result.acknowledged) {
        throw new Error('Failed to create lab result');
      }

      // Update lab order status
      await runQuery(
        'UPDATE lab_orders SET status = "completed", updated_at = NOW() WHERE order_id = ?',
        [resultData.orderId]
      );

      this.log('info', `Lab result created: ${resultId}`);

      return {
        resultId,
        orderId: resultData.orderId,
        testName: resultData.testName,
        resultValue: resultData.resultValue,
        status: resultData.status,
        resultDate: new Date().toISOString().split('T')[0],
        resultTime: new Date().toTimeString().split(' ')[0]
      };
    } catch (error) {
      this.handleError(error, 'Create lab result');
    }
  }

  async getLabResults(filters: LabFiltersDto, pagination: PaginationDto): Promise<{ results: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (filters.orderId) {
        whereClause += ' AND lr.order_id = ?';
        params.push(filters.orderId);
      }
      if (filters.patientId) {
        whereClause += ' AND lo.patient_id = ?';
        params.push(filters.patientId);
      }
      if (filters.testName) {
        whereClause += ' AND lr.test_name = ?';
        params.push(filters.testName);
      }
      if (filters.status) {
        whereClause += ' AND lr.status = ?';
        params.push(filters.status);
      }
      if (filters.startDate) {
        whereClause += ' AND lr.result_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        whereClause += ' AND lr.result_date <= ?';
        params.push(filters.endDate);
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

      return {
        results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get lab results');
    }
  }

  // Statistics
  async getLabStats(filters: { startDate?: string; endDate?: string }): Promise<any> {
    try {
      let dateFilter = '';
      const params: any[] = [];

      if (filters.startDate && filters.endDate) {
        dateFilter = 'WHERE order_date BETWEEN ? AND ?';
        params.push(filters.startDate, filters.endDate);
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

      return {
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
      };
    } catch (error) {
      this.handleError(error, 'Get lab stats');
    }
  }
}

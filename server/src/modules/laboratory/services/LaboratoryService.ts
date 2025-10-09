import { BaseService } from '../../base/Service';
import { LabOrderModel, LabSampleModel, LabResultModel } from '../../../models';
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
      const labOrder = new LabOrderModel({
        orderId,
        patientId: orderData.patientId,
        staffId: orderData.staffId,
        appointmentId: orderData.appointmentId,
        admissionId: orderData.admissionId,
        orderDate: orderData.orderDate,
        orderTime: orderData.orderTime,
        testType: orderData.testType,
        testDescription: orderData.testDescription,
        priority: orderData.priority,
        status: 'ordered',
        notes: orderData.notes,
        createdAt: new Date().toISOString()
      });

      await labOrder.save();

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

      // Build MongoDB filter
      const mongoFilter: any = {};
      
      if (filters.patientId) mongoFilter.patientId = filters.patientId;
      if (filters.staffId) mongoFilter.staffId = filters.staffId;
      if (filters.status) mongoFilter.status = filters.status;
      if (filters.priority) mongoFilter.priority = filters.priority;
      if (filters.testType) mongoFilter.testType = filters.testType;
      if (filters.startDate) mongoFilter.orderDate = { $gte: filters.startDate };
      if (filters.endDate) {
        mongoFilter.orderDate = { ...mongoFilter.orderDate, $lte: filters.endDate };
      }

      // Get lab orders with pagination
      const orders = await LabOrderModel.find(mongoFilter)
        .select('-__v')
        .sort({ orderDate: -1, orderTime: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      // Get total count
      const total = await LabOrderModel.countDocuments(mongoFilter);

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
      const order = await LabOrderModel.findOne({ orderId }).select('-__v');

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
      const existingOrder = await LabOrderModel.findOne({ orderId });

      if (!existingOrder) {
        throw new Error('Lab order not found');
      }

      // Update lab order
      const updatedOrder = await LabOrderModel.findOneAndUpdate(
        { orderId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      this.log('info', `Lab order updated: ${orderId}`);
      return updatedOrder;
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
      const order = await LabOrderModel.findOne({ orderId: sampleData.orderId });

      if (!order) {
        throw new Error('Lab order not found');
      }

      // Generate sample ID
      const sampleId = generateId('SAMPLE', 6);

      // Create lab sample
      const labSample = new LabSampleModel({
        sampleId,
        orderId: sampleData.orderId,
        sampleType: sampleData.sampleType,
        collectionDate: sampleData.collectionDate,
        collectionTime: sampleData.collectionTime,
        collectedBy: sampleData.collectedBy,
        sampleCondition: sampleData.sampleCondition,
        storageLocation: sampleData.storageLocation,
        status: 'collected',
        notes: sampleData.notes,
        createdAt: new Date().toISOString()
      });

      await labSample.save();

      // Update lab order status
      await LabOrderModel.findOneAndUpdate(
        { orderId: sampleData.orderId },
        { status: 'collected', updatedAt: new Date().toISOString() }
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

      // Build MongoDB filter
      const mongoFilter: any = {};
      
      if (filters.orderId) mongoFilter.orderId = filters.orderId;
      if (filters.sampleType) mongoFilter.sampleType = filters.sampleType;
      if (filters.status) mongoFilter.status = filters.status;
      if (filters.startDate) mongoFilter.collectionDate = { $gte: filters.startDate };
      if (filters.endDate) {
        mongoFilter.collectionDate = { ...mongoFilter.collectionDate, $lte: filters.endDate };
      }

      // Get lab samples with pagination
      const samples = await LabSampleModel.find(mongoFilter)
        .select('-__v')
        .sort({ collectionDate: -1, collectionTime: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      // Get total count
      const total = await LabSampleModel.countDocuments(mongoFilter);

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
      const order = await LabOrderModel.findOne({ orderId: resultData.orderId });

      if (!order) {
        throw new Error('Lab order not found');
      }

      // Generate result ID
      const resultId = generateId('RESULT', 6);

      // Create lab result
      const labResult = new LabResultModel({
        resultId,
        orderId: resultData.orderId,
        sampleId: resultData.sampleId,
        testName: resultData.testName,
        resultValue: resultData.resultValue,
        normalRange: resultData.normalRange,
        unit: resultData.unit,
        status: resultData.status,
        verifiedBy: resultData.verifiedBy,
        resultDate: new Date().toISOString().split('T')[0],
        resultTime: new Date().toTimeString().split(' ')[0],
        notes: resultData.notes,
        createdAt: new Date().toISOString()
      });

      await labResult.save();

      // Update lab order status
      await LabOrderModel.findOneAndUpdate(
        { orderId: resultData.orderId },
        { status: 'completed', updatedAt: new Date().toISOString() }
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

      // Build MongoDB filter
      const mongoFilter: any = {};
      
      if (filters.orderId) mongoFilter.orderId = filters.orderId;
      if (filters.testName) mongoFilter.testName = filters.testName;
      if (filters.status) mongoFilter.status = filters.status;
      if (filters.startDate) mongoFilter.resultDate = { $gte: filters.startDate };
      if (filters.endDate) {
        mongoFilter.resultDate = { ...mongoFilter.resultDate, $lte: filters.endDate };
      }

      // Get lab results with pagination
      const results = await LabResultModel.find(mongoFilter)
        .select('-__v')
        .sort({ resultDate: -1, resultTime: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      // Get total count
      const total = await LabResultModel.countDocuments(mongoFilter);

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
      // Build date filter for MongoDB
      const dateFilter: any = {};
      if (filters.startDate && filters.endDate) {
        dateFilter.orderDate = { $gte: filters.startDate, $lte: filters.endDate };
      }

      // Get order statistics
      const totalOrders = await LabOrderModel.countDocuments(dateFilter);
      const pendingOrders = await LabOrderModel.countDocuments({ ...dateFilter, status: 'ordered' });
      const collectedOrders = await LabOrderModel.countDocuments({ ...dateFilter, status: 'collected' });
      const completedOrders = await LabOrderModel.countDocuments({ ...dateFilter, status: 'completed' });
      const statOrders = await LabOrderModel.countDocuments({ ...dateFilter, priority: 'stat' });

      // Get result statistics
      const totalResults = await LabResultModel.countDocuments(dateFilter);
      const normalResults = await LabResultModel.countDocuments({ ...dateFilter, status: 'normal' });
      const abnormalResults = await LabResultModel.countDocuments({ ...dateFilter, status: 'abnormal' });
      const criticalResults = await LabResultModel.countDocuments({ ...dateFilter, status: 'critical' });

      return {
        orders: {
          totalOrders,
          pendingOrders,
          collectedOrders,
          completedOrders,
          statOrders
        },
        results: {
          totalResults,
          normalResults,
          abnormalResults,
          criticalResults
        }
      };
    } catch (error) {
      this.handleError(error, 'Get lab stats');
    }
  }
}

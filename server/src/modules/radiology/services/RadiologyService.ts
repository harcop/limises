import { RadiologyOrderModel, RadiologyStudyModel, RadiologyEquipmentModel } from '../models';
import { CreateRadiologyOrderDto, UpdateRadiologyOrderDto, CreateRadiologyStudyDto, UpdateRadiologyStudyDto, CreateRadiologyEquipmentDto, UpdateRadiologyEquipmentDto, CompleteRadiologyStudyDto } from '../dto/CreateRadiologyDto';
import { logger } from '../../../utils/logger';

export class RadiologyService {
  // ==============================================
  // RADIOLOGY ORDER MANAGEMENT
  // ==============================================

  async createRadiologyOrder(orderData: CreateRadiologyOrderDto): Promise<any> {
    try {
      const orderId = `RAD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const order = new RadiologyOrderModel({
        orderId,
        ...orderData,
        orderDate: new Date(orderData.orderDate),
        status: 'ordered'
      });

      const savedOrder = await order.save();
      logger.info(`Radiology order created: ${orderId} for patient: ${orderData.patientId}`);
      
      return savedOrder;
    } catch (error) {
      logger.error('Error creating radiology order:', error);
      throw error;
    }
  }

  async getRadiologyOrders(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.staffId) query.staffId = filters.staffId;
      if (filters.studyType) query.studyType = filters.studyType;
      if (filters.priority) query.priority = filters.priority;
      if (filters.status) query.status = filters.status;
      if (filters.orderDate) {
        const date = new Date(filters.orderDate);
        query.orderDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const orders = await RadiologyOrderModel.find(query)
        .populate('patientId', 'patientId firstName lastName phone')
        .populate('staffId', 'staffId firstName lastName department')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await RadiologyOrderModel.countDocuments(query);

      return {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching radiology orders:', error);
      throw error;
    }
  }

  async getRadiologyOrderById(orderId: string): Promise<any> {
    try {
      const order = await RadiologyOrderModel.findOne({ orderId })
        .populate('patientId', 'patientId firstName lastName phone email dateOfBirth gender')
        .populate('staffId', 'staffId firstName lastName department position');

      if (!order) {
        throw new Error('Radiology order not found');
      }

      return order;
    } catch (error) {
      logger.error('Error fetching radiology order:', error);
      throw error;
    }
  }

  async updateRadiologyOrder(orderId: string, updateData: UpdateRadiologyOrderDto): Promise<any> {
    try {
      const order = await RadiologyOrderModel.findOneAndUpdate(
        { orderId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('patientId', 'patientId firstName lastName')
       .populate('staffId', 'staffId firstName lastName department');

      if (!order) {
        throw new Error('Radiology order not found');
      }

      logger.info(`Radiology order updated: ${orderId}`);
      return order;
    } catch (error) {
      logger.error('Error updating radiology order:', error);
      throw error;
    }
  }

  // ==============================================
  // RADIOLOGY STUDY MANAGEMENT
  // ==============================================

  async createRadiologyStudy(studyData: CreateRadiologyStudyDto): Promise<any> {
    try {
      // Check if order exists
      const order = await RadiologyOrderModel.findOne({ orderId: studyData.orderId });
      if (!order) {
        throw new Error('Radiology order not found');
      }

      const studyId = `STUDY${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const study = new RadiologyStudyModel({
        studyId,
        ...studyData,
        studyDate: new Date(studyData.studyDate),
        status: 'scheduled'
      });

      const savedStudy = await study.save();

      // Update order status to scheduled
      await RadiologyOrderModel.findOneAndUpdate(
        { orderId: studyData.orderId },
        { status: 'scheduled' }
      );

      logger.info(`Radiology study created: ${studyId} for order: ${studyData.orderId}`);
      
      return savedStudy;
    } catch (error) {
      logger.error('Error creating radiology study:', error);
      throw error;
    }
  }

  async getRadiologyStudies(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.orderId) query.orderId = filters.orderId;
      if (filters.modality) query.modality = filters.modality;
      if (filters.status) query.status = filters.status;
      if (filters.radiologistId) query.radiologistId = filters.radiologistId;
      if (filters.studyDate) {
        const date = new Date(filters.studyDate);
        query.studyDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const studies = await RadiologyStudyModel.find(query)
        .populate('orderId', 'orderId studyType bodyPart priority contrastRequired')
        .populate('radiologistId', 'staffId firstName lastName department')
        .populate('technologistId', 'staffId firstName lastName department')
        .sort({ studyDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await RadiologyStudyModel.countDocuments(query);

      return {
        studies,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching radiology studies:', error);
      throw error;
    }
  }

  async getRadiologyStudyById(studyId: string): Promise<any> {
    try {
      const study = await RadiologyStudyModel.findOne({ studyId })
        .populate('orderId', 'orderId studyType bodyPart priority contrastRequired clinicalIndication')
        .populate('radiologistId', 'staffId firstName lastName department position')
        .populate('technologistId', 'staffId firstName lastName department position');

      if (!study) {
        throw new Error('Radiology study not found');
      }

      return study;
    } catch (error) {
      logger.error('Error fetching radiology study:', error);
      throw error;
    }
  }

  async updateRadiologyStudy(studyId: string, updateData: UpdateRadiologyStudyDto): Promise<any> {
    try {
      const study = await RadiologyStudyModel.findOneAndUpdate(
        { studyId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('orderId', 'orderId studyType bodyPart')
       .populate('radiologistId', 'staffId firstName lastName department');

      if (!study) {
        throw new Error('Radiology study not found');
      }

      logger.info(`Radiology study updated: ${studyId}`);
      return study;
    } catch (error) {
      logger.error('Error updating radiology study:', error);
      throw error;
    }
  }

  async startRadiologyStudy(studyId: string, technologistId: string): Promise<any> {
    try {
      const study = await RadiologyStudyModel.findOneAndUpdate(
        { studyId },
        { 
          status: 'in_progress',
          technologistId,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!study) {
        throw new Error('Radiology study not found');
      }

      logger.info(`Radiology study started: ${studyId}`);
      return study;
    } catch (error) {
      logger.error('Error starting radiology study:', error);
      throw error;
    }
  }

  async completeRadiologyStudy(studyId: string, completionData: CompleteRadiologyStudyDto): Promise<any> {
    try {
      const study = await RadiologyStudyModel.findOneAndUpdate(
        { studyId },
        {
          status: 'completed',
          findings: completionData.findings,
          impression: completionData.impression,
          recommendations: completionData.recommendations,
          radiologistId: completionData.radiologistId,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!study) {
        throw new Error('Radiology study not found');
      }

      // Update order status to completed
      await RadiologyOrderModel.findOneAndUpdate(
        { orderId: study.orderId },
        { status: 'completed' }
      );

      logger.info(`Radiology study completed: ${studyId}`);
      return study;
    } catch (error) {
      logger.error('Error completing radiology study:', error);
      throw error;
    }
  }

  // ==============================================
  // RADIOLOGY EQUIPMENT MANAGEMENT
  // ==============================================

  async createRadiologyEquipment(equipmentData: CreateRadiologyEquipmentDto): Promise<any> {
    try {
      const equipmentId = `EQ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const equipment = new RadiologyEquipmentModel({
        equipmentId,
        ...equipmentData,
        status: 'operational'
      });

      const savedEquipment = await equipment.save();
      logger.info(`Radiology equipment created: ${equipmentId} - ${equipmentData.equipmentName}`);
      
      return savedEquipment;
    } catch (error) {
      logger.error('Error creating radiology equipment:', error);
      throw error;
    }
  }

  async getRadiologyEquipment(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.equipmentType) query.equipmentType = filters.equipmentType;
      if (filters.status) query.status = filters.status;

      const equipment = await RadiologyEquipmentModel.find(query)
        .sort({ equipmentName: 1 })
        .skip(skip)
        .limit(limit);

      const total = await RadiologyEquipmentModel.countDocuments(query);

      return {
        equipment,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching radiology equipment:', error);
      throw error;
    }
  }

  async getRadiologyEquipmentById(equipmentId: string): Promise<any> {
    try {
      const equipment = await RadiologyEquipmentModel.findOne({ equipmentId });
      if (!equipment) {
        throw new Error('Radiology equipment not found');
      }
      return equipment;
    } catch (error) {
      logger.error('Error fetching radiology equipment:', error);
      throw error;
    }
  }

  async updateRadiologyEquipment(equipmentId: string, updateData: UpdateRadiologyEquipmentDto): Promise<any> {
    try {
      const equipment = await RadiologyEquipmentModel.findOneAndUpdate(
        { equipmentId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!equipment) {
        throw new Error('Radiology equipment not found');
      }

      logger.info(`Radiology equipment updated: ${equipmentId}`);
      return equipment;
    } catch (error) {
      logger.error('Error updating radiology equipment:', error);
      throw error;
    }
  }

  async getAvailableEquipment(equipmentType?: string): Promise<any> {
    try {
      const query: any = {
        status: 'operational'
      };
      
      if (equipmentType) query.equipmentType = equipmentType;

      const equipment = await RadiologyEquipmentModel.find(query)
        .sort({ equipmentType: 1, equipmentName: 1 });

      return equipment;
    } catch (error) {
      logger.error('Error fetching available equipment:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getRadiologyDashboardStats(date?: string): Promise<any> {
    try {
      const query: any = {};
      if (date) {
        const targetDate = new Date(date);
        query.orderDate = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      } else {
        // Default to today
        const today = new Date();
        query.orderDate = {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }

      const stats = await RadiologyOrderModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalOrders = await RadiologyOrderModel.countDocuments(query);
      const totalEquipment = await RadiologyEquipmentModel.countDocuments();
      const operationalEquipment = await RadiologyEquipmentModel.countDocuments({ status: 'operational' });
      const pendingStudies = await RadiologyStudyModel.countDocuments({ status: { $in: ['scheduled', 'in_progress'] } });

      return {
        totalOrders,
        totalEquipment,
        operationalEquipment,
        pendingStudies,
        statusBreakdown: stats
      };
    } catch (error) {
      logger.error('Error fetching radiology dashboard stats:', error);
      throw error;
    }
  }

  async getStudyTypeStats(): Promise<any> {
    try {
      const stats = await RadiologyOrderModel.aggregate([
        {
          $group: {
            _id: {
              studyType: '$studyType',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.studyType',
            statusBreakdown: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Error fetching study type stats:', error);
      throw error;
    }
  }

  async getEquipmentUtilizationStats(): Promise<any> {
    try {
      const equipment = await RadiologyEquipmentModel.find();
      
      const utilizationStats = await Promise.all(equipment.map(async (eq) => {
        const totalStudies = await RadiologyStudyModel.countDocuments({ 
          modality: eq.equipmentType 
        });
        const completedStudies = await RadiologyStudyModel.countDocuments({ 
          modality: eq.equipmentType, 
          status: 'completed' 
        });
        
        return {
          equipmentId: eq.equipmentId,
          equipmentName: eq.equipmentName,
          equipmentType: eq.equipmentType,
          status: eq.status,
          totalStudies,
          completedStudies,
          utilizationRate: totalStudies > 0 ? (completedStudies / totalStudies) * 100 : 0
        };
      }));

      return utilizationStats;
    } catch (error) {
      logger.error('Error fetching equipment utilization stats:', error);
      throw error;
    }
  }
}

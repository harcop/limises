import { EmergencyVisitModel, AmbulanceServiceModel, EmergencyCallModel } from '../models';
import { CreateEmergencyVisitDto, UpdateEmergencyVisitDto, CreateAmbulanceServiceDto, UpdateAmbulanceServiceDto, CreateEmergencyCallDto, UpdateEmergencyCallDto, DispatchAmbulanceDto } from '../dto/CreateEmergencyDto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';

export class EmergencyService {
  // ==============================================
  // EMERGENCY VISIT MANAGEMENT
  // ==============================================

  async createEmergencyVisit(visitData: CreateEmergencyVisitDto): Promise<any> {
    try {
      const visitId = `EMG${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const visit = new EmergencyVisitModel({
        visitId,
        ...visitData,
        arrivalTime: new Date(),
        status: 'active'
      });

      const savedVisit = await visit.save();
      logger.info(`Emergency visit created: ${visitId} for patient: ${visitData.patientId}`);
      
      return savedVisit;
    } catch (error) {
      logger.error('Error creating emergency visit:', error);
      throw error;
    }
  }

  async getEmergencyVisits(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.staffId) query.staffId = filters.staffId;
      if (filters.triageLevel) query.triageLevel = filters.triageLevel;
      if (filters.status) query.status = filters.status;
      if (filters.disposition) query.disposition = filters.disposition;
      if (filters.visitDate) {
        const date = new Date(filters.visitDate);
        query.visitDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const visits = await EmergencyVisitModel.find(query)
        .populate('patientId', 'patientId firstName lastName phone')
        .populate('staffId', 'staffId firstName lastName department')
        .sort({ visitDate: -1, arrivalTime: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EmergencyVisitModel.countDocuments(query);

      return {
        visits,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching emergency visits:', error);
      throw error;
    }
  }

  async getEmergencyVisitById(visitId: string): Promise<any> {
    try {
      const visit = await EmergencyVisitModel.findOne({ visitId })
        .populate('patientId', 'patientId firstName lastName phone email dateOfBirth gender')
        .populate('staffId', 'staffId firstName lastName department position');

      if (!visit) {
        throw new Error('Emergency visit not found');
      }

      return visit;
    } catch (error) {
      logger.error('Error fetching emergency visit:', error);
      throw error;
    }
  }

  async updateEmergencyVisit(visitId: string, updateData: UpdateEmergencyVisitDto): Promise<any> {
    try {
      const visit = await EmergencyVisitModel.findOneAndUpdate(
        { visitId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('patientId', 'patientId firstName lastName')
       .populate('staffId', 'staffId firstName lastName department');

      if (!visit) {
        throw new Error('Emergency visit not found');
      }

      logger.info(`Emergency visit updated: ${visitId}`);
      return visit;
    } catch (error) {
      logger.error('Error updating emergency visit:', error);
      throw error;
    }
  }

  // ==============================================
  // AMBULANCE SERVICE MANAGEMENT
  // ==============================================

  async createAmbulanceService(serviceData: CreateAmbulanceServiceDto): Promise<any> {
    try {
      const serviceId = `AMB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const service = new AmbulanceServiceModel({
        serviceId,
        ...serviceData,
        status: 'available'
      });

      const savedService = await service.save();
      logger.info(`Ambulance service created: ${serviceId} - ${serviceData.ambulanceNumber}`);
      
      return savedService;
    } catch (error) {
      logger.error('Error creating ambulance service:', error);
      throw error;
    }
  }

  async getAmbulanceServices(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.vehicleType) query.vehicleType = filters.vehicleType;
      if (filters.status) query.status = filters.status;

      const services = await AmbulanceServiceModel.find(query)
        .sort({ ambulanceNumber: 1 })
        .skip(skip)
        .limit(limit);

      const total = await AmbulanceServiceModel.countDocuments(query);

      return {
        services,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching ambulance services:', error);
      throw error;
    }
  }

  async getAmbulanceServiceById(serviceId: string): Promise<any> {
    try {
      const service = await AmbulanceServiceModel.findOne({ serviceId });
      if (!service) {
        throw new Error('Ambulance service not found');
      }
      return service;
    } catch (error) {
      logger.error('Error fetching ambulance service:', error);
      throw error;
    }
  }

  async updateAmbulanceService(serviceId: string, updateData: UpdateAmbulanceServiceDto): Promise<any> {
    try {
      const service = await AmbulanceServiceModel.findOneAndUpdate(
        { serviceId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!service) {
        throw new Error('Ambulance service not found');
      }

      logger.info(`Ambulance service updated: ${serviceId}`);
      return service;
    } catch (error) {
      logger.error('Error updating ambulance service:', error);
      throw error;
    }
  }

  async getAvailableAmbulances(vehicleType?: string): Promise<any> {
    try {
      const query: any = {
        status: 'available'
      };
      
      if (vehicleType) query.vehicleType = vehicleType;

      const ambulances = await AmbulanceServiceModel.find(query)
        .sort({ vehicleType: 1, ambulanceNumber: 1 });

      return ambulances;
    } catch (error) {
      logger.error('Error fetching available ambulances:', error);
      throw error;
    }
  }

  // ==============================================
  // EMERGENCY CALL MANAGEMENT
  // ==============================================

  async createEmergencyCall(callData: CreateEmergencyCallDto): Promise<any> {
    try {
      const callId = `CALL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const call = new EmergencyCallModel({
        callId,
        ...callData,
        status: 'pending'
      });

      const savedCall = await call.save();
      logger.info(`Emergency call created: ${callId}`);
      
      return savedCall;
    } catch (error) {
      logger.error('Error creating emergency call:', error);
      throw error;
    }
  }

  async getEmergencyCalls(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.emergencyType) query.emergencyType = filters.emergencyType;
      if (filters.priority) query.priority = filters.priority;
      if (filters.status) query.status = filters.status;
      if (filters.ambulanceId) query.ambulanceId = filters.ambulanceId;

      const calls = await EmergencyCallModel.find(query)
        .populate('ambulanceId', 'serviceId ambulanceNumber vehicleType driverName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EmergencyCallModel.countDocuments(query);

      return {
        calls,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching emergency calls:', error);
      throw error;
    }
  }

  async getEmergencyCallById(callId: string): Promise<any> {
    try {
      const call = await EmergencyCallModel.findOne({ callId })
        .populate('ambulanceId', 'serviceId ambulanceNumber vehicleType driverName paramedicName');

      if (!call) {
        throw new Error('Emergency call not found');
      }

      return call;
    } catch (error) {
      logger.error('Error fetching emergency call:', error);
      throw error;
    }
  }

  async updateEmergencyCall(callId: string, updateData: UpdateEmergencyCallDto): Promise<any> {
    try {
      const call = await EmergencyCallModel.findOneAndUpdate(
        { callId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('ambulanceId', 'serviceId ambulanceNumber vehicleType driverName');

      if (!call) {
        throw new Error('Emergency call not found');
      }

      logger.info(`Emergency call updated: ${callId}`);
      return call;
    } catch (error) {
      logger.error('Error updating emergency call:', error);
      throw error;
    }
  }

  async dispatchAmbulance(callId: string, dispatchData: DispatchAmbulanceDto): Promise<any> {
    try {
      const call = await EmergencyCallModel.findOne({ callId });
      if (!call) {
        throw new Error('Emergency call not found');
      }

      // Check if ambulance is available
      const ambulance = await AmbulanceServiceModel.findOne({ serviceId: dispatchData.ambulanceId });
      if (!ambulance) {
        throw new Error('Ambulance service not found');
      }
      if (ambulance.status !== 'available') {
        throw new Error('Ambulance is not available');
      }

      // Update call with dispatch information
      const updatedCall = await EmergencyCallModel.findOneAndUpdate(
        { callId },
        {
          ambulanceId: dispatchData.ambulanceId,
          dispatchTime: new Date(dispatchData.dispatchTime),
          status: 'dispatched',
          updatedAt: new Date()
        },
        { new: true }
      ).populate('ambulanceId', 'serviceId ambulanceNumber vehicleType driverName paramedicName');

      // Update ambulance status
      await AmbulanceServiceModel.findOneAndUpdate(
        { serviceId: dispatchData.ambulanceId },
        { status: 'on_call' }
      );

      logger.info(`Ambulance dispatched: ${dispatchData.ambulanceId} for call: ${callId}`);
      return updatedCall;
    } catch (error) {
      logger.error('Error dispatching ambulance:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getEmergencyDashboardStats(date?: string): Promise<any> {
    try {
      const query: any = {};
      if (date) {
        const targetDate = new Date(date);
        query.visitDate = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      } else {
        // Default to today
        const today = new Date();
        query.visitDate = {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }

      const stats = await EmergencyVisitModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$triageLevel',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalVisits = await EmergencyVisitModel.countDocuments(query);
      const activeVisits = await EmergencyVisitModel.countDocuments({ ...query, status: 'active' });
      const totalAmbulances = await AmbulanceServiceModel.countDocuments();
      const availableAmbulances = await AmbulanceServiceModel.countDocuments({ status: 'available' });
      const pendingCalls = await EmergencyCallModel.countDocuments({ status: 'pending' });

      return {
        totalVisits,
        activeVisits,
        totalAmbulances,
        availableAmbulances,
        pendingCalls,
        triageBreakdown: stats
      };
    } catch (error) {
      logger.error('Error fetching emergency dashboard stats:', error);
      throw error;
    }
  }

  async getTriageStats(): Promise<any> {
    try {
      const stats = await EmergencyVisitModel.aggregate([
        {
          $group: {
            _id: {
              triageLevel: '$triageLevel',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.triageLevel',
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
      logger.error('Error fetching triage stats:', error);
      throw error;
    }
  }
}

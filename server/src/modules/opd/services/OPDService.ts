import { OPDVisitModel, OPDQueueModel } from '../models';
import { CreateOPDVisitDto, UpdateOPDVisitDto, AddToQueueDto, UpdateQueueStatusDto } from '../dto/CreateOPDVisitDto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';

export class OPDService {
  // ==============================================
  // OPD VISIT MANAGEMENT
  // ==============================================

  async createOPDVisit(visitData: CreateOPDVisitDto): Promise<any> {
    try {
      const visitId = `OPD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const visit = new OPDVisitModel({
        visitId,
        ...visitData,
        checkInTime: new Date(),
        status: 'checked_in'
      });

      const savedVisit = await visit.save();
      logger.info(`OPD visit created: ${visitId} for patient: ${visitData.patientId}`);
      
      return savedVisit;
    } catch (error) {
      logger.error('Error creating OPD visit:', error);
      throw error;
    }
  }

  async getOPDVisits(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.staffId) query.staffId = filters.staffId;
      if (filters.status) query.status = filters.status;
      if (filters.visitDate) {
        const date = new Date(filters.visitDate);
        query.visitDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const visits = await OPDVisitModel.find(query)
        .populate('patientId', 'patientId firstName lastName phone')
        .populate('staffId', 'staffId firstName lastName department')
        .populate('appointmentId', 'appointmentId appointmentDate startTime')
        .sort({ visitDate: -1, checkInTime: -1 })
        .skip(skip)
        .limit(limit);

      const total = await OPDVisitModel.countDocuments(query);

      return {
        visits,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching OPD visits:', error);
      throw error;
    }
  }

  async getOPDVisitById(visitId: string): Promise<any> {
    try {
      const visit = await OPDVisitModel.findOne({ visitId })
        .populate('patientId', 'patientId firstName lastName phone email dateOfBirth gender')
        .populate('staffId', 'staffId firstName lastName department position')
        .populate('appointmentId', 'appointmentId appointmentDate startTime endTime reasonForVisit');

      if (!visit) {
        throw new Error('OPD visit not found');
      }

      return visit;
    } catch (error) {
      logger.error('Error fetching OPD visit:', error);
      throw error;
    }
  }

  async updateOPDVisit(visitId: string, updateData: UpdateOPDVisitDto): Promise<any> {
    try {
      const visit = await OPDVisitModel.findOneAndUpdate(
        { visitId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('patientId', 'patientId firstName lastName')
       .populate('staffId', 'staffId firstName lastName department');

      if (!visit) {
        throw new Error('OPD visit not found');
      }

      logger.info(`OPD visit updated: ${visitId}`);
      return visit;
    } catch (error) {
      logger.error('Error updating OPD visit:', error);
      throw error;
    }
  }

  async completeOPDVisit(visitId: string): Promise<any> {
    try {
      const visit = await OPDVisitModel.findOneAndUpdate(
        { visitId },
        { 
          status: 'completed',
          checkOutTime: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!visit) {
        throw new Error('OPD visit not found');
      }

      // Remove from queue if exists
      await OPDQueueModel.findOneAndUpdate(
        { visitId },
        { 
          status: 'completed',
          completedAt: new Date()
        }
      );

      logger.info(`OPD visit completed: ${visitId}`);
      return visit;
    } catch (error) {
      logger.error('Error completing OPD visit:', error);
      throw error;
    }
  }

  // ==============================================
  // QUEUE MANAGEMENT
  // ==============================================

  async addToQueue(queueData: AddToQueueDto): Promise<any> {
    try {
      // Get the next queue number for the staff member
      const lastQueue = await OPDQueueModel.findOne({ staffId: queueData.staffId })
        .sort({ queueNumber: -1 });
      
      const nextQueueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

      const queueId = `Q${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const queueEntry = new OPDQueueModel({
        queueId,
        ...queueData,
        queueNumber: nextQueueNumber,
        status: 'waiting'
      });

      const savedQueue = await queueEntry.save();
      
      // Update visit status to in_queue
      await OPDVisitModel.findOneAndUpdate(
        { visitId: queueData.visitId },
        { status: 'in_queue' }
      );

      logger.info(`Patient added to queue: ${queueId}, position: ${nextQueueNumber}`);
      return savedQueue;
    } catch (error) {
      logger.error('Error adding to queue:', error);
      throw error;
    }
  }

  async getQueue(staffId?: string, status?: string): Promise<any> {
    try {
      const query: any = {};
      if (staffId) query.staffId = staffId;
      if (status) query.status = status;

      const queue = await OPDQueueModel.find(query)
        .populate('visitId', 'visitId chiefComplaint vitalSigns')
        .populate('patientId', 'patientId firstName lastName phone')
        .populate('staffId', 'staffId firstName lastName department')
        .sort({ queueNumber: 1 });

      return queue;
    } catch (error) {
      logger.error('Error fetching queue:', error);
      throw error;
    }
  }

  async updateQueueStatus(queueId: string, updateData: UpdateQueueStatusDto): Promise<any> {
    try {
      const queue = await OPDQueueModel.findOneAndUpdate(
        { queueId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('visitId', 'visitId chiefComplaint')
       .populate('patientId', 'patientId firstName lastName');

      if (!queue) {
        throw new Error('Queue entry not found');
      }

      // Update visit status based on queue status
      if (updateData.status === 'in_progress') {
        await OPDVisitModel.findOneAndUpdate(
          { visitId: queue.visitId },
          { status: 'with_doctor' }
        );
      } else if (updateData.status === 'completed') {
        await OPDVisitModel.findOneAndUpdate(
          { visitId: queue.visitId },
          { status: 'completed', checkOutTime: new Date() }
        );
      }

      logger.info(`Queue status updated: ${queueId} to ${updateData.status}`);
      return queue;
    } catch (error) {
      logger.error('Error updating queue status:', error);
      throw error;
    }
  }

  async getQueueStats(staffId?: string): Promise<any> {
    try {
      const query: any = {};
      if (staffId) query.staffId = staffId;

      const stats = await OPDQueueModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgWaitTime: { $avg: '$estimatedWaitTime' }
          }
        }
      ]);

      const totalWaiting = await OPDQueueModel.countDocuments({ ...query, status: 'waiting' });
      const totalInProgress = await OPDQueueModel.countDocuments({ ...query, status: 'in_progress' });

      return {
        statusBreakdown: stats,
        totalWaiting,
        totalInProgress,
        totalInQueue: totalWaiting + totalInProgress
      };
    } catch (error) {
      logger.error('Error fetching queue stats:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getOPDDashboardStats(date?: string): Promise<any> {
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

      const stats = await OPDVisitModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalVisits = await OPDVisitModel.countDocuments(query);
      const completedVisits = await OPDVisitModel.countDocuments({ ...query, status: 'completed' });
      const inProgressVisits = await OPDVisitModel.countDocuments({ ...query, status: { $in: ['in_queue', 'with_doctor'] } });

      return {
        totalVisits,
        completedVisits,
        inProgressVisits,
        statusBreakdown: stats,
        completionRate: totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0
      };
    } catch (error) {
      logger.error('Error fetching OPD dashboard stats:', error);
      throw error;
    }
  }
}

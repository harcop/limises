import { OperationTheatreModel, SurgicalProcedureModel, OTScheduleModel, OTTeamAssignmentModel, OTConsumableModel } from '../models';
import { CreateOperationTheatreDto, UpdateOperationTheatreDto, CreateSurgicalProcedureDto, UpdateSurgicalProcedureDto, CreateOTScheduleDto, UpdateOTScheduleDto, CreateOTTeamAssignmentDto, CreateOTConsumableDto, CompleteSurgeryDto } from '../dto/CreateOTDto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';

export class OTService {
  // ==============================================
  // OPERATION THEATRE MANAGEMENT
  // ==============================================

  async createOperationTheatre(theatreData: CreateOperationTheatreDto): Promise<any> {
    try {
      const theatreId = `OT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const theatre = new OperationTheatreModel({
        theatreId,
        ...theatreData,
        status: 'available'
      });

      const savedTheatre = await theatre.save();
      logger.info(`Operation theatre created: ${theatreId} - ${theatreData.theatreName}`);
      
      return savedTheatre;
    } catch (error) {
      logger.error('Error creating operation theatre:', error);
      throw error;
    }
  }

  async getOperationTheatres(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.status) query.status = filters.status;

      const theatres = await OperationTheatreModel.find(query)
        .sort({ theatreNumber: 1 })
        .skip(skip)
        .limit(limit);

      const total = await OperationTheatreModel.countDocuments(query);

      return {
        theatres,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching operation theatres:', error);
      throw error;
    }
  }

  async getOperationTheatreById(theatreId: string): Promise<any> {
    try {
      const theatre = await OperationTheatreModel.findOne({ theatreId });
      if (!theatre) {
        throw new Error('Operation theatre not found');
      }
      return theatre;
    } catch (error) {
      logger.error('Error fetching operation theatre:', error);
      throw error;
    }
  }

  async updateOperationTheatre(theatreId: string, updateData: UpdateOperationTheatreDto): Promise<any> {
    try {
      const theatre = await OperationTheatreModel.findOneAndUpdate(
        { theatreId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!theatre) {
        throw new Error('Operation theatre not found');
      }

      logger.info(`Operation theatre updated: ${theatreId}`);
      return theatre;
    } catch (error) {
      logger.error('Error updating operation theatre:', error);
      throw error;
    }
  }

  // ==============================================
  // SURGICAL PROCEDURE MANAGEMENT
  // ==============================================

  async createSurgicalProcedure(procedureData: CreateSurgicalProcedureDto): Promise<any> {
    try {
      const procedureId = `PROC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const procedure = new SurgicalProcedureModel({
        procedureId,
        ...procedureData,
        isActive: true
      });

      const savedProcedure = await procedure.save();
      logger.info(`Surgical procedure created: ${procedureId} - ${procedureData.procedureName}`);
      
      return savedProcedure;
    } catch (error) {
      logger.error('Error creating surgical procedure:', error);
      throw error;
    }
  }

  async getSurgicalProcedures(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.category) query.category = filters.category;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const procedures = await SurgicalProcedureModel.find(query)
        .sort({ procedureName: 1 })
        .skip(skip)
        .limit(limit);

      const total = await SurgicalProcedureModel.countDocuments(query);

      return {
        procedures,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching surgical procedures:', error);
      throw error;
    }
  }

  async getSurgicalProcedureById(procedureId: string): Promise<any> {
    try {
      const procedure = await SurgicalProcedureModel.findOne({ procedureId });
      if (!procedure) {
        throw new Error('Surgical procedure not found');
      }
      return procedure;
    } catch (error) {
      logger.error('Error fetching surgical procedure:', error);
      throw error;
    }
  }

  async updateSurgicalProcedure(procedureId: string, updateData: UpdateSurgicalProcedureDto): Promise<any> {
    try {
      const procedure = await SurgicalProcedureModel.findOneAndUpdate(
        { procedureId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!procedure) {
        throw new Error('Surgical procedure not found');
      }

      logger.info(`Surgical procedure updated: ${procedureId}`);
      return procedure;
    } catch (error) {
      logger.error('Error updating surgical procedure:', error);
      throw error;
    }
  }

  // ==============================================
  // OT SCHEDULE MANAGEMENT
  // ==============================================

  async createOTSchedule(scheduleData: CreateOTScheduleDto): Promise<any> {
    try {
      // Check if theatre is available
      const theatre = await OperationTheatreModel.findOne({ theatreId: scheduleData.theatreId });
      if (!theatre) {
        throw new Error('Operation theatre not found');
      }
      if (theatre.status !== 'available') {
        throw new Error('Operation theatre is not available');
      }

      // Check for scheduling conflicts
      const conflict = await OTScheduleModel.findOne({
        theatreId: scheduleData.theatreId,
        scheduledDate: new Date(scheduleData.scheduledDate),
        status: { $in: ['scheduled', 'in_progress'] },
        $or: [
          {
            startTime: { $lt: scheduleData.endTime },
            endTime: { $gt: scheduleData.startTime }
          }
        ]
      });

      if (conflict) {
        throw new Error('Time slot conflict with existing schedule');
      }

      const scheduleId = `SCHED${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const schedule = new OTScheduleModel({
        scheduleId,
        ...scheduleData,
        scheduledDate: new Date(scheduleData.scheduledDate),
        status: 'scheduled'
      });

      const savedSchedule = await schedule.save();

      // Update theatre status if needed
      if (new Date(scheduleData.scheduledDate).toDateString() === new Date().toDateString()) {
        await OperationTheatreModel.findOneAndUpdate(
          { theatreId: scheduleData.theatreId },
          { status: 'occupied' }
        );
      }

      logger.info(`OT schedule created: ${scheduleId} for patient: ${scheduleData.patientId}`);
      
      return savedSchedule;
    } catch (error) {
      logger.error('Error creating OT schedule:', error);
      throw error;
    }
  }

  async getOTSchedules(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.theatreId) query.theatreId = filters.theatreId;
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.surgeonId) query.surgeonId = filters.surgeonId;
      if (filters.status) query.status = filters.status;
      if (filters.scheduledDate) {
        const date = new Date(filters.scheduledDate);
        query.scheduledDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const schedules = await OTScheduleModel.find(query)
        .populate('theatreId', 'theatreId theatreName theatreNumber')
        .populate('patientId', 'patientId firstName lastName phone')
        .populate('procedureId', 'procedureId procedureName category estimatedDuration')
        .populate('surgeonId', 'staffId firstName lastName department')
        .populate('anesthetistId', 'staffId firstName lastName department')
        .sort({ scheduledDate: -1, startTime: 1 })
        .skip(skip)
        .limit(limit);

      const total = await OTScheduleModel.countDocuments(query);

      return {
        schedules,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching OT schedules:', error);
      throw error;
    }
  }

  async getOTScheduleById(scheduleId: string): Promise<any> {
    try {
      const schedule = await OTScheduleModel.findOne({ scheduleId })
        .populate('theatreId', 'theatreId theatreName theatreNumber equipmentList specializations')
        .populate('patientId', 'patientId firstName lastName phone email dateOfBirth gender')
        .populate('procedureId', 'procedureId procedureName category estimatedDuration description requirements')
        .populate('surgeonId', 'staffId firstName lastName department position')
        .populate('anesthetistId', 'staffId firstName lastName department position');

      if (!schedule) {
        throw new Error('OT schedule not found');
      }

      return schedule;
    } catch (error) {
      logger.error('Error fetching OT schedule:', error);
      throw error;
    }
  }

  async updateOTSchedule(scheduleId: string, updateData: UpdateOTScheduleDto): Promise<any> {
    try {
      const schedule = await OTScheduleModel.findOneAndUpdate(
        { scheduleId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('theatreId', 'theatreId theatreName theatreNumber')
       .populate('patientId', 'patientId firstName lastName')
       .populate('procedureId', 'procedureId procedureName category')
       .populate('surgeonId', 'staffId firstName lastName department');

      if (!schedule) {
        throw new Error('OT schedule not found');
      }

      logger.info(`OT schedule updated: ${scheduleId}`);
      return schedule;
    } catch (error) {
      logger.error('Error updating OT schedule:', error);
      throw error;
    }
  }

  async startSurgery(scheduleId: string): Promise<any> {
    try {
      const schedule = await OTScheduleModel.findOneAndUpdate(
        { scheduleId },
        { 
          status: 'in_progress',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!schedule) {
        throw new Error('OT schedule not found');
      }

      // Update theatre status
      await OperationTheatreModel.findOneAndUpdate(
        { theatreId: schedule.theatreId },
        { status: 'occupied' }
      );

      logger.info(`Surgery started: ${scheduleId}`);
      return schedule;
    } catch (error) {
      logger.error('Error starting surgery:', error);
      throw error;
    }
  }

  async completeSurgery(scheduleId: string, completionData: CompleteSurgeryDto): Promise<any> {
    try {
      const schedule = await OTScheduleModel.findOneAndUpdate(
        { scheduleId },
        {
          status: 'completed',
          postOpNotes: completionData.postOpNotes,
          notes: completionData.notes,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!schedule) {
        throw new Error('OT schedule not found');
      }

      // Update theatre status to cleaning
      await OperationTheatreModel.findOneAndUpdate(
        { theatreId: schedule.theatreId },
        { status: 'cleaning' }
      );

      logger.info(`Surgery completed: ${scheduleId}`);
      return schedule;
    } catch (error) {
      logger.error('Error completing surgery:', error);
      throw error;
    }
  }

  // ==============================================
  // TEAM ASSIGNMENT MANAGEMENT
  // ==============================================

  async createOTTeamAssignment(assignmentData: CreateOTTeamAssignmentDto): Promise<any> {
    try {
      const assignmentId = `ASSIGN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const assignment = new OTTeamAssignmentModel({
        assignmentId,
        ...assignmentData
      });

      const savedAssignment = await assignment.save();
      logger.info(`OT team assignment created: ${assignmentId}`);
      
      return savedAssignment;
    } catch (error) {
      logger.error('Error creating OT team assignment:', error);
      throw error;
    }
  }

  async getOTTeamAssignments(scheduleId: string): Promise<any> {
    try {
      const assignments = await OTTeamAssignmentModel.find({ scheduleId })
        .populate('staffId', 'staffId firstName lastName department position')
        .sort({ role: 1 });

      return assignments;
    } catch (error) {
      logger.error('Error fetching OT team assignments:', error);
      throw error;
    }
  }

  // ==============================================
  // CONSUMABLE TRACKING
  // ==============================================

  async createOTConsumable(consumableData: CreateOTConsumableDto): Promise<any> {
    try {
      const consumptionId = `CONS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const consumable = new OTConsumableModel({
        consumptionId,
        ...consumableData,
        totalCost: consumableData.unitCost ? consumableData.unitCost * consumableData.quantityUsed : undefined
      });

      const savedConsumable = await consumable.save();
      logger.info(`OT consumable recorded: ${consumptionId}`);
      
      return savedConsumable;
    } catch (error) {
      logger.error('Error creating OT consumable:', error);
      throw error;
    }
  }

  async getOTConsumables(scheduleId: string): Promise<any> {
    try {
      const consumables = await OTConsumableModel.find({ scheduleId })
        .populate('itemId', 'itemId itemName itemCategory unitOfMeasure')
        .populate('usedBy', 'staffId firstName lastName')
        .sort({ usedAt: -1 });

      return consumables;
    } catch (error) {
      logger.error('Error fetching OT consumables:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getOTDashboardStats(date?: string): Promise<any> {
    try {
      const query: any = {};
      if (date) {
        const targetDate = new Date(date);
        query.scheduledDate = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      } else {
        // Default to today
        const today = new Date();
        query.scheduledDate = {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999))
        };
      }

      const stats = await OTScheduleModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalSchedules = await OTScheduleModel.countDocuments(query);
      const totalTheatres = await OperationTheatreModel.countDocuments();
      const availableTheatres = await OperationTheatreModel.countDocuments({ status: 'available' });
      const totalProcedures = await SurgicalProcedureModel.countDocuments({ isActive: true });

      return {
        totalSchedules,
        totalTheatres,
        availableTheatres,
        totalProcedures,
        statusBreakdown: stats
      };
    } catch (error) {
      logger.error('Error fetching OT dashboard stats:', error);
      throw error;
    }
  }

  async getTheatreUtilizationStats(): Promise<any> {
    try {
      const theatres = await OperationTheatreModel.find();
      
      const utilizationStats = await Promise.all(theatres.map(async (theatre) => {
        const totalSchedules = await OTScheduleModel.countDocuments({ theatreId: theatre.theatreId });
        const completedSchedules = await OTScheduleModel.countDocuments({ 
          theatreId: theatre.theatreId, 
          status: 'completed' 
        });
        
        return {
          theatreId: theatre.theatreId,
          theatreName: theatre.theatreName,
          theatreNumber: theatre.theatreNumber,
          status: theatre.status,
          totalSchedules,
          completedSchedules,
          utilizationRate: totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0
        };
      }));

      return utilizationStats;
    } catch (error) {
      logger.error('Error fetching theatre utilization stats:', error);
      throw error;
    }
  }
}

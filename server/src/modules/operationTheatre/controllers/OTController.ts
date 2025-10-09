import { Request, Response } from 'express';
import { OTService } from '../services/OTService';
import { logger } from '../../../utils/logger';

export class OTController {
  private otService: OTService;

  constructor() {
    this.otService = new OTService();
  }

  // ==============================================
  // OPERATION THEATRE MANAGEMENT
  // ==============================================

  createOperationTheatre = async (req: Request, res: Response): Promise<void> => {
    try {
      const theatreData = req.body;
      const theatre = await this.otService.createOperationTheatre(theatreData);

      res.status(201).json({
        success: true,
        message: 'Operation theatre created successfully',
        data: theatre
      });
    } catch (error: any) {
      logger.error('Error creating operation theatre:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create operation theatre',
        error: error.message
      });
    }
  };

  getOperationTheatres = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;

      const result = await this.otService.getOperationTheatres(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Operation theatres retrieved successfully',
        data: result.theatres,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching operation theatres:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch operation theatres',
        error: error.message
      });
    }
  };

  getOperationTheatreById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { theatreId } = req.params;
      const theatre = await this.otService.getOperationTheatreById(theatreId);

      res.json({
        success: true,
        message: 'Operation theatre retrieved successfully',
        data: theatre
      });
    } catch (error: any) {
      logger.error('Error fetching operation theatre:', error);
      const statusCode = error.message === 'Operation theatre not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch operation theatre',
        error: error.message
      });
    }
  };

  updateOperationTheatre = async (req: Request, res: Response): Promise<void> => {
    try {
      const { theatreId } = req.params;
      const updateData = req.body;
      
      const theatre = await this.otService.updateOperationTheatre(theatreId, updateData);

      res.json({
        success: true,
        message: 'Operation theatre updated successfully',
        data: theatre
      });
    } catch (error: any) {
      logger.error('Error updating operation theatre:', error);
      const statusCode = error.message === 'Operation theatre not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update operation theatre',
        error: error.message
      });
    }
  };

  // ==============================================
  // SURGICAL PROCEDURE MANAGEMENT
  // ==============================================

  createSurgicalProcedure = async (req: Request, res: Response): Promise<void> => {
    try {
      const procedureData = req.body;
      const procedure = await this.otService.createSurgicalProcedure(procedureData);

      res.status(201).json({
        success: true,
        message: 'Surgical procedure created successfully',
        data: procedure
      });
    } catch (error: any) {
      logger.error('Error creating surgical procedure:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create surgical procedure',
        error: error.message
      });
    }
  };

  getSurgicalProcedures = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, category, isActive } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await this.otService.getSurgicalProcedures(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Surgical procedures retrieved successfully',
        data: result.procedures,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching surgical procedures:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch surgical procedures',
        error: error.message
      });
    }
  };

  getSurgicalProcedureById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { procedureId } = req.params;
      const procedure = await this.otService.getSurgicalProcedureById(procedureId);

      res.json({
        success: true,
        message: 'Surgical procedure retrieved successfully',
        data: procedure
      });
    } catch (error: any) {
      logger.error('Error fetching surgical procedure:', error);
      const statusCode = error.message === 'Surgical procedure not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch surgical procedure',
        error: error.message
      });
    }
  };

  updateSurgicalProcedure = async (req: Request, res: Response): Promise<void> => {
    try {
      const { procedureId } = req.params;
      const updateData = req.body;
      
      const procedure = await this.otService.updateSurgicalProcedure(procedureId, updateData);

      res.json({
        success: true,
        message: 'Surgical procedure updated successfully',
        data: procedure
      });
    } catch (error: any) {
      logger.error('Error updating surgical procedure:', error);
      const statusCode = error.message === 'Surgical procedure not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update surgical procedure',
        error: error.message
      });
    }
  };

  // ==============================================
  // OT SCHEDULE MANAGEMENT
  // ==============================================

  createOTSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleData = req.body;
      const schedule = await this.otService.createOTSchedule(scheduleData);

      res.status(201).json({
        success: true,
        message: 'OT schedule created successfully',
        data: schedule
      });
    } catch (error: any) {
      logger.error('Error creating OT schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create OT schedule',
        error: error.message
      });
    }
  };

  getOTSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, theatreId, patientId, surgeonId, status, scheduledDate } = req.query;
      
      const filters: any = {};
      if (theatreId) filters.theatreId = theatreId as string;
      if (patientId) filters.patientId = patientId as string;
      if (surgeonId) filters.surgeonId = surgeonId as string;
      if (status) filters.status = status as string;
      if (scheduledDate) filters.scheduledDate = scheduledDate as string;

      const result = await this.otService.getOTSchedules(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'OT schedules retrieved successfully',
        data: result.schedules,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching OT schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OT schedules',
        error: error.message
      });
    }
  };

  getOTScheduleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const schedule = await this.otService.getOTScheduleById(scheduleId);

      res.json({
        success: true,
        message: 'OT schedule retrieved successfully',
        data: schedule
      });
    } catch (error: any) {
      logger.error('Error fetching OT schedule:', error);
      const statusCode = error.message === 'OT schedule not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch OT schedule',
        error: error.message
      });
    }
  };

  updateOTSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const updateData = req.body;
      
      const schedule = await this.otService.updateOTSchedule(scheduleId, updateData);

      res.json({
        success: true,
        message: 'OT schedule updated successfully',
        data: schedule
      });
    } catch (error: any) {
      logger.error('Error updating OT schedule:', error);
      const statusCode = error.message === 'OT schedule not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update OT schedule',
        error: error.message
      });
    }
  };

  startSurgery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const schedule = await this.otService.startSurgery(scheduleId);

      res.json({
        success: true,
        message: 'Surgery started successfully',
        data: schedule
      });
    } catch (error: any) {
      logger.error('Error starting surgery:', error);
      const statusCode = error.message === 'OT schedule not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to start surgery',
        error: error.message
      });
    }
  };

  completeSurgery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const completionData = req.body;
      
      const schedule = await this.otService.completeSurgery(scheduleId, completionData);

      res.json({
        success: true,
        message: 'Surgery completed successfully',
        data: schedule
      });
    } catch (error: any) {
      logger.error('Error completing surgery:', error);
      const statusCode = error.message === 'OT schedule not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to complete surgery',
        error: error.message
      });
    }
  };

  // ==============================================
  // TEAM ASSIGNMENT MANAGEMENT
  // ==============================================

  createOTTeamAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignmentData = req.body;
      const assignment = await this.otService.createOTTeamAssignment(assignmentData);

      res.status(201).json({
        success: true,
        message: 'OT team assignment created successfully',
        data: assignment
      });
    } catch (error: any) {
      logger.error('Error creating OT team assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create OT team assignment',
        error: error.message
      });
    }
  };

  getOTTeamAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const assignments = await this.otService.getOTTeamAssignments(scheduleId);

      res.json({
        success: true,
        message: 'OT team assignments retrieved successfully',
        data: assignments
      });
    } catch (error: any) {
      logger.error('Error fetching OT team assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OT team assignments',
        error: error.message
      });
    }
  };

  // ==============================================
  // CONSUMABLE TRACKING
  // ==============================================

  createOTConsumable = async (req: Request, res: Response): Promise<void> => {
    try {
      const consumableData = req.body;
      const consumable = await this.otService.createOTConsumable(consumableData);

      res.status(201).json({
        success: true,
        message: 'OT consumable recorded successfully',
        data: consumable
      });
    } catch (error: any) {
      logger.error('Error creating OT consumable:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record OT consumable',
        error: error.message
      });
    }
  };

  getOTConsumables = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scheduleId } = req.params;
      const consumables = await this.otService.getOTConsumables(scheduleId);

      res.json({
        success: true,
        message: 'OT consumables retrieved successfully',
        data: consumables
      });
    } catch (error: any) {
      logger.error('Error fetching OT consumables:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OT consumables',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getOTDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.otService.getOTDashboardStats(date as string);

      res.json({
        success: true,
        message: 'OT dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching OT dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OT dashboard statistics',
        error: error.message
      });
    }
  };

  getTheatreUtilizationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.otService.getTheatreUtilizationStats();

      res.json({
        success: true,
        message: 'Theatre utilization statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching theatre utilization stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch theatre utilization statistics',
        error: error.message
      });
    }
  };

  getOTStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.otService.getOTDashboardStats(date as string);

      res.json({
        success: true,
        message: 'OT statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching OT stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OT statistics',
        error: error.message
      });
    }
  };
}

import { Request, Response } from 'express';
import { OPDService } from '../services/OPDService';
import { logger } from '../../../utils/logger';

export class OPDController {
  private opdService: OPDService;

  constructor() {
    this.opdService = new OPDService();
  }

  // ==============================================
  // OPD VISIT MANAGEMENT
  // ==============================================

  createOPDVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const visitData = req.body;
      const visit = await this.opdService.createOPDVisit(visitData);

      res.status(201).json({
        success: true,
        message: 'OPD visit created successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error creating OPD visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create OPD visit',
        error: error.message
      });
    }
  };

  getOPDVisits = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, patientId, staffId, status, visitDate } = req.query;
      
      const filters: any = {};
      if (patientId) filters.patientId = patientId as string;
      if (staffId) filters.staffId = staffId as string;
      if (status) filters.status = status as string;
      if (visitDate) filters.visitDate = visitDate as string;

      const result = await this.opdService.getOPDVisits(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'OPD visits retrieved successfully',
        data: result.visits,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching OPD visits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OPD visits',
        error: error.message
      });
    }
  };

  getOPDVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { visitId } = req.params;
      const visit = await this.opdService.getOPDVisitById(visitId);

      res.json({
        success: true,
        message: 'OPD visit retrieved successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error fetching OPD visit:', error);
      const statusCode = error.message === 'OPD visit not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch OPD visit',
        error: error.message
      });
    }
  };

  updateOPDVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { visitId } = req.params;
      const updateData = req.body;
      
      const visit = await this.opdService.updateOPDVisit(visitId, updateData);

      res.json({
        success: true,
        message: 'OPD visit updated successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error updating OPD visit:', error);
      const statusCode = error.message === 'OPD visit not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update OPD visit',
        error: error.message
      });
    }
  };

  completeOPDVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { visitId } = req.params;
      const visit = await this.opdService.completeOPDVisit(visitId);

      res.json({
        success: true,
        message: 'OPD visit completed successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error completing OPD visit:', error);
      const statusCode = error.message === 'OPD visit not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to complete OPD visit',
        error: error.message
      });
    }
  };

  // ==============================================
  // QUEUE MANAGEMENT
  // ==============================================

  addToQueue = async (req: Request, res: Response): Promise<void> => {
    try {
      const queueData = req.body;
      const queueEntry = await this.opdService.addToQueue(queueData);

      res.status(201).json({
        success: true,
        message: 'Patient added to queue successfully',
        data: queueEntry
      });
    } catch (error: any) {
      logger.error('Error adding to queue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add patient to queue',
        error: error.message
      });
    }
  };

  getQueue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { staffId, status } = req.query;
      
      const queue = await this.opdService.getQueue(
        staffId as string,
        status as string
      );

      res.json({
        success: true,
        message: 'Queue retrieved successfully',
        data: queue
      });
    } catch (error: any) {
      logger.error('Error fetching queue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch queue',
        error: error.message
      });
    }
  };

  updateQueueStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { queueId } = req.params;
      const updateData = req.body;
      
      const queue = await this.opdService.updateQueueStatus(queueId, updateData);

      res.json({
        success: true,
        message: 'Queue status updated successfully',
        data: queue
      });
    } catch (error: any) {
      logger.error('Error updating queue status:', error);
      const statusCode = error.message === 'Queue entry not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update queue status',
        error: error.message
      });
    }
  };

  getQueueStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { staffId } = req.query;
      
      const stats = await this.opdService.getQueueStats(staffId as string);

      res.json({
        success: true,
        message: 'Queue statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching queue stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch queue statistics',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getOPDDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.opdService.getOPDDashboardStats(date as string);

      res.json({
        success: true,
        message: 'OPD dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching OPD dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OPD dashboard statistics',
        error: error.message
      });
    }
  };

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  getOPDStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.opdService.getOPDDashboardStats(date as string);

      res.json({
        success: true,
        message: 'OPD statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching OPD stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch OPD statistics',
        error: error.message
      });
    }
  };
}

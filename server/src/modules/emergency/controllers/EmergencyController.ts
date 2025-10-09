import { Request, Response } from 'express';
import { EmergencyService } from '../services/EmergencyService';
import { logger } from '../../../utils/logger';

export class EmergencyController {
  private emergencyService: EmergencyService;

  constructor() {
    this.emergencyService = new EmergencyService();
  }

  // ==============================================
  // EMERGENCY VISIT MANAGEMENT
  // ==============================================

  createEmergencyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const visitData = req.body;
      const visit = await this.emergencyService.createEmergencyVisit(visitData);

      res.status(201).json({
        success: true,
        message: 'Emergency visit created successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error creating emergency visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create emergency visit',
        error: error.message
      });
    }
  };

  getEmergencyVisits = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, patientId, staffId, triageLevel, status, disposition, visitDate } = req.query;
      
      const filters: any = {};
      if (patientId) filters.patientId = patientId as string;
      if (staffId) filters.staffId = staffId as string;
      if (triageLevel) filters.triageLevel = triageLevel as string;
      if (status) filters.status = status as string;
      if (disposition) filters.disposition = disposition as string;
      if (visitDate) filters.visitDate = visitDate as string;

      const result = await this.emergencyService.getEmergencyVisits(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Emergency visits retrieved successfully',
        data: result.visits,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching emergency visits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emergency visits',
        error: error.message
      });
    }
  };

  getEmergencyVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { visitId } = req.params;
      const visit = await this.emergencyService.getEmergencyVisitById(visitId);

      res.json({
        success: true,
        message: 'Emergency visit retrieved successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error fetching emergency visit:', error);
      const statusCode = error.message === 'Emergency visit not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch emergency visit',
        error: error.message
      });
    }
  };

  updateEmergencyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { visitId } = req.params;
      const updateData = req.body;
      
      const visit = await this.emergencyService.updateEmergencyVisit(visitId, updateData);

      res.json({
        success: true,
        message: 'Emergency visit updated successfully',
        data: visit
      });
    } catch (error: any) {
      logger.error('Error updating emergency visit:', error);
      const statusCode = error.message === 'Emergency visit not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update emergency visit',
        error: error.message
      });
    }
  };

  // ==============================================
  // AMBULANCE SERVICE MANAGEMENT
  // ==============================================

  createAmbulanceService = async (req: Request, res: Response): Promise<void> => {
    try {
      const serviceData = req.body;
      const service = await this.emergencyService.createAmbulanceService(serviceData);

      res.status(201).json({
        success: true,
        message: 'Ambulance service created successfully',
        data: service
      });
    } catch (error: any) {
      logger.error('Error creating ambulance service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ambulance service',
        error: error.message
      });
    }
  };

  getAmbulanceServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, vehicleType, status } = req.query;
      
      const filters: any = {};
      if (vehicleType) filters.vehicleType = vehicleType as string;
      if (status) filters.status = status as string;

      const result = await this.emergencyService.getAmbulanceServices(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Ambulance services retrieved successfully',
        data: result.services,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching ambulance services:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ambulance services',
        error: error.message
      });
    }
  };

  getAmbulanceServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const service = await this.emergencyService.getAmbulanceServiceById(serviceId);

      res.json({
        success: true,
        message: 'Ambulance service retrieved successfully',
        data: service
      });
    } catch (error: any) {
      logger.error('Error fetching ambulance service:', error);
      const statusCode = error.message === 'Ambulance service not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch ambulance service',
        error: error.message
      });
    }
  };

  updateAmbulanceService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const updateData = req.body;
      
      const service = await this.emergencyService.updateAmbulanceService(serviceId, updateData);

      res.json({
        success: true,
        message: 'Ambulance service updated successfully',
        data: service
      });
    } catch (error: any) {
      logger.error('Error updating ambulance service:', error);
      const statusCode = error.message === 'Ambulance service not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update ambulance service',
        error: error.message
      });
    }
  };

  getAvailableAmbulances = async (req: Request, res: Response): Promise<void> => {
    try {
      const { vehicleType } = req.query;
      
      const ambulances = await this.emergencyService.getAvailableAmbulances(vehicleType as string);

      res.json({
        success: true,
        message: 'Available ambulances retrieved successfully',
        data: ambulances
      });
    } catch (error: any) {
      logger.error('Error fetching available ambulances:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available ambulances',
        error: error.message
      });
    }
  };

  // ==============================================
  // EMERGENCY CALL MANAGEMENT
  // ==============================================

  createEmergencyCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const callData = req.body;
      const call = await this.emergencyService.createEmergencyCall(callData);

      res.status(201).json({
        success: true,
        message: 'Emergency call created successfully',
        data: call
      });
    } catch (error: any) {
      logger.error('Error creating emergency call:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create emergency call',
        error: error.message
      });
    }
  };

  getEmergencyCalls = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, emergencyType, priority, status, ambulanceId } = req.query;
      
      const filters: any = {};
      if (emergencyType) filters.emergencyType = emergencyType as string;
      if (priority) filters.priority = priority as string;
      if (status) filters.status = status as string;
      if (ambulanceId) filters.ambulanceId = ambulanceId as string;

      const result = await this.emergencyService.getEmergencyCalls(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Emergency calls retrieved successfully',
        data: result.calls,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching emergency calls:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emergency calls',
        error: error.message
      });
    }
  };

  getEmergencyCallById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { callId } = req.params;
      const call = await this.emergencyService.getEmergencyCallById(callId);

      res.json({
        success: true,
        message: 'Emergency call retrieved successfully',
        data: call
      });
    } catch (error: any) {
      logger.error('Error fetching emergency call:', error);
      const statusCode = error.message === 'Emergency call not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch emergency call',
        error: error.message
      });
    }
  };

  updateEmergencyCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { callId } = req.params;
      const updateData = req.body;
      
      const call = await this.emergencyService.updateEmergencyCall(callId, updateData);

      res.json({
        success: true,
        message: 'Emergency call updated successfully',
        data: call
      });
    } catch (error: any) {
      logger.error('Error updating emergency call:', error);
      const statusCode = error.message === 'Emergency call not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update emergency call',
        error: error.message
      });
    }
  };

  dispatchAmbulance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { callId } = req.params;
      const dispatchData = req.body;
      
      const call = await this.emergencyService.dispatchAmbulance(callId, dispatchData);

      res.json({
        success: true,
        message: 'Ambulance dispatched successfully',
        data: call
      });
    } catch (error: any) {
      logger.error('Error dispatching ambulance:', error);
      const statusCode = error.message === 'Emergency call not found' || error.message === 'Ambulance service not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to dispatch ambulance',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getEmergencyDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.emergencyService.getEmergencyDashboardStats(date as string);

      res.json({
        success: true,
        message: 'Emergency dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching emergency dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emergency dashboard statistics',
        error: error.message
      });
    }
  };

  getTriageStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.emergencyService.getTriageStats();

      res.json({
        success: true,
        message: 'Triage statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching triage stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch triage statistics',
        error: error.message
      });
    }
  };

  getEmergencyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.emergencyService.getEmergencyDashboardStats(date as string);

      res.json({
        success: true,
        message: 'Emergency statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching emergency stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emergency statistics',
        error: error.message
      });
    }
  };
}

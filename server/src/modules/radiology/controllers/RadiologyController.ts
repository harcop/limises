import { Request, Response } from 'express';
import { RadiologyService } from '../services/RadiologyService';
import { logger } from '../../../utils/logger';

export class RadiologyController {
  private radiologyService: RadiologyService;

  constructor() {
    this.radiologyService = new RadiologyService();
  }

  // ==============================================
  // RADIOLOGY ORDER MANAGEMENT
  // ==============================================

  createRadiologyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData = req.body;
      const order = await this.radiologyService.createRadiologyOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Radiology order created successfully',
        data: order
      });
    } catch (error: any) {
      logger.error('Error creating radiology order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create radiology order',
        error: error.message
      });
    }
  };

  getRadiologyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, patientId, staffId, studyType, priority, status, orderDate } = req.query;
      
      const filters: any = {};
      if (patientId) filters.patientId = patientId as string;
      if (staffId) filters.staffId = staffId as string;
      if (studyType) filters.studyType = studyType as string;
      if (priority) filters.priority = priority as string;
      if (status) filters.status = status as string;
      if (orderDate) filters.orderDate = orderDate as string;

      const result = await this.radiologyService.getRadiologyOrders(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Radiology orders retrieved successfully',
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching radiology orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch radiology orders',
        error: error.message
      });
    }
  };

  getRadiologyOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const order = await this.radiologyService.getRadiologyOrderById(orderId);

      res.json({
        success: true,
        message: 'Radiology order retrieved successfully',
        data: order
      });
    } catch (error: any) {
      logger.error('Error fetching radiology order:', error);
      const statusCode = error.message === 'Radiology order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch radiology order',
        error: error.message
      });
    }
  };

  updateRadiologyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const updateData = req.body;
      
      const order = await this.radiologyService.updateRadiologyOrder(orderId, updateData);

      res.json({
        success: true,
        message: 'Radiology order updated successfully',
        data: order
      });
    } catch (error: any) {
      logger.error('Error updating radiology order:', error);
      const statusCode = error.message === 'Radiology order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update radiology order',
        error: error.message
      });
    }
  };

  // ==============================================
  // RADIOLOGY STUDY MANAGEMENT
  // ==============================================

  createRadiologyStudy = async (req: Request, res: Response): Promise<void> => {
    try {
      const studyData = req.body;
      const study = await this.radiologyService.createRadiologyStudy(studyData);

      res.status(201).json({
        success: true,
        message: 'Radiology study created successfully',
        data: study
      });
    } catch (error: any) {
      logger.error('Error creating radiology study:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create radiology study',
        error: error.message
      });
    }
  };

  getRadiologyStudies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, orderId, modality, status, radiologistId, studyDate } = req.query;
      
      const filters: any = {};
      if (orderId) filters.orderId = orderId as string;
      if (modality) filters.modality = modality as string;
      if (status) filters.status = status as string;
      if (radiologistId) filters.radiologistId = radiologistId as string;
      if (studyDate) filters.studyDate = studyDate as string;

      const result = await this.radiologyService.getRadiologyStudies(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Radiology studies retrieved successfully',
        data: result.studies,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching radiology studies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch radiology studies',
        error: error.message
      });
    }
  };

  getRadiologyStudyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studyId } = req.params;
      const study = await this.radiologyService.getRadiologyStudyById(studyId);

      res.json({
        success: true,
        message: 'Radiology study retrieved successfully',
        data: study
      });
    } catch (error: any) {
      logger.error('Error fetching radiology study:', error);
      const statusCode = error.message === 'Radiology study not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch radiology study',
        error: error.message
      });
    }
  };

  updateRadiologyStudy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studyId } = req.params;
      const updateData = req.body;
      
      const study = await this.radiologyService.updateRadiologyStudy(studyId, updateData);

      res.json({
        success: true,
        message: 'Radiology study updated successfully',
        data: study
      });
    } catch (error: any) {
      logger.error('Error updating radiology study:', error);
      const statusCode = error.message === 'Radiology study not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update radiology study',
        error: error.message
      });
    }
  };

  startRadiologyStudy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studyId } = req.params;
      const { technologistId } = req.body;
      
      const study = await this.radiologyService.startRadiologyStudy(studyId, technologistId);

      res.json({
        success: true,
        message: 'Radiology study started successfully',
        data: study
      });
    } catch (error: any) {
      logger.error('Error starting radiology study:', error);
      const statusCode = error.message === 'Radiology study not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to start radiology study',
        error: error.message
      });
    }
  };

  completeRadiologyStudy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studyId } = req.params;
      const completionData = req.body;
      
      const study = await this.radiologyService.completeRadiologyStudy(studyId, completionData);

      res.json({
        success: true,
        message: 'Radiology study completed successfully',
        data: study
      });
    } catch (error: any) {
      logger.error('Error completing radiology study:', error);
      const statusCode = error.message === 'Radiology study not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to complete radiology study',
        error: error.message
      });
    }
  };

  // ==============================================
  // RADIOLOGY EQUIPMENT MANAGEMENT
  // ==============================================

  createRadiologyEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const equipmentData = req.body;
      const equipment = await this.radiologyService.createRadiologyEquipment(equipmentData);

      res.status(201).json({
        success: true,
        message: 'Radiology equipment created successfully',
        data: equipment
      });
    } catch (error: any) {
      logger.error('Error creating radiology equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create radiology equipment',
        error: error.message
      });
    }
  };

  getRadiologyEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, equipmentType, status } = req.query;
      
      const filters: any = {};
      if (equipmentType) filters.equipmentType = equipmentType as string;
      if (status) filters.status = status as string;

      const result = await this.radiologyService.getRadiologyEquipment(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Radiology equipment retrieved successfully',
        data: result.equipment,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching radiology equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch radiology equipment',
        error: error.message
      });
    }
  };

  getRadiologyEquipmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { equipmentId } = req.params;
      const equipment = await this.radiologyService.getRadiologyEquipmentById(equipmentId);

      res.json({
        success: true,
        message: 'Radiology equipment retrieved successfully',
        data: equipment
      });
    } catch (error: any) {
      logger.error('Error fetching radiology equipment:', error);
      const statusCode = error.message === 'Radiology equipment not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch radiology equipment',
        error: error.message
      });
    }
  };

  updateRadiologyEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { equipmentId } = req.params;
      const updateData = req.body;
      
      const equipment = await this.radiologyService.updateRadiologyEquipment(equipmentId, updateData);

      res.json({
        success: true,
        message: 'Radiology equipment updated successfully',
        data: equipment
      });
    } catch (error: any) {
      logger.error('Error updating radiology equipment:', error);
      const statusCode = error.message === 'Radiology equipment not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update radiology equipment',
        error: error.message
      });
    }
  };

  getAvailableEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { equipmentType } = req.query;
      
      const equipment = await this.radiologyService.getAvailableEquipment(equipmentType as string);

      res.json({
        success: true,
        message: 'Available radiology equipment retrieved successfully',
        data: equipment
      });
    } catch (error: any) {
      logger.error('Error fetching available equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available equipment',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getRadiologyDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.radiologyService.getRadiologyDashboardStats(date as string);

      res.json({
        success: true,
        message: 'Radiology dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching radiology dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch radiology dashboard statistics',
        error: error.message
      });
    }
  };

  getStudyTypeStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.radiologyService.getStudyTypeStats();

      res.json({
        success: true,
        message: 'Study type statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching study type stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch study type statistics',
        error: error.message
      });
    }
  };

  getEquipmentUtilizationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.radiologyService.getEquipmentUtilizationStats();

      res.json({
        success: true,
        message: 'Equipment utilization statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching equipment utilization stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment utilization statistics',
        error: error.message
      });
    }
  };

  getRadiologyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.radiologyService.getRadiologyDashboardStats(date as string);

      res.json({
        success: true,
        message: 'Radiology statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching radiology stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch radiology statistics',
        error: error.message
      });
    }
  };
}

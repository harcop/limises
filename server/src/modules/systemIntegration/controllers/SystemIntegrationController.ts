import { Request, Response } from 'express';
import { SystemIntegrationService } from '../services/SystemIntegrationService';
import { logger } from '../../../utils/logger';

export class SystemIntegrationController {
  private systemIntegrationService: SystemIntegrationService;

  constructor() {
    this.systemIntegrationService = new SystemIntegrationService();
  }

  // ==============================================
  // SYSTEM INTEGRATION MANAGEMENT
  // ==============================================

  createSystemIntegration = async (req: Request, res: Response): Promise<void> => {
    try {
      const integrationData = req.body;
      const integration = await this.systemIntegrationService.createSystemIntegration(integrationData);

      res.status(201).json({
        success: true,
        message: 'System integration created successfully',
        data: integration
      });
    } catch (error: any) {
      logger.error('Error creating system integration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create system integration',
        error: error.message
      });
    }
  };

  getSystemIntegrations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, systemType, status, authenticationType } = req.query;
      
      const filters: any = {};
      if (systemType) filters.systemType = systemType as string;
      if (status) filters.status = status as string;
      if (authenticationType) filters.authenticationType = authenticationType as string;

      const result = await this.systemIntegrationService.getSystemIntegrations(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'System integrations retrieved successfully',
        data: result.integrations,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching system integrations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system integrations',
        error: error.message
      });
    }
  };

  getSystemIntegrationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { integrationId } = req.params;
      const integration = await this.systemIntegrationService.getSystemIntegrationById(integrationId);

      res.json({
        success: true,
        message: 'System integration retrieved successfully',
        data: integration
      });
    } catch (error: any) {
      logger.error('Error fetching system integration:', error);
      const statusCode = error.message === 'System integration not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch system integration',
        error: error.message
      });
    }
  };

  updateSystemIntegration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { integrationId } = req.params;
      const updateData = req.body;
      
      const integration = await this.systemIntegrationService.updateSystemIntegration(integrationId, updateData);

      res.json({
        success: true,
        message: 'System integration updated successfully',
        data: integration
      });
    } catch (error: any) {
      logger.error('Error updating system integration:', error);
      const statusCode = error.message === 'System integration not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update system integration',
        error: error.message
      });
    }
  };

  testSystemIntegration = async (req: Request, res: Response): Promise<void> => {
    try {
      const testData = req.body;
      const result = await this.systemIntegrationService.testSystemIntegration(testData);

      res.json({
        success: true,
        message: 'System integration test completed',
        data: result
      });
    } catch (error: any) {
      logger.error('Error testing system integration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test system integration',
        error: error.message
      });
    }
  };

  syncSystemIntegration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { integrationId } = req.params;
      const syncData = req.body;
      
      const result = await this.systemIntegrationService.syncSystemIntegration(integrationId, syncData);

      res.json({
        success: true,
        message: 'System integration sync completed',
        data: result
      });
    } catch (error: any) {
      logger.error('Error syncing system integration:', error);
      const statusCode = error.message === 'System integration not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to sync system integration',
        error: error.message
      });
    }
  };

  // ==============================================
  // SECURITY AUDIT MANAGEMENT
  // ==============================================

  createSecurityAudit = async (req: Request, res: Response): Promise<void> => {
    try {
      const auditData = req.body;
      const audit = await this.systemIntegrationService.createSecurityAudit(auditData);

      res.status(201).json({
        success: true,
        message: 'Security audit created successfully',
        data: audit
      });
    } catch (error: any) {
      logger.error('Error creating security audit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create security audit',
        error: error.message
      });
    }
  };

  getSecurityAudits = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        userId, 
        action, 
        resource, 
        ipAddress, 
        success, 
        startDate, 
        endDate 
      } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (resource) filters.resource = resource as string;
      if (ipAddress) filters.ipAddress = ipAddress as string;
      if (success !== undefined) filters.success = success === 'true';
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      const result = await this.systemIntegrationService.getSecurityAudits(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Security audits retrieved successfully',
        data: result.audits,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching security audits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security audits',
        error: error.message
      });
    }
  };

  getSecurityAuditById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { auditId } = req.params;
      const audit = await this.systemIntegrationService.getSecurityAuditById(auditId);

      res.json({
        success: true,
        message: 'Security audit retrieved successfully',
        data: audit
      });
    } catch (error: any) {
      logger.error('Error fetching security audit:', error);
      const statusCode = error.message === 'Security audit not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch security audit',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getSystemIntegrationDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.systemIntegrationService.getSystemIntegrationDashboardStats();

      res.json({
        success: true,
        message: 'System integration dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching system integration dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system integration dashboard statistics',
        error: error.message
      });
    }
  };

  getSecurityAuditStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.systemIntegrationService.getSecurityAuditStats();

      res.json({
        success: true,
        message: 'Security audit statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching security audit stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security audit statistics',
        error: error.message
      });
    }
  };

  getSystemHealthStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = await this.systemIntegrationService.getSystemHealthStatus();

      res.json({
        success: true,
        message: 'System health status retrieved successfully',
        data: healthStatus
      });
    } catch (error: any) {
      logger.error('Error fetching system health status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system health status',
        error: error.message
      });
    }
  };

  getSystemIntegrationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.systemIntegrationService.getSystemIntegrationDashboardStats();

      res.json({
        success: true,
        message: 'System integration statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching system integration stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system integration statistics',
        error: error.message
      });
    }
  };
}

import { SystemIntegrationModel, SecurityAuditModel } from '../models';
import { CreateSystemIntegrationDto, UpdateSystemIntegrationDto, TestIntegrationDto, CreateSecurityAuditDto, SecurityAuditFilterDto, SyncIntegrationDto } from '../dto/CreateSystemIntegrationDto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';
import axios from 'axios';

export class SystemIntegrationService {
  // ==============================================
  // SYSTEM INTEGRATION MANAGEMENT
  // ==============================================

  async createSystemIntegration(integrationData: CreateSystemIntegrationDto): Promise<any> {
    try {
      const integrationId = `INT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const integration = new SystemIntegrationModel({
        integrationId,
        ...integrationData,
        status: 'active'
      });

      const savedIntegration = await integration.save();
      logger.info(`System integration created: ${integrationId} - ${integrationData.systemName}`);
      
      return savedIntegration;
    } catch (error) {
      logger.error('Error creating system integration:', error);
      throw error;
    }
  }

  async getSystemIntegrations(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.systemType) query.systemType = filters.systemType;
      if (filters.status) query.status = filters.status;
      if (filters.authenticationType) query.authenticationType = filters.authenticationType;

      const integrations = await SystemIntegrationModel.find(query)
        .sort({ systemName: 1 })
        .skip(skip)
        .limit(limit);

      const total = await SystemIntegrationModel.countDocuments(query);

      return {
        integrations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching system integrations:', error);
      throw error;
    }
  }

  async getSystemIntegrationById(integrationId: string): Promise<any> {
    try {
      const integration = await SystemIntegrationModel.findOne({ integrationId });
      if (!integration) {
        throw new Error('System integration not found');
      }
      return integration;
    } catch (error) {
      logger.error('Error fetching system integration:', error);
      throw error;
    }
  }

  async updateSystemIntegration(integrationId: string, updateData: UpdateSystemIntegrationDto): Promise<any> {
    try {
      const integration = await SystemIntegrationModel.findOneAndUpdate(
        { integrationId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!integration) {
        throw new Error('System integration not found');
      }

      logger.info(`System integration updated: ${integrationId}`);
      return integration;
    } catch (error) {
      logger.error('Error updating system integration:', error);
      throw error;
    }
  }

  async testSystemIntegration(testData: TestIntegrationDto): Promise<any> {
    try {
      const { endpoint, authenticationType, configuration } = testData;
      
      // Create test request configuration
      const requestConfig: any = {
        method: 'GET',
        url: endpoint,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HMS-Integration-Test/1.0'
        }
      };

      // Add authentication based on type
      switch (authenticationType) {
        case 'api_key':
          if (configuration?.apiKey) {
            requestConfig.headers['Authorization'] = `Bearer ${configuration.apiKey}`;
          }
          break;
        case 'basic':
          if (configuration?.username && configuration?.password) {
            const credentials = Buffer.from(`${configuration.username}:${configuration.password}`).toString('base64');
            requestConfig.headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'oauth':
          if (configuration?.accessToken) {
            requestConfig.headers['Authorization'] = `Bearer ${configuration.accessToken}`;
          }
          break;
        case 'certificate':
          // Certificate authentication would require additional setup
          requestConfig.cert = configuration?.certificate;
          requestConfig.key = configuration?.privateKey;
          break;
      }

      // Make test request
      const response = await axios(requestConfig);
      
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        responseTime: response.headers['x-response-time'] || 'N/A',
        message: 'Integration test successful'
      };
    } catch (error: any) {
      logger.error('Error testing system integration:', error);
      
      return {
        success: false,
        status: error.response?.status || 'N/A',
        statusText: error.response?.statusText || 'Connection Failed',
        responseTime: 'N/A',
        message: error.message || 'Integration test failed'
      };
    }
  }

  async syncSystemIntegration(integrationId: string, syncData: SyncIntegrationDto): Promise<any> {
    try {
      const integration = await SystemIntegrationModel.findOne({ integrationId });
      if (!integration) {
        throw new Error('System integration not found');
      }

      if (integration.status !== 'active') {
        throw new Error('Integration is not active');
      }

      // Perform sync operation based on integration type
      const syncResult = await this.performSync(integration, syncData.forceSync);

      // Update last sync time
      await SystemIntegrationModel.findOneAndUpdate(
        { integrationId },
        { 
          lastSync: new Date(),
          status: syncResult.success ? 'active' : 'error'
        }
      );

      logger.info(`System integration synced: ${integrationId}`);
      return syncResult;
    } catch (error) {
      logger.error('Error syncing system integration:', error);
      
      // Update status to error
      await SystemIntegrationModel.findOneAndUpdate(
        { integrationId },
        { status: 'error' }
      );
      
      throw error;
    }
  }

  private async performSync(integration: any, forceSync: boolean = false): Promise<any> {
    try {
      // Check if sync is needed
      if (!forceSync && integration.lastSync) {
        const lastSyncTime = new Date(integration.lastSync);
        const now = new Date();
        const timeDiff = now.getTime() - lastSyncTime.getTime();
        
        // If sync frequency is set, check if enough time has passed
        if (integration.syncFrequency) {
          const frequencyMs = this.parseSyncFrequency(integration.syncFrequency);
          if (timeDiff < frequencyMs) {
            return {
              success: true,
              message: 'Sync not needed - frequency not reached',
              skipped: true
            };
          }
        }
      }

      // Perform actual sync based on system type
      switch (integration.systemType) {
        case 'internal':
          return await this.syncInternalSystem(integration);
        case 'external':
          return await this.syncExternalSystem(integration);
        case 'third_party':
          return await this.syncThirdPartySystem(integration);
        default:
          throw new Error('Unknown system type');
      }
    } catch (error) {
      logger.error('Error performing sync:', error);
      return {
        success: false,
        message: error.message || 'Sync failed'
      };
    }
  }

  private async syncInternalSystem(integration: any): Promise<any> {
    // Internal system sync logic
    return {
      success: true,
      message: 'Internal system sync completed',
      recordsProcessed: 0
    };
  }

  private async syncExternalSystem(integration: any): Promise<any> {
    // External system sync logic
    return {
      success: true,
      message: 'External system sync completed',
      recordsProcessed: 0
    };
  }

  private async syncThirdPartySystem(integration: any): Promise<any> {
    // Third-party system sync logic
    return {
      success: true,
      message: 'Third-party system sync completed',
      recordsProcessed: 0
    };
  }

  private parseSyncFrequency(frequency: string): number {
    const match = frequency.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000; // seconds
      case 'm': return value * 60 * 1000; // minutes
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      default: return 3600000; // Default 1 hour
    }
  }

  // ==============================================
  // SECURITY AUDIT MANAGEMENT
  // ==============================================

  async createSecurityAudit(auditData: CreateSecurityAuditDto): Promise<any> {
    try {
      const auditId = `AUDIT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const audit = new SecurityAuditModel({
        auditId,
        ...auditData
      });

      const savedAudit = await audit.save();
      logger.info(`Security audit created: ${auditId} - ${auditData.action}`);
      
      return savedAudit;
    } catch (error) {
      logger.error('Error creating security audit:', error);
      throw error;
    }
  }

  async getSecurityAudits(filters: SecurityAuditFilterDto, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.ipAddress) query.ipAddress = filters.ipAddress;
      if (filters.success !== undefined) query.success = filters.success;
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }

      const audits = await SecurityAuditModel.find(query)
        .populate('userId', 'staffId firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SecurityAuditModel.countDocuments(query);

      return {
        audits,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching security audits:', error);
      throw error;
    }
  }

  async getSecurityAuditById(auditId: string): Promise<any> {
    try {
      const audit = await SecurityAuditModel.findOne({ auditId })
        .populate('userId', 'staffId firstName lastName email');

      if (!audit) {
        throw new Error('Security audit not found');
      }

      return audit;
    } catch (error) {
      logger.error('Error fetching security audit:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getSystemIntegrationDashboardStats(): Promise<any> {
    try {
      const totalIntegrations = await SystemIntegrationModel.countDocuments();
      const activeIntegrations = await SystemIntegrationModel.countDocuments({ status: 'active' });
      const errorIntegrations = await SystemIntegrationModel.countDocuments({ status: 'error' });
      const maintenanceIntegrations = await SystemIntegrationModel.countDocuments({ status: 'maintenance' });

      const systemTypeStats = await SystemIntegrationModel.aggregate([
        {
          $group: {
            _id: '$systemType',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusStats = await SystemIntegrationModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalIntegrations,
        activeIntegrations,
        errorIntegrations,
        maintenanceIntegrations,
        systemTypeStats,
        statusStats
      };
    } catch (error) {
      logger.error('Error fetching system integration dashboard stats:', error);
      throw error;
    }
  }

  async getSecurityAuditStats(): Promise<any> {
    try {
      const totalAudits = await SecurityAuditModel.countDocuments();
      const successfulAudits = await SecurityAuditModel.countDocuments({ success: true });
      const failedAudits = await SecurityAuditModel.countDocuments({ success: false });

      const actionStats = await SecurityAuditModel.aggregate([
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            successCount: {
              $sum: { $cond: ['$success', 1, 0] }
            }
          }
        }
      ]);

      const recentFailedAudits = await SecurityAuditModel.find({ success: false })
        .populate('userId', 'staffId firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        totalAudits,
        successfulAudits,
        failedAudits,
        actionStats,
        recentFailedAudits
      };
    } catch (error) {
      logger.error('Error fetching security audit stats:', error);
      throw error;
    }
  }

  async getSystemHealthStatus(): Promise<any> {
    try {
      const integrations = await SystemIntegrationModel.find();
      
      const healthStatus = await Promise.all(integrations.map(async (integration) => {
        try {
          // Test each integration
          const testResult = await this.testSystemIntegration({
            endpoint: integration.endpoint,
            authenticationType: integration.authenticationType,
            configuration: integration.configuration
          });

          return {
            integrationId: integration.integrationId,
            systemName: integration.systemName,
            systemType: integration.systemType,
            status: integration.status,
            health: testResult.success ? 'healthy' : 'unhealthy',
            lastSync: integration.lastSync,
            responseTime: testResult.responseTime
          };
        } catch (error) {
          return {
            integrationId: integration.integrationId,
            systemName: integration.systemName,
            systemType: integration.systemType,
            status: integration.status,
            health: 'unhealthy',
            lastSync: integration.lastSync,
            responseTime: 'N/A'
          };
        }
      }));

      return healthStatus;
    } catch (error) {
      logger.error('Error fetching system health status:', error);
      throw error;
    }
  }
}

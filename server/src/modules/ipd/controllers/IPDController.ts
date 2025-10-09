import { Request, Response } from 'express';
import { IPDService } from '../services/IPDService';
import { logger } from '../../../utils/logger';

export class IPDController {
  private ipdService: IPDService;

  constructor() {
    this.ipdService = new IPDService();
  }

  // ==============================================
  // WARD MANAGEMENT
  // ==============================================

  createWard = async (req: Request, res: Response): Promise<void> => {
    try {
      const wardData = req.body;
      const ward = await this.ipdService.createWard(wardData);

      res.status(201).json({
        success: true,
        message: 'Ward created successfully',
        data: ward
      });
    } catch (error: any) {
      logger.error('Error creating ward:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ward',
        error: error.message
      });
    }
  };

  getWards = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, wardType, isActive } = req.query;
      
      const filters: any = {};
      if (wardType) filters.wardType = wardType as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await this.ipdService.getWards(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Wards retrieved successfully',
        data: result.wards,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching wards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wards',
        error: error.message
      });
    }
  };

  getWardById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wardId } = req.params;
      const ward = await this.ipdService.getWardById(wardId);

      res.json({
        success: true,
        message: 'Ward retrieved successfully',
        data: ward
      });
    } catch (error: any) {
      logger.error('Error fetching ward:', error);
      const statusCode = error.message === 'Ward not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch ward',
        error: error.message
      });
    }
  };

  updateWard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wardId } = req.params;
      const updateData = req.body;
      
      const ward = await this.ipdService.updateWard(wardId, updateData);

      res.json({
        success: true,
        message: 'Ward updated successfully',
        data: ward
      });
    } catch (error: any) {
      logger.error('Error updating ward:', error);
      const statusCode = error.message === 'Ward not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update ward',
        error: error.message
      });
    }
  };

  // ==============================================
  // BED MANAGEMENT
  // ==============================================

  createBed = async (req: Request, res: Response): Promise<void> => {
    try {
      const bedData = req.body;
      const bed = await this.ipdService.createBed(bedData);

      res.status(201).json({
        success: true,
        message: 'Bed created successfully',
        data: bed
      });
    } catch (error: any) {
      logger.error('Error creating bed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create bed',
        error: error.message
      });
    }
  };

  getBeds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, wardId, bedType, status, isActive } = req.query;
      
      const filters: any = {};
      if (wardId) filters.wardId = wardId as string;
      if (bedType) filters.bedType = bedType as string;
      if (status) filters.status = status as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await this.ipdService.getBeds(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Beds retrieved successfully',
        data: result.beds,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching beds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch beds',
        error: error.message
      });
    }
  };

  getBedById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bedId } = req.params;
      const bed = await this.ipdService.getBedById(bedId);

      res.json({
        success: true,
        message: 'Bed retrieved successfully',
        data: bed
      });
    } catch (error: any) {
      logger.error('Error fetching bed:', error);
      const statusCode = error.message === 'Bed not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch bed',
        error: error.message
      });
    }
  };

  updateBed = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bedId } = req.params;
      const updateData = req.body;
      
      const bed = await this.ipdService.updateBed(bedId, updateData);

      res.json({
        success: true,
        message: 'Bed updated successfully',
        data: bed
      });
    } catch (error: any) {
      logger.error('Error updating bed:', error);
      const statusCode = error.message === 'Bed not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update bed',
        error: error.message
      });
    }
  };

  getAvailableBeds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wardId, bedType } = req.query;
      
      const beds = await this.ipdService.getAvailableBeds(
        wardId as string,
        bedType as string
      );

      res.json({
        success: true,
        message: 'Available beds retrieved successfully',
        data: beds
      });
    } catch (error: any) {
      logger.error('Error fetching available beds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available beds',
        error: error.message
      });
    }
  };

  // ==============================================
  // IPD ADMISSION MANAGEMENT
  // ==============================================

  createIPDAdmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const admissionData = req.body;
      const admission = await this.ipdService.createIPDAdmission(admissionData);

      res.status(201).json({
        success: true,
        message: 'IPD admission created successfully',
        data: admission
      });
    } catch (error: any) {
      logger.error('Error creating IPD admission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create IPD admission',
        error: error.message
      });
    }
  };

  getIPDAdmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, patientId, wardId, status, admissionType, admissionDate } = req.query;
      
      const filters: any = {};
      if (patientId) filters.patientId = patientId as string;
      if (wardId) filters.wardId = wardId as string;
      if (status) filters.status = status as string;
      if (admissionType) filters.admissionType = admissionType as string;
      if (admissionDate) filters.admissionDate = admissionDate as string;

      const result = await this.ipdService.getIPDAdmissions(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'IPD admissions retrieved successfully',
        data: result.admissions,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching IPD admissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch IPD admissions',
        error: error.message
      });
    }
  };

  getIPDAdmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { admissionId } = req.params;
      const admission = await this.ipdService.getIPDAdmissionById(admissionId);

      res.json({
        success: true,
        message: 'IPD admission retrieved successfully',
        data: admission
      });
    } catch (error: any) {
      logger.error('Error fetching IPD admission:', error);
      const statusCode = error.message === 'IPD admission not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch IPD admission',
        error: error.message
      });
    }
  };

  updateIPDAdmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { admissionId } = req.params;
      const updateData = req.body;
      
      const admission = await this.ipdService.updateIPDAdmission(admissionId, updateData);

      res.json({
        success: true,
        message: 'IPD admission updated successfully',
        data: admission
      });
    } catch (error: any) {
      logger.error('Error updating IPD admission:', error);
      const statusCode = error.message === 'IPD admission not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update IPD admission',
        error: error.message
      });
    }
  };

  dischargePatient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { admissionId } = req.params;
      const dischargeData = req.body;
      
      const admission = await this.ipdService.dischargePatient(admissionId, dischargeData);

      res.json({
        success: true,
        message: 'Patient discharged successfully',
        data: admission
      });
    } catch (error: any) {
      logger.error('Error discharging patient:', error);
      const statusCode = error.message === 'IPD admission not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to discharge patient',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getIPDDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.ipdService.getIPDDashboardStats(date as string);

      res.json({
        success: true,
        message: 'IPD dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching IPD dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch IPD dashboard statistics',
        error: error.message
      });
    }
  };

  getWardOccupancyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.ipdService.getWardOccupancyStats();

      res.json({
        success: true,
        message: 'Ward occupancy statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching ward occupancy stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ward occupancy statistics',
        error: error.message
      });
    }
  };

  getIPDStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      
      const stats = await this.ipdService.getIPDDashboardStats(date as string);

      res.json({
        success: true,
        message: 'IPD statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching IPD stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch IPD statistics',
        error: error.message
      });
    }
  };
}

import { Request, Response } from 'express';
import { HRService } from '../services/HRService';
import { BaseController } from '../../base/Controller';
import { NotFoundError, ValidationError, ConflictError } from '../../../types/errors';

export class HRController extends BaseController {
  private hrService: HRService;

  constructor() {
    super('HRController');
    this.hrService = new HRService();
  }

  // ==============================================
  // EMPLOYEE RECORD MANAGEMENT
  // ==============================================

  createEmployeeRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeData = req.body;
      const result = await this.hrService.createEmployeeRecord(employeeData);
      this.sendSuccessResponse(res, result, 'Employee record created successfully', 201);
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to create employee record', statusCode);
    }
  };

  getEmployeeRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, department, employmentType, status, managerId } = req.query;
      
      const filters: Record<string, string> = {};
      if (department) filters.department = department as string;
      if (employmentType) filters.employmentType = employmentType as string;
      if (status) filters.status = status as string;
      if (managerId) filters.managerId = managerId as string;

      const result = await this.hrService.getEmployeeRecords(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Employee records retrieved successfully',
        data: result.employees,
        pagination: result.pagination
      });
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to retrieve employee records', statusCode);
    }
  };

  getEmployeeRecordById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const employee = await this.hrService.getEmployeeRecordById(employeeId);
      
      if (!employee) {
        throw new NotFoundError('Employee record', employeeId);
      }
      
      this.sendSuccessResponse(res, employee, 'Employee record retrieved successfully');
    } catch (error: any) {
      const statusCode = this.getErrorStatusCode(error);
      this.sendErrorResponse(res, error, 'Failed to fetch employee record', statusCode);
    }
  };

  updateEmployeeRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const updateData = req.body;
      
      const employee = await this.hrService.updateEmployeeRecord(employeeId, updateData);

      res.json({
        success: true,
        message: 'Employee record updated successfully',
        data: employee
      });
    } catch (error: any) {
      logger.error('Error updating employee record:', error);
      const statusCode = error.message === 'Employee record not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update employee record',
        error: error.message
      });
    }
  };

  // ==============================================
  // LEAVE REQUEST MANAGEMENT
  // ==============================================

  createLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const leaveData = req.body;
      const leave = await this.hrService.createLeaveRequest(leaveData);

      res.status(201).json({
        success: true,
        message: 'Leave request created successfully',
        data: leave
      });
    } catch (error: any) {
      logger.error('Error creating leave request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create leave request',
        error: error.message
      });
    }
  };

  getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, employeeId, leaveType, status, startDate } = req.query;
      
      const filters: any = {};
      if (employeeId) filters.employeeId = employeeId as string;
      if (leaveType) filters.leaveType = leaveType as string;
      if (status) filters.status = status as string;
      if (startDate) filters.startDate = startDate as string;

      const result = await this.hrService.getLeaveRequests(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Leave requests retrieved successfully',
        data: result.leaves,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching leave requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leave requests',
        error: error.message
      });
    }
  };

  getLeaveRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leaveId } = req.params;
      const leave = await this.hrService.getLeaveRequestById(leaveId);

      res.json({
        success: true,
        message: 'Leave request retrieved successfully',
        data: leave
      });
    } catch (error: any) {
      logger.error('Error fetching leave request:', error);
      const statusCode = error.message === 'Leave request not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch leave request',
        error: error.message
      });
    }
  };

  updateLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leaveId } = req.params;
      const updateData = req.body;
      
      const leave = await this.hrService.updateLeaveRequest(leaveId, updateData);

      res.json({
        success: true,
        message: 'Leave request updated successfully',
        data: leave
      });
    } catch (error: any) {
      logger.error('Error updating leave request:', error);
      const statusCode = error.message === 'Leave request not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update leave request',
        error: error.message
      });
    }
  };

  approveLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leaveId } = req.params;
      const approvalData = req.body;
      const approvedBy = (req as any).user?.staffId; // From auth middleware
      
      const leave = await this.hrService.approveLeaveRequest(leaveId, approvalData, approvedBy);

      res.json({
        success: true,
        message: `Leave request ${approvalData.status} successfully`,
        data: leave
      });
    } catch (error: any) {
      logger.error('Error approving leave request:', error);
      const statusCode = error.message === 'Leave request not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to approve leave request',
        error: error.message
      });
    }
  };

  // ==============================================
  // PERFORMANCE REVIEW MANAGEMENT
  // ==============================================

  createPerformanceReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewData = req.body;
      const review = await this.hrService.createPerformanceReview(reviewData);

      res.status(201).json({
        success: true,
        message: 'Performance review created successfully',
        data: review
      });
    } catch (error: any) {
      logger.error('Error creating performance review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create performance review',
        error: error.message
      });
    }
  };

  getPerformanceReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, employeeId, reviewerId, status, overallRating } = req.query;
      
      const filters: any = {};
      if (employeeId) filters.employeeId = employeeId as string;
      if (reviewerId) filters.reviewerId = reviewerId as string;
      if (status) filters.status = status as string;
      if (overallRating) filters.overallRating = overallRating as string;

      const result = await this.hrService.getPerformanceReviews(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Performance reviews retrieved successfully',
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching performance reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance reviews',
        error: error.message
      });
    }
  };

  getPerformanceReviewById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reviewId } = req.params;
      const review = await this.hrService.getPerformanceReviewById(reviewId);

      res.json({
        success: true,
        message: 'Performance review retrieved successfully',
        data: review
      });
    } catch (error: any) {
      logger.error('Error fetching performance review:', error);
      const statusCode = error.message === 'Performance review not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch performance review',
        error: error.message
      });
    }
  };

  updatePerformanceReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reviewId } = req.params;
      const updateData = req.body;
      
      const review = await this.hrService.updatePerformanceReview(reviewId, updateData);

      res.json({
        success: true,
        message: 'Performance review updated successfully',
        data: review
      });
    } catch (error: any) {
      logger.error('Error updating performance review:', error);
      const statusCode = error.message === 'Performance review not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update performance review',
        error: error.message
      });
    }
  };

  // ==============================================
  // TRAINING RECORD MANAGEMENT
  // ==============================================

  createTrainingRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const trainingData = req.body;
      const training = await this.hrService.createTrainingRecord(trainingData);

      res.status(201).json({
        success: true,
        message: 'Training record created successfully',
        data: training
      });
    } catch (error: any) {
      logger.error('Error creating training record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create training record',
        error: error.message
      });
    }
  };

  getTrainingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, employeeId, trainingType, status } = req.query;
      
      const filters: any = {};
      if (employeeId) filters.employeeId = employeeId as string;
      if (trainingType) filters.trainingType = trainingType as string;
      if (status) filters.status = status as string;

      const result = await this.hrService.getTrainingRecords(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Training records retrieved successfully',
        data: result.trainings,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error('Error fetching training records:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch training records',
        error: error.message
      });
    }
  };

  getTrainingRecordById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { trainingId } = req.params;
      const training = await this.hrService.getTrainingRecordById(trainingId);

      res.json({
        success: true,
        message: 'Training record retrieved successfully',
        data: training
      });
    } catch (error: any) {
      logger.error('Error fetching training record:', error);
      const statusCode = error.message === 'Training record not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch training record',
        error: error.message
      });
    }
  };

  updateTrainingRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { trainingId } = req.params;
      const updateData = req.body;
      
      const training = await this.hrService.updateTrainingRecord(trainingId, updateData);

      res.json({
        success: true,
        message: 'Training record updated successfully',
        data: training
      });
    } catch (error: any) {
      logger.error('Error updating training record:', error);
      const statusCode = error.message === 'Training record not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update training record',
        error: error.message
      });
    }
  };

  completeTraining = async (req: Request, res: Response): Promise<void> => {
    try {
      const { trainingId } = req.params;
      const completionData = req.body;
      
      const training = await this.hrService.completeTraining(trainingId, completionData);

      res.json({
        success: true,
        message: 'Training completed successfully',
        data: training
      });
    } catch (error: any) {
      logger.error('Error completing training:', error);
      const statusCode = error.message === 'Training record not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to complete training',
        error: error.message
      });
    }
  };

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  getHRDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.hrService.getHRDashboardStats();

      res.json({
        success: true,
        message: 'HR dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching HR dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch HR dashboard statistics',
        error: error.message
      });
    }
  };

  getLeaveStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.hrService.getLeaveStats();

      res.json({
        success: true,
        message: 'Leave statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching leave stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leave statistics',
        error: error.message
      });
    }
  };

  getPerformanceStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.hrService.getPerformanceStats();

      res.json({
        success: true,
        message: 'Performance statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error fetching performance stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance statistics',
        error: error.message
      });
    }
  };

}

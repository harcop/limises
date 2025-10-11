import { EmployeeRecordModel, LeaveRequestModel, PerformanceReviewModel, TrainingRecordModel } from '../models';
import { CreateEmployeeRecordDto, UpdateEmployeeRecordDto, CreateLeaveRequestDto, UpdateLeaveRequestDto, ApproveLeaveRequestDto, CreatePerformanceReviewDto, UpdatePerformanceReviewDto, CreateTrainingRecordDto, UpdateTrainingRecordDto, CompleteTrainingDto } from '../dto/CreateHRDto';
import { IdGenerator } from '../../../utils/idGenerator';
import { logger } from '../../../utils/logger';

export class HRService {
  // ==============================================
  // EMPLOYEE RECORD MANAGEMENT
  // ==============================================

  async createEmployeeRecord(employeeData: CreateEmployeeRecordDto): Promise<any> {
    try {
      const employeeId = IdGenerator.generateEmployeeId();
      
      const employee = new EmployeeRecordModel({
        employeeId,
        ...employeeData,
        hireDate: new Date(employeeData.hireDate),
        terminationDate: employeeData.terminationDate ? new Date(employeeData.terminationDate) : undefined,
        status: 'active'
      });

      const savedEmployee = await employee.save();
      logger.info(`Employee record created: ${employeeId} for staff: ${employeeData.staffId}`);
      
      return savedEmployee;
    } catch (error) {
      logger.error('Error creating employee record:', error);
      throw error;
    }
  }

  async getEmployeeRecords(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.department) query.department = filters.department;
      if (filters.employmentType) query.employmentType = filters.employmentType;
      if (filters.status) query.status = filters.status;
      if (filters.managerId) query.managerId = filters.managerId;

      const employees = await EmployeeRecordModel.find(query)
        .populate('staffId', 'staffId firstName lastName email phone position')
        .populate('managerId', 'staffId firstName lastName')
        .sort({ hireDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EmployeeRecordModel.countDocuments(query);

      return {
        employees,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching employee records:', error);
      throw error;
    }
  }

  async getEmployeeRecordById(employeeId: string): Promise<any> {
    try {
      const employee = await EmployeeRecordModel.findOne({ employeeId })
        .populate('staffId', 'staffId firstName lastName email phone position department')
        .populate('managerId', 'staffId firstName lastName position');

      if (!employee) {
        throw new Error('Employee record not found');
      }

      return employee;
    } catch (error) {
      logger.error('Error fetching employee record:', error);
      throw error;
    }
  }

  async updateEmployeeRecord(employeeId: string, updateData: UpdateEmployeeRecordDto): Promise<any> {
    try {
      const employee = await EmployeeRecordModel.findOneAndUpdate(
        { employeeId },
        { 
          ...updateData, 
          terminationDate: updateData.terminationDate ? new Date(updateData.terminationDate) : undefined,
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      ).populate('staffId', 'staffId firstName lastName email phone')
       .populate('managerId', 'staffId firstName lastName');

      if (!employee) {
        throw new Error('Employee record not found');
      }

      logger.info(`Employee record updated: ${employeeId}`);
      return employee;
    } catch (error) {
      logger.error('Error updating employee record:', error);
      throw error;
    }
  }

  // ==============================================
  // LEAVE REQUEST MANAGEMENT
  // ==============================================

  async createLeaveRequest(leaveData: CreateLeaveRequestDto): Promise<any> {
    try {
      // Check for overlapping leave requests
      const overlappingLeave = await LeaveRequestModel.findOne({
        employeeId: leaveData.employeeId,
        status: { $in: ['pending', 'approved'] },
        $or: [
          {
            startDate: { $lte: new Date(leaveData.endDate) },
            endDate: { $gte: new Date(leaveData.startDate) }
          }
        ]
      });

      if (overlappingLeave) {
        throw new Error('Overlapping leave request exists');
      }

      const leaveId = IdGenerator.generateLeaveId();
      
      const leave = new LeaveRequestModel({
        leaveId,
        ...leaveData,
        startDate: new Date(leaveData.startDate),
        endDate: new Date(leaveData.endDate),
        status: 'pending'
      });

      const savedLeave = await leave.save();
      logger.info(`Leave request created: ${leaveId} for employee: ${leaveData.employeeId}`);
      
      return savedLeave;
    } catch (error) {
      logger.error('Error creating leave request:', error);
      throw error;
    }
  }

  async getLeaveRequests(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.employeeId) query.employeeId = filters.employeeId;
      if (filters.leaveType) query.leaveType = filters.leaveType;
      if (filters.status) query.status = filters.status;
      if (filters.startDate) {
        const date = new Date(filters.startDate);
        query.startDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const leaves = await LeaveRequestModel.find(query)
        .populate('employeeId', 'employeeId staffId jobTitle department')
        .populate('approvedBy', 'staffId firstName lastName')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await LeaveRequestModel.countDocuments(query);

      return {
        leaves,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  async getLeaveRequestById(leaveId: string): Promise<any> {
    try {
      const leave = await LeaveRequestModel.findOne({ leaveId })
        .populate('employeeId', 'employeeId staffId jobTitle department')
        .populate('approvedBy', 'staffId firstName lastName position');

      if (!leave) {
        throw new Error('Leave request not found');
      }

      return leave;
    } catch (error) {
      logger.error('Error fetching leave request:', error);
      throw error;
    }
  }

  async updateLeaveRequest(leaveId: string, updateData: UpdateLeaveRequestDto): Promise<any> {
    try {
      const leave = await LeaveRequestModel.findOneAndUpdate(
        { leaveId },
        { 
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      ).populate('employeeId', 'employeeId staffId jobTitle')
       .populate('approvedBy', 'staffId firstName lastName');

      if (!leave) {
        throw new Error('Leave request not found');
      }

      logger.info(`Leave request updated: ${leaveId}`);
      return leave;
    } catch (error) {
      logger.error('Error updating leave request:', error);
      throw error;
    }
  }

  async approveLeaveRequest(leaveId: string, approvalData: ApproveLeaveRequestDto, approvedBy: string): Promise<any> {
    try {
      const leave = await LeaveRequestModel.findOneAndUpdate(
        { leaveId },
        {
          status: approvalData.status,
          approvedBy,
          approvedAt: new Date(),
          comments: approvalData.comments,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('employeeId', 'employeeId staffId jobTitle')
       .populate('approvedBy', 'staffId firstName lastName');

      if (!leave) {
        throw new Error('Leave request not found');
      }

      logger.info(`Leave request ${approvalData.status}: ${leaveId}`);
      return leave;
    } catch (error) {
      logger.error('Error approving leave request:', error);
      throw error;
    }
  }

  // ==============================================
  // PERFORMANCE REVIEW MANAGEMENT
  // ==============================================

  async createPerformanceReview(reviewData: CreatePerformanceReviewDto): Promise<any> {
    try {
      const reviewId = IdGenerator.generateReviewId();
      
      const review = new PerformanceReviewModel({
        reviewId,
        ...reviewData,
        reviewPeriodStart: new Date(reviewData.reviewPeriodStart),
        reviewPeriodEnd: new Date(reviewData.reviewPeriodEnd),
        status: 'draft'
      });

      const savedReview = await review.save();
      logger.info(`Performance review created: ${reviewId} for employee: ${reviewData.employeeId}`);
      
      return savedReview;
    } catch (error) {
      logger.error('Error creating performance review:', error);
      throw error;
    }
  }

  async getPerformanceReviews(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.employeeId) query.employeeId = filters.employeeId;
      if (filters.reviewerId) query.reviewerId = filters.reviewerId;
      if (filters.status) query.status = filters.status;
      if (filters.overallRating) query.overallRating = filters.overallRating;

      const reviews = await PerformanceReviewModel.find(query)
        .populate('employeeId', 'employeeId staffId jobTitle department')
        .populate('reviewerId', 'staffId firstName lastName position')
        .sort({ reviewPeriodEnd: -1 })
        .skip(skip)
        .limit(limit);

      const total = await PerformanceReviewModel.countDocuments(query);

      return {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching performance reviews:', error);
      throw error;
    }
  }

  async getPerformanceReviewById(reviewId: string): Promise<any> {
    try {
      const review = await PerformanceReviewModel.findOne({ reviewId })
        .populate('employeeId', 'employeeId staffId jobTitle department')
        .populate('reviewerId', 'staffId firstName lastName position department');

      if (!review) {
        throw new Error('Performance review not found');
      }

      return review;
    } catch (error) {
      logger.error('Error fetching performance review:', error);
      throw error;
    }
  }

  async updatePerformanceReview(reviewId: string, updateData: UpdatePerformanceReviewDto): Promise<any> {
    try {
      const review = await PerformanceReviewModel.findOneAndUpdate(
        { reviewId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('employeeId', 'employeeId staffId jobTitle')
       .populate('reviewerId', 'staffId firstName lastName');

      if (!review) {
        throw new Error('Performance review not found');
      }

      logger.info(`Performance review updated: ${reviewId}`);
      return review;
    } catch (error) {
      logger.error('Error updating performance review:', error);
      throw error;
    }
  }

  // ==============================================
  // TRAINING RECORD MANAGEMENT
  // ==============================================

  async createTrainingRecord(trainingData: CreateTrainingRecordDto): Promise<any> {
    try {
      const trainingId = IdGenerator.generateTrainingId();
      
      const training = new TrainingRecordModel({
        trainingId,
        ...trainingData,
        startDate: trainingData.startDate ? new Date(trainingData.startDate) : undefined,
        endDate: trainingData.endDate ? new Date(trainingData.endDate) : undefined,
        status: 'scheduled'
      });

      const savedTraining = await training.save();
      logger.info(`Training record created: ${trainingId} for employee: ${trainingData.employeeId}`);
      
      return savedTraining;
    } catch (error) {
      logger.error('Error creating training record:', error);
      throw error;
    }
  }

  async getTrainingRecords(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.employeeId) query.employeeId = filters.employeeId;
      if (filters.trainingType) query.trainingType = filters.trainingType;
      if (filters.status) query.status = filters.status;

      const trainings = await TrainingRecordModel.find(query)
        .populate('employeeId', 'employeeId staffId jobTitle department')
        .sort({ completionDate: -1, startDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await TrainingRecordModel.countDocuments(query);

      return {
        trainings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching training records:', error);
      throw error;
    }
  }

  async getTrainingRecordById(trainingId: string): Promise<any> {
    try {
      const training = await TrainingRecordModel.findOne({ trainingId })
        .populate('employeeId', 'employeeId staffId jobTitle department');

      if (!training) {
        throw new Error('Training record not found');
      }

      return training;
    } catch (error) {
      logger.error('Error fetching training record:', error);
      throw error;
    }
  }

  async updateTrainingRecord(trainingId: string, updateData: UpdateTrainingRecordDto): Promise<any> {
    try {
      const training = await TrainingRecordModel.findOneAndUpdate(
        { trainingId },
        { 
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          completionDate: updateData.completionDate ? new Date(updateData.completionDate) : undefined,
          expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : undefined,
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      ).populate('employeeId', 'employeeId staffId jobTitle');

      if (!training) {
        throw new Error('Training record not found');
      }

      logger.info(`Training record updated: ${trainingId}`);
      return training;
    } catch (error) {
      logger.error('Error updating training record:', error);
      throw error;
    }
  }

  async completeTraining(trainingId: string, completionData: CompleteTrainingDto): Promise<any> {
    try {
      const training = await TrainingRecordModel.findOneAndUpdate(
        { trainingId },
        {
          status: 'completed',
          completionDate: new Date(completionData.completionDate),
          score: completionData.score,
          certificateNumber: completionData.certificateNumber,
          expiryDate: completionData.expiryDate ? new Date(completionData.expiryDate) : undefined,
          notes: completionData.notes,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('employeeId', 'employeeId staffId jobTitle');

      if (!training) {
        throw new Error('Training record not found');
      }

      logger.info(`Training completed: ${trainingId}`);
      return training;
    } catch (error) {
      logger.error('Error completing training:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getHRDashboardStats(): Promise<any> {
    try {
      const totalEmployees = await EmployeeRecordModel.countDocuments();
      const activeEmployees = await EmployeeRecordModel.countDocuments({ status: 'active' });
      const pendingLeaves = await LeaveRequestModel.countDocuments({ status: 'pending' });
      const pendingReviews = await PerformanceReviewModel.countDocuments({ status: 'draft' });
      const upcomingTrainings = await TrainingRecordModel.countDocuments({ 
        status: 'scheduled',
        startDate: { $gte: new Date() }
      });

      const departmentStats = await EmployeeRecordModel.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        }
      ]);

      const employmentTypeStats = await EmployeeRecordModel.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$employmentType',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        pendingReviews,
        upcomingTrainings,
        departmentStats,
        employmentTypeStats
      };
    } catch (error) {
      logger.error('Error fetching HR dashboard stats:', error);
      throw error;
    }
  }

  async getLeaveStats(): Promise<any> {
    try {
      const leaveStats = await LeaveRequestModel.aggregate([
        {
          $group: {
            _id: {
              leaveType: '$leaveType',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.leaveType',
            statusBreakdown: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      return leaveStats;
    } catch (error) {
      logger.error('Error fetching leave stats:', error);
      throw error;
    }
  }

  async getPerformanceStats(): Promise<any> {
    try {
      const performanceStats = await PerformanceReviewModel.aggregate([
        {
          $group: {
            _id: '$overallRating',
            count: { $sum: 1 }
          }
        }
      ]);

      return performanceStats;
    } catch (error) {
      logger.error('Error fetching performance stats:', error);
      throw error;
    }
  }
}

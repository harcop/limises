import { Request, Response } from 'express';
import { StaffModel } from '../../models';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { 
  generateStaffId,
  formatDate, 
  formatTime 
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

export class StaffController {
  // @route   POST /api/staff
  // @desc    Create a new staff member
  // @access  Private (Admin only)
  static async createStaff(req: AuthRequest, res: Response) {
    try {
      const {
        firstName,
        lastName,
        middleName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        department,
        position,
        hireDate,
        employmentType,
        salary,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship
      } = req.body;

      // Check for duplicate email
      const existingStaff = await StaffModel.findOne({ email });

      if (existingStaff) {
        return res.status(409).json({
          success: false,
          error: 'Staff member with this email already exists'
        });
      }

      // Generate staff ID
      const staffId = generateStaffId();

      // Create staff member
      const staff = new StaffModel({
        staffId,
        firstName,
        lastName,
        middleName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        department,
        position,
        hireDate,
        employmentType,
        salary,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      await staff.save();

      logger.info(`Staff member ${staffId} created by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: {
          staffId,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          department: staff.department,
          position: staff.position,
          hireDate: staff.hireDate,
          employmentType: staff.employmentType,
          status: staff.status
        }
      });

    } catch (error) {
      logger.error('Create staff error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating staff member'
      });
    }
  }

  // @route   GET /api/staff
  // @desc    Get all staff members with filters and pagination
  // @access  Private (Staff only)
  static async getStaff(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        search,
        department,
        position,
        status,
        employmentType
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (department) filter.department = department;
      if (position) filter.position = position;
      if (status) filter.status = status;
      if (employmentType) filter.employmentType = employmentType;

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { staffId: searchRegex }
        ];
      }

      // Get staff with pagination
      const staff = await StaffModel.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await StaffModel.countDocuments(filter);

      res.json({
        success: true,
        data: staff,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get staff error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving staff members'
      });
    }
  }

  // @route   GET /api/staff/:staffId
  // @desc    Get a specific staff member by ID
  // @access  Private (Staff only)
  static async getStaffMember(req: AuthRequest, res: Response) {
    try {
      const { staffId } = req.params;

      const staff = await StaffModel.findOne({ staffId }).select('-__v');

      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        data: staff
      });

    } catch (error) {
      logger.error('Get staff member error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving staff member'
      });
    }
  }

  // @route   PUT /api/staff/:staffId
  // @desc    Update staff member information
  // @access  Private (Admin only)
  static async updateStaff(req: AuthRequest, res: Response) {
    try {
      const { staffId } = req.params;
      const updateData = req.body;

      // Check if staff exists
      const existingStaff = await StaffModel.findOne({ staffId });

      if (!existingStaff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      // Update staff member
      const updatedStaff = await StaffModel.findOneAndUpdate(
        { staffId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      logger.info(`Staff member ${staffId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Staff member updated successfully',
        data: updatedStaff
      });

    } catch (error) {
      logger.error('Update staff error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating staff member'
      });
    }
  }

  // @route   DELETE /api/staff/:staffId
  // @desc    Deactivate a staff member (soft delete)
  // @access  Private (Admin only)
  static async deactivateStaff(req: AuthRequest, res: Response) {
    try {
      const { staffId } = req.params;

      const staff = await StaffModel.findOneAndUpdate(
        { staffId, status: 'active' },
        { 
          status: 'inactive',
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );

      if (!staff) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found or already inactive'
        });
      }

      logger.info(`Staff member ${staffId} deactivated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Staff member deactivated successfully'
      });

    } catch (error) {
      logger.error('Deactivate staff error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error deactivating staff member'
      });
    }
  }

  // @route   GET /api/staff/departments
  // @desc    Get all departments
  // @access  Private (Staff only)
  static async getDepartments(req: AuthRequest, res: Response) {
    try {
      const departments = await StaffModel.distinct('department', { status: 'active' });

      res.json({
        success: true,
        data: departments
      });

    } catch (error) {
      logger.error('Get departments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving departments'
      });
    }
  }

  // @route   GET /api/staff/positions
  // @desc    Get all positions
  // @access  Private (Staff only)
  static async getPositions(req: AuthRequest, res: Response) {
    try {
      const positions = await StaffModel.distinct('position', { status: 'active' });

      res.json({
        success: true,
        data: positions
      });

    } catch (error) {
      logger.error('Get positions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving positions'
      });
    }
  }

  // @route   GET /api/staff/stats
  // @desc    Get staff statistics
  // @access  Private (Staff only)
  static async getStaffStats(req: AuthRequest, res: Response) {
    try {
      const totalStaff = await StaffModel.countDocuments();
      const activeStaff = await StaffModel.countDocuments({ status: 'active' });
      const inactiveStaff = await StaffModel.countDocuments({ status: 'inactive' });
      const terminatedStaff = await StaffModel.countDocuments({ status: 'terminated' });
      
      const departments = await StaffModel.distinct('department', { status: 'active' });
      const positions = await StaffModel.distinct('position', { status: 'active' });

      res.json({
        success: true,
        data: {
          totalStaff,
          activeStaff,
          inactiveStaff,
          terminatedStaff,
          totalDepartments: departments.length,
          totalPositions: positions.length
        }
      });

    } catch (error) {
      logger.error('Get staff stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving staff statistics'
      });
    }
  }
}

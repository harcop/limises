import { Response } from 'express';
import { BaseController } from '../../base/Controller';
import { StaffService } from '../services/StaffService';
import { AuthRequest } from '../../../types';

export class StaffController extends BaseController {
  private staffService: StaffService;

  constructor() {
    super(new StaffService(), 'StaffController');
    this.staffService = new StaffService();
  }

  // @route   POST /api/staff
  // @desc    Create a new staff member
  // @access  Private (Admin only)
  createStaff = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const staffData = req.body;
    const result = await this.staffService.createStaff(staffData);
    this.sendSuccess(res, result, 'Staff member created successfully', 201);
  });

  // @route   GET /api/staff
  // @desc    Get all staff members with filters and pagination
  // @access  Private (Staff only)
  getStaff = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const filters = {
      search: req.query['search'] as string,
      department: req.query['department'] as string,
      position: req.query['position'] as string,
      status: req.query['status'] as string,
      employmentType: req.query['employmentType'] as string
    };

    const pagination = {
      page: parseInt(req.query['page'] as string) || 1,
      limit: parseInt(req.query['limit'] as string) || 20
    };

    const result = await this.staffService.getStaff(filters, pagination);
    this.sendSuccess(res, result);
  });

  // @route   GET /api/staff/:staffId
  // @desc    Get a specific staff member by ID
  // @access  Private (Staff only)
  getStaffMember = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { staffId } = req.params;
    const staff = await this.staffService.getStaffMember(staffId);
    this.sendSuccess(res, { staff });
  });

  // @route   PUT /api/staff/:staffId
  // @desc    Update staff member information
  // @access  Private (Admin only)
  updateStaff = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { staffId } = req.params;
    const updateData = req.body;
    const updatedStaff = await this.staffService.updateStaff(staffId, updateData);
    this.sendSuccess(res, { staff: updatedStaff }, 'Staff member updated successfully');
  });

  // @route   DELETE /api/staff/:staffId
  // @desc    Deactivate a staff member (soft delete)
  // @access  Private (Admin only)
  deactivateStaff = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const { staffId } = req.params;
    await this.staffService.deactivateStaff(staffId);
    this.sendSuccess(res, null, 'Staff member deactivated successfully');
  });

  // @route   GET /api/staff/departments
  // @desc    Get all departments
  // @access  Private (Staff only)
  getDepartments = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const departments = await this.staffService.getDepartments();
    this.sendSuccess(res, { departments });
  });

  // @route   GET /api/staff/positions
  // @desc    Get all positions
  // @access  Private (Staff only)
  getPositions = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const positions = await this.staffService.getPositions();
    this.sendSuccess(res, { positions });
  });

  // @route   GET /api/staff/stats
  // @desc    Get staff statistics
  // @access  Private (Staff only)
  getStaffStats = this.handleAsync(async (req: AuthRequest, res: Response) => {
    const stats = await this.staffService.getStaffStats();
    this.sendSuccess(res, stats);
  });
}

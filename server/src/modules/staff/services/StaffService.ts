import { BaseService } from '../../base/Service';
import { StaffModel } from '../../../models';
import { generateStaffId, sanitizeString } from '../../../utils/helpers';

export interface CreateStaffDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  department: string;
  position: string;
  hireDate: string;
  employmentType?: string;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  department?: string;
  position?: string;
  employmentType?: string;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface StaffFiltersDto {
  search?: string;
  department?: string;
  position?: string;
  status?: string;
  employmentType?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class StaffService extends BaseService {
  constructor() {
    super('StaffService');
  }

  async createStaff(staffData: CreateStaffDto): Promise<any> {
    try {
      // Check for duplicate email
      const existingStaff = await StaffModel.findOne({ email: staffData.email });

      if (existingStaff) {
        throw new Error('Staff member with this email already exists');
      }

      // Generate staff ID
      const staffId = generateStaffId();

      // Create staff member
      const staff = new StaffModel({
        staffId,
        firstName: sanitizeString(staffData.firstName),
        lastName: sanitizeString(staffData.lastName),
        middleName: staffData.middleName ? sanitizeString(staffData.middleName) : undefined,
        email: sanitizeString(staffData.email),
        phone: staffData.phone ? sanitizeString(staffData.phone) : undefined,
        address: staffData.address ? sanitizeString(staffData.address) : undefined,
        city: staffData.city ? sanitizeString(staffData.city) : undefined,
        state: staffData.state ? sanitizeString(staffData.state) : undefined,
        zipCode: staffData.zipCode ? sanitizeString(staffData.zipCode) : undefined,
        department: sanitizeString(staffData.department),
        position: sanitizeString(staffData.position),
        hireDate: staffData.hireDate,
        employmentType: staffData.employmentType,
        salary: staffData.salary,
        emergencyContactName: staffData.emergencyContactName ? sanitizeString(staffData.emergencyContactName) : undefined,
        emergencyContactPhone: staffData.emergencyContactPhone ? sanitizeString(staffData.emergencyContactPhone) : undefined,
        emergencyContactRelationship: staffData.emergencyContactRelationship ? sanitizeString(staffData.emergencyContactRelationship) : undefined,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      await staff.save();

      this.log('info', `Staff member ${staffId} created`);

      return {
        staffId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        department: staff.department,
        position: staff.position,
        hireDate: staff.hireDate,
        employmentType: staff.employmentType,
        status: staff.status
      };
    } catch (error) {
      this.handleError(error, 'Create staff');
    }
  }

  async getStaff(filters: StaffFiltersDto, pagination: PaginationDto): Promise<{ staff: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build filter object
      const filter: any = {};
      
      if (filters.department) filter.department = filters.department;
      if (filters.position) filter.position = filters.position;
      if (filters.status) filter.status = filters.status;
      if (filters.employmentType) filter.employmentType = filters.employmentType;

      // Search filter
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
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

      return {
        staff,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get staff');
    }
  }

  async getStaffMember(staffId: string): Promise<any> {
    try {
      const staff = await StaffModel.findOne({ staffId }).select('-__v');

      if (!staff) {
        throw new Error('Staff member not found');
      }

      return staff;
    } catch (error) {
      this.handleError(error, 'Get staff member');
    }
  }

  async updateStaff(staffId: string, updateData: UpdateStaffDto): Promise<any> {
    try {
      // Check if staff exists
      const existingStaff = await StaffModel.findOne({ staffId });

      if (!existingStaff) {
        throw new Error('Staff member not found');
      }

      // Sanitize string fields
      const sanitizedData: any = {};
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key as keyof UpdateStaffDto] === 'string') {
          sanitizedData[key] = sanitizeString(updateData[key as keyof UpdateStaffDto] as string);
        } else {
          sanitizedData[key] = updateData[key as keyof UpdateStaffDto];
        }
      });

      // Update staff member
      const updatedStaff = await StaffModel.findOneAndUpdate(
        { staffId },
        { ...sanitizedData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      this.log('info', `Staff member ${staffId} updated`);

      return updatedStaff;
    } catch (error) {
      this.handleError(error, 'Update staff');
    }
  }

  async deactivateStaff(staffId: string): Promise<boolean> {
    try {
      const staff = await StaffModel.findOneAndUpdate(
        { staffId, status: 'active' },
        { 
          status: 'inactive',
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );

      if (!staff) {
        throw new Error('Staff member not found or already inactive');
      }

      this.log('info', `Staff member ${staffId} deactivated`);
      return true;
    } catch (error) {
      this.handleError(error, 'Deactivate staff');
    }
  }

  async getDepartments(): Promise<string[]> {
    try {
      const departments = await StaffModel.distinct('department', { status: 'active' });
      return departments;
    } catch (error) {
      this.handleError(error, 'Get departments');
    }
  }

  async getPositions(): Promise<string[]> {
    try {
      const positions = await StaffModel.distinct('position', { status: 'active' });
      return positions;
    } catch (error) {
      this.handleError(error, 'Get positions');
    }
  }

  async getStaffStats(): Promise<any> {
    try {
      const totalStaff = await StaffModel.countDocuments();
      const activeStaff = await StaffModel.countDocuments({ status: 'active' });
      const inactiveStaff = await StaffModel.countDocuments({ status: 'inactive' });
      const terminatedStaff = await StaffModel.countDocuments({ status: 'terminated' });
      
      const departments = await StaffModel.distinct('department', { status: 'active' });
      const positions = await StaffModel.distinct('position', { status: 'active' });

      return {
        totalStaff,
        activeStaff,
        inactiveStaff,
        terminatedStaff,
        totalDepartments: departments.length,
        totalPositions: positions.length
      };
    } catch (error) {
      this.handleError(error, 'Get staff stats');
    }
  }
}

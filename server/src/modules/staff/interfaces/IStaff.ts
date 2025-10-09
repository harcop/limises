// ==============================================
// STAFF MANAGEMENT INTERFACES
// ==============================================

export interface Staff {
  staffId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  department: string;
  position: string;
  hireDate: string;
  terminationDate?: string;
  salary?: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  photoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffRole {
  roleId: string;
  roleName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffRoleAssignment {
  assignmentId: string;
  staffId: string;
  roleId: string;
  assignedBy?: string;
  assignedDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  permissionId: string;
  permissionName: string;
  description?: string;
  module: string;
  isActive: boolean;
  createdAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  grantedBy?: string;
  grantedDate: string;
  createdAt: string;
}

// Statistics Types
export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  terminatedStaff: number;
  totalDepartments: number;
  totalPositions: number;
}

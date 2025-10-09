// ==============================================
// HUMAN RESOURCES MANAGEMENT INTERFACES
// ==============================================

export interface EmployeeRecord {
  employeeId: string;
  staffId: string;
  employeeNumber?: string;
  hireDate: string;
  terminationDate?: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
  jobTitle: string;
  department: string;
  managerId?: string;
  salary?: number;
  benefits?: string; // JSON string
  emergencyContact?: string; // JSON string
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  createdAt: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  leaveId: string;
  employeeId: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PerformanceReview {
  reviewId: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  goalsAchieved?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  comments?: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingRecord {
  trainingId: string;
  employeeId: string;
  trainingName: string;
  trainingType: 'mandatory' | 'optional' | 'certification' | 'continuing_education';
  provider?: string;
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  score?: number;
  certificateNumber?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

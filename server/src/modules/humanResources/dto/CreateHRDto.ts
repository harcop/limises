import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsObject } from 'class-validator';

export class CreateEmployeeRecordDto {
  @IsString()
  staffId: string;

  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @IsDateString()
  hireDate: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @IsEnum(['full_time', 'part_time', 'contract', 'intern', 'consultant'])
  employmentType: string;

  @IsString()
  jobTitle: string;

  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsObject()
  benefits?: any;

  @IsOptional()
  @IsObject()
  emergencyContact?: any;
}

export class UpdateEmployeeRecordDto {
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @IsOptional()
  @IsEnum(['full_time', 'part_time', 'contract', 'intern', 'consultant'])
  employmentType?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsObject()
  benefits?: any;

  @IsOptional()
  @IsObject()
  emergencyContact?: any;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'terminated', 'on_leave'])
  status?: string;
}

export class CreateLeaveRequestDto {
  @IsString()
  employeeId: string;

  @IsEnum(['sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other'])
  leaveType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  daysRequested: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsEnum(['sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other'])
  leaveType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  daysRequested?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class ApproveLeaveRequestDto {
  @IsEnum(['approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreatePerformanceReviewDto {
  @IsString()
  employeeId: string;

  @IsString()
  reviewerId: string;

  @IsDateString()
  reviewPeriodStart: string;

  @IsDateString()
  reviewPeriodEnd: string;

  @IsEnum(['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'])
  overallRating: string;

  @IsOptional()
  @IsString()
  goalsAchieved?: string;

  @IsOptional()
  @IsString()
  areasForImprovement?: string;

  @IsOptional()
  @IsString()
  developmentPlan?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdatePerformanceReviewDto {
  @IsOptional()
  @IsEnum(['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'])
  overallRating?: string;

  @IsOptional()
  @IsString()
  goalsAchieved?: string;

  @IsOptional()
  @IsString()
  areasForImprovement?: string;

  @IsOptional()
  @IsString()
  developmentPlan?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsEnum(['draft', 'submitted', 'approved', 'completed'])
  status?: string;
}

export class CreateTrainingRecordDto {
  @IsString()
  employeeId: string;

  @IsString()
  trainingName: string;

  @IsEnum(['mandatory', 'optional', 'certification', 'continuing_education'])
  trainingType: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTrainingRecordDto {
  @IsOptional()
  @IsString()
  trainingName?: string;

  @IsOptional()
  @IsEnum(['mandatory', 'optional', 'certification', 'continuing_education'])
  trainingType?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'in_progress', 'completed', 'failed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteTrainingDto {
  @IsDateString()
  completionDate: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

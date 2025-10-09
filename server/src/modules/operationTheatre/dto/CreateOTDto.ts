import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsBoolean, IsObject, IsArray } from 'class-validator';

export class CreateOperationTheatreDto {
  @IsString()
  theatreName: string;

  @IsString()
  theatreNumber: string;

  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsObject()
  equipmentList?: any;

  @IsOptional()
  @IsObject()
  specializations?: any;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateOperationTheatreDto {
  @IsOptional()
  @IsString()
  theatreName?: string;

  @IsOptional()
  @IsString()
  theatreNumber?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsObject()
  equipmentList?: any;

  @IsOptional()
  @IsObject()
  specializations?: any;

  @IsOptional()
  @IsEnum(['available', 'occupied', 'maintenance', 'cleaning'])
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class CreateSurgicalProcedureDto {
  @IsString()
  procedureName: string;

  @IsOptional()
  @IsString()
  procedureCode?: string;

  @IsEnum(['major', 'minor', 'emergency', 'elective'])
  category: string;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  requirements?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSurgicalProcedureDto {
  @IsOptional()
  @IsString()
  procedureName?: string;

  @IsOptional()
  @IsString()
  procedureCode?: string;

  @IsOptional()
  @IsEnum(['major', 'minor', 'emergency', 'elective'])
  category?: string;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  requirements?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateOTScheduleDto {
  @IsString()
  theatreId: string;

  @IsString()
  patientId: string;

  @IsString()
  procedureId: string;

  @IsString()
  surgeonId: string;

  @IsOptional()
  @IsString()
  anesthetistId?: string;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  preOpNotes?: string;
}

export class UpdateOTScheduleDto {
  @IsOptional()
  @IsString()
  theatreId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  procedureId?: string;

  @IsOptional()
  @IsString()
  surgeonId?: string;

  @IsOptional()
  @IsString()
  anesthetistId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  preOpNotes?: string;

  @IsOptional()
  @IsString()
  postOpNotes?: string;
}

export class CreateOTTeamAssignmentDto {
  @IsString()
  scheduleId: string;

  @IsString()
  staffId: string;

  @IsEnum(['surgeon', 'assistant', 'anesthetist', 'nurse', 'technician', 'observer'])
  role: string;
}

export class CreateOTConsumableDto {
  @IsString()
  scheduleId: string;

  @IsString()
  itemId: string;

  @IsNumber()
  quantityUsed: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsString()
  usedBy: string;
}

export class CompleteSurgeryDto {
  @IsString()
  postOpNotes: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

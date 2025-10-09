import { IsString, IsOptional, IsDateString, IsObject, IsEnum, IsNumber } from 'class-validator';

export class CreateOPDVisitDto {
  @IsString()
  patientId: string;

  @IsString()
  staffId: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsDateString()
  visitDate: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsObject()
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOPDVisitDto {
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsObject()
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };

  @IsOptional()
  @IsEnum(['checked_in', 'in_queue', 'with_doctor', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  checkOutTime?: string;
}

export class AddToQueueDto {
  @IsString()
  visitId: string;

  @IsString()
  staffId: string;

  @IsOptional()
  @IsEnum(['normal', 'urgent', 'emergency'])
  priority?: string;

  @IsOptional()
  @IsNumber()
  estimatedWaitTime?: number;
}

export class UpdateQueueStatusDto {
  @IsEnum(['waiting', 'in_progress', 'completed', 'cancelled'])
  status: string;

  @IsOptional()
  @IsNumber()
  estimatedWaitTime?: number;
}

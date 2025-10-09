import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export class CreateRadiologyOrderDto {
  @IsString()
  patientId: string;

  @IsString()
  staffId: string;

  @IsDateString()
  orderDate: string;

  @IsEnum(['xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy'])
  studyType: string;

  @IsString()
  bodyPart: string;

  @IsOptional()
  @IsString()
  clinicalIndication?: string;

  @IsEnum(['routine', 'urgent', 'stat'])
  priority: string;

  @IsOptional()
  @IsBoolean()
  contrastRequired?: boolean;

  @IsOptional()
  @IsString()
  contrastType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRadiologyOrderDto {
  @IsOptional()
  @IsEnum(['xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy'])
  studyType?: string;

  @IsOptional()
  @IsString()
  bodyPart?: string;

  @IsOptional()
  @IsString()
  clinicalIndication?: string;

  @IsOptional()
  @IsEnum(['routine', 'urgent', 'stat'])
  priority?: string;

  @IsOptional()
  @IsBoolean()
  contrastRequired?: boolean;

  @IsOptional()
  @IsString()
  contrastType?: string;

  @IsOptional()
  @IsEnum(['ordered', 'scheduled', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRadiologyStudyDto {
  @IsString()
  orderId: string;

  @IsDateString()
  studyDate: string;

  @IsString()
  modality: string;

  @IsString()
  bodyPart: string;

  @IsOptional()
  @IsString()
  technique?: string;

  @IsOptional()
  @IsString()
  radiologistId?: string;

  @IsOptional()
  @IsString()
  technologistId?: string;
}

export class UpdateRadiologyStudyDto {
  @IsOptional()
  @IsString()
  modality?: string;

  @IsOptional()
  @IsString()
  bodyPart?: string;

  @IsOptional()
  @IsString()
  technique?: string;

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsString()
  impression?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsString()
  radiologistId?: string;

  @IsOptional()
  @IsString()
  technologistId?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])
  status?: string;
}

export class CreateRadiologyEquipmentDto {
  @IsString()
  equipmentName: string;

  @IsEnum(['xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy'])
  equipmentType: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;

  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;
}

export class UpdateRadiologyEquipmentDto {
  @IsOptional()
  @IsString()
  equipmentName?: string;

  @IsOptional()
  @IsEnum(['xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy'])
  equipmentType?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['operational', 'maintenance', 'out_of_service'])
  status?: string;

  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;

  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;
}

export class CompleteRadiologyStudyDto {
  @IsString()
  findings: string;

  @IsString()
  impression: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsString()
  radiologistId: string;
}

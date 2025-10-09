import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsObject } from 'class-validator';

export class CreateEmergencyVisitDto {
  @IsString()
  patientId: string;

  @IsString()
  staffId: string;

  @IsDateString()
  visitDate: string;

  @IsEnum(['1', '2', '3', '4', '5'])
  triageLevel: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsObject()
  vitalSigns?: any;

  @IsOptional()
  @IsString()
  initialAssessment?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsEnum(['discharge', 'admit', 'transfer', 'observation'])
  disposition: string;
}

export class UpdateEmergencyVisitDto {
  @IsOptional()
  @IsEnum(['1', '2', '3', '4', '5'])
  triageLevel?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsObject()
  vitalSigns?: any;

  @IsOptional()
  @IsString()
  initialAssessment?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsEnum(['discharge', 'admit', 'transfer', 'observation'])
  disposition?: string;

  @IsOptional()
  @IsEnum(['active', 'completed', 'transferred'])
  status?: string;

  @IsOptional()
  @IsDateString()
  dischargeTime?: string;
}

export class CreateAmbulanceServiceDto {
  @IsString()
  ambulanceNumber: string;

  @IsString()
  driverName: string;

  @IsOptional()
  @IsString()
  driverLicense?: string;

  @IsOptional()
  @IsString()
  paramedicName?: string;

  @IsOptional()
  @IsString()
  paramedicLicense?: string;

  @IsEnum(['basic', 'advanced', 'critical_care'])
  vehicleType: string;

  @IsOptional()
  @IsObject()
  equipmentList?: any;

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

export class UpdateAmbulanceServiceDto {
  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverLicense?: string;

  @IsOptional()
  @IsString()
  paramedicName?: string;

  @IsOptional()
  @IsString()
  paramedicLicense?: string;

  @IsOptional()
  @IsEnum(['basic', 'advanced', 'critical_care'])
  vehicleType?: string;

  @IsOptional()
  @IsObject()
  equipmentList?: any;

  @IsOptional()
  @IsEnum(['available', 'on_call', 'maintenance', 'out_of_service'])
  status?: string;

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

export class CreateEmergencyCallDto {
  @IsOptional()
  @IsString()
  callerName?: string;

  @IsString()
  callerPhone: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsNumber()
  patientAge?: number;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  patientGender?: string;

  @IsEnum(['medical', 'trauma', 'psychiatric', 'obstetric', 'pediatric'])
  emergencyType: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: string;
}

export class UpdateEmergencyCallDto {
  @IsOptional()
  @IsString()
  callerName?: string;

  @IsOptional()
  @IsString()
  callerPhone?: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsNumber()
  patientAge?: number;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  patientGender?: string;

  @IsOptional()
  @IsEnum(['medical', 'trauma', 'psychiatric', 'obstetric', 'pediatric'])
  emergencyType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @IsOptional()
  @IsString()
  ambulanceId?: string;

  @IsOptional()
  @IsEnum(['pending', 'dispatched', 'arrived', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDateString()
  dispatchTime?: string;

  @IsOptional()
  @IsDateString()
  arrivalTime?: string;
}

export class DispatchAmbulanceDto {
  @IsString()
  ambulanceId: string;

  @IsDateString()
  dispatchTime: string;
}

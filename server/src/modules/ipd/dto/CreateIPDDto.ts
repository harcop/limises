import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export class CreateWardDto {
  @IsString()
  wardName: string;

  @IsEnum(['general', 'icu', 'ccu', 'pediatric', 'maternity', 'surgical', 'medical'])
  wardType: string;

  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWardDto {
  @IsOptional()
  @IsString()
  wardName?: string;

  @IsOptional()
  @IsEnum(['general', 'icu', 'ccu', 'pediatric', 'maternity', 'surgical', 'medical'])
  wardType?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateBedDto {
  @IsString()
  wardId: string;

  @IsString()
  bedNumber: string;

  @IsEnum(['standard', 'private', 'semi_private', 'icu', 'isolation'])
  bedType: string;

  @IsNumber()
  dailyRate: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBedDto {
  @IsOptional()
  @IsString()
  bedNumber?: string;

  @IsOptional()
  @IsEnum(['standard', 'private', 'semi_private', 'icu', 'isolation'])
  bedType?: string;

  @IsOptional()
  @IsEnum(['available', 'occupied', 'maintenance', 'reserved'])
  status?: string;

  @IsOptional()
  @IsNumber()
  dailyRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateIPDAdmissionDto {
  @IsString()
  patientId: string;

  @IsString()
  staffId: string;

  @IsString()
  wardId: string;

  @IsString()
  bedId: string;

  @IsDateString()
  admissionDate: string;

  @IsString()
  admissionTime: string;

  @IsEnum(['emergency', 'elective', 'transfer'])
  admissionType: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateIPDAdmissionDto {
  @IsOptional()
  @IsString()
  wardId?: string;

  @IsOptional()
  @IsString()
  bedId?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsEnum(['admitted', 'discharged', 'transferred'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dischargeDate?: string;

  @IsOptional()
  @IsString()
  dischargeTime?: string;
}

export class DischargePatientDto {
  @IsDateString()
  dischargeDate: string;

  @IsString()
  dischargeTime: string;

  @IsEnum(['recovered', 'improved', 'transferred', 'ama', 'deceased'])
  dischargeStatus: string;

  @IsOptional()
  @IsString()
  dischargeNotes?: string;
}

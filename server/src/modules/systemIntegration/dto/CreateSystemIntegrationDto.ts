import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';

export class CreateSystemIntegrationDto {
  @IsString()
  systemName: string;

  @IsEnum(['internal', 'external', 'third_party'])
  systemType: string;

  @IsString()
  endpoint: string;

  @IsEnum(['api_key', 'oauth', 'basic', 'certificate'])
  authenticationType: string;

  @IsOptional()
  @IsString()
  syncFrequency?: string;

  @IsOptional()
  @IsObject()
  configuration?: any;
}

export class UpdateSystemIntegrationDto {
  @IsOptional()
  @IsString()
  systemName?: string;

  @IsOptional()
  @IsEnum(['internal', 'external', 'third_party'])
  systemType?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsEnum(['api_key', 'oauth', 'basic', 'certificate'])
  authenticationType?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'error', 'maintenance'])
  status?: string;

  @IsOptional()
  @IsString()
  syncFrequency?: string;

  @IsOptional()
  @IsObject()
  configuration?: any;
}

export class TestIntegrationDto {
  @IsString()
  endpoint: string;

  @IsEnum(['api_key', 'oauth', 'basic', 'certificate'])
  authenticationType: string;

  @IsOptional()
  @IsObject()
  configuration?: any;
}

export class CreateSecurityAuditDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  action: string;

  @IsString()
  resource: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsObject()
  details?: any;
}

export class SecurityAuditFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class SyncIntegrationDto {
  @IsOptional()
  @IsBoolean()
  forceSync?: boolean;
}

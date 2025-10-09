// ==============================================
// SYSTEM INTEGRATION & SECURITY INTERFACES
// ==============================================

export interface SystemIntegration {
  integrationId: string;
  systemName: string;
  systemType: 'internal' | 'external' | 'third_party';
  endpoint: string;
  authenticationType: 'api_key' | 'oauth' | 'basic' | 'certificate';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  lastSync?: string;
  syncFrequency?: string;
  configuration?: string; // JSON string
  createdAt: string;
  updatedAt?: string;
}

export interface SecurityAudit {
  auditId: string;
  userId?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string; // JSON string
  createdAt: string;
}

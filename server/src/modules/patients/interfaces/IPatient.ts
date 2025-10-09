// ==============================================
// PATIENT MANAGEMENT INTERFACES
// ==============================================

export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  status: 'active' | 'inactive' | 'deceased';
  createdAt: string;
  updatedAt?: string;
}

export interface PatientInsurance {
  insuranceId: string;
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: string;
  expirationDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  coveragePercentage?: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

// Request Types
export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

// Statistics Types
export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  malePatients: number;
  femalePatients: number;
  otherGenderPatients: number;
}

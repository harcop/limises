// ==============================================
// IPD MANAGEMENT INTERFACES
// ==============================================

export interface IPDAdmission {
  admissionId: string;
  patientId: string;
  staffId: string;
  wardId: string;
  bedId: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate?: string;
  dischargeTime?: string;
  admissionType: 'emergency' | 'elective' | 'transfer';
  diagnosis?: string;
  status: 'admitted' | 'discharged' | 'transferred';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Ward {
  wardId: string;
  wardName: string;
  wardType: 'general' | 'icu' | 'pediatric' | 'maternity' | 'surgical';
  capacity: number;
  currentOccupancy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Bed {
  bedId: string;
  wardId: string;
  bedNumber: string;
  bedType: 'standard' | 'icu' | 'isolation' | 'private';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  dailyRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

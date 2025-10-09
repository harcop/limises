// ==============================================
// OPD MANAGEMENT INTERFACES
// ==============================================

export interface OPDVisit {
  visitId: string;
  patientId: string;
  staffId: string;
  appointmentId?: string;
  visitDate: string;
  checkInTime: string;
  checkOutTime?: string;
  chiefComplaint?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  status: 'in_queue' | 'with_doctor' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OPDQueue {
  queueId: string;
  visitId: string;
  patientId: string;
  staffId: string;
  queueNumber: number;
  estimatedWaitTime?: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  createdAt: string;
  completedAt?: string;
}

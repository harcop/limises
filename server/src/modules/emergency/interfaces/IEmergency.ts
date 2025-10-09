// ==============================================
// EMERGENCY & AMBULANCE MANAGEMENT INTERFACES
// ==============================================

export interface EmergencyVisit {
  visitId: string;
  patientId: string;
  staffId: string;
  visitDate: string;
  arrivalTime: string;
  triageLevel: '1' | '2' | '3' | '4' | '5';
  chiefComplaint?: string;
  vitalSigns?: string; // JSON string
  initialAssessment?: string;
  treatmentPlan?: string;
  disposition: 'discharge' | 'admit' | 'transfer' | 'observation';
  dischargeTime?: string;
  status: 'active' | 'completed' | 'transferred';
  createdAt: string;
  updatedAt?: string;
}

export interface AmbulanceService {
  serviceId: string;
  ambulanceNumber: string;
  driverName: string;
  driverLicense?: string;
  paramedicName?: string;
  paramedicLicense?: string;
  vehicleType: 'basic' | 'advanced' | 'critical_care';
  equipmentList?: string; // JSON string
  status: 'available' | 'on_call' | 'maintenance' | 'out_of_service';
  location?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmergencyCall {
  callId: string;
  callerName?: string;
  callerPhone: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  emergencyType: 'medical' | 'trauma' | 'psychiatric' | 'obstetric' | 'pediatric';
  location: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  ambulanceId?: string;
  dispatchTime?: string;
  arrivalTime?: string;
  status: 'pending' | 'dispatched' | 'arrived' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

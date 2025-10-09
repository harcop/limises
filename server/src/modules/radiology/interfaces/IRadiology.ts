// ==============================================
// RADIOLOGY & IMAGING INTERFACES
// ==============================================

export interface RadiologyOrder {
  orderId: string;
  patientId: string;
  staffId: string;
  orderDate: string;
  studyType: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'mammography' | 'nuclear' | 'pet' | 'fluoroscopy';
  bodyPart: string;
  clinicalIndication?: string;
  priority: 'routine' | 'urgent' | 'stat';
  contrastRequired: boolean;
  contrastType?: string;
  status: 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RadiologyStudy {
  studyId: string;
  orderId: string;
  studyDate: string;
  modality: string;
  bodyPart: string;
  technique?: string;
  findings?: string;
  impression?: string;
  recommendations?: string;
  radiologistId?: string;
  technologistId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface RadiologyEquipment {
  equipmentId: string;
  equipmentName: string;
  equipmentType: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'mammography' | 'nuclear' | 'pet' | 'fluoroscopy';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  status: 'operational' | 'maintenance' | 'out_of_service';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==============================================
// LABORATORY MANAGEMENT INTERFACES
// ==============================================

export interface LabOrder {
  orderId: string;
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  orderDate: string;
  orderTime: string;
  testType: string;
  testDescription?: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'collected' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LabSample {
  sampleId: string;
  orderId: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  collectedBy: string;
  sampleCondition: 'good' | 'poor' | 'contaminated';
  storageLocation?: string;
  status: 'collected' | 'processed' | 'stored' | 'disposed';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LabResult {
  resultId: string;
  orderId: string;
  sampleId?: string;
  testName: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  status: 'normal' | 'abnormal' | 'critical';
  verifiedBy?: string;
  verifiedAt?: string;
  resultDate: string;
  resultTime: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

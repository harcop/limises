import { Request } from 'express';

// ==============================================
// AUTHENTICATION TYPES
// ==============================================

// Base authentication interface
export interface BaseAuth {
  authId: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt?: string;
}

// Staff authentication
export interface StaffAuth extends BaseAuth {
  staffId: string;
  username: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}


// Authentication request types
export interface StaffAuthRequest extends Request {
  user?: {
    authId: string;
    staffId: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}


// ==============================================
// STAFF MANAGEMENT TYPES
// ==============================================

export interface Staff {
  staffId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  department: string;
  position: string;
  hireDate: string;
  terminationDate?: string;
  salary?: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  photoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffRole {
  roleId: string;
  roleName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffRoleAssignment {
  assignmentId: string;
  staffId: string;
  roleId: string;
  assignedBy?: string;
  assignedDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  permissionId: string;
  permissionName: string;
  description?: string;
  module: string;
  isActive: boolean;
  createdAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  grantedBy?: string;
  grantedDate: string;
  createdAt: string;
}

// Patient Types
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

// Appointment Types
export interface Appointment {
  appointmentId: string;
  patientId: string;
  staffId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  duration: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Clinical Types
export interface ClinicalNote {
  noteId: string;
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  noteType: 'consultation' | 'progress' | 'discharge' | 'procedure' | 'emergency';
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  plan?: string;
  isSigned: boolean;
  signedBy?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  staffId: string;
  drugId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refillsAllowed: number;
  refillsUsed: number;
  instructions?: string;
  prescribedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// OPD Types
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

// IPD Types
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

// Laboratory Types
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

// Pharmacy Types
export interface DrugMaster {
  drugId: string;
  drugName: string;
  genericName?: string;
  drugClass?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  ndcNumber?: string;
  isControlled: boolean;
  controlledSchedule?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PharmacyInventory {
  inventoryId: string;
  drugId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  supplier?: string;
  location?: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

export interface PharmacyDispense {
  dispenseId: string;
  prescriptionId: string;
  inventoryId: string;
  quantityDispensed: number;
  dispensedBy: string;
  patientInstructions?: string;
  notes?: string;
  dispensedAt: string;
}

// Billing Types
export interface BillingAccount {
  accountId: string;
  patientId: string;
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive' | 'closed';
  createdAt: string;
  updatedAt?: string;
}

export interface Charge {
  chargeId: string;
  patientId: string;
  accountId: string;
  serviceType: string;
  serviceDescription?: string;
  serviceDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'billed' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  paymentId: string;
  patientId: string;
  accountId: string;
  paymentDate: string;
  paymentTime: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'insurance' | 'check';
  paymentAmount: number;
  referenceNumber?: string;
  notes?: string;
  processedBy: string;
  createdAt: string;
}

export interface InsuranceClaim {
  claimId: string;
  patientId: string;
  insuranceId: string;
  claimDate: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  totalCharges: number;
  claimAmount: number;
  status: 'submitted' | 'approved' | 'denied' | 'pending';
  claimNumber?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Inventory Types
export interface InventoryItem {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemType?: string;
  unitOfMeasure?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryStock {
  stockId: string;
  itemId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  supplier?: string;
  location?: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Database Types
export interface DatabaseRow {
  [key: string]: any;
}

export interface DatabaseResult {
  acknowledged: boolean;
  insertedId?: string;
  modifiedCount?: number;
  upsertedCount?: number;
  matchedCount?: number;
  deletedCount?: number;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// JWT Types
export interface JWTPayload {
  userId: string;
  staffId?: string;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
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

export interface CreateAppointmentRequest {
  patientId: string;
  staffId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  duration?: number;
  notes?: string;
}

export interface CreateClinicalNoteRequest {
  patientId: string;
  staffId: string;
  appointmentId?: string;
  admissionId?: string;
  noteType: 'consultation' | 'progress' | 'discharge' | 'procedure' | 'emergency';
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  plan?: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  staffId: string;
  drugId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refillsAllowed?: number;
  instructions?: string;
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface SearchQuery {
  search?: string;
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

export interface AppointmentStats {
  totalAppointments: number;
  scheduledAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
}

export interface RevenueStats {
  totalCharges: number;
  totalRevenue: number;
  avgChargeAmount: number;
  paidCharges: number;
  paidRevenue: number;
  pendingCharges: number;
  pendingRevenue: number;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  terminatedStaff: number;
  totalDepartments: number;
  totalPositions: number;
}

// ==============================================
// EMERGENCY & AMBULANCE MANAGEMENT TYPES
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

// ==============================================
// OPERATION THEATRE MANAGEMENT TYPES
// ==============================================

export interface OperationTheatre {
  theatreId: string;
  theatreName: string;
  theatreNumber: string;
  capacity: number;
  equipmentList?: string; // JSON string
  specializations?: string; // JSON string
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  location?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SurgicalProcedure {
  procedureId: string;
  procedureName: string;
  procedureCode?: string;
  category: 'major' | 'minor' | 'emergency' | 'elective';
  estimatedDuration?: number; // in minutes
  description?: string;
  requirements?: string; // JSON string
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OTSchedule {
  scheduleId: string;
  theatreId: string;
  patientId: string;
  procedureId: string;
  surgeonId: string;
  anesthetistId?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  notes?: string;
  preOpNotes?: string;
  postOpNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OTTeamAssignment {
  assignmentId: string;
  scheduleId: string;
  staffId: string;
  role: 'surgeon' | 'assistant' | 'anesthetist' | 'nurse' | 'technician' | 'observer';
  assignedAt: string;
}

export interface OTConsumable {
  consumptionId: string;
  scheduleId: string;
  itemId: string;
  quantityUsed: number;
  unitCost?: number;
  totalCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  usedBy: string;
  usedAt: string;
}

// ==============================================
// RADIOLOGY & IMAGING TYPES
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

// ==============================================
// HUMAN RESOURCES MANAGEMENT TYPES
// ==============================================

export interface EmployeeRecord {
  employeeId: string;
  staffId: string;
  employeeNumber?: string;
  hireDate: string;
  terminationDate?: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
  jobTitle: string;
  department: string;
  managerId?: string;
  salary?: number;
  benefits?: string; // JSON string
  emergencyContact?: string; // JSON string
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  createdAt: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  leaveId: string;
  employeeId: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PerformanceReview {
  reviewId: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  goalsAchieved?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  comments?: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingRecord {
  trainingId: string;
  employeeId: string;
  trainingName: string;
  trainingType: 'mandatory' | 'optional' | 'certification' | 'continuing_education';
  provider?: string;
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  score?: number;
  certificateNumber?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==============================================
// SYSTEM INTEGRATION & SECURITY TYPES
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

// ==============================================
// OPERATION THEATRE MANAGEMENT INTERFACES
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

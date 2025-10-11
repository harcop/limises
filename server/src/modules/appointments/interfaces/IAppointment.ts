// ==============================================
// APPOINTMENT MANAGEMENT INTERFACES
// ==============================================

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
  roomNumber?: string;
  reason?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// Request Types
export interface CreateAppointmentRequest {
  patientId: string;
  staffId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  duration?: number;
  notes?: string;
  roomNumber?: string;
  reason?: string;
  followUpRequired?: boolean;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentType?: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  duration?: number;
  notes?: string;
  roomNumber?: string;
  reason?: string;
  followUpRequired?: boolean;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
}

// Statistics Types
export interface AppointmentStats {
  totalAppointments: number;
  scheduledAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
}

import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

// Generate unique IDs for different entities
export const generateId = (prefix: string, length: number = 8): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, length);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

// Generate patient ID
export const generatePatientId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `HMS-${year}-${random}`;
};

// Generate staff ID
export const generateStaffId = (): string => {
  return generateId('STAFF', 6);
};

// Generate appointment ID
export const generateAppointmentId = (): string => {
  return generateId('APT', 6);
};

// Generate clinical note ID
export const generateClinicalNoteId = (): string => {
  return generateId('NOTE', 6);
};

// Generate prescription ID
export const generatePrescriptionId = (): string => {
  return generateId('RX', 6);
};

// Generate billing account ID
export const generateBillingAccountId = (): string => {
  return generateId('BILL', 6);
};

// Generate charge ID
export const generateChargeId = (): string => {
  return generateId('CHG', 6);
};

// Generate payment ID
export const generatePaymentId = (): string => {
  return generateId('PAY', 6);
};

// Generate lab order ID
export const generateLabOrderId = (): string => {
  return generateId('LAB', 6);
};

// Generate admission ID
export const generateAdmissionId = (): string => {
  return generateId('ADM', 6);
};

// Generate bed ID
export const generateBedId = (): string => {
  return generateId('BED', 6);
};

// Generate ward ID
export const generateWardId = (): string => {
  return generateId('WARD', 6);
};

// Format date for database
export const formatDate = (date: string | Date): string => {
  return moment(date).format('YYYY-MM-DD');
};

// Format datetime for database
export const formatDateTime = (date: string | Date): string => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// Format time for database
export const formatTime = (time: string): string => {
  return moment(time, 'HH:mm').format('HH:mm:ss');
};

// Parse date from database
export const parseDate = (dateString: string): string => {
  return moment(dateString).format('YYYY-MM-DD');
};

// Parse datetime from database
export const parseDateTime = (dateTimeString: string): string => {
  return moment(dateTimeString).format('YYYY-MM-DD HH:mm:ss');
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  return moment().diff(moment(dateOfBirth), 'years');
};

// Check if date is in the past
export const isPastDate = (date: string | Date): boolean => {
  return moment(date).isBefore(moment(), 'day');
};

// Check if date is in the future
export const isFutureDate = (date: string | Date): boolean => {
  return moment(date).isAfter(moment(), 'day');
};

// Check if time is in the past
export const isPastTime = (date: string, time: string): boolean => {
  const dateTime = moment(`${date} ${time}`);
  return dateTime.isBefore(moment());
};

// Generate random string
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random number
export const generateRandomNumber = (min: number = 100000, max: number = 999999): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Sanitize string for database
export const sanitizeString = (str: string | null | undefined): string | null => {
  if (!str) return null;
  return str.trim().replace(/[<>]/g, '');
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Calculate time difference in minutes
export const getTimeDifferenceInMinutes = (startTime: string, endTime: string): number => {
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  return end.diff(start, 'minutes');
};

// Add minutes to time
export const addMinutesToTime = (time: string, minutes: number): string => {
  return moment(time, 'HH:mm').add(minutes, 'minutes').format('HH:mm');
};

// Check if time is within business hours
export const isWithinBusinessHours = (time: string, startHour: number = 8, endHour: number = 17): boolean => {
  const hour = moment(time, 'HH:mm').hour();
  return hour >= startHour && hour < endHour;
};

// Time slot interface
export interface TimeSlot {
  start: string;
  end: string;
}

// Generate appointment time slots
export const generateTimeSlots = (startTime: string, endTime: string, duration: number = 30): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  
  while (start.isBefore(end)) {
    const slotStart = start.format('HH:mm');
    const slotEnd = start.add(duration, 'minutes').format('HH:mm');
    slots.push({
      start: slotStart,
      end: slotEnd
    });
  }
  
  return slots;
};

// Check for time conflicts
export const hasTimeConflict = (newStart: string, newEnd: string, existingStart: string, existingEnd: string): boolean => {
  const newStartTime = moment(newStart, 'HH:mm');
  const newEndTime = moment(newEnd, 'HH:mm');
  const existingStartTime = moment(existingStart, 'HH:mm');
  const existingEndTime = moment(existingEnd, 'HH:mm');
  
  return newStartTime.isBefore(existingEndTime) && newEndTime.isAfter(existingStartTime);
};

// Calculate appointment duration
export const calculateAppointmentDuration = (appointmentType: string): number => {
  const durations: { [key: string]: number } = {
    'consultation': 30,
    'follow_up': 20,
    'procedure': 60,
    'emergency': 45,
    'telemedicine': 30
  };
  return durations[appointmentType] || 30;
};

// Generate billing account number
export const generateBillingAccountNumber = (): string => {
  const year = new Date().getFullYear();
  const random = generateRandomNumber(100000, 999999);
  return `BILL-${year}-${random}`;
};

// Calculate copay amount
export const calculateCopay = (totalAmount: number, copayPercentage: number): number => {
  return (totalAmount * copayPercentage) / 100;
};

// Calculate insurance coverage
export const calculateInsuranceCoverage = (totalAmount: number, coveragePercentage: number): number => {
  return (totalAmount * coveragePercentage) / 100;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Parse currency
export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};

// Generate report filename
export const generateReportFilename = (reportType: string, date: Date = new Date()): string => {
  const dateStr = moment(date).format('YYYY-MM-DD');
  const timeStr = moment(date).format('HH-mm-ss');
  return `${reportType}_${dateStr}_${timeStr}.pdf`;
};

// Check if user has permission
export const hasPermission = (userRoles: string[], requiredRoles: string[]): boolean => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  if (!requiredRoles || !Array.isArray(requiredRoles)) return true;
  
  return requiredRoles.some(role => userRoles.includes(role));
};

// Get user display name
export const getUserDisplayName = (user: { firstName?: string; lastName?: string; username?: string; email?: string }): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email || 'Unknown User';
};

// Audit log interface
export interface AuditLogEntry {
  logId: string;
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// Generate audit log entry
export const generateAuditLog = (
  userId: string, 
  action: string, 
  tableName: string, 
  recordId: string, 
  oldValues: any = null, 
  newValues: any = null
): AuditLogEntry => {
  return {
    logId: generateId('LOG', 6),
    userId,
    action,
    tableName,
    recordId,
    oldValues: oldValues ? JSON.stringify(oldValues) : null,
    newValues: newValues ? JSON.stringify(newValues) : null,
    ipAddress: null, // Will be set by middleware
    userAgent: null, // Will be set by middleware
    createdAt: formatDateTime(new Date())
  };
};

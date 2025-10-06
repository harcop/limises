import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// Patient validation rules
export const validatePatient: ValidationChain[] = [
  body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be less than 100 characters'),
  body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be less than 100 characters'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('emergencyContactName').trim().isLength({ min: 1, max: 200 }).withMessage('Emergency contact name is required'),
  body('emergencyContactPhone').isMobilePhone().withMessage('Valid emergency contact phone is required'),
  handleValidationErrors
];

export const validatePatientUpdate: ValidationChain[] = [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be less than 100 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be less than 100 characters'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  handleValidationErrors
];


// Staff validation rules
export const validateStaff: ValidationChain[] = [
  body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required and must be less than 100 characters'),
  body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required and must be less than 100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('department').trim().isLength({ min: 1, max: 100 }).withMessage('Department is required'),
  body('position').trim().isLength({ min: 1, max: 100 }).withMessage('Position is required'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
  handleValidationErrors
];

// User validation rules
export const validateUser: ValidationChain[] = [
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  handleValidationErrors
];

// Appointment validation rules
export const validateAppointment: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM format)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM format)'),
  body('appointmentType').isIn(['consultation', 'follow_up', 'procedure', 'emergency', 'telemedicine']).withMessage('Valid appointment type is required'),
  handleValidationErrors
];

// Clinical note validation rules
export const validateClinicalNote: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
  body('noteType').isIn(['consultation', 'progress', 'discharge', 'procedure', 'emergency']).withMessage('Valid note type is required'),
  body('chiefComplaint').optional().trim().isLength({ max: 1000 }).withMessage('Chief complaint must be less than 1000 characters'),
  body('historyOfPresentIllness').optional().trim().isLength({ max: 2000 }).withMessage('History of present illness must be less than 2000 characters'),
  body('physicalExamination').optional().trim().isLength({ max: 2000 }).withMessage('Physical examination must be less than 2000 characters'),
  body('assessment').optional().trim().isLength({ max: 2000 }).withMessage('Assessment must be less than 2000 characters'),
  body('plan').optional().trim().isLength({ max: 2000 }).withMessage('Plan must be less than 2000 characters'),
  handleValidationErrors
];

// Prescription validation rules
export const validatePrescription: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
  body('drugId').trim().isLength({ min: 1 }).withMessage('Drug ID is required'),
  body('dosage').trim().isLength({ min: 1, max: 100 }).withMessage('Dosage is required and must be less than 100 characters'),
  body('frequency').trim().isLength({ min: 1, max: 100 }).withMessage('Frequency is required and must be less than 100 characters'),
  body('duration').trim().isLength({ min: 1, max: 100 }).withMessage('Duration is required and must be less than 100 characters'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('refillsAllowed').optional().isInt({ min: 0 }).withMessage('Refills allowed must be a non-negative integer'),
  handleValidationErrors
];

// Insurance validation rules
export const validateInsurance: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('insuranceProvider').trim().isLength({ min: 1, max: 200 }).withMessage('Insurance provider is required'),
  body('policyNumber').trim().isLength({ min: 1, max: 100 }).withMessage('Policy number is required'),
  body('effectiveDate').isISO8601().withMessage('Valid effective date is required'),
  body('subscriberName').trim().isLength({ min: 1, max: 200 }).withMessage('Subscriber name is required'),
  body('relationshipToSubscriber').isIn(['self', 'spouse', 'child', 'other']).withMessage('Valid relationship is required'),
  handleValidationErrors
];

// Billing validation rules
export const validateCharge: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('accountId').trim().isLength({ min: 1 }).withMessage('Account ID is required'),
  body('serviceType').trim().isLength({ min: 1, max: 100 }).withMessage('Service type is required'),
  body('serviceDate').isISO8601().withMessage('Valid service date is required'),
  body('unitPrice').isDecimal().withMessage('Valid unit price is required'),
  body('totalAmount').isDecimal().withMessage('Valid total amount is required'),
  handleValidationErrors
];

export const validatePayment: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('accountId').trim().isLength({ min: 1 }).withMessage('Account ID is required'),
  body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
  body('paymentMethod').isIn(['cash', 'credit_card', 'debit_card', 'check', 'insurance', 'bank_transfer']).withMessage('Valid payment method is required'),
  body('paymentAmount').isDecimal().withMessage('Valid payment amount is required'),
  handleValidationErrors
];

// Lab order validation rules
export const validateLabOrder: ValidationChain[] = [
  body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
  body('orderDate').isISO8601().withMessage('Valid order date is required'),
  body('testType').trim().isLength({ min: 1, max: 100 }).withMessage('Test type is required'),
  body('priority').isIn(['routine', 'urgent', 'stat']).withMessage('Valid priority is required'),
  handleValidationErrors
];

// Parameter validation
export const validateId: ValidationChain[] = [
  param('id').trim().isLength({ min: 1 }).withMessage('Valid ID is required'),
  handleValidationErrors
];

export const validatePatientId: ValidationChain[] = [
  param('patientId').trim().isLength({ min: 1 }).withMessage('Valid patient ID is required'),
  handleValidationErrors
];

export const validateStaffId: ValidationChain[] = [
  param('staffId').trim().isLength({ min: 1 }).withMessage('Valid staff ID is required'),
  handleValidationErrors
];

// Query validation
export const validatePagination: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateDateRange: ValidationChain[] = [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  handleValidationErrors
];

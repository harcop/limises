import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validatePatient, validatePatientUpdate, validatePatientId, validatePagination, validateInsurance } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
import { 
  generatePatientId, 
  generateBillingAccountId, 
  formatDate, 
  calculateAge, 
  sanitizeString,
  generateBillingAccountNumber 
} from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse, Patient, PatientInsurance } from '../types';

const router = express.Router();

// @route   POST /api/patients
// @desc    Register a new patient (staff-only)
// @access  Private (Staff only)
router.post('/', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePatient, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      bloodType,
      allergies,
      medicalConditions
    } = req.body;

    // Check for duplicate patient
    const duplicateCheck = await getRow(
      'SELECT patient_id FROM patients WHERE (phone = ? AND phone IS NOT NULL AND phone != "") OR (email = ? AND email IS NOT NULL AND email != "")',
      [sanitizeString(phone), sanitizeString(email)]
    );

    if (duplicateCheck) {
      return res.status(400).json({
        success: false,
        error: 'Patient with this phone number or email already exists',
        duplicatePatientId: duplicateCheck.patient_id
      });
    }

    // Generate patient ID
    const patientId = generatePatientId();

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Create patient record
      await runQuery(
        `INSERT INTO patients (
          patient_id, first_name, last_name, middle_name, date_of_birth, gender,
          phone, email, address, city, state, zip_code, country,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
          blood_type, allergies, medical_conditions, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
        [
          patientId,
          sanitizeString(firstName),
          sanitizeString(lastName),
          sanitizeString(middleName),
          formatDate(dateOfBirth),
          gender,
          sanitizeString(phone),
          sanitizeString(email),
          sanitizeString(address),
          sanitizeString(city),
          sanitizeString(state),
          sanitizeString(zipCode),
          sanitizeString(country || 'USA'),
          sanitizeString(emergencyContactName),
          sanitizeString(emergencyContactPhone),
          sanitizeString(emergencyContactRelationship),
          sanitizeString(bloodType),
          sanitizeString(allergies),
          sanitizeString(medicalConditions)
        ]
      );

      // Create billing account
      const accountId = generateBillingAccountId();
      const accountNumber = generateBillingAccountNumber();
      
      await runQuery(
        `INSERT INTO billing_accounts (account_id, patient_id, account_number, status, created_at) 
         VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
        [accountId, patientId, accountNumber]
      );

      await runQuery('COMMIT');

      logger.info(`New patient registered: ${patientId} by user ${req.user.userId}`);

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        patient: {
          patientId,
          firstName,
          lastName,
          accountId,
          accountNumber
        }
      });

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during patient registration'
    });
  }
});

// @route   GET /api/patients
// @desc    Get all patients with pagination and search
// @access  Private (Staff only)
router.get('/', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || 'active';

    let whereClause = 'WHERE p.status = ?';
    let params = [status];

    if (search) {
      whereClause += ` AND (
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.patient_id LIKE ? OR 
        p.phone LIKE ? OR 
        p.email LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM patients p ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get patients
    const patients = await getAll(
      `SELECT 
        p.patient_id, p.first_name, p.last_name, p.middle_name, p.date_of_birth, p.gender,
        p.phone, p.email, p.address, p.city, p.state, p.zip_code, p.country,
        p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relationship,
        p.blood_type, p.allergies, p.medical_conditions, p.status, p.created_at,
        ba.account_id, ba.account_number, ba.balance
       FROM patients p
       LEFT JOIN billing_accounts ba ON p.patient_id = ba.patient_id
       ${whereClause}
       ORDER BY p.last_name, p.first_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Calculate age for each patient
    const patientsWithAge = patients.map(patient => ({
      ...patient,
      age: calculateAge(patient.date_of_birth)
    }));

    res.json({
      success: true,
      patients: patientsWithAge,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving patients'
    });
  }
});

// @route   GET /api/patients/search
// @desc    Search patients with advanced filters
// @access  Private (Staff only)
router.get('/search', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      query: searchQuery,
      firstName,
      lastName,
      phone,
      email,
      dateOfBirth,
      gender,
      bloodType,
      limit = 50
    } = req.query;

    let whereClause = 'WHERE p.status = "active"';
    let params = [];

    if (searchQuery) {
      whereClause += ` AND (
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.patient_id LIKE ? OR 
        p.phone LIKE ? OR 
        p.email LIKE ?
      )`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (firstName) {
      whereClause += ' AND p.first_name LIKE ?';
      params.push(`%${firstName}%`);
    }

    if (lastName) {
      whereClause += ' AND p.last_name LIKE ?';
      params.push(`%${lastName}%`);
    }

    if (phone) {
      whereClause += ' AND p.phone LIKE ?';
      params.push(`%${phone}%`);
    }

    if (email) {
      whereClause += ' AND p.email LIKE ?';
      params.push(`%${email}%`);
    }

    if (dateOfBirth) {
      whereClause += ' AND p.date_of_birth = ?';
      params.push(formatDate(dateOfBirth));
    }

    if (gender) {
      whereClause += ' AND p.gender = ?';
      params.push(gender);
    }

    if (bloodType) {
      whereClause += ' AND p.blood_type = ?';
      params.push(bloodType);
    }

    const patients = await getAll(
      `SELECT 
        p.patient_id, p.first_name, p.last_name, p.middle_name, p.date_of_birth, p.gender,
        p.phone, p.email, p.blood_type, p.status
       FROM patients p
       ${whereClause}
       ORDER BY p.last_name, p.first_name
       LIMIT ?`,
      [...params, parseInt(limit)]
    );

    // Calculate age for each patient
    const patientsWithAge = patients.map(patient => ({
      ...patient,
      age: calculateAge(patient.date_of_birth)
    }));

    res.json({
      success: true,
      patients: patientsWithAge,
      count: patients.length
    });

  } catch (error) {
    logger.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error searching patients'
    });
  }
});

// @route   GET /api/patients/:patientId
// @desc    Get patient by ID
// @access  Private (Staff only)
router.get('/:patientId', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePatientId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const patient = await getRow(
      `SELECT 
        p.*, ba.account_id, ba.account_number, ba.balance, ba.status as account_status
       FROM patients p
       LEFT JOIN billing_accounts ba ON p.patient_id = ba.patient_id
       WHERE p.patient_id = ?`,
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Add age to patient data
    const patientWithAge = {
      ...patient,
      age: calculateAge(patient.date_of_birth)
    };

    res.json({
      success: true,
      patient: patientWithAge
    });

  } catch (error) {
    logger.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving patient'
    });
  }
});

// @route   PUT /api/patients/:patientId
// @desc    Update patient information
// @access  Private (Staff only)
router.put('/:patientId', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePatientUpdate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const updates = req.body;

    // Check if patient exists
    const existingPatient = await getRow(
      'SELECT patient_id FROM patients WHERE patient_id = ?',
      [patientId]
    );

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Check for duplicate phone/email if being updated
    if (updates.phone || updates.email) {
      const duplicateCheck = await getRow(
        'SELECT patient_id FROM patients WHERE patient_id != ? AND ((phone = ? AND phone IS NOT NULL AND phone != "") OR (email = ? AND email IS NOT NULL AND email != ""))',
        [patientId, sanitizeString(updates.phone), sanitizeString(updates.email)]
      );

      if (duplicateCheck) {
        return res.status(400).json({
          success: false,
          error: 'Another patient with this phone number or email already exists'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender',
      'phone', 'email', 'address', 'city', 'state', 'zipCode', 'country',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship',
      'bloodType', 'allergies', 'medicalConditions', 'status'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        if (key === 'dateOfBirth') {
          updateValues.push(formatDate(value));
        } else {
          updateValues.push(sanitizeString(value));
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(patientId);

    await runQuery(
      `UPDATE patients SET ${updateFields.join(', ')} WHERE patient_id = ?`,
      updateValues
    );

    logger.info(`Patient ${patientId} updated by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Patient updated successfully'
    });

  } catch (error) {
    logger.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating patient'
    });
  }
});

// @route   GET /api/patients/:patientId/insurance
// @desc    Get patient insurance information
// @access  Private (Staff only)
router.get('/:patientId/insurance', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePatientId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    const insurance = await getAll(
      'SELECT * FROM patient_insurance WHERE patient_id = ? ORDER BY is_primary DESC, effective_date DESC',
      [patientId]
    );

    res.json({
      success: true,
      insurance
    });

  } catch (error) {
    logger.error('Get patient insurance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving patient insurance'
    });
  }
});

// @route   POST /api/patients/:patientId/insurance
// @desc    Add insurance information to patient
// @access  Private (Staff only)
router.post('/:patientId/insurance', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validateInsurance, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const {
      insuranceProvider,
      policyNumber,
      groupNumber,
      subscriberName,
      subscriberId,
      relationshipToSubscriber,
      effectiveDate,
      expiryDate,
      copayAmount,
      deductibleAmount,
      coveragePercentage,
      isPrimary
    } = req.body;

    // Check if patient exists
    const patient = await getRow(
      'SELECT patient_id FROM patients WHERE patient_id = ?',
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // If this is being set as primary, unset other primary insurances
    if (isPrimary) {
      await runQuery(
        'UPDATE patient_insurance SET is_primary = 0 WHERE patient_id = ?',
        [patientId]
      );
    }

    // Generate insurance ID
    const insuranceId = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await runQuery(
      `INSERT INTO patient_insurance (
        insurance_id, patient_id, insurance_provider, policy_number, group_number,
        subscriber_name, subscriber_id, relationship_to_subscriber, effective_date,
        expiry_date, copay_amount, deductible_amount, coverage_percentage, is_primary,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
      [
        insuranceId,
        patientId,
        sanitizeString(insuranceProvider),
        sanitizeString(policyNumber),
        sanitizeString(groupNumber),
        sanitizeString(subscriberName),
        sanitizeString(subscriberId),
        relationshipToSubscriber,
        formatDate(effectiveDate),
        expiryDate ? formatDate(expiryDate) : null,
        copayAmount || 0,
        deductibleAmount || 0,
        coveragePercentage || 100,
        isPrimary ? 1 : 0
      ]
    );

    logger.info(`Insurance added for patient ${patientId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Insurance information added successfully',
      insuranceId
    });

  } catch (error) {
    logger.error('Add patient insurance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding insurance information'
    });
  }
});

// @route   GET /api/patients/:patientId/appointments
// @desc    Get patient appointments
// @access  Private (Staff only)
router.get('/:patientId/appointments', authenticate, authorize('receptionist', 'admin', 'doctor', 'nurse'), validatePatientId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { status, limit = 50 } = req.query;

    let whereClause = 'WHERE a.patient_id = ?';
    let params = [patientId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const appointments = await getAll(
      `SELECT 
        a.*, s.first_name as doctor_first_name, s.last_name as doctor_last_name,
        s.department, s.position
       FROM appointments a
       LEFT JOIN staff s ON a.staff_id = s.staff_id
       ${whereClause}
       ORDER BY a.appointment_date DESC, a.start_time DESC
       LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    logger.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving patient appointments'
    });
  }
});

// @route   GET /api/patients/:patientId/medical-history
// @desc    Get patient medical history
// @access  Private (Staff only)
router.get('/:patientId/medical-history', authenticate, authorize('doctor', 'nurse', 'admin'), validatePatientId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { limit = 100 } = req.query;

    // Get clinical notes
    const clinicalNotes = await getAll(
      `SELECT 
        cn.*, s.first_name as doctor_first_name, s.last_name as doctor_last_name
       FROM clinical_notes cn
       LEFT JOIN staff s ON cn.staff_id = s.staff_id
       WHERE cn.patient_id = ?
       ORDER BY cn.created_at DESC
       LIMIT ?`,
      [patientId, parseInt(limit)]
    );

    // Get prescriptions
    const prescriptions = await getAll(
      `SELECT 
        p.*, dm.drug_name, dm.generic_name, s.first_name as doctor_first_name, s.last_name as doctor_last_name
       FROM prescriptions p
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       LEFT JOIN staff s ON p.staff_id = s.staff_id
       WHERE p.patient_id = ?
       ORDER BY p.prescribed_at DESC
       LIMIT ?`,
      [patientId, parseInt(limit)]
    );

    // Get lab results
    const labResults = await getAll(
      `SELECT 
        lr.*, lo.test_type, lo.order_date
       FROM lab_results lr
       LEFT JOIN lab_orders lo ON lr.order_id = lo.order_id
       WHERE lo.patient_id = ?
       ORDER BY lr.result_date DESC, lr.result_time DESC
       LIMIT ?`,
      [patientId, parseInt(limit)]
    );

    res.json({
      success: true,
      medicalHistory: {
        clinicalNotes,
        prescriptions,
        labResults
      }
    });

  } catch (error) {
    logger.error('Get patient medical history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving medical history'
    });
  }
});

export default router;

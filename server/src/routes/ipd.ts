import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateAdmissionId,
  generateBedId,
  generateWardId,
  formatDate, 
  formatTime 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/ipd/wards
// @desc    Create a new ward
// @access  Private (Admin only)
router.post('/wards', authenticate, authorize('admin'), [
  require('express-validator').body('wardName').trim().isLength({ min: 1, max: 100 }).withMessage('Ward name is required'),
  require('express-validator').body('wardType').isIn(['general', 'icu', 'ccu', 'pediatric', 'maternity', 'surgical', 'medical']).withMessage('Valid ward type is required'),
  require('express-validator').body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { wardName, wardType, capacity } = req.body;

    // Generate ward ID
    const wardId = generateWardId();

    await runQuery(
      `INSERT INTO wards (ward_id, ward_name, ward_type, capacity, current_occupancy, is_active, created_at) 
       VALUES (?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP)`,
      [wardId, wardName, wardType, capacity]
    );

    logger.info(`Ward created: ${wardId} - ${wardName} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Ward created successfully',
      ward: {
        wardId,
        wardName,
        wardType,
        capacity,
        currentOccupancy: 0
      }
    });

  } catch (error) {
    logger.error('Create ward error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating ward'
    });
  }
});

// @route   GET /api/ipd/wards
// @desc    Get all wards
// @access  Private (Staff only)
router.get('/wards', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wardType, isActive } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (wardType) {
      whereClause += ' AND ward_type = ?';
      params.push(wardType);
    }

    if (isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const wards = await getAll(
      `SELECT w.*, 
        COUNT(b.bed_id) as total_beds,
        COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available_beds,
        COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied_beds
       FROM wards w
       LEFT JOIN beds b ON w.ward_id = b.ward_id AND b.is_active = 1
       ${whereClause}
       GROUP BY w.ward_id
       ORDER BY w.ward_name`,
      params
    );

    res.json({
      success: true,
      wards
    });

  } catch (error) {
    logger.error('Get wards error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving wards'
    });
  }
});

// @route   POST /api/ipd/beds
// @desc    Create a new bed
// @access  Private (Admin only)
router.post('/beds', authenticate, authorize('admin'), [
  require('express-validator').body('wardId').trim().isLength({ min: 1 }).withMessage('Ward ID is required'),
  require('express-validator').body('bedNumber').trim().isLength({ min: 1, max: 20 }).withMessage('Bed number is required'),
  require('express-validator').body('bedType').isIn(['standard', 'private', 'semi_private', 'icu', 'isolation']).withMessage('Valid bed type is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { wardId, bedNumber, bedType, dailyRate } = req.body;

    // Check if ward exists
    const ward = await getRow(
      'SELECT ward_id, ward_name FROM wards WHERE ward_id = ? AND is_active = 1',
      [wardId]
    );

    if (!ward) {
      return res.status(404).json({
        success: false,
        error: 'Ward not found or inactive'
      });
    }

    // Check if bed number already exists in ward
    const existingBed = await getRow(
      'SELECT bed_id FROM beds WHERE ward_id = ? AND bed_number = ?',
      [wardId, bedNumber]
    );

    if (existingBed) {
      return res.status(400).json({
        success: false,
        error: 'Bed number already exists in this ward'
      });
    }

    // Generate bed ID
    const bedId = generateBedId();

    await runQuery(
      `INSERT INTO beds (bed_id, ward_id, bed_number, bed_type, status, daily_rate, is_active, created_at) 
       VALUES (?, ?, ?, ?, 'available', ?, 1, CURRENT_TIMESTAMP)`,
      [bedId, wardId, bedNumber, bedType, dailyRate || 0]
    );

    logger.info(`Bed created: ${bedId} - ${bedNumber} in ward ${wardId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Bed created successfully',
      bed: {
        bedId,
        wardId,
        bedNumber,
        bedType,
        status: 'available',
        dailyRate: dailyRate || 0
      }
    });

  } catch (error) {
    logger.error('Create bed error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating bed'
    });
  }
});

// @route   GET /api/ipd/beds
// @desc    Get beds with filters
// @access  Private (Staff only)
router.get('/beds', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wardId, bedType, status, isActive } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (wardId) {
      whereClause += ' AND b.ward_id = ?';
      params.push(wardId);
    }

    if (bedType) {
      whereClause += ' AND b.bed_type = ?';
      params.push(bedType);
    }

    if (status) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

    if (isActive !== undefined) {
      whereClause += ' AND b.is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const beds = await getAll(
      `SELECT 
        b.*, w.ward_name, w.ward_type,
        ia.admission_id, ia.patient_id, ia.admission_date, ia.status as admission_status,
        p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM beds b
       LEFT JOIN wards w ON b.ward_id = w.ward_id
       LEFT JOIN ipd_admissions ia ON b.bed_id = ia.bed_id AND ia.status = 'admitted'
       LEFT JOIN patients p ON ia.patient_id = p.patient_id
       ${whereClause}
       ORDER BY w.ward_name, b.bed_number`,
      params
    );

    res.json({
      success: true,
      beds
    });

  } catch (error) {
    logger.error('Get beds error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving beds'
    });
  }
});

// @route   POST /api/ipd/admissions
// @desc    Create a new IPD admission
// @access  Private (Doctor, Admin only)
router.post('/admissions', authenticate, authorize('doctor', 'admin'), [
  require('express-validator').body('patientId').trim().isLength({ min: 1 }).withMessage('Patient ID is required'),
  require('express-validator').body('bedId').trim().isLength({ min: 1 }).withMessage('Bed ID is required'),
  require('express-validator').body('admissionDate').isISO8601().withMessage('Valid admission date is required'),
  require('express-validator').body('admissionType').isIn(['emergency', 'elective', 'transfer']).withMessage('Valid admission type is required'),
  require('express-validator').body('admittingPhysician').trim().isLength({ min: 1 }).withMessage('Admitting physician is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      patientId,
      bedId,
      admissionDate,
      admissionTime,
      admissionType,
      admittingPhysician,
      diagnosis,
      admissionNotes
    } = req.body;

    // Check if patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
    }

    // Check if bed is available
    const bed = await getRow(
      `SELECT b.*, w.ward_name, w.ward_type 
       FROM beds b 
       LEFT JOIN wards w ON b.ward_id = w.ward_id 
       WHERE b.bed_id = ? AND b.status = 'available' AND b.is_active = 1`,
      [bedId]
    );

    if (!bed) {
      return res.status(404).json({
        success: false,
        error: 'Bed not found or not available'
      });
    }

    // Check if patient is already admitted
    const existingAdmission = await getRow(
      'SELECT admission_id FROM ipd_admissions WHERE patient_id = ? AND status = "admitted"',
      [patientId]
    );

    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        error: 'Patient is already admitted'
      });
    }

    // Generate admission ID
    const admissionId = generateAdmissionId();

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Create admission record
      await runQuery(
        `INSERT INTO ipd_admissions (
          admission_id, patient_id, bed_id, admission_date, admission_time, admission_type,
          admitting_physician, diagnosis, admission_notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'admitted', CURRENT_TIMESTAMP)`,
        [
          admissionId,
          patientId,
          bedId,
          formatDate(admissionDate),
          admissionTime ? formatTime(admissionTime) : formatTime(new Date().toTimeString().slice(0, 8)),
          admissionType,
          admittingPhysician,
          diagnosis,
          admissionNotes
        ]
      );

      // Update bed status
      await runQuery(
        'UPDATE beds SET status = "occupied", updated_at = CURRENT_TIMESTAMP WHERE bed_id = ?',
        [bedId]
      );

      // Update ward occupancy
      await runQuery(
        'UPDATE wards SET current_occupancy = current_occupancy + 1, updated_at = CURRENT_TIMESTAMP WHERE ward_id = ?',
        [bed.ward_id]
      );

      await runQuery('COMMIT');

      logger.info(`IPD admission created: ${admissionId} for patient ${patientId} in bed ${bedId}`);

      res.status(201).json({
        success: true,
        message: 'Patient admitted successfully',
        admission: {
          admissionId,
          patientId,
          bedId,
          wardId: bed.ward_id,
          wardName: bed.ward_name,
          admissionDate,
          admissionType,
          status: 'admitted',
          patient: {
            firstName: patient.first_name,
            lastName: patient.last_name
          }
        }
      });

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Create IPD admission error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating IPD admission'
    });
  }
});

// @route   GET /api/ipd/admissions
// @desc    Get IPD admissions with filters
// @access  Private (Staff only)
router.get('/admissions', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      wardId,
      status,
      admissionType,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND ia.patient_id = ?';
      params.push(patientId);
    }

    if (wardId) {
      whereClause += ' AND b.ward_id = ?';
      params.push(wardId);
    }

    if (status) {
      whereClause += ' AND ia.status = ?';
      params.push(status);
    }

    if (admissionType) {
      whereClause += ' AND ia.admission_type = ?';
      params.push(admissionType);
    }

    if (startDate && endDate) {
      whereClause += ' AND ia.admission_date BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM ipd_admissions ia
       LEFT JOIN beds b ON ia.bed_id = b.bed_id
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get admissions
    const admissions = await getAll(
      `SELECT 
        ia.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender,
        b.bed_number, b.bed_type, b.daily_rate,
        w.ward_name, w.ward_type,
        s.first_name as doctor_first_name, s.last_name as doctor_last_name
       FROM ipd_admissions ia
       LEFT JOIN patients p ON ia.patient_id = p.patient_id
       LEFT JOIN beds b ON ia.bed_id = b.bed_id
       LEFT JOIN wards w ON b.ward_id = w.ward_id
       LEFT JOIN staff s ON ia.admitting_physician = s.staff_id
       ${whereClause}
       ORDER BY ia.admission_date DESC, ia.admission_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      admissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get IPD admissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving IPD admissions'
    });
  }
});

// @route   GET /api/ipd/admissions/:admissionId
// @desc    Get IPD admission by ID
// @access  Private (Staff only)
router.get('/admissions/:admissionId', authenticate, authorize('receptionist', 'nurse', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { admissionId } = req.params;

    const admission = await getRow(
      `SELECT 
        ia.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender, p.phone, p.email,
        b.bed_number, b.bed_type, b.daily_rate,
        w.ward_name, w.ward_type, w.ward_id,
        s.first_name as doctor_first_name, s.last_name as doctor_last_name, s.department
       FROM ipd_admissions ia
       LEFT JOIN patients p ON ia.patient_id = p.patient_id
       LEFT JOIN beds b ON ia.bed_id = b.bed_id
       LEFT JOIN wards w ON b.ward_id = w.ward_id
       LEFT JOIN staff s ON ia.admitting_physician = s.staff_id
       WHERE ia.admission_id = ?`,
      [admissionId]
    );

    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'IPD admission not found'
      });
    }

    res.json({
      success: true,
      admission
    });

  } catch (error) {
    logger.error('Get IPD admission error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving IPD admission'
    });
  }
});

// @route   PUT /api/ipd/admissions/:admissionId/discharge
// @desc    Discharge patient
// @access  Private (Doctor, Admin only)
router.put('/admissions/:admissionId/discharge', authenticate, authorize('doctor', 'admin'), validateId, [
  require('express-validator').body('dischargeDate').isISO8601().withMessage('Valid discharge date is required'),
  require('express-validator').body('dischargeStatus').isIn(['recovered', 'improved', 'transferred', 'ama', 'deceased']).withMessage('Valid discharge status is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { admissionId } = req.params;
    const { dischargeDate, dischargeTime, dischargeStatus, dischargeNotes } = req.body;

    const admission = await getRow(
      `SELECT ia.*, b.ward_id 
       FROM ipd_admissions ia 
       LEFT JOIN beds b ON ia.bed_id = b.bed_id 
       WHERE ia.admission_id = ? AND ia.status = 'admitted'`,
      [admissionId]
    );

    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Active admission not found'
      });
    }

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Update admission record
      await runQuery(
        `UPDATE ipd_admissions SET 
          discharge_date = ?, discharge_time = ?, discharge_status = ?, discharge_notes = ?,
          status = 'discharged', updated_at = CURRENT_TIMESTAMP 
         WHERE admission_id = ?`,
        [
          formatDate(dischargeDate),
          dischargeTime ? formatTime(dischargeTime) : formatTime(new Date().toTimeString().slice(0, 8)),
          dischargeStatus,
          dischargeNotes,
          admissionId
        ]
      );

      // Update bed status
      await runQuery(
        'UPDATE beds SET status = "available", updated_at = CURRENT_TIMESTAMP WHERE bed_id = ?',
        [admission.bed_id]
      );

      // Update ward occupancy
      await runQuery(
        'UPDATE wards SET current_occupancy = current_occupancy - 1, updated_at = CURRENT_TIMESTAMP WHERE ward_id = ?',
        [admission.ward_id]
      );

      await runQuery('COMMIT');

      logger.info(`Patient discharged: ${admissionId} by user ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Patient discharged successfully'
      });

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Discharge patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error discharging patient'
    });
  }
});

// @route   POST /api/ipd/nursing-care
// @desc    Record nursing care
// @access  Private (Nurse only)
router.post('/nursing-care', authenticate, authorize('nurse', 'admin'), [
  require('express-validator').body('admissionId').trim().isLength({ min: 1 }).withMessage('Admission ID is required'),
  require('express-validator').body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
  require('express-validator').body('careDate').isISO8601().withMessage('Valid care date is required'),
  require('express-validator').body('shift').isIn(['morning', 'afternoon', 'night']).withMessage('Valid shift is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      admissionId,
      staffId,
      careDate,
      shift,
      vitalSigns,
      careActivities,
      patientCondition,
      medicationsGiven,
      notes
    } = req.body;

    // Check if admission exists
    const admission = await getRow(
      'SELECT admission_id FROM ipd_admissions WHERE admission_id = ? AND status = "admitted"',
      [admissionId]
    );

    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Active admission not found'
      });
    }

    // Generate care ID
    const careId = generateId('CARE', 6);

    await runQuery(
      `INSERT INTO nursing_care (
        care_id, admission_id, staff_id, care_date, shift, vital_signs,
        care_activities, patient_condition, medications_given, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        careId,
        admissionId,
        staffId,
        formatDate(careDate),
        shift,
        vitalSigns ? JSON.stringify(vitalSigns) : null,
        careActivities,
        patientCondition,
        medicationsGiven,
        notes
      ]
    );

    logger.info(`Nursing care recorded: ${careId} for admission ${admissionId} by nurse ${staffId}`);

    res.status(201).json({
      success: true,
      message: 'Nursing care recorded successfully',
      care: {
        careId,
        admissionId,
        staffId,
        careDate,
        shift
      }
    });

  } catch (error) {
    logger.error('Record nursing care error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error recording nursing care'
    });
  }
});

// @route   GET /api/ipd/nursing-care/:admissionId
// @desc    Get nursing care records for admission
// @access  Private (Staff only)
router.get('/nursing-care/:admissionId', authenticate, authorize('nurse', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { admissionId } = req.params;
    const { limit = 50 } = req.query;

    const nursingCare = await getAll(
      `SELECT 
        nc.*, s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM nursing_care nc
       LEFT JOIN staff s ON nc.staff_id = s.staff_id
       WHERE nc.admission_id = ?
       ORDER BY nc.care_date DESC, nc.created_at DESC
       LIMIT ?`,
      [admissionId, parseInt(limit)]
    );

    // Parse vital signs JSON
    const nursingCareWithParsedData = nursingCare.map(care => ({
      ...care,
      vitalSigns: care.vital_signs ? JSON.parse(care.vital_signs) : null
    }));

    res.json({
      success: true,
      nursingCare: nursingCareWithParsedData
    });

  } catch (error) {
    logger.error('Get nursing care error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving nursing care'
    });
  }
});

// @route   GET /api/ipd/stats
// @desc    Get IPD statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE ia.admission_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get admission statistics
    const admissionStats = await getRow(
      `SELECT 
        COUNT(*) as total_admissions,
        COUNT(CASE WHEN ia.status = 'admitted' THEN 1 END) as current_admissions,
        COUNT(CASE WHEN ia.status = 'discharged' THEN 1 END) as discharged_admissions,
        COUNT(CASE WHEN ia.admission_type = 'emergency' THEN 1 END) as emergency_admissions,
        COUNT(CASE WHEN ia.admission_type = 'elective' THEN 1 END) as elective_admissions,
        AVG(CASE WHEN ia.discharge_date IS NOT NULL THEN 
          (julianday(ia.discharge_date) - julianday(ia.admission_date)) 
        END) as avg_length_of_stay_days
       FROM ipd_admissions ia
       ${dateFilter}`,
      params
    );

    // Get bed utilization statistics
    const bedStats = await getRow(
      `SELECT 
        COUNT(*) as total_beds,
        COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available_beds,
        COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied_beds,
        ROUND((COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) * 100.0 / COUNT(*)), 2) as occupancy_rate
       FROM beds b
       WHERE b.is_active = 1`
    );

    res.json({
      success: true,
      stats: {
        admissions: admissionStats,
        beds: bedStats
      }
    });

  } catch (error) {
    logger.error('Get IPD stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving IPD statistics'
    });
  }
});

export default router;

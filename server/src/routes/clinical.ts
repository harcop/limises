import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateClinicalNote, validatePrescription, validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateClinicalNoteId, 
  generatePrescriptionId,
  formatDate, 
  formatTime 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/clinical/notes
// @desc    Create a new clinical note
// @access  Private (Doctor, Nurse only)
router.post('/notes', authenticate, authorize('doctor', 'nurse', 'admin'), validateClinicalNote, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      staffId,
      appointmentId,
      noteType,
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      assessment,
      plan,
      vitalSigns
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

    // Check if staff exists
    const staff = await getRow(
      'SELECT staff_id, first_name, last_name FROM staff WHERE staff_id = ? AND status = "active"',
      [staffId]
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found or inactive'
      });
    }

    // Generate clinical note ID
    const noteId = generateClinicalNoteId();

    await runQuery(
      `INSERT INTO clinical_notes (
        note_id, patient_id, staff_id, appointment_id, note_type, chief_complaint,
        history_of_present_illness, physical_examination, assessment, plan, vital_signs,
        is_signed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [
        noteId,
        patientId,
        staffId,
        appointmentId || null,
        noteType,
        chiefComplaint,
        historyOfPresentIllness,
        physicalExamination,
        assessment,
        plan,
        vitalSigns ? JSON.stringify(vitalSigns) : null
      ]
    );

    logger.info(`Clinical note created: ${noteId} for patient ${patientId} by staff ${staffId}`);

    res.status(201).json({
      success: true,
      message: 'Clinical note created successfully',
      note: {
        noteId,
        patientId,
        staffId,
        appointmentId,
        noteType,
        isSigned: false
      }
    });

  } catch (error) {
    logger.error('Create clinical note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating clinical note'
    });
  }
});

// @route   GET /api/clinical/notes
// @desc    Get clinical notes with filters
// @access  Private (Doctor, Nurse only)
router.get('/notes', authenticate, authorize('doctor', 'nurse', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      staffId,
      noteType,
      isSigned,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND cn.patient_id = ?';
      params.push(patientId);
    }

    if (staffId) {
      whereClause += ' AND cn.staff_id = ?';
      params.push(staffId);
    }

    if (noteType) {
      whereClause += ' AND cn.note_type = ?';
      params.push(noteType);
    }

    if (isSigned !== undefined) {
      whereClause += ' AND cn.is_signed = ?';
      params.push(isSigned === 'true' ? 1 : 0);
    }

    if (startDate && endDate) {
      whereClause += ' AND DATE(cn.created_at) BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM clinical_notes cn
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get clinical notes
    const notes = await getAll(
      `SELECT 
        cn.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department
       FROM clinical_notes cn
       LEFT JOIN patients p ON cn.patient_id = p.patient_id
       LEFT JOIN staff s ON cn.staff_id = s.staff_id
       ${whereClause}
       ORDER BY cn.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Parse vital signs JSON
    const notesWithParsedData = notes.map(note => ({
      ...note,
      vitalSigns: note.vital_signs ? JSON.parse(note.vital_signs) : null
    }));

    res.json({
      success: true,
      notes: notesWithParsedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get clinical notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving clinical notes'
    });
  }
});

// @route   GET /api/clinical/notes/:noteId
// @desc    Get clinical note by ID
// @access  Private (Doctor, Nurse only)
router.get('/notes/:noteId', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    const note = await getRow(
      `SELECT 
        cn.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.date_of_birth, p.gender,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department, s.position
       FROM clinical_notes cn
       LEFT JOIN patients p ON cn.patient_id = p.patient_id
       LEFT JOIN staff s ON cn.staff_id = s.staff_id
       WHERE cn.note_id = ?`,
      [noteId]
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
    }

    // Parse vital signs JSON
    const noteWithParsedData = {
      ...note,
      vitalSigns: note.vital_signs ? JSON.parse(note.vital_signs) : null
    };

    res.json({
      success: true,
      note: noteWithParsedData
    });

  } catch (error) {
    logger.error('Get clinical note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving clinical note'
    });
  }
});

// @route   PUT /api/clinical/notes/:noteId
// @desc    Update clinical note
// @access  Private (Doctor, Nurse only)
router.put('/notes/:noteId', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const updates = req.body;

    // Check if note exists and is not signed
    const existingNote = await getRow(
      'SELECT * FROM clinical_notes WHERE note_id = ?',
      [noteId]
    );

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
    }

    if (existingNote.is_signed) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify signed clinical notes'
      });
    }

    // Check if user is the author
    if (existingNote.staff_id !== req.user.staffId && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can modify this clinical note'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'chiefComplaint', 'historyOfPresentIllness', 'physicalExamination', 
      'assessment', 'plan', 'vitalSigns'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        if (key === 'vitalSigns') {
          updateValues.push(JSON.stringify(value));
        } else {
          updateValues.push(value);
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
    updateValues.push(noteId);

    await runQuery(
      `UPDATE clinical_notes SET ${updateFields.join(', ')} WHERE note_id = ?`,
      updateValues
    );

    logger.info(`Clinical note ${noteId} updated by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Clinical note updated successfully'
    });

  } catch (error) {
    logger.error('Update clinical note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating clinical note'
    });
  }
});

// @route   POST /api/clinical/notes/:noteId/sign
// @desc    Sign clinical note
// @access  Private (Doctor, Nurse only)
router.post('/notes/:noteId/sign', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    const note = await getRow(
      'SELECT * FROM clinical_notes WHERE note_id = ?',
      [noteId]
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
    }

    if (note.is_signed) {
      return res.status(400).json({
        success: false,
        error: 'Clinical note is already signed'
      });
    }

    // Check if user is the author
    if (note.staff_id !== req.user.staffId && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can sign this clinical note'
      });
    }

    await runQuery(
      'UPDATE clinical_notes SET is_signed = 1, signed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE note_id = ?',
      [noteId]
    );

    logger.info(`Clinical note ${noteId} signed by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Clinical note signed successfully'
    });

  } catch (error) {
    logger.error('Sign clinical note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error signing clinical note'
    });
  }
});

// @route   POST /api/clinical/notes/:noteId/amendments
// @desc    Create clinical note amendment
// @access  Private (Doctor, Nurse only)
router.post('/notes/:noteId/amendments', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, [
  require('express-validator').body('amendmentReason').trim().isLength({ min: 1 }).withMessage('Amendment reason is required'),
  require('express-validator').body('amendmentText').trim().isLength({ min: 1 }).withMessage('Amendment text is required'),
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

    const { noteId } = req.params;
    const { amendmentReason, amendmentText } = req.body;

    const note = await getRow(
      'SELECT * FROM clinical_notes WHERE note_id = ?',
      [noteId]
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
    }

    // Check if user is the author
    if (note.staff_id !== req.user.staffId && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can create amendments for this clinical note'
      });
    }

    // Generate amendment ID
    const amendmentId = `AMEND-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await runQuery(
      `INSERT INTO clinical_note_amendments (
        amendment_id, note_id, staff_id, amendment_reason, amendment_text,
        is_signed, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [amendmentId, noteId, req.user.staffId, amendmentReason, amendmentText]
    );

    logger.info(`Clinical note amendment created: ${amendmentId} for note ${noteId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Clinical note amendment created successfully',
      amendment: {
        amendmentId,
        noteId,
        amendmentReason,
        isSigned: false
      }
    });

  } catch (error) {
    logger.error('Create clinical note amendment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating clinical note amendment'
    });
  }
});

// @route   GET /api/clinical/notes/:noteId/amendments
// @desc    Get clinical note amendments
// @access  Private (Doctor, Nurse only)
router.get('/notes/:noteId/amendments', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    const amendments = await getAll(
      `SELECT 
        cna.*, s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM clinical_note_amendments cna
       LEFT JOIN staff s ON cna.staff_id = s.staff_id
       WHERE cna.note_id = ?
       ORDER BY cna.created_at ASC`,
      [noteId]
    );

    res.json({
      success: true,
      amendments
    });

  } catch (error) {
    logger.error('Get clinical note amendments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving clinical note amendments'
    });
  }
});

// @route   POST /api/clinical/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor only)
router.post('/prescriptions', authenticate, authorize('doctor', 'admin'), validatePrescription, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      staffId,
      appointmentId,
      drugId,
      dosage,
      frequency,
      duration,
      quantity,
      refillsAllowed,
      instructions
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

    // Check if drug exists
    const drug = await getRow(
      'SELECT drug_id, drug_name, generic_name, is_controlled FROM drug_master WHERE drug_id = ? AND is_active = 1',
      [drugId]
    );

    if (!drug) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found or inactive'
      });
    }

    // Generate prescription ID
    const prescriptionId = generatePrescriptionId();

    await runQuery(
      `INSERT INTO prescriptions (
        prescription_id, patient_id, staff_id, appointment_id, drug_id, dosage,
        frequency, duration, quantity, refills_allowed, refills_used, instructions,
        is_active, prescribed_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_DATE, INTERVAL 1 YEAR))`,
      [
        prescriptionId,
        patientId,
        staffId,
        appointmentId || null,
        drugId,
        dosage,
        frequency,
        duration,
        quantity,
        refillsAllowed || 0,
        instructions
      ]
    );

    logger.info(`Prescription created: ${prescriptionId} for patient ${patientId} by doctor ${staffId}`);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: {
        prescriptionId,
        patientId,
        staffId,
        drugId,
        drugName: drug.drug_name,
        dosage,
        frequency,
        duration,
        quantity,
        refillsAllowed: refillsAllowed || 0,
        isControlled: drug.is_controlled
      }
    });

  } catch (error) {
    logger.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating prescription'
    });
  }
});

// @route   GET /api/clinical/prescriptions
// @desc    Get prescriptions with filters
// @access  Private (Doctor, Nurse, Pharmacist only)
router.get('/prescriptions', authenticate, authorize('doctor', 'nurse', 'pharmacist', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      staffId,
      drugId,
      isActive,
      startDate,
      endDate
    } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND p.patient_id = ?';
      params.push(patientId);
    }

    if (staffId) {
      whereClause += ' AND p.staff_id = ?';
      params.push(staffId);
    }

    if (drugId) {
      whereClause += ' AND p.drug_id = ?';
      params.push(drugId);
    }

    if (isActive !== undefined) {
      whereClause += ' AND p.is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    if (startDate && endDate) {
      whereClause += ' AND DATE(p.prescribed_at) BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM prescriptions p
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get prescriptions
    const prescriptions = await getAll(
      `SELECT 
        p.*, 
        pt.first_name as patient_first_name, pt.last_name as patient_last_name,
        s.first_name as staff_first_name, s.last_name as staff_last_name,
        dm.drug_name, dm.generic_name, dm.is_controlled
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN staff s ON p.staff_id = s.staff_id
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       ${whereClause}
       ORDER BY p.prescribed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving prescriptions'
    });
  }
});

// @route   GET /api/clinical/prescriptions/:prescriptionId
// @desc    Get prescription by ID
// @access  Private (Doctor, Nurse, Pharmacist only)
router.get('/prescriptions/:prescriptionId', authenticate, authorize('doctor', 'nurse', 'pharmacist', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await getRow(
      `SELECT 
        p.*, 
        pt.first_name as patient_first_name, pt.last_name as patient_last_name, pt.date_of_birth, pt.gender,
        s.first_name as staff_first_name, s.last_name as staff_last_name, s.department,
        dm.drug_name, dm.generic_name, dm.drug_class, dm.dosage_form, dm.strength, dm.is_controlled
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN staff s ON p.staff_id = s.staff_id
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       WHERE p.prescription_id = ?`,
      [prescriptionId]
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      prescription
    });

  } catch (error) {
    logger.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving prescription'
    });
  }
});

// @route   PUT /api/clinical/prescriptions/:prescriptionId/refill
// @desc    Process prescription refill
// @access  Private (Pharmacist, Doctor only)
router.put('/prescriptions/:prescriptionId/refill', authenticate, authorize('pharmacist', 'doctor', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prescriptionId } = req.params;
    const { quantity } = req.body;

    const prescription = await getRow(
      'SELECT * FROM prescriptions WHERE prescription_id = ? AND is_active = 1',
      [prescriptionId]
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found or inactive'
      });
    }

    // Check if refills are available
    if (prescription.refills_used >= prescription.refills_allowed) {
      return res.status(400).json({
        success: false,
        error: 'No refills remaining for this prescription'
      });
    }

    // Check if prescription has expired
    if (new Date() > new Date(prescription.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'Prescription has expired'
      });
    }

    const refillQuantity = quantity || prescription.quantity;

    // Update refill count
    await runQuery(
      'UPDATE prescriptions SET refills_used = refills_used + 1, updated_at = CURRENT_TIMESTAMP WHERE prescription_id = ?',
      [prescriptionId]
    );

    logger.info(`Prescription refill processed: ${prescriptionId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Prescription refill processed successfully',
      refill: {
        prescriptionId,
        quantity: refillQuantity,
        refillsUsed: prescription.refills_used + 1,
        refillsRemaining: prescription.refills_allowed - (prescription.refills_used + 1)
      }
    });

  } catch (error) {
    logger.error('Process prescription refill error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing prescription refill'
    });
  }
});

export default router;

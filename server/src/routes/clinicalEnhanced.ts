import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
import { 
  generateId,
  formatDate,
  sanitizeString
} from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

const router = express.Router();

// ==============================================
// CLINICAL NOTES MANAGEMENT
// ==============================================

// @route   POST /api/clinical/notes
// @desc    Create a new clinical note
// @access  Private (Medical Staff)
router.post('/notes', authenticate, authorize('doctor', 'nurse', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      appointmentId,
      noteType,
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      assessment,
      plan,
      vitalSigns,
      templateId
    } = req.body;

    // Validate patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
      return;
    }

    // Validate appointment if provided
    if (appointmentId) {
      const appointment = await getRow(
        'SELECT appointment_id FROM appointments WHERE appointment_id = ? AND patient_id = ?',
        [appointmentId, patientId]
      );

      if (!appointment) {
        res.status(404).json({
          success: false,
          error: 'Appointment not found for this patient'
        });
        return;
      }
    }

    // Generate note ID
    const noteId = generateId('NOTE', 6);

    await runQuery(
      `INSERT INTO clinical_notes (
        note_id, patient_id, staff_id, appointment_id, note_type,
        chief_complaint, history_of_present_illness, physical_examination,
        assessment, plan, vital_signs, is_signed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [
        noteId,
        patientId,
        req.user.staffId,
        appointmentId || null,
        noteType,
        sanitizeString(chiefComplaint),
        sanitizeString(historyOfPresentIllness),
        sanitizeString(physicalExamination),
        sanitizeString(assessment),
        sanitizeString(plan),
        vitalSigns ? JSON.stringify(vitalSigns) : null
      ]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        new_values, created_at
      ) VALUES (?, ?, ?, 'create', 'clinical_notes', ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        patientId,
        noteId,
        JSON.stringify({
          noteType,
          chiefComplaint,
          assessment,
          plan
        })
      ]
    );

    logger.info(`Clinical note created: ${noteId} for patient ${patientId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Clinical note created successfully',
      note: {
        noteId,
        patientId,
        noteType,
        isSigned: false,
        createdAt: new Date().toISOString()
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
// @access  Private (Medical Staff)
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

    // Get notes
    const notes = await getAll(
      `SELECT 
        cn.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name,
        s.first_name as staff_first_name, s.last_name as staff_last_name,
        s.department, s.position
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
// @access  Private (Medical Staff)
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
      res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
      return;
    }

    // Get amendments
    const amendments = await getAll(
      `SELECT 
        cna.*, s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM clinical_note_amendments cna
       LEFT JOIN staff s ON cna.staff_id = s.staff_id
       WHERE cna.note_id = ?
       ORDER BY cna.created_at DESC`,
      [noteId]
    );

    // Get signatures
    const signatures = await getAll(
      `SELECT 
        cns.*, s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM clinical_note_signatures cns
       LEFT JOIN staff s ON cns.staff_id = s.staff_id
       WHERE cns.note_id = ?
       ORDER BY cns.signature_timestamp DESC`,
      [noteId]
    );

    // Parse vital signs JSON
    const noteWithParsedData = {
      ...note,
      vitalSigns: note.vital_signs ? JSON.parse(note.vital_signs) : null,
      amendments,
      signatures
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
// @access  Private (Medical Staff)
router.put('/notes/:noteId', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const {
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      assessment,
      plan,
      vitalSigns
    } = req.body;

    // Check if note exists and is not signed
    const existingNote = await getRow(
      'SELECT * FROM clinical_notes WHERE note_id = ? AND is_signed = 0',
      [noteId]
    );

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Clinical note not found or already signed'
      });
      return;
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (chiefComplaint !== undefined) {
      updateFields.push('chief_complaint = ?');
      updateValues.push(sanitizeString(chiefComplaint));
    }

    if (historyOfPresentIllness !== undefined) {
      updateFields.push('history_of_present_illness = ?');
      updateValues.push(sanitizeString(historyOfPresentIllness));
    }

    if (physicalExamination !== undefined) {
      updateFields.push('physical_examination = ?');
      updateValues.push(sanitizeString(physicalExamination));
    }

    if (assessment !== undefined) {
      updateFields.push('assessment = ?');
      updateValues.push(sanitizeString(assessment));
    }

    if (plan !== undefined) {
      updateFields.push('plan = ?');
      updateValues.push(sanitizeString(plan));
    }

    if (vitalSigns !== undefined) {
      updateFields.push('vital_signs = ?');
      updateValues.push(JSON.stringify(vitalSigns));
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
      return;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(noteId);

    await runQuery(
      `UPDATE clinical_notes SET ${updateFields.join(', ')} WHERE note_id = ?`,
      updateValues
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        old_values, new_values, created_at
      ) VALUES (?, ?, ?, 'update', 'clinical_notes', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        existingNote.patient_id,
        noteId,
        JSON.stringify({
          chiefComplaint: existingNote.chief_complaint,
          assessment: existingNote.assessment,
          plan: existingNote.plan
        }),
        JSON.stringify({
          chiefComplaint,
          assessment,
          plan
        })
      ]
    );

    logger.info(`Clinical note updated: ${noteId} by staff ${req.user.staffId}`);

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
// @desc    Sign clinical note digitally
// @access  Private (Medical Staff)
router.post('/notes/:noteId/sign', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { signatureType = 'primary' } = req.body;

    // Check if note exists and is not already signed
    const note = await getRow(
      'SELECT * FROM clinical_notes WHERE note_id = ?',
      [noteId]
    );

    if (!note) {
      res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
      return;
    }

    if (note.is_signed) {
      res.status(400).json({
        success: false,
        error: 'Clinical note is already signed'
      });
      return;
    }

    // Generate signature ID
    const signatureId = generateId('SIG', 6);

    // Create digital signature record
    await runQuery(
      `INSERT INTO clinical_note_signatures (
        signature_id, note_id, staff_id, signature_type, digital_signature,
        certificate_hash, signature_timestamp, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP)`,
      [
        signatureId,
        noteId,
        req.user.staffId,
        signatureType,
        'DIGITAL_SIGNATURE_PLACEHOLDER', // In production, this would be a real digital signature
        'CERTIFICATE_HASH_PLACEHOLDER', // In production, this would be the actual certificate hash
        req.ip,
        req.get('User-Agent')
      ]
    );

    // Mark note as signed
    await runQuery(
      'UPDATE clinical_notes SET is_signed = 1, signed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE note_id = ?',
      [noteId]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        new_values, created_at
      ) VALUES (?, ?, ?, 'sign', 'clinical_notes', ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        note.patient_id,
        noteId,
        JSON.stringify({
          signatureType,
          signedAt: new Date().toISOString()
        })
      ]
    );

    logger.info(`Clinical note signed: ${noteId} by staff ${req.user.staffId}`);

    res.json({
      success: true,
      message: 'Clinical note signed successfully',
      signature: {
        signatureId,
        noteId,
        signatureType,
        signedAt: new Date().toISOString()
      }
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
// @desc    Create amendment to clinical note
// @access  Private (Medical Staff)
router.post('/notes/:noteId/amendments', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { amendmentReason, amendmentText } = req.body;

    // Check if note exists
    const note = await getRow(
      'SELECT * FROM clinical_notes WHERE note_id = ?',
      [noteId]
    );

    if (!note) {
      res.status(404).json({
        success: false,
        error: 'Clinical note not found'
      });
      return;
    }

    // Generate amendment ID
    const amendmentId = generateId('AMEND', 6);

    await runQuery(
      `INSERT INTO clinical_note_amendments (
        amendment_id, note_id, staff_id, amendment_reason, amendment_text,
        is_signed, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [
        amendmentId,
        noteId,
        req.user.staffId,
        sanitizeString(amendmentReason),
        sanitizeString(amendmentText)
      ]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        new_values, created_at
      ) VALUES (?, ?, ?, 'amend', 'clinical_notes', ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        note.patient_id,
        noteId,
        JSON.stringify({
          amendmentReason,
          amendmentText
        })
      ]
    );

    logger.info(`Clinical note amendment created: ${amendmentId} for note ${noteId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Amendment created successfully',
      amendment: {
        amendmentId,
        noteId,
        amendmentReason,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Create amendment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating amendment'
    });
  }
});

// ==============================================
// PRESCRIPTION MANAGEMENT
// ==============================================

// @route   POST /api/clinical/prescriptions
// @desc    Create a new prescription
// @access  Private (Medical Staff)
router.post('/prescriptions', authenticate, authorize('doctor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      appointmentId,
      drugId,
      dosage,
      frequency,
      duration,
      quantity,
      refillsAllowed,
      instructions
    } = req.body;

    // Validate patient exists
    const patient = await getRow(
      'SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found or inactive'
      });
      return;
    }

    // Validate drug exists
    const drug = await getRow(
      'SELECT drug_id, drug_name, is_controlled FROM drug_master WHERE drug_id = ? AND is_active = 1',
      [drugId]
    );

    if (!drug) {
      res.status(404).json({
        success: false,
        error: 'Drug not found or inactive'
      });
      return;
    }

    // Check for drug interactions
    const interactions = await getAll(
      `SELECT di.*, dm1.drug_name as drug1_name, dm2.drug_name as drug2_name
       FROM drug_interactions di
       LEFT JOIN drug_master dm1 ON di.drug1_id = dm1.drug_id
       LEFT JOIN drug_master dm2 ON di.drug2_id = dm2.drug_id
       WHERE (di.drug1_id = ? OR di.drug2_id = ?) AND di.is_active = 1`,
      [drugId, drugId]
    );

    // Check patient allergies
    const allergies = await getAll(
      `SELECT pa.* FROM patient_allergies pa
       WHERE pa.patient_id = ? AND pa.status = 'active'`,
      [patientId]
    );

    // Generate prescription ID
    const prescriptionId = generateId('RX', 6);

    await runQuery(
      `INSERT INTO prescriptions (
        prescription_id, patient_id, staff_id, appointment_id, drug_id,
        dosage, frequency, duration, quantity, refills_allowed, refills_used,
        instructions, is_active, prescribed_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, CURRENT_TIMESTAMP, DATE('now', '+1 year'))`,
      [
        prescriptionId,
        patientId,
        req.user.staffId,
        appointmentId || null,
        drugId,
        sanitizeString(dosage),
        sanitizeString(frequency),
        sanitizeString(duration),
        quantity,
        refillsAllowed || 0,
        sanitizeString(instructions)
      ]
    );

    // Create alerts for interactions and allergies
    if (interactions.length > 0) {
      for (const interaction of interactions) {
        await runQuery(
          `INSERT INTO prescription_alerts (
            alert_id, prescription_id, alert_type, alert_severity, alert_message, created_at
          ) VALUES (?, ?, 'drug_interaction', ?, ?, CURRENT_TIMESTAMP)`,
          [
            generateId('ALERT', 6),
            prescriptionId,
            interaction.severity_level,
            `Drug interaction: ${interaction.drug1_name} and ${interaction.drug2_name}. ${interaction.interaction_description}`
          ]
        );
      }
    }

    if (allergies.length > 0) {
      for (const allergy of allergies) {
        await runQuery(
          `INSERT INTO prescription_alerts (
            alert_id, prescription_id, alert_type, alert_severity, alert_message, created_at
          ) VALUES (?, ?, 'allergy', 'critical', ?, CURRENT_TIMESTAMP)`,
          [
            generateId('ALERT', 6),
            prescriptionId,
            `Patient has allergy to: ${allergy.allergen_name}. Reaction: ${allergy.reaction_type} (${allergy.severity})`
          ]
        );
      }
    }

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        new_values, created_at
      ) VALUES (?, ?, ?, 'create', 'prescriptions', ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        patientId,
        prescriptionId,
        JSON.stringify({
          drugId,
          dosage,
          frequency,
          duration,
          quantity
        })
      ]
    );

    logger.info(`Prescription created: ${prescriptionId} for patient ${patientId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: {
        prescriptionId,
        patientId,
        drugId,
        drugName: drug.drug_name,
        dosage,
        frequency,
        duration,
        quantity,
        refillsAllowed: refillsAllowed || 0,
        isControlled: drug.is_controlled,
        alerts: {
          interactions: interactions.length,
          allergies: allergies.length
        }
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
// @access  Private (Medical Staff)
router.get('/prescriptions', authenticate, authorize('doctor', 'nurse', 'pharmacist', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {
      patientId,
      staffId,
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
        dm.drug_name, dm.generic_name, dm.is_controlled,
        s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       LEFT JOIN staff s ON p.staff_id = s.staff_id
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

// ==============================================
// MEDICATION ADMINISTRATION
// ==============================================

// @route   POST /api/clinical/medications/administration
// @desc    Record medication administration
// @access  Private (Nursing Staff)
router.post('/medications/administration', authenticate, authorize('nurse', 'doctor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      prescriptionId,
      patientId,
      medicationName,
      dosage,
      route,
      scheduledTime,
      actualTime,
      administrationStatus,
      refusalReason,
      notes,
      vitalSigns,
      adverseReaction,
      adverseReactionDetails
    } = req.body;

    // Validate prescription exists
    const prescription = await getRow(
      `SELECT p.*, pt.first_name, pt.last_name, dm.drug_name
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       WHERE p.prescription_id = ? AND p.is_active = 1`,
      [prescriptionId]
    );

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: 'Prescription not found or inactive'
      });
      return;
    }

    // Generate administration ID
    const administrationId = generateId('ADMIN', 6);

    await runQuery(
      `INSERT INTO medication_administration (
        administration_id, prescription_id, patient_id, medication_name, dosage, route,
        scheduled_time, actual_time, administered_by, administration_status,
        refusal_reason, notes, vital_signs, adverse_reaction, adverse_reaction_details,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        administrationId,
        prescriptionId,
        patientId,
        sanitizeString(medicationName),
        sanitizeString(dosage),
        sanitizeString(route),
        scheduledTime,
        actualTime || new Date().toISOString(),
        req.user.staffId,
        administrationStatus,
        sanitizeString(refusalReason),
        sanitizeString(notes),
        vitalSigns ? JSON.stringify(vitalSigns) : null,
        adverseReaction || false,
        sanitizeString(adverseReactionDetails)
      ]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        new_values, created_at
      ) VALUES (?, ?, ?, 'create', 'medication_administration', ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        patientId,
        administrationId,
        JSON.stringify({
          medicationName,
          dosage,
          route,
          administrationStatus,
          adverseReaction
        })
      ]
    );

    logger.info(`Medication administration recorded: ${administrationId} for prescription ${prescriptionId} by staff ${req.user.staffId}`);

    res.status(201).json({
      success: true,
      message: 'Medication administration recorded successfully',
      administration: {
        administrationId,
        prescriptionId,
        patientId,
        medicationName,
        administrationStatus,
        administeredAt: actualTime || new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Record medication administration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error recording medication administration'
    });
  }
});

// ==============================================
// CLINICAL ALERTS
// ==============================================

// @route   GET /api/clinical/alerts
// @desc    Get active clinical alerts
// @access  Private (Medical Staff)
router.get('/alerts', authenticate, authorize('doctor', 'nurse', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId, alertType, alertSeverity } = req.query;

    let whereClause = 'WHERE ca.is_active = TRUE';
    let params = [];

    if (patientId) {
      whereClause += ' AND ca.patient_id = ?';
      params.push(patientId);
    }

    if (alertType) {
      whereClause += ' AND ca.alert_type = ?';
      params.push(alertType);
    }

    if (alertSeverity) {
      whereClause += ' AND ca.alert_severity = ?';
      params.push(alertSeverity);
    }

    const alerts = await getAll(
      `SELECT 
        ca.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM clinical_alerts ca
       LEFT JOIN patients p ON ca.patient_id = p.patient_id
       ${whereClause}
       ORDER BY ca.alert_severity DESC, ca.created_at DESC`,
      params
    );

    res.json({
      success: true,
      alerts
    });

  } catch (error) {
    logger.error('Get clinical alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving clinical alerts'
    });
  }
});

// @route   PUT /api/clinical/alerts/:alertId/acknowledge
// @desc    Acknowledge clinical alert
// @access  Private (Medical Staff)
router.put('/alerts/:alertId/acknowledge', authenticate, authorize('doctor', 'nurse', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertId } = req.params;

    const alert = await getRow(
      'SELECT * FROM clinical_alerts WHERE alert_id = ? AND is_active = TRUE',
      [alertId]
    );

    if (!alert) {
      res.status(404).json({
        success: false,
        error: 'Clinical alert not found or inactive'
      });
      return;
    }

    await runQuery(
      'UPDATE clinical_alerts SET is_acknowledged = 1, acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP WHERE alert_id = ?',
      [req.user.staffId, alertId]
    );

    // Log audit trail
    await runQuery(
      `INSERT INTO clinical_audit_log (
        audit_id, user_id, patient_id, action_type, table_name, record_id,
        new_values, created_at
      ) VALUES (?, ?, ?, 'acknowledge', 'clinical_alerts', ?, ?, CURRENT_TIMESTAMP)`,
      [
        generateId('AUDIT', 6),
        req.user.staffId,
        alert.patient_id,
        alertId,
        JSON.stringify({
          acknowledgedAt: new Date().toISOString()
        })
      ]
    );

    logger.info(`Clinical alert acknowledged: ${alertId} by staff ${req.user.staffId}`);

    res.json({
      success: true,
      message: 'Clinical alert acknowledged successfully'
    });

  } catch (error) {
    logger.error('Acknowledge clinical alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error acknowledging clinical alert'
    });
  }
});

// ==============================================
// CLINICAL QUALITY METRICS
// ==============================================

// @route   GET /api/clinical/quality/dashboard
// @desc    Get clinical quality dashboard data
// @access  Private (Admin, Manager)
router.get('/quality/dashboard', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE cqm.measurement_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get quality indicators with measurements
    const qualityData = await getAll(
      `SELECT 
        cqi.indicator_id, cqi.indicator_name, cqi.indicator_type, cqi.specialty,
        cqi.target_value, cqi.measurement_unit,
        COUNT(cqm.measurement_id) as total_measurements,
        AVG(cqm.measurement_value) as average_value,
        MIN(cqm.measurement_value) as min_value,
        MAX(cqm.measurement_value) as max_value
       FROM clinical_quality_indicators cqi
       LEFT JOIN clinical_quality_measurements cqm ON cqi.indicator_id = cqm.indicator_id
       ${dateFilter}
       WHERE cqi.is_active = TRUE
       GROUP BY cqi.indicator_id, cqi.indicator_name, cqi.indicator_type, cqi.specialty, cqi.target_value, cqi.measurement_unit
       ORDER BY cqi.indicator_name`,
      params
    );

    // Calculate target achievement
    const qualityMetrics = qualityData.map(metric => ({
      ...metric,
      targetAchievement: metric.target_value ? 
        ((metric.average_value / metric.target_value) * 100).toFixed(2) : null,
      targetStatus: metric.target_value ? 
        (metric.average_value >= metric.target_value ? 'Met' : 'Not Met') : 'N/A'
    }));

    res.json({
      success: true,
      qualityMetrics
    });

  } catch (error) {
    logger.error('Get clinical quality dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving clinical quality dashboard'
    });
  }
});

export default router;

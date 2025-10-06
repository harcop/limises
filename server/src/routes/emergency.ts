import express, { Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticateStaff, authorizeStaff, checkStaffPermission } from '../middleware/staffAuth';
import { runQuery, getRow, getAll } from '../database/connection';
import { generateId, formatDateTime, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest, ApiResponse, EmergencyVisit, AmbulanceService, EmergencyCall, DatabaseRow } from '../types';
import {
  validateId,
  validatePagination,
  validateDateRange
} from '../middleware/validation';

const router = express.Router();

// ==============================================
// EMERGENCY VISITS
// ==============================================

// @route   POST /api/emergency/visits
// @desc    Create a new emergency visit
// @access  Private (Emergency Staff)
router.post('/visits', authenticateStaff, checkStaffPermission('emergency.create'), async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyVisit>>): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const {
      patientId,
      triageLevel,
      chiefComplaint,
      vitalSigns,
      initialAssessment,
      treatmentPlan,
      disposition
    } = req.body;

    // Validate patient exists
    const patient = await getRow<DatabaseRow>('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    const visitId = generateId('EMV', 6);
    const visitDate = formatDateTime(new Date());
    const arrivalTime = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO emergency_visits (
        visit_id, patient_id, staff_id, visit_date, arrival_time, triage_level,
        chief_complaint, vital_signs, initial_assessment, treatment_plan, disposition,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitId, patientId, req.user!.staffId, visitDate, arrivalTime, triageLevel,
        sanitizeString(chiefComplaint), vitalSigns ? JSON.stringify(vitalSigns) : null,
        sanitizeString(initialAssessment), sanitizeString(treatmentPlan), disposition,
        'active', visitDate
      ]
    );

    // Get the created visit
    const newVisit = await getRow<DatabaseRow>(
      `SELECT ev.*, p.first_name, p.last_name, p.date_of_birth, p.gender
       FROM emergency_visits ev
       JOIN patients p ON ev.patient_id = p.patient_id
       WHERE ev.visit_id = ?`,
      [visitId]
    );

    res.status(201).json({
      success: true,
      message: 'Emergency visit created successfully',
      data: {
        visitId: newVisit!.visit_id,
        patientId: newVisit!.patient_id,
        staffId: newVisit!.staff_id,
        visitDate: newVisit!.visit_date,
        arrivalTime: newVisit!.arrival_time,
        triageLevel: newVisit!.triage_level,
        chiefComplaint: newVisit!.chief_complaint,
        vitalSigns: newVisit!.vital_signs,
        initialAssessment: newVisit!.initial_assessment,
        treatmentPlan: newVisit!.treatment_plan,
        disposition: newVisit!.disposition,
        dischargeTime: newVisit!.discharge_time,
        status: newVisit!.status,
        createdAt: newVisit!.created_at,
        updatedAt: newVisit!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create emergency visit error:', error);
    res.status(500).json({ success: false, error: 'Server error creating emergency visit' });
  }
});

// @route   GET /api/emergency/visits
// @desc    Get all emergency visits with pagination and filters
// @access  Private (Emergency Staff)
router.get('/visits', authenticateStaff, checkStaffPermission('emergency.read'), validatePagination, validateDateRange, async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyVisit[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    const triageLevel = req.query.triageLevel as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND DATE(ev.visit_date) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(ev.visit_date) <= ?';
      params.push(endDate);
    }
    if (status) {
      whereClause += ' AND ev.status = ?';
      params.push(status);
    }
    if (triageLevel) {
      whereClause += ' AND ev.triage_level = ?';
      params.push(triageLevel);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM emergency_visits ev ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get visits
    const visits = await getAll<DatabaseRow>(
      `SELECT ev.*, p.first_name, p.last_name, p.date_of_birth, p.gender,
              s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM emergency_visits ev
       JOIN patients p ON ev.patient_id = p.patient_id
       JOIN staff s ON ev.staff_id = s.staff_id
       ${whereClause}
       ORDER BY ev.visit_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedVisits = visits.map(visit => ({
      visitId: visit.visit_id,
      patientId: visit.patient_id,
      staffId: visit.staff_id,
      visitDate: visit.visit_date,
      arrivalTime: visit.arrival_time,
      triageLevel: visit.triage_level,
      chiefComplaint: visit.chief_complaint,
      vitalSigns: visit.vital_signs,
      initialAssessment: visit.initial_assessment,
      treatmentPlan: visit.treatment_plan,
      disposition: visit.disposition,
      dischargeTime: visit.discharge_time,
      status: visit.status,
      createdAt: visit.created_at,
      updatedAt: visit.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedVisits,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get emergency visits error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving emergency visits' });
  }
});

// @route   GET /api/emergency/visits/:id
// @desc    Get emergency visit by ID
// @access  Private (Emergency Staff)
router.get('/visits/:id', authenticateStaff, checkStaffPermission('emergency.read'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyVisit>>): Promise<void> => {
  try {
    const visitId = req.params.id;

    const visit = await getRow<DatabaseRow>(
      `SELECT ev.*, p.first_name, p.last_name, p.date_of_birth, p.gender,
              s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM emergency_visits ev
       JOIN patients p ON ev.patient_id = p.patient_id
       JOIN staff s ON ev.staff_id = s.staff_id
       WHERE ev.visit_id = ?`,
      [visitId]
    );

    if (!visit) {
      res.status(404).json({ success: false, error: 'Emergency visit not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        visitId: visit.visit_id,
        patientId: visit.patient_id,
        staffId: visit.staff_id,
        visitDate: visit.visit_date,
        arrivalTime: visit.arrival_time,
        triageLevel: visit.triage_level,
        chiefComplaint: visit.chief_complaint,
        vitalSigns: visit.vital_signs,
        initialAssessment: visit.initial_assessment,
        treatmentPlan: visit.treatment_plan,
        disposition: visit.disposition,
        dischargeTime: visit.discharge_time,
        status: visit.status,
        createdAt: visit.created_at,
        updatedAt: visit.updated_at
      }
    });
  } catch (error) {
    logger.error('Get emergency visit error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving emergency visit' });
  }
});

// @route   PUT /api/emergency/visits/:id
// @desc    Update emergency visit
// @access  Private (Emergency Staff)
router.put('/visits/:id', authenticateStaff, checkStaffPermission('emergency.update'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyVisit>>): Promise<void> => {
  try {
    const visitId = req.params.id;
    const {
      triageLevel,
      chiefComplaint,
      vitalSigns,
      initialAssessment,
      treatmentPlan,
      disposition,
      status
    } = req.body;

    // Check if visit exists
    const existingVisit = await getRow<DatabaseRow>('SELECT * FROM emergency_visits WHERE visit_id = ?', [visitId]);
    if (!existingVisit) {
      res.status(404).json({ success: false, error: 'Emergency visit not found' });
      return;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (triageLevel !== undefined) {
      updateFields.push('triage_level = ?');
      updateValues.push(triageLevel);
    }
    if (chiefComplaint !== undefined) {
      updateFields.push('chief_complaint = ?');
      updateValues.push(sanitizeString(chiefComplaint));
    }
    if (vitalSigns !== undefined) {
      updateFields.push('vital_signs = ?');
      updateValues.push(vitalSigns ? JSON.stringify(vitalSigns) : null);
    }
    if (initialAssessment !== undefined) {
      updateFields.push('initial_assessment = ?');
      updateValues.push(sanitizeString(initialAssessment));
    }
    if (treatmentPlan !== undefined) {
      updateFields.push('treatment_plan = ?');
      updateValues.push(sanitizeString(treatmentPlan));
    }
    if (disposition !== undefined) {
      updateFields.push('disposition = ?');
      updateValues.push(disposition);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    updateFields.push('updated_at = ?');
    updateValues.push(formatDateTime(new Date()));
    updateValues.push(visitId);

    await runQuery(
      `UPDATE emergency_visits SET ${updateFields.join(', ')} WHERE visit_id = ?`,
      updateValues
    );

    // Get updated visit
    const updatedVisit = await getRow<DatabaseRow>(
      `SELECT ev.*, p.first_name, p.last_name, p.date_of_birth, p.gender
       FROM emergency_visits ev
       JOIN patients p ON ev.patient_id = p.patient_id
       WHERE ev.visit_id = ?`,
      [visitId]
    );

    res.status(200).json({
      success: true,
      message: 'Emergency visit updated successfully',
      data: {
        visitId: updatedVisit!.visit_id,
        patientId: updatedVisit!.patient_id,
        staffId: updatedVisit!.staff_id,
        visitDate: updatedVisit!.visit_date,
        arrivalTime: updatedVisit!.arrival_time,
        triageLevel: updatedVisit!.triage_level,
        chiefComplaint: updatedVisit!.chief_complaint,
        vitalSigns: updatedVisit!.vital_signs,
        initialAssessment: updatedVisit!.initial_assessment,
        treatmentPlan: updatedVisit!.treatment_plan,
        disposition: updatedVisit!.disposition,
        dischargeTime: updatedVisit!.discharge_time,
        status: updatedVisit!.status,
        createdAt: updatedVisit!.created_at,
        updatedAt: updatedVisit!.updated_at
      }
    });
  } catch (error) {
    logger.error('Update emergency visit error:', error);
    res.status(500).json({ success: false, error: 'Server error updating emergency visit' });
  }
});

// ==============================================
// AMBULANCE SERVICES
// ==============================================

// @route   POST /api/emergency/ambulances
// @desc    Create a new ambulance service
// @access  Private (Admin)
router.post('/ambulances', authenticateStaff, authorizeStaff('admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<AmbulanceService>>): Promise<void> => {
  try {
    const {
      ambulanceNumber,
      driverName,
      driverLicense,
      paramedicName,
      paramedicLicense,
      vehicleType,
      equipmentList,
      location
    } = req.body;

    // Check if ambulance number already exists
    const existingAmbulance = await getRow<DatabaseRow>('SELECT * FROM ambulance_services WHERE ambulance_number = ?', [ambulanceNumber]);
    if (existingAmbulance) {
      res.status(400).json({ success: false, error: 'Ambulance number already exists' });
      return;
    }

    const serviceId = generateId('AMB', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO ambulance_services (
        service_id, ambulance_number, driver_name, driver_license, paramedic_name,
        paramedic_license, vehicle_type, equipment_list, status, location, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId, ambulanceNumber, sanitizeString(driverName), sanitizeString(driverLicense),
        sanitizeString(paramedicName), sanitizeString(paramedicLicense), vehicleType,
        equipmentList ? JSON.stringify(equipmentList) : null, 'available',
        sanitizeString(location), createdAt
      ]
    );

    // Get the created ambulance
    const newAmbulance = await getRow<DatabaseRow>('SELECT * FROM ambulance_services WHERE service_id = ?', [serviceId]);

    res.status(201).json({
      success: true,
      message: 'Ambulance service created successfully',
      data: {
        serviceId: newAmbulance!.service_id,
        ambulanceNumber: newAmbulance!.ambulance_number,
        driverName: newAmbulance!.driver_name,
        driverLicense: newAmbulance!.driver_license,
        paramedicName: newAmbulance!.paramedic_name,
        paramedicLicense: newAmbulance!.paramedic_license,
        vehicleType: newAmbulance!.vehicle_type,
        equipmentList: newAmbulance!.equipment_list,
        status: newAmbulance!.status,
        location: newAmbulance!.location,
        lastMaintenanceDate: newAmbulance!.last_maintenance_date,
        nextMaintenanceDate: newAmbulance!.next_maintenance_date,
        createdAt: newAmbulance!.created_at,
        updatedAt: newAmbulance!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create ambulance service error:', error);
    res.status(500).json({ success: false, error: 'Server error creating ambulance service' });
  }
});

// @route   GET /api/emergency/ambulances
// @desc    Get all ambulance services
// @access  Private (Emergency Staff)
router.get('/ambulances', authenticateStaff, checkStaffPermission('emergency.read'), async (req: StaffAuthRequest, res: Response<ApiResponse<AmbulanceService[]>>): Promise<void> => {
  try {
    const status = req.query.status as string;

    let whereClause = '';
    const params: any[] = [];

    if (status) {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    const ambulances = await getAll<DatabaseRow>(
      `SELECT * FROM ambulance_services ${whereClause} ORDER BY ambulance_number`,
      params
    );

    const formattedAmbulances = ambulances.map(ambulance => ({
      serviceId: ambulance.service_id,
      ambulanceNumber: ambulance.ambulance_number,
      driverName: ambulance.driver_name,
      driverLicense: ambulance.driver_license,
      paramedicName: ambulance.paramedic_name,
      paramedicLicense: ambulance.paramedic_license,
      vehicleType: ambulance.vehicle_type,
      equipmentList: ambulance.equipment_list,
      status: ambulance.status,
      location: ambulance.location,
      lastMaintenanceDate: ambulance.last_maintenance_date,
      nextMaintenanceDate: ambulance.next_maintenance_date,
      createdAt: ambulance.created_at,
      updatedAt: ambulance.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedAmbulances
    });
  } catch (error) {
    logger.error('Get ambulance services error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving ambulance services' });
  }
});

// ==============================================
// EMERGENCY CALLS
// ==============================================

// @route   POST /api/emergency/calls
// @desc    Create a new emergency call
// @access  Public (Emergency calls can be made by anyone)
router.post('/calls', async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyCall>>): Promise<void> => {
  try {
    const {
      callerName,
      callerPhone,
      patientName,
      patientAge,
      patientGender,
      emergencyType,
      location,
      description,
      priority
    } = req.body;

    const callId = generateId('EMC', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO emergency_calls (
        call_id, caller_name, caller_phone, patient_name, patient_age, patient_gender,
        emergency_type, location, description, priority, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        callId, sanitizeString(callerName), callerPhone, sanitizeString(patientName),
        patientAge, patientGender, emergencyType, sanitizeString(location),
        sanitizeString(description), priority, 'pending', createdAt
      ]
    );

    // Get the created call
    const newCall = await getRow<DatabaseRow>('SELECT * FROM emergency_calls WHERE call_id = ?', [callId]);

    res.status(201).json({
      success: true,
      message: 'Emergency call created successfully',
      data: {
        callId: newCall!.call_id,
        callerName: newCall!.caller_name,
        callerPhone: newCall!.caller_phone,
        patientName: newCall!.patient_name,
        patientAge: newCall!.patient_age,
        patientGender: newCall!.patient_gender,
        emergencyType: newCall!.emergency_type,
        location: newCall!.location,
        description: newCall!.description,
        priority: newCall!.priority,
        ambulanceId: newCall!.ambulance_id,
        dispatchTime: newCall!.dispatch_time,
        arrivalTime: newCall!.arrival_time,
        status: newCall!.status,
        createdAt: newCall!.created_at,
        updatedAt: newCall!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create emergency call error:', error);
    res.status(500).json({ success: false, error: 'Server error creating emergency call' });
  }
});

// @route   GET /api/emergency/calls
// @desc    Get all emergency calls
// @access  Private (Emergency Staff)
router.get('/calls', authenticateStaff, checkStaffPermission('emergency.read'), validatePagination, async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyCall[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const priority = req.query.priority as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM emergency_calls ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get calls
    const calls = await getAll<DatabaseRow>(
      `SELECT * FROM emergency_calls ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedCalls = calls.map(call => ({
      callId: call.call_id,
      callerName: call.caller_name,
      callerPhone: call.caller_phone,
      patientName: call.patient_name,
      patientAge: call.patient_age,
      patientGender: call.patient_gender,
      emergencyType: call.emergency_type,
      location: call.location,
      description: call.description,
      priority: call.priority,
      ambulanceId: call.ambulance_id,
      dispatchTime: call.dispatch_time,
      arrivalTime: call.arrival_time,
      status: call.status,
      createdAt: call.created_at,
      updatedAt: call.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedCalls,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get emergency calls error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving emergency calls' });
  }
});

// @route   PUT /api/emergency/calls/:id/dispatch
// @desc    Dispatch ambulance for emergency call
// @access  Private (Emergency Staff)
router.put('/calls/:id/dispatch', authenticateStaff, checkStaffPermission('emergency.dispatch'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<EmergencyCall>>): Promise<void> => {
  try {
    const callId = req.params.id;
    const { ambulanceId } = req.body;

    // Check if call exists
    const existingCall = await getRow<DatabaseRow>('SELECT * FROM emergency_calls WHERE call_id = ?', [callId]);
    if (!existingCall) {
      res.status(404).json({ success: false, error: 'Emergency call not found' });
      return;
    }

    // Check if ambulance is available
    if (ambulanceId) {
      const ambulance = await getRow<DatabaseRow>('SELECT * FROM ambulance_services WHERE service_id = ? AND status = ?', [ambulanceId, 'available']);
      if (!ambulance) {
        res.status(400).json({ success: false, error: 'Ambulance not available' });
        return;
      }

      // Update ambulance status
      await runQuery('UPDATE ambulance_services SET status = ? WHERE service_id = ?', ['on_call', ambulanceId]);
    }

    const dispatchTime = formatDateTime(new Date());

    // Update call status
    await runQuery(
      'UPDATE emergency_calls SET status = ?, ambulance_id = ?, dispatch_time = ?, updated_at = ? WHERE call_id = ?',
      ['dispatched', ambulanceId, dispatchTime, dispatchTime, callId]
    );

    // Get updated call
    const updatedCall = await getRow<DatabaseRow>('SELECT * FROM emergency_calls WHERE call_id = ?', [callId]);

    res.status(200).json({
      success: true,
      message: 'Ambulance dispatched successfully',
      data: {
        callId: updatedCall!.call_id,
        callerName: updatedCall!.caller_name,
        callerPhone: updatedCall!.caller_phone,
        patientName: updatedCall!.patient_name,
        patientAge: updatedCall!.patient_age,
        patientGender: updatedCall!.patient_gender,
        emergencyType: updatedCall!.emergency_type,
        location: updatedCall!.location,
        description: updatedCall!.description,
        priority: updatedCall!.priority,
        ambulanceId: updatedCall!.ambulance_id,
        dispatchTime: updatedCall!.dispatch_time,
        arrivalTime: updatedCall!.arrival_time,
        status: updatedCall!.status,
        createdAt: updatedCall!.created_at,
        updatedAt: updatedCall!.updated_at
      }
    });
  } catch (error) {
    logger.error('Dispatch ambulance error:', error);
    res.status(500).json({ success: false, error: 'Server error dispatching ambulance' });
  }
});

export default router;

import express, { Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticateStaff, authorizeStaff, checkStaffPermission } from '../middleware/staffAuth';
import { runQuery, getRow, getAll } from '../database/connection';
import { generateId, formatDateTime, formatDate, formatTime, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest, ApiResponse, OperationTheatre, SurgicalProcedure, OTSchedule, OTTeamAssignment, OTConsumable, DatabaseRow } from '../types';
import {
  validateId,
  validatePagination,
  validateDateRange
} from '../middleware/validation';

const router = express.Router();

// ==============================================
// OPERATION THEATRES
// ==============================================

// @route   POST /api/ot/theatres
// @desc    Create a new operation theatre
// @access  Private (Admin)
router.post('/theatres', authenticateStaff, authorizeStaff('admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<OperationTheatre>>): Promise<void> => {
  try {
    const {
      theatreName,
      theatreNumber,
      capacity,
      equipmentList,
      specializations,
      location
    } = req.body;

    // Check if theatre number already exists
    const existingTheatre = await getRow<DatabaseRow>('SELECT * FROM operation_theatres WHERE theatre_number = ?', [theatreNumber]);
    if (existingTheatre) {
      res.status(400).json({ success: false, error: 'Theatre number already exists' });
      return;
    }

    const theatreId = generateId('OT', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO operation_theatres (
        theatre_id, theatre_name, theatre_number, capacity, equipment_list,
        specializations, status, location, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        theatreId, sanitizeString(theatreName), theatreNumber, capacity || 1,
        equipmentList ? JSON.stringify(equipmentList) : null,
        specializations ? JSON.stringify(specializations) : null,
        'available', sanitizeString(location), createdAt
      ]
    );

    // Get the created theatre
    const newTheatre = await getRow<DatabaseRow>('SELECT * FROM operation_theatres WHERE theatre_id = ?', [theatreId]);

    res.status(201).json({
      success: true,
      message: 'Operation theatre created successfully',
      data: {
        theatreId: newTheatre!.theatre_id,
        theatreName: newTheatre!.theatre_name,
        theatreNumber: newTheatre!.theatre_number,
        capacity: newTheatre!.capacity,
        equipmentList: newTheatre!.equipment_list,
        specializations: newTheatre!.specializations,
        status: newTheatre!.status,
        location: newTheatre!.location,
        createdAt: newTheatre!.created_at,
        updatedAt: newTheatre!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create operation theatre error:', error);
    res.status(500).json({ success: false, error: 'Server error creating operation theatre' });
  }
});

// @route   GET /api/ot/theatres
// @desc    Get all operation theatres
// @access  Private (OT Staff)
router.get('/theatres', authenticateStaff, checkStaffPermission('ot.read'), async (req: StaffAuthRequest, res: Response<ApiResponse<OperationTheatre[]>>): Promise<void> => {
  try {
    const status = req.query.status as string;

    let whereClause = '';
    const params: any[] = [];

    if (status) {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    const theatres = await getAll<DatabaseRow>(
      `SELECT * FROM operation_theatres ${whereClause} ORDER BY theatre_number`,
      params
    );

    const formattedTheatres = theatres.map(theatre => ({
      theatreId: theatre.theatre_id,
      theatreName: theatre.theatre_name,
      theatreNumber: theatre.theatre_number,
      capacity: theatre.capacity,
      equipmentList: theatre.equipment_list,
      specializations: theatre.specializations,
      status: theatre.status,
      location: theatre.location,
      createdAt: theatre.created_at,
      updatedAt: theatre.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedTheatres
    });
  } catch (error) {
    logger.error('Get operation theatres error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving operation theatres' });
  }
});

// ==============================================
// SURGICAL PROCEDURES
// ==============================================

// @route   POST /api/ot/procedures
// @desc    Create a new surgical procedure
// @access  Private (Admin)
router.post('/procedures', authenticateStaff, authorizeStaff('admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<SurgicalProcedure>>): Promise<void> => {
  try {
    const {
      procedureName,
      procedureCode,
      category,
      estimatedDuration,
      description,
      requirements
    } = req.body;

    const procedureId = generateId('PROC', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO surgical_procedures (
        procedure_id, procedure_name, procedure_code, category, estimated_duration,
        description, requirements, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        procedureId, sanitizeString(procedureName), sanitizeString(procedureCode),
        category, estimatedDuration, sanitizeString(description),
        requirements ? JSON.stringify(requirements) : null, true, createdAt
      ]
    );

    // Get the created procedure
    const newProcedure = await getRow<DatabaseRow>('SELECT * FROM surgical_procedures WHERE procedure_id = ?', [procedureId]);

    res.status(201).json({
      success: true,
      message: 'Surgical procedure created successfully',
      data: {
        procedureId: newProcedure!.procedure_id,
        procedureName: newProcedure!.procedure_name,
        procedureCode: newProcedure!.procedure_code,
        category: newProcedure!.category,
        estimatedDuration: newProcedure!.estimated_duration,
        description: newProcedure!.description,
        requirements: newProcedure!.requirements,
        isActive: newProcedure!.is_active === 1,
        createdAt: newProcedure!.created_at,
        updatedAt: newProcedure!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create surgical procedure error:', error);
    res.status(500).json({ success: false, error: 'Server error creating surgical procedure' });
  }
});

// @route   GET /api/ot/procedures
// @desc    Get all surgical procedures
// @access  Private (OT Staff)
router.get('/procedures', authenticateStaff, checkStaffPermission('ot.read'), async (req: StaffAuthRequest, res: Response<ApiResponse<SurgicalProcedure[]>>): Promise<void> => {
  try {
    const category = req.query.category as string;
    const isActive = req.query.isActive as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    if (isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    const procedures = await getAll<DatabaseRow>(
      `SELECT * FROM surgical_procedures ${whereClause} ORDER BY procedure_name`,
      params
    );

    const formattedProcedures = procedures.map(procedure => ({
      procedureId: procedure.procedure_id,
      procedureName: procedure.procedure_name,
      procedureCode: procedure.procedure_code,
      category: procedure.category,
      estimatedDuration: procedure.estimated_duration,
      description: procedure.description,
      requirements: procedure.requirements,
      isActive: procedure.is_active === 1,
      createdAt: procedure.created_at,
      updatedAt: procedure.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedProcedures
    });
  } catch (error) {
    logger.error('Get surgical procedures error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving surgical procedures' });
  }
});

// ==============================================
// OT SCHEDULES
// ==============================================

// @route   POST /api/ot/schedules
// @desc    Create a new OT schedule
// @access  Private (OT Staff)
router.post('/schedules', authenticateStaff, checkStaffPermission('ot.create'), async (req: StaffAuthRequest, res: Response<ApiResponse<OTSchedule>>): Promise<void> => {
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
      theatreId,
      patientId,
      procedureId,
      surgeonId,
      anesthetistId,
      scheduledDate,
      startTime,
      endTime,
      notes
    } = req.body;

    // Validate theatre exists and is available
    const theatre = await getRow<DatabaseRow>('SELECT * FROM operation_theatres WHERE theatre_id = ? AND status = ?', [theatreId, 'available']);
    if (!theatre) {
      res.status(400).json({ success: false, error: 'Theatre not available' });
      return;
    }

    // Validate patient exists
    const patient = await getRow<DatabaseRow>('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    // Validate procedure exists
    const procedure = await getRow<DatabaseRow>('SELECT * FROM surgical_procedures WHERE procedure_id = ? AND is_active = 1', [procedureId]);
    if (!procedure) {
      res.status(404).json({ success: false, error: 'Surgical procedure not found' });
      return;
    }

    // Validate surgeon exists
    const surgeon = await getRow<DatabaseRow>('SELECT * FROM staff WHERE staff_id = ?', [surgeonId]);
    if (!surgeon) {
      res.status(404).json({ success: false, error: 'Surgeon not found' });
      return;
    }

    // Check for time conflicts
    const conflictingSchedule = await getRow<DatabaseRow>(
      `SELECT * FROM ot_schedules 
       WHERE theatre_id = ? AND scheduled_date = ? AND status != 'cancelled'
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [theatreId, scheduledDate, startTime, startTime, endTime, endTime]
    );

    if (conflictingSchedule) {
      res.status(400).json({ success: false, error: 'Time conflict with existing schedule' });
      return;
    }

    const scheduleId = generateId('OTS', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO ot_schedules (
        schedule_id, theatre_id, patient_id, procedure_id, surgeon_id, anesthetist_id,
        scheduled_date, start_time, end_time, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scheduleId, theatreId, patientId, procedureId, surgeonId, anesthetistId,
        scheduledDate, startTime, endTime, 'scheduled', sanitizeString(notes), createdAt
      ]
    );

    // Update theatre status to occupied
    await runQuery('UPDATE operation_theatres SET status = ? WHERE theatre_id = ?', ['occupied', theatreId]);

    // Get the created schedule
    const newSchedule = await getRow<DatabaseRow>(
      `SELECT ots.*, p.first_name, p.last_name, proc.procedure_name, s.first_name as surgeon_first_name, s.last_name as surgeon_last_name
       FROM ot_schedules ots
       JOIN patients p ON ots.patient_id = p.patient_id
       JOIN surgical_procedures proc ON ots.procedure_id = proc.procedure_id
       JOIN staff s ON ots.surgeon_id = s.staff_id
       WHERE ots.schedule_id = ?`,
      [scheduleId]
    );

    res.status(201).json({
      success: true,
      message: 'OT schedule created successfully',
      data: {
        scheduleId: newSchedule!.schedule_id,
        theatreId: newSchedule!.theatre_id,
        patientId: newSchedule!.patient_id,
        procedureId: newSchedule!.procedure_id,
        surgeonId: newSchedule!.surgeon_id,
        anesthetistId: newSchedule!.anesthetist_id,
        scheduledDate: newSchedule!.scheduled_date,
        startTime: newSchedule!.start_time,
        endTime: newSchedule!.end_time,
        status: newSchedule!.status,
        notes: newSchedule!.notes,
        preOpNotes: newSchedule!.pre_op_notes,
        postOpNotes: newSchedule!.post_op_notes,
        createdAt: newSchedule!.created_at,
        updatedAt: newSchedule!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create OT schedule error:', error);
    res.status(500).json({ success: false, error: 'Server error creating OT schedule' });
  }
});

// @route   GET /api/ot/schedules
// @desc    Get all OT schedules with pagination and filters
// @access  Private (OT Staff)
router.get('/schedules', authenticateStaff, checkStaffPermission('ot.read'), validatePagination, validateDateRange, async (req: StaffAuthRequest, res: Response<ApiResponse<OTSchedule[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    const theatreId = req.query.theatreId as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND ots.scheduled_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND ots.scheduled_date <= ?';
      params.push(endDate);
    }
    if (status) {
      whereClause += ' AND ots.status = ?';
      params.push(status);
    }
    if (theatreId) {
      whereClause += ' AND ots.theatre_id = ?';
      params.push(theatreId);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM ot_schedules ots ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get schedules
    const schedules = await getAll<DatabaseRow>(
      `SELECT ots.*, p.first_name, p.last_name, proc.procedure_name,
              s.first_name as surgeon_first_name, s.last_name as surgeon_last_name,
              ot.theatre_name, ot.theatre_number
       FROM ot_schedules ots
       JOIN patients p ON ots.patient_id = p.patient_id
       JOIN surgical_procedures proc ON ots.procedure_id = proc.procedure_id
       JOIN staff s ON ots.surgeon_id = s.staff_id
       JOIN operation_theatres ot ON ots.theatre_id = ot.theatre_id
       ${whereClause}
       ORDER BY ots.scheduled_date DESC, ots.start_time DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedSchedules = schedules.map(schedule => ({
      scheduleId: schedule.schedule_id,
      theatreId: schedule.theatre_id,
      patientId: schedule.patient_id,
      procedureId: schedule.procedure_id,
      surgeonId: schedule.surgeon_id,
      anesthetistId: schedule.anesthetist_id,
      scheduledDate: schedule.scheduled_date,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      status: schedule.status,
      notes: schedule.notes,
      preOpNotes: schedule.pre_op_notes,
      postOpNotes: schedule.post_op_notes,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedSchedules,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get OT schedules error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving OT schedules' });
  }
});

// @route   GET /api/ot/schedules/:id
// @desc    Get OT schedule by ID
// @access  Private (OT Staff)
router.get('/schedules/:id', authenticateStaff, checkStaffPermission('ot.read'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<OTSchedule>>): Promise<void> => {
  try {
    const scheduleId = req.params.id;

    const schedule = await getRow<DatabaseRow>(
      `SELECT ots.*, p.first_name, p.last_name, proc.procedure_name,
              s.first_name as surgeon_first_name, s.last_name as surgeon_last_name,
              ot.theatre_name, ot.theatre_number
       FROM ot_schedules ots
       JOIN patients p ON ots.patient_id = p.patient_id
       JOIN surgical_procedures proc ON ots.procedure_id = proc.procedure_id
       JOIN staff s ON ots.surgeon_id = s.staff_id
       JOIN operation_theatres ot ON ots.theatre_id = ot.theatre_id
       WHERE ots.schedule_id = ?`,
      [scheduleId]
    );

    if (!schedule) {
      res.status(404).json({ success: false, error: 'OT schedule not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        scheduleId: schedule.schedule_id,
        theatreId: schedule.theatre_id,
        patientId: schedule.patient_id,
        procedureId: schedule.procedure_id,
        surgeonId: schedule.surgeon_id,
        anesthetistId: schedule.anesthetist_id,
        scheduledDate: schedule.scheduled_date,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        status: schedule.status,
        notes: schedule.notes,
        preOpNotes: schedule.pre_op_notes,
        postOpNotes: schedule.post_op_notes,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at
      }
    });
  } catch (error) {
    logger.error('Get OT schedule error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving OT schedule' });
  }
});

// @route   PUT /api/ot/schedules/:id/status
// @desc    Update OT schedule status
// @access  Private (OT Staff)
router.put('/schedules/:id/status', authenticateStaff, checkStaffPermission('ot.update'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<OTSchedule>>): Promise<void> => {
  try {
    const scheduleId = req.params.id;
    const { status, preOpNotes, postOpNotes } = req.body;

    // Check if schedule exists
    const existingSchedule = await getRow<DatabaseRow>('SELECT * FROM ot_schedules WHERE schedule_id = ?', [scheduleId]);
    if (!existingSchedule) {
      res.status(404).json({ success: false, error: 'OT schedule not found' });
      return;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (preOpNotes !== undefined) {
      updateFields.push('pre_op_notes = ?');
      updateValues.push(sanitizeString(preOpNotes));
    }
    if (postOpNotes !== undefined) {
      updateFields.push('post_op_notes = ?');
      updateValues.push(sanitizeString(postOpNotes));
    }

    if (updateFields.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    updateFields.push('updated_at = ?');
    updateValues.push(formatDateTime(new Date()));
    updateValues.push(scheduleId);

    await runQuery(
      `UPDATE ot_schedules SET ${updateFields.join(', ')} WHERE schedule_id = ?`,
      updateValues
    );

    // If status is completed or cancelled, make theatre available
    if (status === 'completed' || status === 'cancelled') {
      await runQuery('UPDATE operation_theatres SET status = ? WHERE theatre_id = ?', ['available', existingSchedule.theatre_id]);
    }

    // Get updated schedule
    const updatedSchedule = await getRow<DatabaseRow>(
      `SELECT ots.*, p.first_name, p.last_name, proc.procedure_name,
              s.first_name as surgeon_first_name, s.last_name as surgeon_last_name,
              ot.theatre_name, ot.theatre_number
       FROM ot_schedules ots
       JOIN patients p ON ots.patient_id = p.patient_id
       JOIN surgical_procedures proc ON ots.procedure_id = proc.procedure_id
       JOIN staff s ON ots.surgeon_id = s.staff_id
       JOIN operation_theatres ot ON ots.theatre_id = ot.theatre_id
       WHERE ots.schedule_id = ?`,
      [scheduleId]
    );

    res.status(200).json({
      success: true,
      message: 'OT schedule status updated successfully',
      data: {
        scheduleId: updatedSchedule!.schedule_id,
        theatreId: updatedSchedule!.theatre_id,
        patientId: updatedSchedule!.patient_id,
        procedureId: updatedSchedule!.procedure_id,
        surgeonId: updatedSchedule!.surgeon_id,
        anesthetistId: updatedSchedule!.anesthetist_id,
        scheduledDate: updatedSchedule!.scheduled_date,
        startTime: updatedSchedule!.start_time,
        endTime: updatedSchedule!.end_time,
        status: updatedSchedule!.status,
        notes: updatedSchedule!.notes,
        preOpNotes: updatedSchedule!.pre_op_notes,
        postOpNotes: updatedSchedule!.post_op_notes,
        createdAt: updatedSchedule!.created_at,
        updatedAt: updatedSchedule!.updated_at
      }
    });
  } catch (error) {
    logger.error('Update OT schedule status error:', error);
    res.status(500).json({ success: false, error: 'Server error updating OT schedule status' });
  }
});

// ==============================================
// OT TEAM ASSIGNMENTS
// ==============================================

// @route   POST /api/ot/schedules/:id/team
// @desc    Assign team member to OT schedule
// @access  Private (OT Staff)
router.post('/schedules/:id/team', authenticateStaff, checkStaffPermission('ot.update'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<OTTeamAssignment>>): Promise<void> => {
  try {
    const scheduleId = req.params.id;
    const { staffId, role } = req.body;

    // Check if schedule exists
    const schedule = await getRow<DatabaseRow>('SELECT * FROM ot_schedules WHERE schedule_id = ?', [scheduleId]);
    if (!schedule) {
      res.status(404).json({ success: false, error: 'OT schedule not found' });
      return;
    }

    // Check if staff exists
    const staff = await getRow<DatabaseRow>('SELECT * FROM staff WHERE staff_id = ?', [staffId]);
    if (!staff) {
      res.status(404).json({ success: false, error: 'Staff member not found' });
      return;
    }

    // Check if already assigned
    const existingAssignment = await getRow<DatabaseRow>('SELECT * FROM ot_team_assignments WHERE schedule_id = ? AND staff_id = ?', [scheduleId, staffId]);
    if (existingAssignment) {
      res.status(400).json({ success: false, error: 'Staff member already assigned to this schedule' });
      return;
    }

    const assignmentId = generateId('OTA', 6);
    const assignedAt = formatDateTime(new Date());

    await runQuery(
      'INSERT INTO ot_team_assignments (assignment_id, schedule_id, staff_id, role, assigned_at) VALUES (?, ?, ?, ?, ?)',
      [assignmentId, scheduleId, staffId, role, assignedAt]
    );

    // Get the created assignment
    const newAssignment = await getRow<DatabaseRow>(
      `SELECT ota.*, s.first_name, s.last_name, s.department, s.position
       FROM ot_team_assignments ota
       JOIN staff s ON ota.staff_id = s.staff_id
       WHERE ota.assignment_id = ?`,
      [assignmentId]
    );

    res.status(201).json({
      success: true,
      message: 'Team member assigned successfully',
      data: {
        assignmentId: newAssignment!.assignment_id,
        scheduleId: newAssignment!.schedule_id,
        staffId: newAssignment!.staff_id,
        role: newAssignment!.role,
        assignedAt: newAssignment!.assigned_at
      }
    });
  } catch (error) {
    logger.error('Assign team member error:', error);
    res.status(500).json({ success: false, error: 'Server error assigning team member' });
  }
});

// @route   GET /api/ot/schedules/:id/team
// @desc    Get team assignments for OT schedule
// @access  Private (OT Staff)
router.get('/schedules/:id/team', authenticateStaff, checkStaffPermission('ot.read'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<OTTeamAssignment[]>>): Promise<void> => {
  try {
    const scheduleId = req.params.id;

    // Check if schedule exists
    const schedule = await getRow<DatabaseRow>('SELECT * FROM ot_schedules WHERE schedule_id = ?', [scheduleId]);
    if (!schedule) {
      res.status(404).json({ success: false, error: 'OT schedule not found' });
      return;
    }

    const assignments = await getAll<DatabaseRow>(
      `SELECT ota.*, s.first_name, s.last_name, s.department, s.position
       FROM ot_team_assignments ota
       JOIN staff s ON ota.staff_id = s.staff_id
       WHERE ota.schedule_id = ?
       ORDER BY ota.role, s.first_name`,
      [scheduleId]
    );

    const formattedAssignments = assignments.map(assignment => ({
      assignmentId: assignment.assignment_id,
      scheduleId: assignment.schedule_id,
      staffId: assignment.staff_id,
      role: assignment.role,
      assignedAt: assignment.assigned_at
    }));

    res.status(200).json({
      success: true,
      data: formattedAssignments
    });
  } catch (error) {
    logger.error('Get team assignments error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving team assignments' });
  }
});

export default router;

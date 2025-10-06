import express, { Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticateStaff, authorizeStaff, checkStaffPermission } from '../middleware/staffAuth';
import { runQuery, getRow, getAll } from '../database/connection';
import { generateId, formatDateTime, formatDate, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest, ApiResponse, EmployeeRecord, LeaveRequest, PerformanceReview, TrainingRecord, DatabaseRow } from '../types';
import {
  validateId,
  validatePagination,
  validateDateRange
} from '../middleware/validation';

const router = express.Router();

// ==============================================
// EMPLOYEE RECORDS
// ==============================================

// @route   POST /api/hr/employees
// @desc    Create a new employee record
// @access  Private (HR Admin)
router.post('/employees', authenticateStaff, authorizeStaff('hr_admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<EmployeeRecord>>): Promise<void> => {
  try {
    const {
      staffId,
      employeeNumber,
      hireDate,
      employmentType,
      jobTitle,
      department,
      managerId,
      salary,
      benefits,
      emergencyContact
    } = req.body;

    // Validate staff exists
    const staff = await getRow<DatabaseRow>('SELECT * FROM staff WHERE staff_id = ?', [staffId]);
    if (!staff) {
      res.status(404).json({ success: false, error: 'Staff member not found' });
      return;
    }

    // Check if employee record already exists
    const existingEmployee = await getRow<DatabaseRow>('SELECT * FROM employee_records WHERE staff_id = ?', [staffId]);
    if (existingEmployee) {
      res.status(400).json({ success: false, error: 'Employee record already exists for this staff member' });
      return;
    }

    // Check if employee number already exists
    if (employeeNumber) {
      const existingEmployeeNumber = await getRow<DatabaseRow>('SELECT * FROM employee_records WHERE employee_number = ?', [employeeNumber]);
      if (existingEmployeeNumber) {
        res.status(400).json({ success: false, error: 'Employee number already exists' });
        return;
      }
    }

    // Validate manager exists if provided
    if (managerId) {
      const manager = await getRow<DatabaseRow>('SELECT * FROM staff WHERE staff_id = ?', [managerId]);
      if (!manager) {
        res.status(404).json({ success: false, error: 'Manager not found' });
        return;
      }
    }

    const employeeId = generateId('EMP', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO employee_records (
        employee_id, staff_id, employee_number, hire_date, employment_type,
        job_title, department, manager_id, salary, benefits, emergency_contact,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId, staffId, employeeNumber, hireDate, employmentType,
        sanitizeString(jobTitle), sanitizeString(department), managerId, salary,
        benefits ? JSON.stringify(benefits) : null,
        emergencyContact ? JSON.stringify(emergencyContact) : null,
        'active', createdAt
      ]
    );

    // Get the created employee record
    const newEmployee = await getRow<DatabaseRow>(
      `SELECT er.*, s.first_name, s.last_name, s.email, s.phone,
              m.first_name as manager_first_name, m.last_name as manager_last_name
       FROM employee_records er
       JOIN staff s ON er.staff_id = s.staff_id
       LEFT JOIN staff m ON er.manager_id = m.staff_id
       WHERE er.employee_id = ?`,
      [employeeId]
    );

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully',
      data: {
        employeeId: newEmployee!.employee_id,
        staffId: newEmployee!.staff_id,
        employeeNumber: newEmployee!.employee_number,
        hireDate: newEmployee!.hire_date,
        terminationDate: newEmployee!.termination_date,
        employmentType: newEmployee!.employment_type,
        jobTitle: newEmployee!.job_title,
        department: newEmployee!.department,
        managerId: newEmployee!.manager_id,
        salary: newEmployee!.salary,
        benefits: newEmployee!.benefits,
        emergencyContact: newEmployee!.emergency_contact,
        status: newEmployee!.status,
        createdAt: newEmployee!.created_at,
        updatedAt: newEmployee!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create employee record error:', error);
    res.status(500).json({ success: false, error: 'Server error creating employee record' });
  }
});

// @route   GET /api/hr/employees
// @desc    Get all employee records with pagination and filters
// @access  Private (HR Staff)
router.get('/employees', authenticateStaff, checkStaffPermission('hr.read'), validatePagination, async (req: StaffAuthRequest, res: Response<ApiResponse<EmployeeRecord[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const department = req.query.department as string;
    const status = req.query.status as string;
    const employmentType = req.query.employmentType as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (department) {
      whereClause += ' AND er.department = ?';
      params.push(department);
    }
    if (status) {
      whereClause += ' AND er.status = ?';
      params.push(status);
    }
    if (employmentType) {
      whereClause += ' AND er.employment_type = ?';
      params.push(employmentType);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM employee_records er ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get employees
    const employees = await getAll<DatabaseRow>(
      `SELECT er.*, s.first_name, s.last_name, s.email, s.phone,
              m.first_name as manager_first_name, m.last_name as manager_last_name
       FROM employee_records er
       JOIN staff s ON er.staff_id = s.staff_id
       LEFT JOIN staff m ON er.manager_id = m.staff_id
       ${whereClause}
       ORDER BY s.last_name, s.first_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedEmployees = employees.map(employee => ({
      employeeId: employee.employee_id,
      staffId: employee.staff_id,
      employeeNumber: employee.employee_number,
      hireDate: employee.hire_date,
      terminationDate: employee.termination_date,
      employmentType: employee.employment_type,
      jobTitle: employee.job_title,
      department: employee.department,
      managerId: employee.manager_id,
      salary: employee.salary,
      benefits: employee.benefits,
      emergencyContact: employee.emergency_contact,
      status: employee.status,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedEmployees,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get employee records error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving employee records' });
  }
});

// ==============================================
// LEAVE REQUESTS
// ==============================================

// @route   POST /api/hr/leave-requests
// @desc    Create a new leave request
// @access  Private (All Staff)
router.post('/leave-requests', authenticateStaff, async (req: StaffAuthRequest, res: Response<ApiResponse<LeaveRequest>>): Promise<void> => {
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
      employeeId,
      leaveType,
      startDate,
      endDate,
      daysRequested,
      reason
    } = req.body;

    // Validate employee exists
    const employee = await getRow<DatabaseRow>('SELECT * FROM employee_records WHERE employee_id = ?', [employeeId]);
    if (!employee) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    // Check if user can create leave request for this employee
    if (req.user!.staffId !== employee.staff_id && !req.user!.roles.includes('hr_admin')) {
      res.status(403).json({ success: false, error: 'You can only create leave requests for yourself' });
      return;
    }

    // Check for overlapping leave requests
    const overlappingLeave = await getRow<DatabaseRow>(
      `SELECT * FROM leave_requests 
       WHERE employee_id = ? AND status IN ('pending', 'approved')
       AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))`,
      [employeeId, startDate, startDate, endDate, endDate]
    );

    if (overlappingLeave) {
      res.status(400).json({ success: false, error: 'Overlapping leave request already exists' });
      return;
    }

    const leaveId = generateId('LEV', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO leave_requests (
        leave_id, employee_id, leave_type, start_date, end_date, days_requested,
        reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leaveId, employeeId, leaveType, startDate, endDate, daysRequested,
        sanitizeString(reason), 'pending', createdAt
      ]
    );

    // Get the created leave request
    const newLeaveRequest = await getRow<DatabaseRow>(
      `SELECT lr.*, er.staff_id, s.first_name, s.last_name
       FROM leave_requests lr
       JOIN employee_records er ON lr.employee_id = er.employee_id
       JOIN staff s ON er.staff_id = s.staff_id
       WHERE lr.leave_id = ?`,
      [leaveId]
    );

    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: {
        leaveId: newLeaveRequest!.leave_id,
        employeeId: newLeaveRequest!.employee_id,
        leaveType: newLeaveRequest!.leave_type,
        startDate: newLeaveRequest!.start_date,
        endDate: newLeaveRequest!.end_date,
        daysRequested: newLeaveRequest!.days_requested,
        reason: newLeaveRequest!.reason,
        status: newLeaveRequest!.status,
        approvedBy: newLeaveRequest!.approved_by,
        approvedAt: newLeaveRequest!.approved_at,
        comments: newLeaveRequest!.comments,
        createdAt: newLeaveRequest!.created_at,
        updatedAt: newLeaveRequest!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create leave request error:', error);
    res.status(500).json({ success: false, error: 'Server error creating leave request' });
  }
});

// @route   GET /api/hr/leave-requests
// @desc    Get all leave requests with pagination and filters
// @access  Private (HR Staff)
router.get('/leave-requests', authenticateStaff, checkStaffPermission('hr.read'), validatePagination, async (req: StaffAuthRequest, res: Response<ApiResponse<LeaveRequest[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const leaveType = req.query.leaveType as string;
    const employeeId = req.query.employeeId as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND lr.status = ?';
      params.push(status);
    }
    if (leaveType) {
      whereClause += ' AND lr.leave_type = ?';
      params.push(leaveType);
    }
    if (employeeId) {
      whereClause += ' AND lr.employee_id = ?';
      params.push(employeeId);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM leave_requests lr ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get leave requests
    const leaveRequests = await getAll<DatabaseRow>(
      `SELECT lr.*, er.staff_id, s.first_name, s.last_name, s.department,
              a.first_name as approver_first_name, a.last_name as approver_last_name
       FROM leave_requests lr
       JOIN employee_records er ON lr.employee_id = er.employee_id
       JOIN staff s ON er.staff_id = s.staff_id
       LEFT JOIN staff a ON lr.approved_by = a.staff_id
       ${whereClause}
       ORDER BY lr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedLeaveRequests = leaveRequests.map(leave => ({
      leaveId: leave.leave_id,
      employeeId: leave.employee_id,
      leaveType: leave.leave_type,
      startDate: leave.start_date,
      endDate: leave.end_date,
      daysRequested: leave.days_requested,
      reason: leave.reason,
      status: leave.status,
      approvedBy: leave.approved_by,
      approvedAt: leave.approved_at,
      comments: leave.comments,
      createdAt: leave.created_at,
      updatedAt: leave.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedLeaveRequests,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get leave requests error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving leave requests' });
  }
});

// @route   PUT /api/hr/leave-requests/:id/approve
// @desc    Approve or reject leave request
// @access  Private (HR Admin)
router.put('/leave-requests/:id/approve', authenticateStaff, authorizeStaff('hr_admin'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<LeaveRequest>>): Promise<void> => {
  try {
    const leaveId = req.params.id;
    const { status, comments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
      return;
    }

    // Check if leave request exists
    const existingLeave = await getRow<DatabaseRow>('SELECT * FROM leave_requests WHERE leave_id = ?', [leaveId]);
    if (!existingLeave) {
      res.status(404).json({ success: false, error: 'Leave request not found' });
      return;
    }

    if (existingLeave.status !== 'pending') {
      res.status(400).json({ success: false, error: 'Leave request has already been processed' });
      return;
    }

    const approvedAt = formatDateTime(new Date());

    await runQuery(
      'UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = ?, comments = ?, updated_at = ? WHERE leave_id = ?',
      [status, req.user!.staffId, approvedAt, sanitizeString(comments), approvedAt, leaveId]
    );

    // Get updated leave request
    const updatedLeave = await getRow<DatabaseRow>(
      `SELECT lr.*, er.staff_id, s.first_name, s.last_name,
              a.first_name as approver_first_name, a.last_name as approver_last_name
       FROM leave_requests lr
       JOIN employee_records er ON lr.employee_id = er.employee_id
       JOIN staff s ON er.staff_id = s.staff_id
       LEFT JOIN staff a ON lr.approved_by = a.staff_id
       WHERE lr.leave_id = ?`,
      [leaveId]
    );

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: {
        leaveId: updatedLeave!.leave_id,
        employeeId: updatedLeave!.employee_id,
        leaveType: updatedLeave!.leave_type,
        startDate: updatedLeave!.start_date,
        endDate: updatedLeave!.end_date,
        daysRequested: updatedLeave!.days_requested,
        reason: updatedLeave!.reason,
        status: updatedLeave!.status,
        approvedBy: updatedLeave!.approved_by,
        approvedAt: updatedLeave!.approved_at,
        comments: updatedLeave!.comments,
        createdAt: updatedLeave!.created_at,
        updatedAt: updatedLeave!.updated_at
      }
    });
  } catch (error) {
    logger.error('Approve leave request error:', error);
    res.status(500).json({ success: false, error: 'Server error processing leave request' });
  }
});

// ==============================================
// PERFORMANCE REVIEWS
// ==============================================

// @route   POST /api/hr/performance-reviews
// @desc    Create a new performance review
// @access  Private (HR Admin)
router.post('/performance-reviews', authenticateStaff, authorizeStaff('hr_admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<PerformanceReview>>): Promise<void> => {
  try {
    const {
      employeeId,
      reviewPeriodStart,
      reviewPeriodEnd,
      overallRating,
      goalsAchieved,
      areasForImprovement,
      developmentPlan,
      comments
    } = req.body;

    // Validate employee exists
    const employee = await getRow<DatabaseRow>('SELECT * FROM employee_records WHERE employee_id = ?', [employeeId]);
    if (!employee) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    const reviewId = generateId('PRV', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO performance_reviews (
        review_id, employee_id, reviewer_id, review_period_start, review_period_end,
        overall_rating, goals_achieved, areas_for_improvement, development_plan,
        comments, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reviewId, employeeId, req.user!.staffId, reviewPeriodStart, reviewPeriodEnd,
        overallRating, sanitizeString(goalsAchieved), sanitizeString(areasForImprovement),
        sanitizeString(developmentPlan), sanitizeString(comments), 'draft', createdAt
      ]
    );

    // Get the created review
    const newReview = await getRow<DatabaseRow>(
      `SELECT pr.*, er.staff_id, s.first_name, s.last_name,
              r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
       FROM performance_reviews pr
       JOIN employee_records er ON pr.employee_id = er.employee_id
       JOIN staff s ON er.staff_id = s.staff_id
       JOIN staff r ON pr.reviewer_id = r.staff_id
       WHERE pr.review_id = ?`,
      [reviewId]
    );

    res.status(201).json({
      success: true,
      message: 'Performance review created successfully',
      data: {
        reviewId: newReview!.review_id,
        employeeId: newReview!.employee_id,
        reviewerId: newReview!.reviewer_id,
        reviewPeriodStart: newReview!.review_period_start,
        reviewPeriodEnd: newReview!.review_period_end,
        overallRating: newReview!.overall_rating,
        goalsAchieved: newReview!.goals_achieved,
        areasForImprovement: newReview!.areas_for_improvement,
        developmentPlan: newReview!.development_plan,
        comments: newReview!.comments,
        status: newReview!.status,
        createdAt: newReview!.created_at,
        updatedAt: newReview!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create performance review error:', error);
    res.status(500).json({ success: false, error: 'Server error creating performance review' });
  }
});

// ==============================================
// TRAINING RECORDS
// ==============================================

// @route   POST /api/hr/training-records
// @desc    Create a new training record
// @access  Private (HR Staff)
router.post('/training-records', authenticateStaff, checkStaffPermission('hr.create'), async (req: StaffAuthRequest, res: Response<ApiResponse<TrainingRecord>>): Promise<void> => {
  try {
    const {
      employeeId,
      trainingName,
      trainingType,
      provider,
      startDate,
      endDate,
      completionDate,
      score,
      certificateNumber,
      expiryDate,
      notes
    } = req.body;

    // Validate employee exists
    const employee = await getRow<DatabaseRow>('SELECT * FROM employee_records WHERE employee_id = ?', [employeeId]);
    if (!employee) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    const trainingId = generateId('TRN', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO training_records (
        training_id, employee_id, training_name, training_type, provider,
        start_date, end_date, completion_date, status, score, certificate_number,
        expiry_date, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trainingId, employeeId, sanitizeString(trainingName), trainingType, sanitizeString(provider),
        startDate, endDate, completionDate, completionDate ? 'completed' : 'scheduled',
        score, sanitizeString(certificateNumber), expiryDate, sanitizeString(notes), createdAt
      ]
    );

    // Get the created training record
    const newTraining = await getRow<DatabaseRow>(
      `SELECT tr.*, er.staff_id, s.first_name, s.last_name
       FROM training_records tr
       JOIN employee_records er ON tr.employee_id = er.employee_id
       JOIN staff s ON er.staff_id = s.staff_id
       WHERE tr.training_id = ?`,
      [trainingId]
    );

    res.status(201).json({
      success: true,
      message: 'Training record created successfully',
      data: {
        trainingId: newTraining!.training_id,
        employeeId: newTraining!.employee_id,
        trainingName: newTraining!.training_name,
        trainingType: newTraining!.training_type,
        provider: newTraining!.provider,
        startDate: newTraining!.start_date,
        endDate: newTraining!.end_date,
        completionDate: newTraining!.completion_date,
        status: newTraining!.status,
        score: newTraining!.score,
        certificateNumber: newTraining!.certificate_number,
        expiryDate: newTraining!.expiry_date,
        notes: newTraining!.notes,
        createdAt: newTraining!.created_at,
        updatedAt: newTraining!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create training record error:', error);
    res.status(500).json({ success: false, error: 'Server error creating training record' });
  }
});

// @route   GET /api/hr/training-records
// @desc    Get all training records with pagination and filters
// @access  Private (HR Staff)
router.get('/training-records', authenticateStaff, checkStaffPermission('hr.read'), validatePagination, async (req: StaffAuthRequest, res: Response<ApiResponse<TrainingRecord[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const trainingType = req.query.trainingType as string;
    const employeeId = req.query.employeeId as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND tr.status = ?';
      params.push(status);
    }
    if (trainingType) {
      whereClause += ' AND tr.training_type = ?';
      params.push(trainingType);
    }
    if (employeeId) {
      whereClause += ' AND tr.employee_id = ?';
      params.push(employeeId);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM training_records tr ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get training records
    const trainingRecords = await getAll<DatabaseRow>(
      `SELECT tr.*, er.staff_id, s.first_name, s.last_name, s.department
       FROM training_records tr
       JOIN employee_records er ON tr.employee_id = er.employee_id
       JOIN staff s ON er.staff_id = s.staff_id
       ${whereClause}
       ORDER BY tr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedTrainingRecords = trainingRecords.map(training => ({
      trainingId: training.training_id,
      employeeId: training.employee_id,
      trainingName: training.training_name,
      trainingType: training.training_type,
      provider: training.provider,
      startDate: training.start_date,
      endDate: training.end_date,
      completionDate: training.completion_date,
      status: training.status,
      score: training.score,
      certificateNumber: training.certificate_number,
      expiryDate: training.expiry_date,
      notes: training.notes,
      createdAt: training.created_at,
      updatedAt: training.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedTrainingRecords,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get training records error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving training records' });
  }
});

export default router;

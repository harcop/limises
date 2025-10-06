import express, { Response } from 'express';
import { validationResult } from 'express-validator';
import { authenticateStaff, authorizeStaff, checkStaffPermission } from '../middleware/staffAuth';
import { runQuery, getRow, getAll } from '../database/connection';
import { generateId, formatDateTime, sanitizeString } from '../utils/helpers';
import { logger } from '../utils/logger';
import { StaffAuthRequest, ApiResponse, RadiologyOrder, RadiologyStudy, RadiologyEquipment, DatabaseRow } from '../types';
import {
  validateId,
  validatePagination,
  validateDateRange
} from '../middleware/validation';

const router = express.Router();

// ==============================================
// RADIOLOGY ORDERS
// ==============================================

// @route   POST /api/radiology/orders
// @desc    Create a new radiology order
// @access  Private (Medical Staff)
router.post('/orders', authenticateStaff, checkStaffPermission('radiology.create'), async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyOrder>>): Promise<void> => {
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
      studyType,
      bodyPart,
      clinicalIndication,
      priority,
      contrastRequired,
      contrastType,
      notes
    } = req.body;

    // Validate patient exists
    const patient = await getRow<DatabaseRow>('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
    if (!patient) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    const orderId = generateId('RAD', 6);
    const orderDate = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO radiology_orders (
        order_id, patient_id, staff_id, order_date, study_type, body_part,
        clinical_indication, priority, contrast_required, contrast_type, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, patientId, req.user!.staffId, orderDate, studyType, sanitizeString(bodyPart),
        sanitizeString(clinicalIndication), priority, contrastRequired || false,
        sanitizeString(contrastType), 'ordered', sanitizeString(notes), orderDate
      ]
    );

    // Get the created order
    const newOrder = await getRow<DatabaseRow>(
      `SELECT ro.*, p.first_name, p.last_name, p.date_of_birth, p.gender,
              s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM radiology_orders ro
       JOIN patients p ON ro.patient_id = p.patient_id
       JOIN staff s ON ro.staff_id = s.staff_id
       WHERE ro.order_id = ?`,
      [orderId]
    );

    res.status(201).json({
      success: true,
      message: 'Radiology order created successfully',
      data: {
        orderId: newOrder!.order_id,
        patientId: newOrder!.patient_id,
        staffId: newOrder!.staff_id,
        orderDate: newOrder!.order_date,
        studyType: newOrder!.study_type,
        bodyPart: newOrder!.body_part,
        clinicalIndication: newOrder!.clinical_indication,
        priority: newOrder!.priority,
        contrastRequired: newOrder!.contrast_required === 1,
        contrastType: newOrder!.contrast_type,
        status: newOrder!.status,
        notes: newOrder!.notes,
        createdAt: newOrder!.created_at,
        updatedAt: newOrder!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create radiology order error:', error);
    res.status(500).json({ success: false, error: 'Server error creating radiology order' });
  }
});

// @route   GET /api/radiology/orders
// @desc    Get all radiology orders with pagination and filters
// @access  Private (Radiology Staff)
router.get('/orders', authenticateStaff, checkStaffPermission('radiology.read'), validatePagination, validateDateRange, async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyOrder[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    const studyType = req.query.studyType as string;
    const priority = req.query.priority as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND DATE(ro.order_date) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(ro.order_date) <= ?';
      params.push(endDate);
    }
    if (status) {
      whereClause += ' AND ro.status = ?';
      params.push(status);
    }
    if (studyType) {
      whereClause += ' AND ro.study_type = ?';
      params.push(studyType);
    }
    if (priority) {
      whereClause += ' AND ro.priority = ?';
      params.push(priority);
    }

    // Get total count
    const countResult = await getRow<DatabaseRow>(
      `SELECT COUNT(*) as total FROM radiology_orders ro ${whereClause}`,
      params
    );
    const total = countResult?.total as number;

    // Get orders
    const orders = await getAll<DatabaseRow>(
      `SELECT ro.*, p.first_name, p.last_name, p.date_of_birth, p.gender,
              s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM radiology_orders ro
       JOIN patients p ON ro.patient_id = p.patient_id
       JOIN staff s ON ro.staff_id = s.staff_id
       ${whereClause}
       ORDER BY ro.order_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedOrders = orders.map(order => ({
      orderId: order.order_id,
      patientId: order.patient_id,
      staffId: order.staff_id,
      orderDate: order.order_date,
      studyType: order.study_type,
      bodyPart: order.body_part,
      clinicalIndication: order.clinical_indication,
      priority: order.priority,
      contrastRequired: order.contrast_required === 1,
      contrastType: order.contrast_type,
      status: order.status,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get radiology orders error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving radiology orders' });
  }
});

// @route   GET /api/radiology/orders/:id
// @desc    Get radiology order by ID
// @access  Private (Radiology Staff)
router.get('/orders/:id', authenticateStaff, checkStaffPermission('radiology.read'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyOrder>>): Promise<void> => {
  try {
    const orderId = req.params.id;

    const order = await getRow<DatabaseRow>(
      `SELECT ro.*, p.first_name, p.last_name, p.date_of_birth, p.gender,
              s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM radiology_orders ro
       JOIN patients p ON ro.patient_id = p.patient_id
       JOIN staff s ON ro.staff_id = s.staff_id
       WHERE ro.order_id = ?`,
      [orderId]
    );

    if (!order) {
      res.status(404).json({ success: false, error: 'Radiology order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.order_id,
        patientId: order.patient_id,
        staffId: order.staff_id,
        orderDate: order.order_date,
        studyType: order.study_type,
        bodyPart: order.body_part,
        clinicalIndication: order.clinical_indication,
        priority: order.priority,
        contrastRequired: order.contrast_required === 1,
        contrastType: order.contrast_type,
        status: order.status,
        notes: order.notes,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }
    });
  } catch (error) {
    logger.error('Get radiology order error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving radiology order' });
  }
});

// @route   PUT /api/radiology/orders/:id/status
// @desc    Update radiology order status
// @access  Private (Radiology Staff)
router.put('/orders/:id/status', authenticateStaff, checkStaffPermission('radiology.update'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyOrder>>): Promise<void> => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Check if order exists
    const existingOrder = await getRow<DatabaseRow>('SELECT * FROM radiology_orders WHERE order_id = ?', [orderId]);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Radiology order not found' });
      return;
    }

    const updatedAt = formatDateTime(new Date());

    await runQuery(
      'UPDATE radiology_orders SET status = ?, updated_at = ? WHERE order_id = ?',
      [status, updatedAt, orderId]
    );

    // Get updated order
    const updatedOrder = await getRow<DatabaseRow>(
      `SELECT ro.*, p.first_name, p.last_name, p.date_of_birth, p.gender,
              s.first_name as staff_first_name, s.last_name as staff_last_name
       FROM radiology_orders ro
       JOIN patients p ON ro.patient_id = p.patient_id
       JOIN staff s ON ro.staff_id = s.staff_id
       WHERE ro.order_id = ?`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      message: 'Radiology order status updated successfully',
      data: {
        orderId: updatedOrder!.order_id,
        patientId: updatedOrder!.patient_id,
        staffId: updatedOrder!.staff_id,
        orderDate: updatedOrder!.order_date,
        studyType: updatedOrder!.study_type,
        bodyPart: updatedOrder!.body_part,
        clinicalIndication: updatedOrder!.clinical_indication,
        priority: updatedOrder!.priority,
        contrastRequired: updatedOrder!.contrast_required === 1,
        contrastType: updatedOrder!.contrast_type,
        status: updatedOrder!.status,
        notes: updatedOrder!.notes,
        createdAt: updatedOrder!.created_at,
        updatedAt: updatedOrder!.updated_at
      }
    });
  } catch (error) {
    logger.error('Update radiology order status error:', error);
    res.status(500).json({ success: false, error: 'Server error updating radiology order status' });
  }
});

// ==============================================
// RADIOLOGY STUDIES
// ==============================================

// @route   POST /api/radiology/studies
// @desc    Create a new radiology study
// @access  Private (Radiology Staff)
router.post('/studies', authenticateStaff, checkStaffPermission('radiology.create'), async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyStudy>>): Promise<void> => {
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
      orderId,
      modality,
      bodyPart,
      technique,
      radiologistId,
      technologistId
    } = req.body;

    // Validate order exists
    const order = await getRow<DatabaseRow>('SELECT * FROM radiology_orders WHERE order_id = ?', [orderId]);
    if (!order) {
      res.status(404).json({ success: false, error: 'Radiology order not found' });
      return;
    }

    // Validate radiologist exists if provided
    if (radiologistId) {
      const radiologist = await getRow<DatabaseRow>('SELECT * FROM staff WHERE staff_id = ?', [radiologistId]);
      if (!radiologist) {
        res.status(404).json({ success: false, error: 'Radiologist not found' });
        return;
      }
    }

    // Validate technologist exists if provided
    if (technologistId) {
      const technologist = await getRow<DatabaseRow>('SELECT * FROM staff WHERE staff_id = ?', [technologistId]);
      if (!technologist) {
        res.status(404).json({ success: false, error: 'Technologist not found' });
        return;
      }
    }

    const studyId = generateId('RST', 6);
    const studyDate = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO radiology_studies (
        study_id, order_id, study_date, modality, body_part, technique,
        radiologist_id, technologist_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studyId, orderId, studyDate, sanitizeString(modality), sanitizeString(bodyPart),
        sanitizeString(technique), radiologistId, technologistId, 'scheduled', studyDate
      ]
    );

    // Update order status to scheduled
    await runQuery('UPDATE radiology_orders SET status = ?, updated_at = ? WHERE order_id = ?', ['scheduled', studyDate, orderId]);

    // Get the created study
    const newStudy = await getRow<DatabaseRow>(
      `SELECT rs.*, ro.patient_id, ro.study_type, ro.priority,
              p.first_name, p.last_name,
              r.first_name as radiologist_first_name, r.last_name as radiologist_last_name,
              t.first_name as technologist_first_name, t.last_name as technologist_last_name
       FROM radiology_studies rs
       JOIN radiology_orders ro ON rs.order_id = ro.order_id
       JOIN patients p ON ro.patient_id = p.patient_id
       LEFT JOIN staff r ON rs.radiologist_id = r.staff_id
       LEFT JOIN staff t ON rs.technologist_id = t.staff_id
       WHERE rs.study_id = ?`,
      [studyId]
    );

    res.status(201).json({
      success: true,
      message: 'Radiology study created successfully',
      data: {
        studyId: newStudy!.study_id,
        orderId: newStudy!.order_id,
        studyDate: newStudy!.study_date,
        modality: newStudy!.modality,
        bodyPart: newStudy!.body_part,
        technique: newStudy!.technique,
        findings: newStudy!.findings,
        impression: newStudy!.impression,
        recommendations: newStudy!.recommendations,
        radiologistId: newStudy!.radiologist_id,
        technologistId: newStudy!.technologist_id,
        status: newStudy!.status,
        createdAt: newStudy!.created_at,
        updatedAt: newStudy!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create radiology study error:', error);
    res.status(500).json({ success: false, error: 'Server error creating radiology study' });
  }
});

// @route   PUT /api/radiology/studies/:id/report
// @desc    Update radiology study with report
// @access  Private (Radiologist)
router.put('/studies/:id/report', authenticateStaff, checkStaffPermission('radiology.report'), validateId, async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyStudy>>): Promise<void> => {
  try {
    const studyId = req.params.id;
    const { findings, impression, recommendations } = req.body;

    // Check if study exists
    const existingStudy = await getRow<DatabaseRow>('SELECT * FROM radiology_studies WHERE study_id = ?', [studyId]);
    if (!existingStudy) {
      res.status(404).json({ success: false, error: 'Radiology study not found' });
      return;
    }

    const updatedAt = formatDateTime(new Date());

    await runQuery(
      `UPDATE radiology_studies SET 
       findings = ?, impression = ?, recommendations = ?, 
       radiologist_id = ?, status = ?, updated_at = ? 
       WHERE study_id = ?`,
      [
        sanitizeString(findings), sanitizeString(impression), sanitizeString(recommendations),
        req.user!.staffId, 'completed', updatedAt, studyId
      ]
    );

    // Update order status to completed
    await runQuery('UPDATE radiology_orders SET status = ?, updated_at = ? WHERE order_id = ?', ['completed', updatedAt, existingStudy.order_id]);

    // Get updated study
    const updatedStudy = await getRow<DatabaseRow>(
      `SELECT rs.*, ro.patient_id, ro.study_type, ro.priority,
              p.first_name, p.last_name,
              r.first_name as radiologist_first_name, r.last_name as radiologist_last_name,
              t.first_name as technologist_first_name, t.last_name as technologist_last_name
       FROM radiology_studies rs
       JOIN radiology_orders ro ON rs.order_id = ro.order_id
       JOIN patients p ON ro.patient_id = p.patient_id
       LEFT JOIN staff r ON rs.radiologist_id = r.staff_id
       LEFT JOIN staff t ON rs.technologist_id = t.staff_id
       WHERE rs.study_id = ?`,
      [studyId]
    );

    res.status(200).json({
      success: true,
      message: 'Radiology report completed successfully',
      data: {
        studyId: updatedStudy!.study_id,
        orderId: updatedStudy!.order_id,
        studyDate: updatedStudy!.study_date,
        modality: updatedStudy!.modality,
        bodyPart: updatedStudy!.body_part,
        technique: updatedStudy!.technique,
        findings: updatedStudy!.findings,
        impression: updatedStudy!.impression,
        recommendations: updatedStudy!.recommendations,
        radiologistId: updatedStudy!.radiologist_id,
        technologistId: updatedStudy!.technologist_id,
        status: updatedStudy!.status,
        createdAt: updatedStudy!.created_at,
        updatedAt: updatedStudy!.updated_at
      }
    });
  } catch (error) {
    logger.error('Update radiology study report error:', error);
    res.status(500).json({ success: false, error: 'Server error updating radiology study report' });
  }
});

// ==============================================
// RADIOLOGY EQUIPMENT
// ==============================================

// @route   POST /api/radiology/equipment
// @desc    Create a new radiology equipment record
// @access  Private (Admin)
router.post('/equipment', authenticateStaff, authorizeStaff('admin'), async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyEquipment>>): Promise<void> => {
  try {
    const {
      equipmentName,
      equipmentType,
      manufacturer,
      model,
      serialNumber,
      location
    } = req.body;

    const equipmentId = generateId('REQ', 6);
    const createdAt = formatDateTime(new Date());

    await runQuery(
      `INSERT INTO radiology_equipment (
        equipment_id, equipment_name, equipment_type, manufacturer, model,
        serial_number, location, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipmentId, sanitizeString(equipmentName), equipmentType,
        sanitizeString(manufacturer), sanitizeString(model), sanitizeString(serialNumber),
        sanitizeString(location), 'operational', createdAt
      ]
    );

    // Get the created equipment
    const newEquipment = await getRow<DatabaseRow>('SELECT * FROM radiology_equipment WHERE equipment_id = ?', [equipmentId]);

    res.status(201).json({
      success: true,
      message: 'Radiology equipment created successfully',
      data: {
        equipmentId: newEquipment!.equipment_id,
        equipmentName: newEquipment!.equipment_name,
        equipmentType: newEquipment!.equipment_type,
        manufacturer: newEquipment!.manufacturer,
        model: newEquipment!.model,
        serialNumber: newEquipment!.serial_number,
        location: newEquipment!.location,
        status: newEquipment!.status,
        lastMaintenanceDate: newEquipment!.last_maintenance_date,
        nextMaintenanceDate: newEquipment!.next_maintenance_date,
        createdAt: newEquipment!.created_at,
        updatedAt: newEquipment!.updated_at
      }
    });
  } catch (error) {
    logger.error('Create radiology equipment error:', error);
    res.status(500).json({ success: false, error: 'Server error creating radiology equipment' });
  }
});

// @route   GET /api/radiology/equipment
// @desc    Get all radiology equipment
// @access  Private (Radiology Staff)
router.get('/equipment', authenticateStaff, checkStaffPermission('radiology.read'), async (req: StaffAuthRequest, res: Response<ApiResponse<RadiologyEquipment[]>>): Promise<void> => {
  try {
    const equipmentType = req.query.equipmentType as string;
    const status = req.query.status as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (equipmentType) {
      whereClause += ' AND equipment_type = ?';
      params.push(equipmentType);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const equipment = await getAll<DatabaseRow>(
      `SELECT * FROM radiology_equipment ${whereClause} ORDER BY equipment_name`,
      params
    );

    const formattedEquipment = equipment.map(item => ({
      equipmentId: item.equipment_id,
      equipmentName: item.equipment_name,
      equipmentType: item.equipment_type,
      manufacturer: item.manufacturer,
      model: item.model,
      serialNumber: item.serial_number,
      location: item.location,
      status: item.status,
      lastMaintenanceDate: item.last_maintenance_date,
      nextMaintenanceDate: item.next_maintenance_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedEquipment
    });
  } catch (error) {
    logger.error('Get radiology equipment error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving radiology equipment' });
  }
});

export default router;

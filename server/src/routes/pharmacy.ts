import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateId, validatePagination } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
const { 
  generateId,
  formatDate, 
  formatTime 
} = require('../utils/helpers');
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   POST /api/pharmacy/drugs
// @desc    Add new drug to master database
// @access  Private (Admin, Pharmacist only)
router.post('/drugs', authenticate, authorize('admin', 'pharmacist'), [
  require('express-validator').body('drugName').trim().isLength({ min: 1, max: 200 }).withMessage('Drug name is required'),
  require('express-validator').body('genericName').optional().trim().isLength({ max: 200 }).withMessage('Generic name must be less than 200 characters'),
  require('express-validator').body('drugClass').optional().trim().isLength({ max: 100 }).withMessage('Drug class must be less than 100 characters'),
  require('express-validator').body('dosageForm').optional().trim().isLength({ max: 100 }).withMessage('Dosage form must be less than 100 characters'),
  require('express-validator').body('strength').optional().trim().isLength({ max: 100 }).withMessage('Strength must be less than 100 characters'),
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
      drugName,
      genericName,
      drugClass,
      dosageForm,
      strength,
      manufacturer,
      ndcNumber,
      isControlled,
      controlledSchedule
    } = req.body;

    // Check if drug already exists
    const existingDrug = await getRow(
      'SELECT drug_id FROM drug_master WHERE drug_name = ? OR ndc_number = ?',
      [drugName, ndcNumber]
    );

    if (existingDrug) {
      return res.status(400).json({
        success: false,
        error: 'Drug with this name or NDC number already exists'
      });
    }

    // Generate drug ID
    const drugId = generateId('DRUG', 6);

    await runQuery(
      `INSERT INTO drug_master (
        drug_id, drug_name, generic_name, drug_class, dosage_form, strength,
        manufacturer, ndc_number, is_controlled, controlled_schedule, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [
        drugId,
        drugName,
        genericName,
        drugClass,
        dosageForm,
        strength,
        manufacturer,
        ndcNumber,
        isControlled ? 1 : 0,
        controlledSchedule
      ]
    );

    logger.info(`Drug added to master database: ${drugId} - ${drugName} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Drug added successfully',
      drug: {
        drugId,
        drugName,
        genericName,
        drugClass,
        dosageForm,
        strength,
        manufacturer,
        ndcNumber,
        isControlled: isControlled || false
      }
    });

  } catch (error) {
    logger.error('Add drug error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding drug'
    });
  }
});

// @route   GET /api/pharmacy/drugs
// @desc    Get drugs from master database
// @access  Private (Staff only)
router.get('/drugs', authenticate, authorize('doctor', 'nurse', 'pharmacist', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { search, drugClass, isControlled, isActive } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (drug_name LIKE ? OR generic_name LIKE ? OR ndc_number LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (drugClass) {
      whereClause += ' AND drug_class = ?';
      params.push(drugClass);
    }

    if (isControlled !== undefined) {
      whereClause += ' AND is_controlled = ?';
      params.push(isControlled === 'true' ? 1 : 0);
    }

    if (isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total FROM drug_master ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get drugs
    const drugs = await getAll(
      `SELECT * FROM drug_master 
       ${whereClause}
       ORDER BY drug_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      drugs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get drugs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving drugs'
    });
  }
});

// @route   GET /api/pharmacy/drugs/:drugId
// @desc    Get drug by ID
// @access  Private (Staff only)
router.get('/drugs/:drugId', authenticate, authorize('doctor', 'nurse', 'pharmacist', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { drugId } = req.params;

    const drug = await getRow(
      'SELECT * FROM drug_master WHERE drug_id = ?',
      [drugId]
    );

    if (!drug) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found'
      });
    }

    res.json({
      success: true,
      drug
    });

  } catch (error) {
    logger.error('Get drug error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving drug'
    });
  }
});

// @route   POST /api/pharmacy/inventory
// @desc    Add drug to inventory
// @access  Private (Pharmacist, Admin only)
router.post('/inventory', authenticate, authorize('pharmacist', 'admin'), [
  require('express-validator').body('drugId').trim().isLength({ min: 1 }).withMessage('Drug ID is required'),
  require('express-validator').body('batchNumber').optional().trim().isLength({ max: 100 }).withMessage('Batch number must be less than 100 characters'),
  require('express-validator').body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  require('express-validator').body('quantityInStock').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  require('express-validator').body('unitCost').isDecimal().withMessage('Valid unit cost is required'),
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
      drugId,
      batchNumber,
      expiryDate,
      quantityInStock,
      reorderLevel,
      unitCost,
      sellingPrice,
      supplier,
      location
    } = req.body;

    // Check if drug exists
    const drug = await getRow(
      'SELECT drug_id, drug_name FROM drug_master WHERE drug_id = ? AND is_active = 1',
      [drugId]
    );

    if (!drug) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found or inactive'
      });
    }

    // Generate inventory ID
    const inventoryId = generateId('INV', 6);

    await runQuery(
      `INSERT INTO pharmacy_inventory (
        inventory_id, drug_id, batch_number, expiry_date, quantity_in_stock, reorder_level,
        unit_cost, selling_price, supplier, location, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', CURRENT_TIMESTAMP)`,
      [
        inventoryId,
        drugId,
        batchNumber,
        formatDate(expiryDate),
        quantityInStock,
        reorderLevel || 10,
        unitCost,
        sellingPrice || unitCost,
        supplier,
        location
      ]
    );

    logger.info(`Drug added to inventory: ${inventoryId} for drug ${drugId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Drug added to inventory successfully',
      inventory: {
        inventoryId,
        drugId,
        drugName: drug.drug_name,
        batchNumber,
        quantityInStock,
        unitCost,
        sellingPrice: sellingPrice || unitCost
      }
    });

  } catch (error) {
    logger.error('Add to inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding drug to inventory'
    });
  }
});

// @route   GET /api/pharmacy/inventory
// @desc    Get pharmacy inventory
// @access  Private (Staff only)
router.get('/inventory', authenticate, authorize('doctor', 'nurse', 'pharmacist', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { drugId, status, lowStock, location } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (drugId) {
      whereClause += ' AND pi.drug_id = ?';
      params.push(drugId);
    }

    if (status) {
      whereClause += ' AND pi.status = ?';
      params.push(status);
    }

    if (location) {
      whereClause += ' AND pi.location = ?';
      params.push(location);
    }

    if (lowStock === 'true') {
      whereClause += ' AND pi.quantity_in_stock <= pi.reorder_level';
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM pharmacy_inventory pi
       LEFT JOIN drug_master dm ON pi.drug_id = dm.drug_id
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get inventory
    const inventory = await getAll(
      `SELECT 
        pi.*, dm.drug_name, dm.generic_name, dm.dosage_form, dm.strength, dm.is_controlled
       FROM pharmacy_inventory pi
       LEFT JOIN drug_master dm ON pi.drug_id = dm.drug_id
       ${whereClause}
       ORDER BY dm.drug_name, pi.expiry_date
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      inventory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving inventory'
    });
  }
});

// @route   PUT /api/pharmacy/inventory/:inventoryId
// @desc    Update inventory item
// @access  Private (Pharmacist, Admin only)
router.put('/inventory/:inventoryId', authenticate, authorize('pharmacist', 'admin'), validateId, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inventoryId } = req.params;
    const updates = req.body;

    // Check if inventory item exists
    const existingItem = await getRow(
      'SELECT * FROM pharmacy_inventory WHERE inventory_id = ?',
      [inventoryId]
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'quantityInStock', 'reorderLevel', 'unitCost', 'sellingPrice', 'supplier', 'location', 'status'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(inventoryId);

    await runQuery(
      `UPDATE pharmacy_inventory SET ${updateFields.join(', ')} WHERE inventory_id = ?`,
      updateValues
    );

    logger.info(`Inventory item updated: ${inventoryId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Inventory item updated successfully'
    });

  } catch (error) {
    logger.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating inventory'
    });
  }
});

// @route   POST /api/pharmacy/dispense
// @desc    Dispense medication
// @access  Private (Pharmacist only)
router.post('/dispense', authenticate, authorize('pharmacist', 'admin'), [
  require('express-validator').body('prescriptionId').trim().isLength({ min: 1 }).withMessage('Prescription ID is required'),
  require('express-validator').body('inventoryId').trim().isLength({ min: 1 }).withMessage('Inventory ID is required'),
  require('express-validator').body('quantityDispensed').isInt({ min: 1 }).withMessage('Quantity dispensed must be a positive integer'),
  require('express-validator').body('dispensedBy').trim().isLength({ min: 1 }).withMessage('Dispensed by is required'),
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
      prescriptionId,
      inventoryId,
      quantityDispensed,
      dispensedBy,
      patientInstructions,
      notes
    } = req.body;

    // Check if prescription exists and is active
    const prescription = await getRow(
      `SELECT p.*, dm.drug_name, pt.first_name as patient_first_name, pt.last_name as patient_last_name
       FROM prescriptions p
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       WHERE p.prescription_id = ? AND p.is_active = 1`,
      [prescriptionId]
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found or inactive'
      });
    }

    // Check if inventory item exists and has sufficient quantity
    const inventory = await getRow(
      'SELECT * FROM pharmacy_inventory WHERE inventory_id = ? AND drug_id = ?',
      [inventoryId, prescription.drug_id]
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found or does not match prescription drug'
      });
    }

    if (inventory.quantity_in_stock < quantityDispensed) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient quantity in stock',
        available: inventory.quantity_in_stock,
        requested: quantityDispensed
      });
    }

    // Generate dispense ID
    const dispenseId = generateId('DISP', 6);

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Create dispense record
      await runQuery(
        `INSERT INTO pharmacy_dispense (
          dispense_id, prescription_id, inventory_id, quantity_dispensed, dispensed_by,
          patient_instructions, notes, dispensed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [dispenseId, prescriptionId, inventoryId, quantityDispensed, dispensedBy, patientInstructions, notes]
      );

      // Update inventory quantity
      await runQuery(
        'UPDATE pharmacy_inventory SET quantity_in_stock = quantity_in_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE inventory_id = ?',
        [quantityDispensed, inventoryId]
      );

      // Update inventory status if low stock
      const newQuantity = inventory.quantity_in_stock - quantityDispensed;
      let newStatus = 'available';
      if (newQuantity <= 0) {
        newStatus = 'out_of_stock';
      } else if (newQuantity <= inventory.reorder_level) {
        newStatus = 'low_stock';
      }

      await runQuery(
        'UPDATE pharmacy_inventory SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE inventory_id = ?',
        [newStatus, inventoryId]
      );

      await runQuery('COMMIT');

      logger.info(`Medication dispensed: ${dispenseId} for prescription ${prescriptionId} by pharmacist ${dispensedBy}`);

      res.status(201).json({
        success: true,
        message: 'Medication dispensed successfully',
        dispense: {
          dispenseId,
          prescriptionId,
          drugName: prescription.drug_name,
          patientName: `${prescription.patient_first_name} ${prescription.patient_last_name}`,
          quantityDispensed,
          dispensedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Dispense medication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error dispensing medication'
    });
  }
});

// @route   GET /api/pharmacy/dispense
// @desc    Get dispense records
// @access  Private (Staff only)
router.get('/dispense', authenticate, authorize('pharmacist', 'doctor', 'nurse', 'admin'), validatePagination, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { patientId, prescriptionId, startDate, endDate } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (patientId) {
      whereClause += ' AND p.patient_id = ?';
      params.push(patientId);
    }

    if (prescriptionId) {
      whereClause += ' AND pd.prescription_id = ?';
      params.push(prescriptionId);
    }

    if (startDate && endDate) {
      whereClause += ' AND DATE(pd.dispensed_at) BETWEEN ? AND ?';
      params.push(formatDate(startDate), formatDate(endDate));
    }

    // Get total count
    const countResult = await getRow(
      `SELECT COUNT(*) as total 
       FROM pharmacy_dispense pd
       LEFT JOIN prescriptions p ON pd.prescription_id = p.prescription_id
       ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get dispense records
    const dispenses = await getAll(
      `SELECT 
        pd.*, 
        p.patient_id, p.drug_id, p.dosage, p.frequency, p.duration,
        pt.first_name as patient_first_name, pt.last_name as patient_last_name,
        dm.drug_name, dm.generic_name,
        s.first_name as dispensed_by_first_name, s.last_name as dispensed_by_last_name
       FROM pharmacy_dispense pd
       LEFT JOIN prescriptions p ON pd.prescription_id = p.prescription_id
       LEFT JOIN patients pt ON p.patient_id = pt.patient_id
       LEFT JOIN drug_master dm ON p.drug_id = dm.drug_id
       LEFT JOIN staff s ON pd.dispensed_by = s.staff_id
       ${whereClause}
       ORDER BY pd.dispensed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      dispenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get dispense records error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving dispense records'
    });
  }
});

// @route   GET /api/pharmacy/stats
// @desc    Get pharmacy statistics
// @access  Private (Admin, Manager only)
router.get('/stats', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(pd.dispensed_at) BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get inventory statistics
    const inventoryStats = await getRow(
      `SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN pi.status = 'available' THEN 1 END) as available_items,
        COUNT(CASE WHEN pi.status = 'low_stock' THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN pi.status = 'out_of_stock' THEN 1 END) as out_of_stock_items,
        SUM(pi.quantity_in_stock * pi.unit_cost) as total_inventory_value
       FROM pharmacy_inventory pi`
    );

    // Get dispense statistics
    const dispenseStats = await getRow(
      `SELECT 
        COUNT(*) as total_dispenses,
        SUM(pd.quantity_dispensed) as total_quantity_dispensed,
        COUNT(DISTINCT pd.prescription_id) as unique_prescriptions,
        COUNT(DISTINCT p.patient_id) as unique_patients
       FROM pharmacy_dispense pd
       LEFT JOIN prescriptions p ON pd.prescription_id = p.prescription_id
       ${dateFilter}`,
      params
    );

    res.json({
      success: true,
      stats: {
        inventory: inventoryStats,
        dispenses: dispenseStats
      }
    });

  } catch (error) {
    logger.error('Get pharmacy stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving pharmacy statistics'
    });
  }
});

export default router;

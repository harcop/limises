import { Request, Response } from 'express';
import { DrugMasterModel } from '../../models';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { 
  generateId,
  formatDate, 
  formatTime 
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

export class PharmacyController {
  // @route   POST /api/pharmacy/drugs
  // @desc    Add new drug to master database
  // @access  Private (Admin, Pharmacist only)
  static async addDrug(req: AuthRequest, res: Response) {
    try {
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

      // Validate required fields
      if (!drugName) {
        return res.status(400).json({
          success: false,
          error: 'Drug name is required'
        });
      }

      // Check for duplicate drug
      const existingDrug = await DrugMasterModel.findOne({
        $or: [
          { drugName: drugName.trim() },
          { ndcNumber: ndcNumber?.trim() }
        ]
      });

      if (existingDrug) {
        return res.status(409).json({
          success: false,
          error: 'Drug with this name or NDC number already exists'
        });
      }

      // Generate drug ID
      const drugId = generateId();

      // Create drug
      const drug = new DrugMasterModel({
        drugId,
        drugName: drugName.trim(),
        genericName: genericName?.trim(),
        drugClass: drugClass?.trim(),
        dosageForm: dosageForm?.trim(),
        strength: strength?.trim(),
        manufacturer: manufacturer?.trim(),
        ndcNumber: ndcNumber?.trim(),
        isControlled: isControlled || false,
        controlledSchedule: isControlled ? controlledSchedule : undefined,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      await drug.save();

      logger.info(`Drug ${drugId} added by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Drug added successfully',
        data: {
          drugId,
          drugName: drug.drugName,
          genericName: drug.genericName,
          drugClass: drug.drugClass,
          dosageForm: drug.dosageForm,
          strength: drug.strength,
          manufacturer: drug.manufacturer,
          isControlled: drug.isControlled
        }
      });

    } catch (error) {
      logger.error('Add drug error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error adding drug'
      });
    }
  }

  // @route   GET /api/pharmacy/drugs
  // @desc    Get all drugs with filters and pagination
  // @access  Private (Staff only)
  static async getDrugs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 50;
      const offset = (page - 1) * limit;
      const {
        search,
        drugClass,
        isControlled,
        isActive
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (drugClass) filter.drugClass = drugClass;
      if (isControlled !== undefined) filter.isControlled = isControlled === 'true';
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [
          { drugName: searchRegex },
          { genericName: searchRegex },
          { drugClass: searchRegex },
          { manufacturer: searchRegex }
        ];
      }

      // Get drugs with pagination
      const drugs = await DrugMasterModel.find(filter)
        .select('-__v')
        .sort({ drugName: 1 })
        .skip(offset)
        .limit(limit);

      const total = await DrugMasterModel.countDocuments(filter);

      res.json({
        success: true,
        data: drugs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get drugs error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving drugs'
      });
    }
  }

  // @route   GET /api/pharmacy/drugs/:drugId
  // @desc    Get a specific drug
  // @access  Private (Staff only)
  static async getDrug(req: AuthRequest, res: Response) {
    try {
      const { drugId } = req.params;

      const drug = await DrugMasterModel.findOne({ drugId });

      if (!drug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found'
        });
      }

      res.json({
        success: true,
        data: drug
      });

    } catch (error) {
      logger.error('Get drug error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving drug'
      });
    }
  }

  // @route   PUT /api/pharmacy/drugs/:drugId
  // @desc    Update drug information
  // @access  Private (Admin, Pharmacist only)
  static async updateDrug(req: AuthRequest, res: Response) {
    try {
      const { drugId } = req.params;
      const updateData = req.body;

      // Check if drug exists
      const existingDrug = await DrugMasterModel.findOne({ drugId });

      if (!existingDrug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found'
        });
      }

      // Update drug
      const updatedDrug = await DrugMasterModel.findOneAndUpdate(
        { drugId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      );

      logger.info(`Drug ${drugId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Drug updated successfully',
        data: updatedDrug
      });

    } catch (error) {
      logger.error('Update drug error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating drug'
      });
    }
  }

  // @route   DELETE /api/pharmacy/drugs/:drugId
  // @desc    Deactivate a drug (soft delete)
  // @access  Private (Admin only)
  static async deactivateDrug(req: AuthRequest, res: Response) {
    try {
      const { drugId } = req.params;

      const drug = await DrugMasterModel.findOneAndUpdate(
        { drugId, isActive: true },
        { 
          isActive: false,
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );

      if (!drug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found or already inactive'
        });
      }

      logger.info(`Drug ${drugId} deactivated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Drug deactivated successfully'
      });

    } catch (error) {
      logger.error('Deactivate drug error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error deactivating drug'
      });
    }
  }

  // @route   GET /api/pharmacy/inventory
  // @desc    Get pharmacy inventory
  // @access  Private (Staff only)
  static async getInventory(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        search,
        status,
        lowStock
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      if (lowStock === 'true') {
        whereClause += ' AND quantity_in_stock <= reorder_level';
      }

      // Get inventory with pagination
      const inventory = await getAll(
        `SELECT pi.*, dm.drug_name, dm.generic_name, dm.dosage_form, dm.strength 
         FROM pharmacy_inventory pi 
         JOIN drug_master dm ON pi.drug_id = dm.drug_id 
         WHERE ${whereClause} 
         ORDER BY dm.drug_name 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM pharmacy_inventory pi 
         JOIN drug_master dm ON pi.drug_id = dm.drug_id 
         WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: inventory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get inventory error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving inventory'
      });
    }
  }

  // @route   POST /api/pharmacy/inventory
  // @desc    Add inventory item
  // @access  Private (Admin, Pharmacist only)
  static async addInventoryItem(req: AuthRequest, res: Response) {
    try {
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

      // Validate required fields
      if (!drugId || !quantityInStock || !unitCost || !sellingPrice) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if drug exists
      const drug = await DrugMasterModel.findOne({ drugId, isActive: true });

      if (!drug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found or inactive'
        });
      }

      // Generate inventory ID
      const inventoryId = generateId();

      // Create inventory item
      const result = await runQuery(
        `INSERT INTO pharmacy_inventory (inventory_id, drug_id, batch_number, expiry_date, 
         quantity_in_stock, reorder_level, unit_cost, selling_price, supplier, location, 
         status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', NOW())`,
        [inventoryId, drugId, batchNumber, expiryDate, quantityInStock, reorderLevel, unitCost, sellingPrice, supplier, location]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to add inventory item'
        });
      }

      logger.info(`Inventory item ${inventoryId} added by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Inventory item added successfully',
        data: {
          inventoryId,
          drugId,
          drugName: drug.drugName,
          quantityInStock,
          unitCost,
          sellingPrice,
          status: 'available'
        }
      });

    } catch (error) {
      logger.error('Add inventory item error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error adding inventory item'
      });
    }
  }

  // @route   GET /api/pharmacy/dispenses
  // @desc    Get dispense records
  // @access  Private (Staff only)
  static async getDispenses(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        prescriptionId,
        startDate,
        endDate
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (patientId) {
        whereClause += ' AND p.patient_id = ?';
        params.push(patientId);
      }
      if (prescriptionId) {
        whereClause += ' AND pd.prescription_id = ?';
        params.push(prescriptionId);
      }
      if (startDate) {
        whereClause += ' AND pd.dispensed_at >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND pd.dispensed_at <= ?';
        params.push(endDate);
      }

      // Get dispenses with pagination
      const dispenses = await getAll(
        `SELECT pd.*, p.first_name, p.last_name, pr.prescription_id, dm.drug_name, dm.dosage_form, dm.strength 
         FROM pharmacy_dispenses pd 
         JOIN prescriptions pr ON pd.prescription_id = pr.prescription_id 
         JOIN patients p ON pr.patient_id = p.patient_id 
         JOIN drug_master dm ON pr.drug_id = dm.drug_id 
         WHERE ${whereClause} 
         ORDER BY pd.dispensed_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM pharmacy_dispenses pd 
         JOIN prescriptions pr ON pd.prescription_id = pr.prescription_id 
         JOIN patients p ON pr.patient_id = p.patient_id 
         WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: dispenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get dispenses error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving dispenses'
      });
    }
  }

  // @route   POST /api/pharmacy/dispenses
  // @desc    Dispense medication
  // @access  Private (Pharmacist only)
  static async dispenseMedication(req: AuthRequest, res: Response) {
    try {
      const {
        prescriptionId,
        inventoryId,
        quantityDispensed,
        patientInstructions,
        notes
      } = req.body;

      // Validate required fields
      if (!prescriptionId || !inventoryId || !quantityDispensed) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if prescription exists and is active
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

      // Check inventory availability
      const inventory = await getRow(
        'SELECT * FROM pharmacy_inventory WHERE inventory_id = ? AND status = "available"',
        [inventoryId]
      );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found or unavailable'
        });
      }

      if (inventory.quantity_in_stock < quantityDispensed) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient inventory'
        });
      }

      // Generate dispense ID
      const dispenseId = generateId();

      // Create dispense record
      const result = await runQuery(
        `INSERT INTO pharmacy_dispenses (dispense_id, prescription_id, inventory_id, 
         quantity_dispensed, dispensed_by, patient_instructions, notes, dispensed_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [dispenseId, prescriptionId, inventoryId, quantityDispensed, req.user?.staffId, patientInstructions, notes]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create dispense record'
        });
      }

      // Update inventory quantity
      await runQuery(
        'UPDATE pharmacy_inventory SET quantity_in_stock = quantity_in_stock - ? WHERE inventory_id = ?',
        [quantityDispensed, inventoryId]
      );

      // Update prescription refills used
      await runQuery(
        'UPDATE prescriptions SET refills_used = refills_used + 1 WHERE prescription_id = ?',
        [prescriptionId]
      );

      logger.info(`Medication dispensed ${dispenseId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Medication dispensed successfully',
        data: {
          dispenseId,
          prescriptionId,
          inventoryId,
          quantityDispensed,
          dispensedBy: req.user?.staffId
        }
      });

    } catch (error) {
      logger.error('Dispense medication error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error dispensing medication'
      });
    }
  }

  // @route   GET /api/pharmacy/stats
  // @desc    Get pharmacy statistics
  // @access  Private (Staff only)
  static async getPharmacyStats(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = '';
      const params: any[] = [];

      if (startDate && endDate) {
        dateFilter = 'WHERE dispensed_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      // Get dispense statistics
      const dispenseStats = await getRow(
        `SELECT 
         COUNT(*) as totalDispenses,
         SUM(quantity_dispensed) as totalQuantityDispensed,
         COUNT(DISTINCT prescription_id) as uniquePrescriptions
         FROM pharmacy_dispenses ${dateFilter}`,
        params
      );

      // Get inventory statistics
      const inventoryStats = await getRow(
        `SELECT 
         COUNT(*) as totalItems,
         SUM(quantity_in_stock) as totalStock,
         COUNT(CASE WHEN quantity_in_stock <= reorder_level THEN 1 END) as lowStockItems
         FROM pharmacy_inventory WHERE status = 'available'`
      );

      res.json({
        success: true,
        data: {
          dispenses: {
            totalDispenses: dispenseStats?.totalDispenses || 0,
            totalQuantityDispensed: dispenseStats?.totalQuantityDispensed || 0,
            uniquePrescriptions: dispenseStats?.uniquePrescriptions || 0
          },
          inventory: {
            totalItems: inventoryStats?.totalItems || 0,
            totalStock: inventoryStats?.totalStock || 0,
            lowStockItems: inventoryStats?.lowStockItems || 0
          }
        }
      });

    } catch (error) {
      logger.error('Get pharmacy stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving pharmacy statistics'
      });
    }
  }
}

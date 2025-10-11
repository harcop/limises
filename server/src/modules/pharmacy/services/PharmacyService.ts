import { BaseService } from '../../base/Service';
import { DrugModel, PharmacyInventoryModel, DispenseModel } from '../../../models';
import { generateId, sanitizeString } from '../../../utils/helpers';

export interface CreateDrugDto {
  drugName: string;
  genericName?: string;
  drugClass?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  ndcNumber?: string;
  isControlled?: boolean;
  controlledSchedule?: string;
}

export interface UpdateDrugDto {
  drugName?: string;
  genericName?: string;
  drugClass?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  ndcNumber?: string;
  isControlled?: boolean;
  controlledSchedule?: string;
  isActive?: boolean;
}

export interface CreateInventoryItemDto {
  drugId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  purchaseDate: string;
  location: string;
}

export interface CreateDispenseDto {
  patientId: string;
  prescriptionId?: string;
  drugId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  dispensedBy: string;
}

export interface PharmacyFiltersDto {
  search?: string;
  drugClass?: string;
  isControlled?: boolean;
  isActive?: boolean;
  patientId?: string;
  drugId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class PharmacyService extends BaseService {
  constructor() {
    super('PharmacyService');
  }

  // Drug Management
  async addDrug(drugData: CreateDrugDto): Promise<any> {
    try {
      // Validate required fields
      if (!drugData.drugName) {
        throw new Error('Drug name is required');
      }

      // Check for duplicate drug
      const existingDrug = await DrugModel.findOne({
        $or: [
          { drugName: sanitizeString(drugData.drugName) },
          { ndcNumber: drugData.ndcNumber ? sanitizeString(drugData.ndcNumber) : undefined }
        ]
      });

      if (existingDrug) {
        throw new Error('Drug with this name or NDC number already exists');
      }

      // Generate drug ID
      const drugId = generateId('DRUG', 6);

      // Create drug
      const drug = new DrugModel({
        drugId,
        drugName: sanitizeString(drugData.drugName),
        genericName: drugData.genericName ? sanitizeString(drugData.genericName) : undefined,
        drugClass: drugData.drugClass ? sanitizeString(drugData.drugClass) : undefined,
        dosageForm: drugData.dosageForm ? sanitizeString(drugData.dosageForm) : undefined,
        strength: drugData.strength ? sanitizeString(drugData.strength) : undefined,
        manufacturer: drugData.manufacturer ? sanitizeString(drugData.manufacturer) : undefined,
        ndcNumber: drugData.ndcNumber ? sanitizeString(drugData.ndcNumber) : undefined,
        isControlled: drugData.isControlled || false,
        controlledSchedule: drugData.isControlled ? drugData.controlledSchedule : undefined,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      await drug.save();

      this.log('info', `Drug added: ${drugId}`);

      return {
        drugId,
        drugName: drug.drugName,
        genericName: drug.genericName,
        drugClass: drug.drugClass,
        dosageForm: drug.dosageForm,
        strength: drug.strength,
        manufacturer: drug.manufacturer,
        isControlled: drug.isControlled
      };
    } catch (error) {
      this.handleError(error, 'Add drug');
    }
  }

  async getDrugs(filters: PharmacyFiltersDto, pagination: PaginationDto): Promise<{ drugs: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.drugClass) filter.drugClass = filters.drugClass;
      if (filters.isControlled !== undefined) filter.isControlled = filters.isControlled;
      if (filters.isActive !== undefined) filter.isActive = filters.isActive;
      if (filters.search) {
        filter.$or = [
          { drugName: { $regex: filters.search, $options: 'i' } },
          { genericName: { $regex: filters.search, $options: 'i' } },
          { manufacturer: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const total = await DrugModel.countDocuments(filter);
      const drugs = await DrugModel.find(filter)
        .select('-__v')
        .sort({ drugName: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        drugs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get drugs');
    }
  }

  async getDrug(drugId: string): Promise<any> {
    try {
      const drug = await DrugModel.findOne({ drugId }).select('-__v');
      if (!drug) {
        throw new Error('Drug not found');
      }
      return drug;
    } catch (error) {
      this.handleError(error, 'Get drug');
    }
  }

  async updateDrug(drugId: string, updateData: UpdateDrugDto): Promise<any> {
    try {
      // Check if drug exists
      const existingDrug = await DrugModel.findOne({ drugId });
      if (!existingDrug) {
        throw new Error('Drug not found');
      }

      // Sanitize string fields
      const sanitizedData = { ...updateData };
      if (sanitizedData.drugName) sanitizedData.drugName = sanitizeString(sanitizedData.drugName);
      if (sanitizedData.genericName) sanitizedData.genericName = sanitizeString(sanitizedData.genericName);
      if (sanitizedData.drugClass) sanitizedData.drugClass = sanitizeString(sanitizedData.drugClass);
      if (sanitizedData.dosageForm) sanitizedData.dosageForm = sanitizeString(sanitizedData.dosageForm);
      if (sanitizedData.strength) sanitizedData.strength = sanitizeString(sanitizedData.strength);
      if (sanitizedData.manufacturer) sanitizedData.manufacturer = sanitizeString(sanitizedData.manufacturer);
      if (sanitizedData.ndcNumber) sanitizedData.ndcNumber = sanitizeString(sanitizedData.ndcNumber);

      const updatedDrug = await DrugModel.findOneAndUpdate(
        { drugId },
        { ...sanitizedData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      this.log('info', `Drug updated: ${drugId}`);
      return updatedDrug;
    } catch (error) {
      this.handleError(error, 'Update drug');
    }
  }

  async deactivateDrug(drugId: string): Promise<boolean> {
    try {
      const result = await DrugModel.findOneAndUpdate(
        { drugId },
        { isActive: false, updatedAt: new Date().toISOString() }
      );
      
      if (!result) {
        throw new Error('Drug not found');
      }

      this.log('info', `Drug deactivated: ${drugId}`);
      return true;
    } catch (error) {
      this.handleError(error, 'Deactivate drug');
    }
  }

  // Inventory Management
  async getInventory(filters: PharmacyFiltersDto, pagination: PaginationDto): Promise<{ inventory: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build match filter
      const matchFilter: any = {};
      if (filters.drugId) matchFilter.drugId = filters.drugId;
      if (filters.startDate || filters.endDate) {
        matchFilter.createdAt = {};
        if (filters.startDate) matchFilter.createdAt.$gte = filters.startDate;
        if (filters.endDate) matchFilter.createdAt.$lte = filters.endDate;
      }

      // Get inventory with pagination using aggregation
      const inventory = await PharmacyInventoryModel.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'drugs',
            localField: 'drugId',
            foreignField: 'drugId',
            as: 'drug'
          }
        },
        {
          $addFields: {
            drugName: { $arrayElemAt: ['$drug.drugName', 0] },
            genericName: { $arrayElemAt: ['$drug.genericName', 0] },
            dosageForm: { $arrayElemAt: ['$drug.dosageForm', 0] },
            strength: { $arrayElemAt: ['$drug.strength', 0] }
          }
        },
        {
          $project: {
            drug: 0
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      // Get total count
      const total = await PharmacyInventoryModel.countDocuments(matchFilter);

      return {
        inventory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get inventory');
    }
  }

  async addInventoryItem(inventoryData: CreateInventoryItemDto): Promise<any> {
    try {
      // Validate required fields
      if (!inventoryData.drugId || !inventoryData.batchNumber || !inventoryData.quantity) {
        throw new Error('Missing required fields');
      }

      // Check if drug exists
      const drug = await DrugModel.findOne({ drugId: inventoryData.drugId });
      if (!drug) {
        throw new Error('Drug not found');
      }

      // Generate inventory ID
      const inventoryId = generateId('INV', 6);

      // Create inventory item using MongoDB
      const inventoryItem = new PharmacyInventoryModel({
        inventoryId,
        drugId: inventoryData.drugId,
        batchNumber: inventoryData.batchNumber,
        expiryDate: inventoryData.expiryDate,
        quantity: inventoryData.quantity,
        unitPrice: inventoryData.unitCost,
        supplier: inventoryData.supplier,
        location: inventoryData.location,
        status: 'available',
        createdAt: new Date().toISOString()
      });

      await inventoryItem.save();

      this.log('info', `Inventory item added: ${inventoryId}`);
      return {
        inventoryId,
        drugId: inventoryData.drugId,
        batchNumber: inventoryData.batchNumber,
        quantity: inventoryData.quantity,
        status: 'available'
      };
    } catch (error) {
      this.handleError(error, 'Add inventory item');
    }
  }

  // Dispense Management
  async getDispenses(filters: PharmacyFiltersDto, pagination: PaginationDto): Promise<{ dispenses: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build match filter
      const matchFilter: any = {};
      if (filters.patientId) matchFilter.patientId = filters.patientId;
      if (filters.drugId) matchFilter.drugId = filters.drugId;
      if (filters.startDate || filters.endDate) {
        matchFilter.dispenseDate = {};
        if (filters.startDate) matchFilter.dispenseDate.$gte = filters.startDate;
        if (filters.endDate) matchFilter.dispenseDate.$lte = filters.endDate;
      }

      // Get dispenses with pagination using aggregation
      const dispenses = await DispenseModel.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'drugs',
            localField: 'drugId',
            foreignField: 'drugId',
            as: 'drug'
          }
        },
        {
          $lookup: {
            from: 'patients',
            localField: 'patientId',
            foreignField: 'patientId',
            as: 'patient'
          }
        },
        {
          $lookup: {
            from: 'staff',
            localField: 'dispensedBy',
            foreignField: 'staffId',
            as: 'staff'
          }
        },
        {
          $addFields: {
            drugName: { $arrayElemAt: ['$drug.drugName', 0] },
            genericName: { $arrayElemAt: ['$drug.genericName', 0] },
            firstName: { $arrayElemAt: ['$patient.firstName', 0] },
            lastName: { $arrayElemAt: ['$patient.lastName', 0] },
            staffFirstName: { $arrayElemAt: ['$staff.firstName', 0] },
            staffLastName: { $arrayElemAt: ['$staff.lastName', 0] }
          }
        },
        {
          $project: {
            drug: 0,
            patient: 0,
            staff: 0
          }
        },
        { $sort: { dispenseDate: -1, dispenseTime: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      // Get total count
      const total = await DispenseModel.countDocuments(matchFilter);

      return {
        dispenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get dispenses');
    }
  }

  async dispenseMedication(dispenseData: CreateDispenseDto): Promise<any> {
    try {
      // Validate required fields
      if (!dispenseData.patientId || !dispenseData.drugId || !dispenseData.quantity) {
        throw new Error('Missing required fields');
      }

      // Check if drug exists and is active
      const drug = await DrugModel.findOne({ drugId: dispenseData.drugId, status: 'active' });
      if (!drug) {
        throw new Error('Drug not found or inactive');
      }

      // Check inventory availability using MongoDB aggregation
      const inventoryAggregation = await PharmacyInventoryModel.aggregate([
        {
          $match: {
            drugId: dispenseData.drugId,
            status: 'available',
            expiryDate: { $gt: new Date().toISOString().split('T')[0] }
          }
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      const totalQuantity = inventoryAggregation[0]?.totalQuantity || 0;
      if (totalQuantity < dispenseData.quantity) {
        throw new Error('Insufficient inventory');
      }

      // Generate dispense ID
      const dispenseId = generateId('DISP', 6);
      const currentDate = new Date();
      const dispenseDate = currentDate.toISOString().split('T')[0];
      const dispenseTime = currentDate.toTimeString().split(' ')[0];

      // Create dispense record using MongoDB
      const dispense = new DispenseModel({
        dispenseId,
        patientId: dispenseData.patientId,
        drugId: dispenseData.drugId,
        prescriptionId: dispenseData.prescriptionId,
        quantity: dispenseData.quantity,
        unitPrice: 0, // Will be set based on inventory or prescription
        totalAmount: 0, // Will be calculated based on unitPrice
        dispensedBy: dispenseData.dispensedBy,
        dispenseDate,
        dispenseTime,
        notes: dispenseData.instructions,
        status: 'dispensed',
        createdAt: new Date().toISOString()
      });

      await dispense.save();

      // Update inventory (FIFO - First In, First Out) using MongoDB
      const inventoryItems = await PharmacyInventoryModel.find({
        drugId: dispenseData.drugId,
        status: 'available',
        expiryDate: { $gt: dispenseDate }
      }).sort({ createdAt: 1, expiryDate: 1 });

      let remainingQuantity = dispenseData.quantity;
      for (const item of inventoryItems) {
        if (remainingQuantity <= 0) break;
        
        const deductQuantity = Math.min(remainingQuantity, item.quantity);
        await PharmacyInventoryModel.findOneAndUpdate(
          { inventoryId: item.inventoryId },
          { 
            $inc: { quantity: -deductQuantity },
            updatedAt: new Date().toISOString()
          }
        );
        remainingQuantity -= deductQuantity;
      }

      this.log('info', `Medication dispensed: ${dispenseId}`);
      return {
        dispenseId,
        patientId: dispenseData.patientId,
        drugId: dispenseData.drugId,
        quantity: dispenseData.quantity,
        status: 'dispensed',
        dispenseDate,
        dispenseTime
      };
    } catch (error) {
      this.handleError(error, 'Dispense medication');
    }
  }

  // Statistics
  async getPharmacyStats(): Promise<any> {
    try {
      // Get drug statistics
      const totalDrugs = await DrugModel.countDocuments();
      const activeDrugs = await DrugModel.countDocuments({ status: 'active' });
      const controlledDrugs = await DrugModel.countDocuments({ isControlled: true });

      // Get inventory statistics
      const totalInventoryItems = await PharmacyInventoryModel.countDocuments({ status: 'available' });
      const inventoryAggregation = await PharmacyInventoryModel.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } }
      ]);

      // Get dispense statistics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dispenseAggregation = await DispenseModel.aggregate([
        { $match: { dispenseDate: { $gte: thirtyDaysAgo.toISOString().split('T')[0] } } },
        { $group: { _id: null, totalDispenses: { $sum: 1 }, totalQuantityDispensed: { $sum: '$quantity' } } }
      ]);

      return {
        drugs: {
          totalDrugs,
          activeDrugs,
          controlledDrugs
        },
        inventory: {
          totalInventoryItems,
          totalQuantity: inventoryAggregation[0]?.totalQuantity || 0,
          totalValue: inventoryAggregation[0]?.totalValue || 0
        },
        dispenses: {
          totalDispenses: dispenseAggregation[0]?.totalDispenses || 0,
          totalQuantityDispensed: dispenseAggregation[0]?.totalQuantityDispensed || 0
        }
      };
    } catch (error) {
      this.handleError(error, 'Get pharmacy stats');
    }
  }
}

// ==============================================
// PHARMACY MANAGEMENT INTERFACES
// ==============================================

export interface DrugMaster {
  drugId: string;
  drugName: string;
  genericName?: string;
  drugClass?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  ndcNumber?: string;
  isControlled: boolean;
  controlledSchedule?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PharmacyInventory {
  inventoryId: string;
  drugId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  supplier?: string;
  location?: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

export interface PharmacyDispense {
  dispenseId: string;
  prescriptionId: string;
  inventoryId: string;
  quantityDispensed: number;
  dispensedBy: string;
  patientInstructions?: string;
  notes?: string;
  dispensedAt: string;
}

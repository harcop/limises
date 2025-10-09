// ==============================================
// INVENTORY MANAGEMENT INTERFACES
// ==============================================

export interface InventoryItem {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemType?: string;
  unitOfMeasure?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryStock {
  stockId: string;
  itemId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  supplier?: string;
  location?: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

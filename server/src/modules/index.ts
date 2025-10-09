// Export base classes
export { BaseModule } from './base/Module';
export { BaseService } from './base/Service';
export { BaseController } from './base/Controller';

// Export module management
export { ModuleRegistry } from './ModuleRegistry';
export { ModuleManager } from './ModuleManager';

// Export module interfaces
export * from './base/interfaces/IModule';

// Export specific modules
export { InventoryModule } from './inventory/InventoryModule';
export { InventoryService } from './inventory/services/InventoryService';
export { InventoryController } from './inventory/controllers/InventoryController';

export { PatientsModule } from './patients/PatientsModule';
export { AppointmentsModule } from './appointments/AppointmentsModule';
export { ClinicalModule } from './clinical/ClinicalModule';
export { StaffModule } from './staff/StaffModule';
export { BillingModule } from './billing/BillingModule';

// Export module DTOs and interfaces
export * from './inventory/dto/CreateItemDto';
export * from './inventory/interfaces/IInventoryService';

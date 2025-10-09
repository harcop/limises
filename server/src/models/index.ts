// Export all models
export { PatientModel } from './Patient';
export { StaffModel } from './Staff';
export { StaffAuthModel } from './StaffAuth';
export { AppointmentModel } from './Appointment';
export { ClinicalNoteModel } from './ClinicalNote';
export { PrescriptionModel } from './Prescription';
export { DrugMasterModel } from './DrugMaster';
export { BillingAccountModel } from './BillingAccount';

// Export inventory models
export { InventoryItemModel } from './InventoryItem';
export { InventoryTransactionModel } from './InventoryTransaction';
export { PurchaseOrderModel } from './PurchaseOrder';

// Export model interfaces
export type { IPatient } from './Patient';
export type { IStaff } from './Staff';
export type { IStaffAuth } from './StaffAuth';
export type { IAppointment } from './Appointment';
export type { IClinicalNote } from './ClinicalNote';
export type { IPrescription } from './Prescription';
export type { IDrugMaster } from './DrugMaster';
export type { IBillingAccount } from './BillingAccount';

// Export inventory model interfaces
export type { IInventoryItem } from './InventoryItem';
export type { IInventoryTransaction } from './InventoryTransaction';
export type { IPurchaseOrder, IPurchaseOrderItem } from './PurchaseOrder';

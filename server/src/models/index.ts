// Re-export all models from their respective modules
// This maintains backward compatibility while using the new modular structure

// Patients Module
export { PatientModel } from '../modules/patients/models';
export type { IPatient } from '../modules/patients/models';

// Staff Module
export { StaffModel, StaffAuthModel } from '../modules/staff/models';
export type { IStaff, IStaffAuth } from '../modules/staff/models';

// Appointments Module
export { AppointmentModel } from '../modules/appointments/models';
export type { IAppointment } from '../modules/appointments/models';

// Clinical Module
export { ClinicalNoteModel, PrescriptionModel, DrugMasterModel } from '../modules/clinical/models';
export type { IClinicalNote, IPrescription, IDrugMaster } from '../modules/clinical/models';

// Billing Module
export { BillingAccountModel, ChargeModel, PaymentModel } from '../modules/billing/models';
export type { IBillingAccount, ICharge, IPayment } from '../modules/billing/models';

// Inventory Module
export { InventoryItemModel, InventoryTransactionModel, PurchaseOrderModel } from '../modules/inventory/models';
export type { IInventoryItem, IInventoryTransaction, IPurchaseOrder, IPurchaseOrderItem } from '../modules/inventory/models';

// Laboratory Module
export { LabOrderModel, LabSampleModel, LabResultModel } from '../modules/laboratory/models';
export type { ILabOrder, ILabSample, ILabResult } from '../modules/laboratory/models';

// Pharmacy Module
export { DrugModel, PharmacyInventoryModel, DispenseModel } from '../modules/pharmacy/models';
export type { IDrug, IPharmacyInventory, IDispense } from '../modules/pharmacy/models';

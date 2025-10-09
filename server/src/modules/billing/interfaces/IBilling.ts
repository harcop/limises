// ==============================================
// BILLING MANAGEMENT INTERFACES
// ==============================================

export interface BillingAccount {
  accountId: string;
  patientId: string;
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive' | 'closed';
  createdAt: string;
  updatedAt?: string;
}

export interface Charge {
  chargeId: string;
  patientId: string;
  accountId: string;
  serviceType: string;
  serviceDescription?: string;
  serviceDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'billed' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  paymentId: string;
  patientId: string;
  accountId: string;
  paymentDate: string;
  paymentTime: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'insurance' | 'check';
  paymentAmount: number;
  referenceNumber?: string;
  notes?: string;
  processedBy: string;
  createdAt: string;
}

export interface InsuranceClaim {
  claimId: string;
  patientId: string;
  insuranceId: string;
  claimDate: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  totalCharges: number;
  claimAmount: number;
  status: 'submitted' | 'approved' | 'denied' | 'pending';
  claimNumber?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Statistics Types
export interface RevenueStats {
  totalCharges: number;
  totalRevenue: number;
  avgChargeAmount: number;
  paidCharges: number;
  paidRevenue: number;
  pendingCharges: number;
  pendingRevenue: number;
}

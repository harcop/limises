import { BaseService } from '../../base/Service';
import { BillingAccountModel } from '../../../models';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { 
  generateChargeId,
  generatePaymentId,
  generateId,
  sanitizeString
} from '../../../utils/helpers';

export interface CreateChargeDto {
  patientId: string;
  accountId: string;
  serviceType: string;
  serviceDescription?: string;
  serviceDate: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface CreatePaymentDto {
  patientId: string;
  accountId: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface CreateBillingAccountDto {
  patientId: string;
  accountType?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  groupNumber?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  notes?: string;
}

export interface UpdateBillingAccountDto {
  accountType?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  groupNumber?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  status?: string;
  notes?: string;
}

export interface BillingFiltersDto {
  patientId?: string;
  accountId?: string;
  serviceType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class BillingService extends BaseService {
  constructor() {
    super('BillingService');
  }

  // Charge Management
  async createCharge(chargeData: CreateChargeDto): Promise<any> {
    try {
      // Validate required fields
      if (!chargeData.patientId || !chargeData.accountId || !chargeData.serviceType || !chargeData.serviceDate || !chargeData.quantity || !chargeData.unitPrice) {
        throw new Error('Missing required fields');
      }

      // Check if billing account exists
      const billingAccount = await BillingAccountModel.findOne({ 
        accountId: chargeData.accountId, 
        patientId: chargeData.patientId,
        status: 'active' 
      });

      if (!billingAccount) {
        throw new Error('Billing account not found or inactive');
      }

      // Generate charge ID
      const chargeId = generateChargeId();
      const totalAmount = chargeData.quantity * chargeData.unitPrice;

      // Create charge using legacy database function
      const result = await runQuery(
        `INSERT INTO charges (charge_id, patient_id, account_id, service_type, service_description, 
         service_date, quantity, unit_price, total_amount, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          chargeId, chargeData.patientId, chargeData.accountId, chargeData.serviceType,
          chargeData.serviceDescription ? sanitizeString(chargeData.serviceDescription) : null,
          chargeData.serviceDate, chargeData.quantity, chargeData.unitPrice, totalAmount
        ]
      );

      if (!result.acknowledged) {
        throw new Error('Failed to create charge');
      }

      // Update billing account balance
      await BillingAccountModel.findOneAndUpdate(
        { accountId: chargeData.accountId },
        { 
          $inc: { balance: totalAmount },
          updatedAt: new Date().toISOString()
        }
      );

      this.log('info', `Charge created: ${chargeId}`);

      return {
        chargeId,
        patientId: chargeData.patientId,
        accountId: chargeData.accountId,
        serviceType: chargeData.serviceType,
        serviceDescription: chargeData.serviceDescription,
        serviceDate: chargeData.serviceDate,
        quantity: chargeData.quantity,
        unitPrice: chargeData.unitPrice,
        totalAmount,
        status: 'pending'
      };
    } catch (error) {
      this.handleError(error, 'Create charge');
    }
  }

  async getCharges(filters: BillingFiltersDto, pagination: PaginationDto): Promise<{ charges: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (filters.patientId) {
        whereClause += ' AND c.patient_id = ?';
        params.push(filters.patientId);
      }
      if (filters.accountId) {
        whereClause += ' AND c.account_id = ?';
        params.push(filters.accountId);
      }
      if (filters.serviceType) {
        whereClause += ' AND c.service_type = ?';
        params.push(filters.serviceType);
      }
      if (filters.status) {
        whereClause += ' AND c.status = ?';
        params.push(filters.status);
      }
      if (filters.startDate) {
        whereClause += ' AND c.service_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        whereClause += ' AND c.service_date <= ?';
        params.push(filters.endDate);
      }

      // Get charges with pagination
      const charges = await getAll(
        `SELECT c.*, p.first_name, p.last_name, p.phone, ba.account_number 
         FROM charges c 
         JOIN patients p ON c.patient_id = p.patient_id 
         JOIN billing_accounts ba ON c.account_id = ba.account_id 
         WHERE ${whereClause} 
         ORDER BY c.service_date DESC, c.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM charges c WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      return {
        charges,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get charges');
    }
  }

  async getCharge(chargeId: string): Promise<any> {
    try {
      const charge = await getRow(
        `SELECT c.*, p.first_name, p.last_name, p.phone, p.email, ba.account_number, ba.balance 
         FROM charges c 
         JOIN patients p ON c.patient_id = p.patient_id 
         JOIN billing_accounts ba ON c.account_id = ba.account_id 
         WHERE c.charge_id = ?`,
        [chargeId]
      );

      if (!charge) {
        throw new Error('Charge not found');
      }

      return charge;
    } catch (error) {
      this.handleError(error, 'Get charge');
    }
  }

  // Payment Management
  async createPayment(paymentData: CreatePaymentDto): Promise<any> {
    try {
      // Validate required fields
      if (!paymentData.patientId || !paymentData.accountId || !paymentData.paymentMethod || !paymentData.paymentAmount || !paymentData.paymentDate) {
        throw new Error('Missing required fields');
      }

      // Check if billing account exists
      const billingAccount = await BillingAccountModel.findOne({ 
        accountId: paymentData.accountId, 
        patientId: paymentData.patientId,
        status: 'active' 
      });

      if (!billingAccount) {
        throw new Error('Billing account not found or inactive');
      }

      // Generate payment ID
      const paymentId = generatePaymentId();

      // Create payment
      const result = await runQuery(
        `INSERT INTO payments (payment_id, patient_id, account_id, payment_method, payment_amount, 
         payment_date, reference_number, status, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, NOW())`,
        [
          paymentId, paymentData.patientId, paymentData.accountId, paymentData.paymentMethod,
          paymentData.paymentAmount, paymentData.paymentDate, paymentData.referenceNumber,
          paymentData.notes ? sanitizeString(paymentData.notes) : null
        ]
      );

      if (!result.acknowledged) {
        throw new Error('Failed to create payment');
      }

      // Update billing account balance
      await BillingAccountModel.findOneAndUpdate(
        { accountId: paymentData.accountId },
        { 
          $inc: { balance: -paymentData.paymentAmount },
          updatedAt: new Date().toISOString()
        }
      );

      this.log('info', `Payment created: ${paymentId}`);

      return {
        paymentId,
        patientId: paymentData.patientId,
        accountId: paymentData.accountId,
        paymentMethod: paymentData.paymentMethod,
        paymentAmount: paymentData.paymentAmount,
        paymentDate: paymentData.paymentDate,
        status: 'completed'
      };
    } catch (error) {
      this.handleError(error, 'Create payment');
    }
  }

  async getPayments(filters: BillingFiltersDto, pagination: PaginationDto): Promise<{ payments: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (filters.patientId) {
        whereClause += ' AND p.patient_id = ?';
        params.push(filters.patientId);
      }
      if (filters.accountId) {
        whereClause += ' AND p.account_id = ?';
        params.push(filters.accountId);
      }
      if (filters.paymentMethod) {
        whereClause += ' AND p.payment_method = ?';
        params.push(filters.paymentMethod);
      }
      if (filters.status) {
        whereClause += ' AND p.status = ?';
        params.push(filters.status);
      }
      if (filters.startDate) {
        whereClause += ' AND p.payment_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        whereClause += ' AND p.payment_date <= ?';
        params.push(filters.endDate);
      }

      // Get payments with pagination
      const payments = await getAll(
        `SELECT p.*, pt.first_name, pt.last_name, pt.phone, ba.account_number 
         FROM payments p 
         JOIN patients pt ON p.patient_id = pt.patient_id 
         JOIN billing_accounts ba ON p.account_id = ba.account_id 
         WHERE ${whereClause} 
         ORDER BY p.payment_date DESC, p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM payments p WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get payments');
    }
  }

  // Billing Account Management
  async createBillingAccount(accountData: CreateBillingAccountDto): Promise<any> {
    try {
      // Validate required fields
      if (!accountData.patientId) {
        throw new Error('Patient ID is required');
      }

      // Check if patient already has an active billing account
      const existingAccount = await BillingAccountModel.findOne({ 
        patientId: accountData.patientId,
        status: 'active' 
      });

      if (existingAccount) {
        throw new Error('Patient already has an active billing account');
      }

      // Generate account ID and number
      const accountId = generateId('ACC', 6);
      const accountNumber = `ACC-${Date.now()}`;

      // Create billing account
      const billingAccount = new BillingAccountModel({
        accountId,
        patientId: accountData.patientId,
        accountNumber,
        accountType: accountData.accountType || 'self_pay',
        insuranceProvider: accountData.insuranceProvider ? sanitizeString(accountData.insuranceProvider) : undefined,
        policyNumber: accountData.policyNumber ? sanitizeString(accountData.policyNumber) : undefined,
        groupNumber: accountData.groupNumber ? sanitizeString(accountData.groupNumber) : undefined,
        copayAmount: accountData.copayAmount || 0,
        deductibleAmount: accountData.deductibleAmount || 0,
        balance: 0,
        status: 'active',
        notes: accountData.notes ? sanitizeString(accountData.notes) : undefined,
        createdAt: new Date().toISOString()
      });

      await billingAccount.save();

      this.log('info', `Billing account created: ${accountId}`);

      return {
        accountId,
        patientId: accountData.patientId,
        accountNumber,
        accountType: billingAccount.accountType,
        balance: 0,
        status: 'active'
      };
    } catch (error) {
      this.handleError(error, 'Create billing account');
    }
  }

  async getBillingAccount(accountId: string): Promise<any> {
    try {
      const account = await BillingAccountModel.findOne({ accountId })
        .populate('patientId', 'firstName lastName phone email')
        .select('-__v')
        .lean();

      if (!account) {
        throw new Error('Billing account not found');
      }

      return account;
    } catch (error) {
      this.handleError(error, 'Get billing account');
    }
  }

  async updateBillingAccount(accountId: string, updateData: UpdateBillingAccountDto): Promise<any> {
    try {
      // Sanitize string fields
      const sanitizedData = { ...updateData };
      if (sanitizedData.insuranceProvider) sanitizedData.insuranceProvider = sanitizeString(sanitizedData.insuranceProvider);
      if (sanitizedData.policyNumber) sanitizedData.policyNumber = sanitizeString(sanitizedData.policyNumber);
      if (sanitizedData.groupNumber) sanitizedData.groupNumber = sanitizeString(sanitizedData.groupNumber);
      if (sanitizedData.notes) sanitizedData.notes = sanitizeString(sanitizedData.notes);

      const updatedAccount = await BillingAccountModel.findOneAndUpdate(
        { accountId },
        { ...sanitizedData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      if (!updatedAccount) {
        throw new Error('Billing account not found');
      }

      this.log('info', `Billing account updated: ${accountId}`);
      return updatedAccount;
    } catch (error) {
      this.handleError(error, 'Update billing account');
    }
  }

  // Statistics
  async getBillingStats(filters: { startDate?: string; endDate?: string }): Promise<any> {
    try {
      let dateFilter = '';
      const params: any[] = [];

      if (filters.startDate && filters.endDate) {
        dateFilter = 'WHERE service_date BETWEEN ? AND ?';
        params.push(filters.startDate, filters.endDate);
      }

      // Get charge statistics
      const chargeStats = await getRow(
        `SELECT 
         COUNT(*) as totalCharges,
         SUM(total_amount) as totalChargesAmount,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingCharges,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidCharges
         FROM charges ${dateFilter}`,
        params
      );

      // Get payment statistics
      const paymentStats = await getRow(
        `SELECT 
         COUNT(*) as totalPayments,
         SUM(payment_amount) as totalPaymentsAmount,
         COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cashPayments,
         COUNT(CASE WHEN payment_method = 'card' THEN 1 END) as cardPayments,
         COUNT(CASE WHEN payment_method = 'insurance' THEN 1 END) as insurancePayments
         FROM payments ${dateFilter}`,
        params
      );

      // Get account statistics
      const accountStats = await getRow(
        `SELECT 
         COUNT(*) as totalAccounts,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as activeAccounts,
         SUM(balance) as totalOutstandingBalance,
         COUNT(CASE WHEN balance > 0 THEN 1 END) as accountsWithBalance
         FROM billing_accounts`
      );

      return {
        charges: {
          totalCharges: chargeStats?.totalCharges || 0,
          totalChargesAmount: chargeStats?.totalChargesAmount || 0,
          pendingCharges: chargeStats?.pendingCharges || 0,
          paidCharges: chargeStats?.paidCharges || 0
        },
        payments: {
          totalPayments: paymentStats?.totalPayments || 0,
          totalPaymentsAmount: paymentStats?.totalPaymentsAmount || 0,
          cashPayments: paymentStats?.cashPayments || 0,
          cardPayments: paymentStats?.cardPayments || 0,
          insurancePayments: paymentStats?.insurancePayments || 0
        },
        accounts: {
          totalAccounts: accountStats?.totalAccounts || 0,
          activeAccounts: accountStats?.activeAccounts || 0,
          totalOutstandingBalance: accountStats?.totalOutstandingBalance || 0,
          accountsWithBalance: accountStats?.accountsWithBalance || 0
        }
      };
    } catch (error) {
      this.handleError(error, 'Get billing stats');
    }
  }
}

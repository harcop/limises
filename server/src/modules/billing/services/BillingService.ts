import { BaseService } from '../../base/Service';
import { BillingAccountModel, ChargeModel, PaymentModel, PatientModel } from '../../../models';
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

      // Create charge using MongoDB
      const charge = new ChargeModel({
        chargeId,
        patientId: chargeData.patientId,
        accountId: chargeData.accountId,
        serviceType: chargeData.serviceType,
        serviceDescription: chargeData.serviceDescription ? sanitizeString(chargeData.serviceDescription) : undefined,
        serviceDate: chargeData.serviceDate,
        quantity: chargeData.quantity,
        unitPrice: chargeData.unitPrice,
        totalAmount,
        status: 'pending',
        notes: chargeData.notes ? sanitizeString(chargeData.notes) : undefined,
        createdAt: new Date().toISOString()
      });

      await charge.save();

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
      const skip = (page - 1) * limit;

      // Build match filter
      const matchFilter: any = {};
      if (filters.patientId) matchFilter.patientId = filters.patientId;
      if (filters.accountId) matchFilter.accountId = filters.accountId;
      if (filters.serviceType) matchFilter.serviceType = filters.serviceType;
      if (filters.status) matchFilter.status = filters.status;
      if (filters.startDate || filters.endDate) {
        matchFilter.serviceDate = {};
        if (filters.startDate) matchFilter.serviceDate.$gte = filters.startDate;
        if (filters.endDate) matchFilter.serviceDate.$lte = filters.endDate;
      }

      // Get charges with pagination using aggregation
      const charges = await ChargeModel.aggregate([
        { $match: matchFilter },
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
            from: 'billing_accounts',
            localField: 'accountId',
            foreignField: 'accountId',
            as: 'billingAccount'
          }
        },
        {
          $addFields: {
            firstName: { $arrayElemAt: ['$patient.firstName', 0] },
            lastName: { $arrayElemAt: ['$patient.lastName', 0] },
            phone: { $arrayElemAt: ['$patient.phone', 0] },
            accountNumber: { $arrayElemAt: ['$billingAccount.accountNumber', 0] }
          }
        },
        {
          $project: {
            patient: 0,
            billingAccount: 0
          }
        },
        { $sort: { serviceDate: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      // Get total count
      const total = await ChargeModel.countDocuments(matchFilter);

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
      const charges = await ChargeModel.aggregate([
        { $match: { chargeId } },
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
            from: 'billing_accounts',
            localField: 'accountId',
            foreignField: 'accountId',
            as: 'billingAccount'
          }
        },
        {
          $addFields: {
            firstName: { $arrayElemAt: ['$patient.firstName', 0] },
            lastName: { $arrayElemAt: ['$patient.lastName', 0] },
            phone: { $arrayElemAt: ['$patient.phone', 0] },
            email: { $arrayElemAt: ['$patient.email', 0] },
            accountNumber: { $arrayElemAt: ['$billingAccount.accountNumber', 0] },
            balance: { $arrayElemAt: ['$billingAccount.balance', 0] }
          }
        },
        {
          $project: {
            patient: 0,
            billingAccount: 0
          }
        }
      ]);

      if (!charges || charges.length === 0) {
        throw new Error('Charge not found');
      }

      return charges[0];
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

      // Create payment using MongoDB
      const payment = new PaymentModel({
        paymentId,
        patientId: paymentData.patientId,
        accountId: paymentData.accountId,
        paymentMethod: paymentData.paymentMethod,
        paymentAmount: paymentData.paymentAmount,
        paymentDate: paymentData.paymentDate,
        referenceNumber: paymentData.referenceNumber,
        status: 'completed',
        notes: paymentData.notes ? sanitizeString(paymentData.notes) : undefined,
        createdAt: new Date().toISOString()
      });

      await payment.save();

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
      const skip = (page - 1) * limit;

      // Build match filter
      const matchFilter: any = {};
      if (filters.patientId) matchFilter.patientId = filters.patientId;
      if (filters.accountId) matchFilter.accountId = filters.accountId;
      if (filters.paymentMethod) matchFilter.paymentMethod = filters.paymentMethod;
      if (filters.status) matchFilter.status = filters.status;
      if (filters.startDate || filters.endDate) {
        matchFilter.paymentDate = {};
        if (filters.startDate) matchFilter.paymentDate.$gte = filters.startDate;
        if (filters.endDate) matchFilter.paymentDate.$lte = filters.endDate;
      }

      // Get payments with pagination using aggregation
      const payments = await PaymentModel.aggregate([
        { $match: matchFilter },
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
            from: 'billing_accounts',
            localField: 'accountId',
            foreignField: 'accountId',
            as: 'billingAccount'
          }
        },
        {
          $addFields: {
            firstName: { $arrayElemAt: ['$patient.firstName', 0] },
            lastName: { $arrayElemAt: ['$patient.lastName', 0] },
            phone: { $arrayElemAt: ['$patient.phone', 0] },
            accountNumber: { $arrayElemAt: ['$billingAccount.accountNumber', 0] }
          }
        },
        {
          $project: {
            patient: 0,
            billingAccount: 0
          }
        },
        { $sort: { paymentDate: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      // Get total count
      const total = await PaymentModel.countDocuments(matchFilter);

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
      // Build date filter for charges and payments
      const dateFilter: any = {};
      if (filters.startDate && filters.endDate) {
        dateFilter.serviceDate = { $gte: filters.startDate, $lte: filters.endDate };
      }

      // Get charge statistics using aggregation
      const chargeStats = await ChargeModel.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: null,
            totalCharges: { $sum: 1 },
            totalChargesAmount: { $sum: '$totalAmount' },
            pendingCharges: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            paidCharges: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get payment statistics using aggregation
      const paymentDateFilter = { ...dateFilter };
      if (paymentDateFilter.serviceDate) {
        paymentDateFilter.paymentDate = paymentDateFilter.serviceDate;
        delete paymentDateFilter.serviceDate;
      }

      const paymentStats = await PaymentModel.aggregate([
        ...(Object.keys(paymentDateFilter).length > 0 ? [{ $match: paymentDateFilter }] : []),
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalPaymentsAmount: { $sum: '$paymentAmount' },
            cashPayments: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, 1, 0] }
            },
            cardPayments: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] }
            },
            insurancePayments: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'insurance'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get account statistics using aggregation
      const accountStats = await BillingAccountModel.aggregate([
        {
          $group: {
            _id: null,
            totalAccounts: { $sum: 1 },
            activeAccounts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalOutstandingBalance: { $sum: '$balance' },
            accountsWithBalance: {
              $sum: { $cond: [{ $gt: ['$balance', 0] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        charges: {
          totalCharges: chargeStats[0]?.totalCharges || 0,
          totalChargesAmount: chargeStats[0]?.totalChargesAmount || 0,
          pendingCharges: chargeStats[0]?.pendingCharges || 0,
          paidCharges: chargeStats[0]?.paidCharges || 0
        },
        payments: {
          totalPayments: paymentStats[0]?.totalPayments || 0,
          totalPaymentsAmount: paymentStats[0]?.totalPaymentsAmount || 0,
          cashPayments: paymentStats[0]?.cashPayments || 0,
          cardPayments: paymentStats[0]?.cardPayments || 0,
          insurancePayments: paymentStats[0]?.insurancePayments || 0
        },
        accounts: {
          totalAccounts: accountStats[0]?.totalAccounts || 0,
          activeAccounts: accountStats[0]?.activeAccounts || 0,
          totalOutstandingBalance: accountStats[0]?.totalOutstandingBalance || 0,
          accountsWithBalance: accountStats[0]?.accountsWithBalance || 0
        }
      };
    } catch (error) {
      this.handleError(error, 'Get billing stats');
    }
  }
}

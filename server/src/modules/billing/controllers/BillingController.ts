import { Request, Response } from 'express';
import { BillingAccountModel } from '../../models';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { 
  generateChargeId,
  generatePaymentId,
  generateId,
  formatDate, 
  formatTime,
  formatCurrency
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

export class BillingController {
  // @route   POST /api/billing/charges
  // @desc    Create a new charge
  // @access  Private (Staff only)
  static async createCharge(req: AuthRequest, res: Response) {
    try {
      const {
        patientId,
        accountId,
        serviceType,
        serviceDescription,
        serviceDate,
        quantity,
        unitPrice,
        notes
      } = req.body;

      // Validate required fields
      if (!patientId || !accountId || !serviceType || !serviceDate || !quantity || !unitPrice) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if billing account exists
      const billingAccount = await BillingAccountModel.findOne({ 
        accountId, 
        patientId,
        status: 'active' 
      });

      if (!billingAccount) {
        return res.status(404).json({
          success: false,
          error: 'Billing account not found or inactive'
        });
      }

      // Generate charge ID
      const chargeId = generateChargeId();
      const totalAmount = quantity * unitPrice;

      // Create charge using legacy database function
      const result = await runQuery(
        `INSERT INTO charges (charge_id, patient_id, account_id, service_type, service_description, 
         service_date, quantity, unit_price, total_amount, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [chargeId, patientId, accountId, serviceType, serviceDescription, serviceDate, quantity, unitPrice, totalAmount]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create charge'
        });
      }

      // Update billing account balance
      await BillingAccountModel.findOneAndUpdate(
        { accountId },
        { 
          $inc: { balance: totalAmount },
          updatedAt: new Date().toISOString()
        }
      );

      logger.info(`Charge ${chargeId} created for patient ${patientId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Charge created successfully',
        data: {
          chargeId,
          patientId,
          accountId,
          serviceType,
          serviceDescription,
          serviceDate,
          quantity,
          unitPrice,
          totalAmount,
          status: 'pending'
        }
      });

    } catch (error) {
      logger.error('Create charge error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating charge'
      });
    }
  }

  // @route   GET /api/billing/charges
  // @desc    Get charges with filters and pagination
  // @access  Private (Staff only)
  static async getCharges(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        accountId,
        status,
        serviceType,
        startDate,
        endDate
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (patientId) {
        whereClause += ' AND patient_id = ?';
        params.push(patientId);
      }
      if (accountId) {
        whereClause += ' AND account_id = ?';
        params.push(accountId);
      }
      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (serviceType) {
        whereClause += ' AND service_type = ?';
        params.push(serviceType);
      }
      if (startDate) {
        whereClause += ' AND service_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND service_date <= ?';
        params.push(endDate);
      }

      // Get charges with pagination
      const charges = await getAll(
        `SELECT c.*, p.first_name, p.last_name, p.phone, ba.account_number 
         FROM charges c 
         JOIN patients p ON c.patient_id = p.patient_id 
         JOIN billing_accounts ba ON c.account_id = ba.account_id 
         WHERE ${whereClause} 
         ORDER BY c.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM charges WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: charges,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get charges error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving charges'
      });
    }
  }

  // @route   GET /api/billing/charges/:chargeId
  // @desc    Get a specific charge
  // @access  Private (Staff only)
  static async getCharge(req: AuthRequest, res: Response) {
    try {
      const { chargeId } = req.params;

      const charge = await getRow(
        `SELECT c.*, p.first_name, p.last_name, p.phone, ba.account_number 
         FROM charges c 
         JOIN patients p ON c.patient_id = p.patient_id 
         JOIN billing_accounts ba ON c.account_id = ba.account_id 
         WHERE c.charge_id = ?`,
        [chargeId]
      );

      if (!charge) {
        return res.status(404).json({
          success: false,
          error: 'Charge not found'
        });
      }

      res.json({
        success: true,
        data: charge
      });

    } catch (error) {
      logger.error('Get charge error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving charge'
      });
    }
  }

  // @route   PUT /api/billing/charges/:chargeId
  // @desc    Update a charge
  // @access  Private (Staff only)
  static async updateCharge(req: AuthRequest, res: Response) {
    try {
      const { chargeId } = req.params;
      const updateData = req.body;

      // Check if charge exists
      const existingCharge = await getRow(
        'SELECT * FROM charges WHERE charge_id = ?',
        [chargeId]
      );

      if (!existingCharge) {
        return res.status(404).json({
          success: false,
          error: 'Charge not found'
        });
      }

      // Update charge
      const result = await runQuery(
        `UPDATE charges SET 
         service_type = COALESCE(?, service_type),
         service_description = COALESCE(?, service_description),
         quantity = COALESCE(?, quantity),
         unit_price = COALESCE(?, unit_price),
         total_amount = COALESCE(?, total_amount),
         status = COALESCE(?, status),
         updated_at = NOW()
         WHERE charge_id = ?`,
        [
          updateData.serviceType,
          updateData.serviceDescription,
          updateData.quantity,
          updateData.unitPrice,
          updateData.totalAmount,
          updateData.status,
          chargeId
        ]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update charge'
        });
      }

      logger.info(`Charge ${chargeId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Charge updated successfully'
      });

    } catch (error) {
      logger.error('Update charge error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating charge'
      });
    }
  }

  // @route   POST /api/billing/payments
  // @desc    Create a new payment
  // @access  Private (Staff only)
  static async createPayment(req: AuthRequest, res: Response) {
    try {
      const {
        patientId,
        accountId,
        paymentMethod,
        paymentAmount,
        referenceNumber,
        notes
      } = req.body;

      // Validate required fields
      if (!patientId || !accountId || !paymentMethod || !paymentAmount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if billing account exists
      const billingAccount = await BillingAccountModel.findOne({ 
        accountId, 
        patientId,
        status: 'active' 
      });

      if (!billingAccount) {
        return res.status(404).json({
          success: false,
          error: 'Billing account not found or inactive'
        });
      }

      // Generate payment ID
      const paymentId = generatePaymentId();

      // Create payment
      const result = await runQuery(
        `INSERT INTO payments (payment_id, patient_id, account_id, payment_date, payment_time, 
         payment_method, payment_amount, reference_number, notes, processed_by, created_at) 
         VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, NOW())`,
        [paymentId, patientId, accountId, paymentMethod, paymentAmount, referenceNumber, notes, req.user?.staffId]
      );

      if (!result.acknowledged) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create payment'
        });
      }

      // Update billing account balance
      await BillingAccountModel.findOneAndUpdate(
        { accountId },
        { 
          $inc: { balance: -paymentAmount },
          updatedAt: new Date().toISOString()
        }
      );

      logger.info(`Payment ${paymentId} created for patient ${patientId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: {
          paymentId,
          patientId,
          accountId,
          paymentMethod,
          paymentAmount,
          referenceNumber,
          processedBy: req.user?.staffId
        }
      });

    } catch (error) {
      logger.error('Create payment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating payment'
      });
    }
  }

  // @route   GET /api/billing/payments
  // @desc    Get payments with filters and pagination
  // @access  Private (Staff only)
  static async getPayments(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        accountId,
        paymentMethod,
        startDate,
        endDate
      } = req.query;

      // Build WHERE clause
      let whereClause = '1=1';
      const params: any[] = [];

      if (patientId) {
        whereClause += ' AND patient_id = ?';
        params.push(patientId);
      }
      if (accountId) {
        whereClause += ' AND account_id = ?';
        params.push(accountId);
      }
      if (paymentMethod) {
        whereClause += ' AND payment_method = ?';
        params.push(paymentMethod);
      }
      if (startDate) {
        whereClause += ' AND payment_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND payment_date <= ?';
        params.push(endDate);
      }

      // Get payments with pagination
      const payments = await getAll(
        `SELECT p.*, pt.first_name, pt.last_name, pt.phone, ba.account_number 
         FROM payments p 
         JOIN patients pt ON p.patient_id = pt.patient_id 
         JOIN billing_accounts ba ON p.account_id = ba.account_id 
         WHERE ${whereClause} 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const totalResult = await getRow(
        `SELECT COUNT(*) as total FROM payments WHERE ${whereClause}`,
        params
      );
      const total = totalResult?.total || 0;

      res.json({
        success: true,
        data: payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get payments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving payments'
      });
    }
  }

  // @route   GET /api/billing/accounts/:accountId
  // @desc    Get billing account details
  // @access  Private (Staff only)
  static async getBillingAccount(req: AuthRequest, res: Response) {
    try {
      const { accountId } = req.params;

      const account = await BillingAccountModel.findOne({ accountId });

      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Billing account not found'
        });
      }

      // Get recent charges and payments
      const recentCharges = await getAll(
        'SELECT * FROM charges WHERE account_id = ? ORDER BY created_at DESC LIMIT 10',
        [accountId]
      );

      const recentPayments = await getAll(
        'SELECT * FROM payments WHERE account_id = ? ORDER BY created_at DESC LIMIT 10',
        [accountId]
      );

      res.json({
        success: true,
        data: {
          account,
          recentCharges,
          recentPayments
        }
      });

    } catch (error) {
      logger.error('Get billing account error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving billing account'
      });
    }
  }

  // @route   GET /api/billing/stats
  // @desc    Get billing statistics
  // @access  Private (Staff only)
  static async getBillingStats(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = '';
      const params: any[] = [];

      if (startDate && endDate) {
        dateFilter = 'WHERE service_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      // Get revenue statistics
      const revenueStats = await getRow(
        `SELECT 
         SUM(total_amount) as totalCharges,
         COUNT(*) as totalChargeCount,
         AVG(total_amount) as avgChargeAmount
         FROM charges ${dateFilter}`,
        params
      );

      // Get payment statistics
      const paymentStats = await getRow(
        `SELECT 
         SUM(payment_amount) as totalPayments,
         COUNT(*) as totalPaymentCount,
         AVG(payment_amount) as avgPaymentAmount
         FROM payments ${dateFilter}`,
        params
      );

      res.json({
        success: true,
        data: {
          revenue: {
            totalCharges: revenueStats?.totalCharges || 0,
            totalChargeCount: revenueStats?.totalChargeCount || 0,
            avgChargeAmount: revenueStats?.avgChargeAmount || 0
          },
          payments: {
            totalPayments: paymentStats?.totalPayments || 0,
            totalPaymentCount: paymentStats?.totalPaymentCount || 0,
            avgPaymentAmount: paymentStats?.avgPaymentAmount || 0
          }
        }
      });

    } catch (error) {
      logger.error('Get billing stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving billing statistics'
      });
    }
  }
}

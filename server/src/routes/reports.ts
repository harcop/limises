import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validatePagination, validateDateRange } from '../middleware/validation';
import { runQuery, getRow, getAll } from '../database/connection';
import { generateId, formatDate, formatTime } from '../utils/helpers';
import { logger } from '../utils/logger';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();

// @route   GET /api/reports/patient-summary
// @desc    Get patient summary report
// @access  Private (Admin, Manager only)
router.get('/patient-summary', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get patient registration statistics
    const patientStats = await getRow(
      `SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_patients,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_patients,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_patients,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_patients,
        COUNT(CASE WHEN gender = 'other' THEN 1 END) as other_gender_patients
       FROM patients
       ${dateFilter}`,
      params
    );

    // Get age distribution
    const ageDistribution = await getAll(
      `SELECT 
        CASE 
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 18 THEN '0-17'
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 30 THEN '18-29'
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 45 THEN '30-44'
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 60 THEN '45-59'
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 75 THEN '60-74'
          ELSE '75+'
        END as age_group,
        COUNT(*) as count
       FROM patients
       ${dateFilter}
       GROUP BY age_group
       ORDER BY age_group`,
      params
    );

    res.json({
      success: true,
      report: {
        type: 'patient_summary',
        period: { startDate, endDate },
        statistics: patientStats,
        ageDistribution
      }
    });

  } catch (error) {
    logger.error('Get patient summary report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating patient summary report'
    });
  }
});

// @route   GET /api/reports/appointment-summary
// @desc    Get appointment summary report
// @access  Private (Admin, Manager only)
router.get('/appointment-summary', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE appointment_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get appointment statistics
    const appointmentStats = await getRow(
      `SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_appointments,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_appointments,
        COUNT(CASE WHEN appointment_type = 'consultation' THEN 1 END) as consultation_appointments,
        COUNT(CASE WHEN appointment_type = 'follow_up' THEN 1 END) as follow_up_appointments,
        COUNT(CASE WHEN appointment_type = 'procedure' THEN 1 END) as procedure_appointments,
        COUNT(CASE WHEN appointment_type = 'emergency' THEN 1 END) as emergency_appointments
       FROM appointments
       ${dateFilter}`,
      params
    );

    // Get appointments by department
    const appointmentsByDepartment = await getAll(
      `SELECT 
        s.department,
        COUNT(*) as appointment_count,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_count
       FROM appointments a
       LEFT JOIN staff s ON a.staff_id = s.staff_id
       ${dateFilter}
       GROUP BY s.department
       ORDER BY appointment_count DESC`,
      params
    );

    res.json({
      success: true,
      report: {
        type: 'appointment_summary',
        period: { startDate, endDate },
        statistics: appointmentStats,
        byDepartment: appointmentsByDepartment
      }
    });

  } catch (error) {
    logger.error('Get appointment summary report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating appointment summary report'
    });
  }
});

// @route   GET /api/reports/revenue-summary
// @desc    Get revenue summary report
// @access  Private (Admin, Manager only)
router.get('/revenue-summary', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE service_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get revenue statistics
    const revenueStats = await getRow(
      `SELECT 
        COUNT(*) as total_charges,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_charge_amount,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_charges,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_charges,
        SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
       FROM charges
       ${dateFilter}`,
      params
    );

    // Get revenue by service type
    const revenueByServiceType = await getAll(
      `SELECT 
        service_type,
        COUNT(*) as charge_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_charge_amount
       FROM charges
       ${dateFilter}
       GROUP BY service_type
       ORDER BY total_revenue DESC`,
      params
    );

    // Get payment statistics
    const paymentStats = await getRow(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(payment_amount) as total_payments_received,
        AVG(payment_amount) as avg_payment_amount,
        COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_payments,
        SUM(CASE WHEN payment_method = 'cash' THEN payment_amount ELSE 0 END) as cash_revenue,
        COUNT(CASE WHEN payment_method = 'credit_card' THEN 1 END) as credit_card_payments,
        SUM(CASE WHEN payment_method = 'credit_card' THEN payment_amount ELSE 0 END) as credit_card_revenue,
        COUNT(CASE WHEN payment_method = 'insurance' THEN 1 END) as insurance_payments,
        SUM(CASE WHEN payment_method = 'insurance' THEN payment_amount ELSE 0 END) as insurance_revenue
       FROM payments
       ${dateFilter.replace('service_date', 'payment_date')}`,
      params
    );

    res.json({
      success: true,
      report: {
        type: 'revenue_summary',
        period: { startDate, endDate },
        revenue: revenueStats,
        payments: paymentStats,
        byServiceType: revenueByServiceType
      }
    });

  } catch (error) {
    logger.error('Get revenue summary report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating revenue summary report'
    });
  }
});

// @route   GET /api/reports/clinical-summary
// @desc    Get clinical summary report
// @access  Private (Admin, Manager only)
router.get('/clinical-summary', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get clinical notes statistics
    const clinicalStats = await getRow(
      `SELECT 
        COUNT(*) as total_notes,
        COUNT(CASE WHEN is_signed = 1 THEN 1 END) as signed_notes,
        COUNT(CASE WHEN is_signed = 0 THEN 1 END) as unsigned_notes,
        COUNT(CASE WHEN note_type = 'consultation' THEN 1 END) as consultation_notes,
        COUNT(CASE WHEN note_type = 'progress' THEN 1 END) as progress_notes,
        COUNT(CASE WHEN note_type = 'discharge' THEN 1 END) as discharge_notes,
        COUNT(CASE WHEN note_type = 'procedure' THEN 1 END) as procedure_notes,
        COUNT(CASE WHEN note_type = 'emergency' THEN 1 END) as emergency_notes
       FROM clinical_notes
       ${dateFilter}`,
      params
    );

    // Get prescription statistics
    const prescriptionStats = await getRow(
      `SELECT 
        COUNT(*) as total_prescriptions,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_prescriptions,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_prescriptions,
        COUNT(CASE WHEN refills_used > 0 THEN 1 END) as prescriptions_with_refills,
        AVG(refills_used) as avg_refills_used
       FROM prescriptions
       ${dateFilter.replace('created_at', 'prescribed_at')}`,
      params
    );

    // Get lab statistics
    const labStats = await getRow(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
        COUNT(CASE WHEN priority = 'stat' THEN 1 END) as stat_orders,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_orders,
        COUNT(CASE WHEN priority = 'routine' THEN 1 END) as routine_orders
       FROM lab_orders
       ${dateFilter.replace('created_at', 'order_date')}`,
      params
    );

    res.json({
      success: true,
      report: {
        type: 'clinical_summary',
        period: { startDate, endDate },
        clinicalNotes: clinicalStats,
        prescriptions: prescriptionStats,
        laboratory: labStats
      }
    });

  } catch (error) {
    logger.error('Get clinical summary report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating clinical summary report'
    });
  }
});

// @route   GET /api/reports/opd-summary
// @desc    Get OPD summary report
// @access  Private (Admin, Manager only)
router.get('/opd-summary', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE visit_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get OPD visit statistics
    const opdStats = await getRow(
      `SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_visits,
        COUNT(CASE WHEN status = 'in_queue' THEN 1 END) as in_queue_visits,
        COUNT(CASE WHEN status = 'with_doctor' THEN 1 END) as with_doctor_visits,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_visits,
        AVG(CASE WHEN check_out_time IS NOT NULL THEN 
          (julianday(check_out_time) - julianday(check_in_time)) * 24 * 60 
        END) as avg_visit_duration_minutes
       FROM opd_visits
       ${dateFilter}`,
      params
    );

    // Get queue statistics
    const queueStats = await getRow(
      `SELECT 
        COUNT(*) as total_queue_entries,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_queue_entries,
        COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting_queue_entries,
        AVG(estimated_wait_time) as avg_estimated_wait_time,
        AVG(CASE WHEN completed_at IS NOT NULL THEN 
          (julianday(completed_at) - julianday(created_at)) * 24 * 60 
        END) as avg_actual_wait_time_minutes
       FROM opd_queue oq
       LEFT JOIN opd_visits ov ON oq.visit_id = ov.visit_id
       ${dateFilter}`,
      params
    );

    res.json({
      success: true,
      report: {
        type: 'opd_summary',
        period: { startDate, endDate },
        visits: opdStats,
        queue: queueStats
      }
    });

  } catch (error) {
    logger.error('Get OPD summary report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating OPD summary report'
    });
  }
});

// @route   GET /api/reports/ipd-summary
// @desc    Get IPD summary report
// @access  Private (Admin, Manager only)
router.get('/ipd-summary', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE admission_date BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get IPD admission statistics
    const ipdStats = await getRow(
      `SELECT 
        COUNT(*) as total_admissions,
        COUNT(CASE WHEN status = 'admitted' THEN 1 END) as current_admissions,
        COUNT(CASE WHEN status = 'discharged' THEN 1 END) as discharged_admissions,
        COUNT(CASE WHEN admission_type = 'emergency' THEN 1 END) as emergency_admissions,
        COUNT(CASE WHEN admission_type = 'elective' THEN 1 END) as elective_admissions,
        COUNT(CASE WHEN admission_type = 'transfer' THEN 1 END) as transfer_admissions,
        AVG(CASE WHEN discharge_date IS NOT NULL THEN 
          (julianday(discharge_date) - julianday(admission_date)) 
        END) as avg_length_of_stay_days
       FROM ipd_admissions
       ${dateFilter}`,
      params
    );

    // Get ward utilization
    const wardUtilization = await getAll(
      `SELECT 
        w.ward_name,
        w.ward_type,
        w.capacity,
        w.current_occupancy,
        ROUND((w.current_occupancy * 100.0 / w.capacity), 2) as occupancy_rate,
        COUNT(ia.admission_id) as total_admissions
       FROM wards w
       LEFT JOIN ipd_admissions ia ON w.ward_id = ia.ward_id AND ia.status = 'admitted'
       GROUP BY w.ward_id, w.ward_name, w.ward_type, w.capacity, w.current_occupancy
       ORDER BY occupancy_rate DESC`
    );

    res.json({
      success: true,
      report: {
        type: 'ipd_summary',
        period: { startDate, endDate },
        admissions: ipdStats,
        wardUtilization
      }
    });

  } catch (error) {
    logger.error('Get IPD summary report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating IPD summary report'
    });
  }
});

// @route   GET /api/reports/staff-productivity
// @desc    Get staff productivity report
// @access  Private (Admin, Manager only)
router.get('/staff-productivity', authenticate, authorize('admin', 'manager'), validateDateRange, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params = [formatDate(startDate), formatDate(endDate)];
    }

    // Get staff productivity by department
    const staffProductivity = await getAll(
      `SELECT 
        s.department,
        s.position,
        COUNT(DISTINCT s.staff_id) as total_staff,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        COUNT(DISTINCT cn.note_id) as total_notes,
        COUNT(DISTINCT p.prescription_id) as total_prescriptions,
        COUNT(DISTINCT lo.order_id) as total_lab_orders
       FROM staff s
       LEFT JOIN appointments a ON s.staff_id = a.staff_id ${dateFilter.replace('created_at', 'appointment_date')}
       LEFT JOIN clinical_notes cn ON s.staff_id = cn.staff_id ${dateFilter}
       LEFT JOIN prescriptions p ON s.staff_id = p.staff_id ${dateFilter.replace('created_at', 'prescribed_at')}
       LEFT JOIN lab_orders lo ON s.staff_id = lo.staff_id ${dateFilter.replace('created_at', 'order_date')}
       WHERE s.status = 'active'
       GROUP BY s.department, s.position
       ORDER BY s.department, total_appointments DESC`,
      params
    );

    res.json({
      success: true,
      report: {
        type: 'staff_productivity',
        period: { startDate, endDate },
        productivity: staffProductivity
      }
    });

  } catch (error) {
    logger.error('Get staff productivity report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating staff productivity report'
    });
  }
});

// @route   GET /api/reports/custom
// @desc    Generate custom report based on parameters
// @access  Private (Admin only)
router.get('/custom', authenticate, authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportType, startDate, endDate, filters } = req.query;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        error: 'Report type is required'
      });
    }

    // This is a placeholder for custom report generation
    // In a real implementation, you would build dynamic queries based on the reportType and filters
    res.json({
      success: true,
      message: 'Custom report generation not yet implemented',
      parameters: {
        reportType,
        startDate,
        endDate,
        filters
      }
    });

  } catch (error) {
    logger.error('Generate custom report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating custom report'
    });
  }
});

export default router;

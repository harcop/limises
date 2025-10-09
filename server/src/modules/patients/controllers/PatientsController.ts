import { Request, Response } from 'express';
import { PatientModel, BillingAccountModel } from '../../../models';
import { 
  generatePatientId, 
  generateBillingAccountId, 
  formatDate, 
  calculateAge, 
  sanitizeString,
  generateBillingAccountNumber 
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

export class PatientsController {
  // @route   POST /api/patients
  // @desc    Register a new patient (staff-only)
  // @access  Private (Staff only)
  static async createPatient(req: AuthRequest, res: Response) {
    try {
      const {
        firstName,
        lastName,
        middleName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        country,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        bloodType,
        allergies,
        medicalConditions
      } = req.body;

      // Check for duplicate patient
      const duplicateCheck = await PatientModel.findOne({
        $or: [
          { phone: sanitizeString(phone), phone: { $ne: null, $ne: "" } },
          { email: sanitizeString(email), email: { $ne: null, $ne: "" } }
        ]
      });

      if (duplicateCheck) {
        return res.status(409).json({
          success: false,
          error: 'Patient with this phone number or email already exists',
          existingPatient: {
            patientId: duplicateCheck.patientId,
            firstName: duplicateCheck.firstName,
            lastName: duplicateCheck.lastName
          }
        });
      }

      // Generate patient ID
      const patientId = generatePatientId();

      // Create patient
      const patient = new PatientModel({
        patientId,
        firstName: sanitizeString(firstName),
        lastName: sanitizeString(lastName),
        middleName: middleName ? sanitizeString(middleName) : undefined,
        dateOfBirth,
        gender,
        phone: phone ? sanitizeString(phone) : undefined,
        email: email ? sanitizeString(email) : undefined,
        address: address ? sanitizeString(address) : undefined,
        city: city ? sanitizeString(city) : undefined,
        state: state ? sanitizeString(state) : undefined,
        zipCode: zipCode ? sanitizeString(zipCode) : undefined,
        country: country ? sanitizeString(country) : undefined,
        emergencyContactName: emergencyContactName ? sanitizeString(emergencyContactName) : undefined,
        emergencyContactPhone: emergencyContactPhone ? sanitizeString(emergencyContactPhone) : undefined,
        emergencyContactRelationship: emergencyContactRelationship ? sanitizeString(emergencyContactRelationship) : undefined,
        bloodType,
        allergies: allergies || [],
        medicalConditions: medicalConditions || [],
        status: 'active',
        createdAt: new Date().toISOString()
      });

      await patient.save();

      // Create billing account for the patient
      const billingAccountId = generateBillingAccountId();
      const billingAccountNumber = generateBillingAccountNumber();

      const billingAccount = new BillingAccountModel({
        accountId: billingAccountId,
        patientId,
        accountNumber: billingAccountNumber,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      await billingAccount.save();

      logger.info(`Patient ${patientId} created by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: {
          patientId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          age: calculateAge(patient.dateOfBirth),
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          billingAccount: {
            accountId: billingAccountId,
            accountNumber: billingAccountNumber
          }
        }
      });

    } catch (error) {
      logger.error('Create patient error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating patient'
      });
    }
  }

  // @route   GET /api/patients
  // @desc    Get all patients with filters and pagination
  // @access  Private (Staff only)
  static async getPatients(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        search,
        status,
        gender,
        bloodType,
        city,
        state
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (status) filter.status = status;
      if (gender) filter.gender = gender;
      if (bloodType) filter.bloodType = bloodType;
      if (city) filter.city = new RegExp(city as string, 'i');
      if (state) filter.state = new RegExp(state as string, 'i');

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
          { patientId: searchRegex }
        ];
      }

      // Get patients with pagination
      const patients = await PatientModel.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await PatientModel.countDocuments(filter);

      // Add age calculation to each patient
      const patientsWithAge = patients.map(patient => ({
        ...patient.toObject(),
        age: calculateAge(patient.dateOfBirth)
      }));

      res.json({
        success: true,
        data: patientsWithAge,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get patients error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving patients'
      });
    }
  }

  // @route   GET /api/patients/:patientId
  // @desc    Get a specific patient by ID
  // @access  Private (Staff only)
  static async getPatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;

      const patient = await PatientModel.findOne({ patientId }).select('-__v');

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Get billing account
      const billingAccount = await BillingAccountModel.findOne({ patientId });

      res.json({
        success: true,
        data: {
          ...patient.toObject(),
          age: calculateAge(patient.dateOfBirth),
          billingAccount: billingAccount ? {
            accountId: billingAccount.accountId,
            accountNumber: billingAccount.accountNumber,
            balance: billingAccount.balance,
            status: billingAccount.status
          } : null
        }
      });

    } catch (error) {
      logger.error('Get patient error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving patient'
      });
    }
  }

  // @route   PUT /api/patients/:patientId
  // @desc    Update patient information
  // @access  Private (Staff only)
  static async updatePatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const updateData = req.body;

      // Check if patient exists
      const existingPatient = await PatientModel.findOne({ patientId });

      if (!existingPatient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Sanitize string fields
      const sanitizedData: any = {};
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'string' && key !== 'dateOfBirth') {
          sanitizedData[key] = sanitizeString(updateData[key]);
        } else {
          sanitizedData[key] = updateData[key];
        }
      });

      // Update patient
      const updatedPatient = await PatientModel.findOneAndUpdate(
        { patientId },
        { ...sanitizedData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      logger.info(`Patient ${patientId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: {
          ...updatedPatient?.toObject(),
          age: calculateAge(updatedPatient?.dateOfBirth || '')
        }
      });

    } catch (error) {
      logger.error('Update patient error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating patient'
      });
    }
  }

  // @route   DELETE /api/patients/:patientId
  // @desc    Deactivate a patient (soft delete)
  // @access  Private (Admin only)
  static async deactivatePatient(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;

      const patient = await PatientModel.findOneAndUpdate(
        { patientId, status: 'active' },
        { 
          status: 'inactive',
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found or already inactive'
        });
      }

      // Also deactivate billing account
      await BillingAccountModel.findOneAndUpdate(
        { patientId },
        { 
          status: 'inactive',
          updatedAt: new Date().toISOString()
        }
      );

      logger.info(`Patient ${patientId} deactivated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Patient deactivated successfully'
      });

    } catch (error) {
      logger.error('Deactivate patient error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error deactivating patient'
      });
    }
  }

  // @route   GET /api/patients/:patientId/insurance
  // @desc    Get patient insurance information
  // @access  Private (Staff only)
  static async getPatientInsurance(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;

      // Check if patient exists
      const patient = await PatientModel.findOne({ patientId });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Get insurance information (this would be from a separate insurance collection)
      // For now, return a placeholder
      res.json({
        success: true,
        data: {
          patientId,
          insurance: [] // This would be populated from insurance collection
        }
      });

    } catch (error) {
      logger.error('Get patient insurance error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving patient insurance'
      });
    }
  }

  // @route   POST /api/patients/:patientId/insurance
  // @desc    Add insurance information for a patient
  // @access  Private (Staff only)
  static async addPatientInsurance(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const insuranceData = req.body;

      // Check if patient exists
      const patient = await PatientModel.findOne({ patientId });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Add insurance information (this would be saved to a separate insurance collection)
      // For now, return a placeholder
      res.status(201).json({
        success: true,
        message: 'Insurance information added successfully',
        data: {
          patientId,
          insurance: insuranceData
        }
      });

    } catch (error) {
      logger.error('Add patient insurance error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error adding patient insurance'
      });
    }
  }

  // @route   GET /api/patients/stats
  // @desc    Get patient statistics
  // @access  Private (Staff only)
  static async getPatientStats(req: AuthRequest, res: Response) {
    try {
      const totalPatients = await PatientModel.countDocuments();
      const activePatients = await PatientModel.countDocuments({ status: 'active' });
      const inactivePatients = await PatientModel.countDocuments({ status: 'inactive' });
      
      const malePatients = await PatientModel.countDocuments({ gender: 'male' });
      const femalePatients = await PatientModel.countDocuments({ gender: 'female' });
      const otherGenderPatients = await PatientModel.countDocuments({ gender: 'other' });

      res.json({
        success: true,
        data: {
          totalPatients,
          activePatients,
          inactivePatients,
          malePatients,
          femalePatients,
          otherGenderPatients
        }
      });

    } catch (error) {
      logger.error('Get patient stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving patient statistics'
      });
    }
  }
}

import { BaseService } from '../../base/Service';
import { PatientModel, BillingAccountModel } from '../../../models';
import { 
  generatePatientId, 
  generateBillingAccountId, 
  calculateAge, 
  sanitizeString,
  generateBillingAccountNumber 
} from '../../../utils/helpers';

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
}

export interface PatientFiltersDto {
  search?: string;
  status?: string;
  gender?: string;
  bloodType?: string;
  city?: string;
  state?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class PatientsService extends BaseService {
  constructor() {
    super('PatientsService');
  }

  async createPatient(patientData: CreatePatientDto): Promise<any> {
    try {
      // Check for duplicate patient
      const duplicateCheck = await PatientModel.findOne({
        $or: [
          { phone: sanitizeString(patientData.phone || '') },
          { email: sanitizeString(patientData.email || '') }
        ]
      });

      if (duplicateCheck) {
        throw new Error('Patient with this phone number or email already exists');
      }

      // Generate patient ID
      const patientId = generatePatientId();

      // Create patient
      const patient = new PatientModel({
        patientId,
        firstName: sanitizeString(patientData.firstName),
        lastName: sanitizeString(patientData.lastName),
        middleName: patientData.middleName ? sanitizeString(patientData.middleName) : undefined,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        phone: patientData.phone ? sanitizeString(patientData.phone) : undefined,
        email: patientData.email ? sanitizeString(patientData.email) : undefined,
        address: patientData.address ? sanitizeString(patientData.address) : undefined,
        city: patientData.city ? sanitizeString(patientData.city) : undefined,
        state: patientData.state ? sanitizeString(patientData.state) : undefined,
        zipCode: patientData.zipCode ? sanitizeString(patientData.zipCode) : undefined,
        country: patientData.country ? sanitizeString(patientData.country) : undefined,
        emergencyContactName: patientData.emergencyContactName ? sanitizeString(patientData.emergencyContactName) : undefined,
        emergencyContactPhone: patientData.emergencyContactPhone ? sanitizeString(patientData.emergencyContactPhone) : undefined,
        emergencyContactRelationship: patientData.emergencyContactRelationship ? sanitizeString(patientData.emergencyContactRelationship) : undefined,
        bloodType: patientData.bloodType,
        allergies: patientData.allergies || [],
        medicalConditions: patientData.medicalConditions || [],
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

      this.log('info', `Patient ${patientId} created`);

      return {
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
      };
    } catch (error) {
      this.handleError(error, 'Create patient');
    }
  }

  async getPatients(filters: PatientFiltersDto, pagination: PaginationDto): Promise<{ patients: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build filter object
      const filter: any = {};
      
      if (filters.status) filter.status = filters.status;
      if (filters.gender) filter.gender = filters.gender;
      if (filters.bloodType) filter.bloodType = filters.bloodType;
      if (filters.city) filter.city = new RegExp(filters.city, 'i');
      if (filters.state) filter.state = new RegExp(filters.state, 'i');

      // Search filter
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
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
      const patientsWithAge = patients.map((patient: any) => ({
        ...patient.toObject(),
        age: calculateAge(patient.dateOfBirth)
      }));

      return {
        patients: patientsWithAge,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get patients');
    }
  }

  async getPatient(patientId: string): Promise<any> {
    try {
      const patient = await PatientModel.findOne({ patientId }).select('-__v');

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Get billing account
      const billingAccount = await BillingAccountModel.findOne({ patientId });

      return {
        ...patient.toObject(),
        age: calculateAge(patient.dateOfBirth),
        billingAccount: billingAccount ? {
          accountId: billingAccount.accountId,
          accountNumber: billingAccount.accountNumber,
          balance: billingAccount.balance,
          status: billingAccount.status
        } : null
      };
    } catch (error) {
      this.handleError(error, 'Get patient');
    }
  }

  async updatePatient(patientId: string, updateData: UpdatePatientDto): Promise<any> {
    try {
      // Check if patient exists
      const existingPatient = await PatientModel.findOne({ patientId });

      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      // Sanitize string fields
      const sanitizedData: any = {};
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key as keyof UpdatePatientDto] === 'string' && key !== 'dateOfBirth') {
          sanitizedData[key] = sanitizeString(updateData[key as keyof UpdatePatientDto] as string);
        } else {
          sanitizedData[key] = updateData[key as keyof UpdatePatientDto];
        }
      });

      // Update patient
      const updatedPatient = await PatientModel.findOneAndUpdate(
        { patientId },
        { ...sanitizedData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      this.log('info', `Patient ${patientId} updated`);

      return {
        ...updatedPatient?.toObject(),
        age: calculateAge(updatedPatient?.dateOfBirth || '')
      };
    } catch (error) {
      this.handleError(error, 'Update patient');
    }
  }

  async deactivatePatient(patientId: string): Promise<boolean> {
    try {
      const patient = await PatientModel.findOneAndUpdate(
        { patientId, status: 'active' },
        { 
          status: 'inactive',
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );

      if (!patient) {
        throw new Error('Patient not found or already inactive');
      }

      // Also deactivate billing account
      await BillingAccountModel.findOneAndUpdate(
        { patientId },
        { 
          status: 'inactive',
          updatedAt: new Date().toISOString()
        }
      );

      this.log('info', `Patient ${patientId} deactivated`);
      return true;
    } catch (error) {
      this.handleError(error, 'Deactivate patient');
    }
  }

  async getPatientStats(): Promise<any> {
    try {
      const totalPatients = await PatientModel.countDocuments();
      const activePatients = await PatientModel.countDocuments({ status: 'active' });
      const inactivePatients = await PatientModel.countDocuments({ status: 'inactive' });
      
      const malePatients = await PatientModel.countDocuments({ gender: 'male' });
      const femalePatients = await PatientModel.countDocuments({ gender: 'female' });
      const otherGenderPatients = await PatientModel.countDocuments({ gender: 'other' });

      return {
        totalPatients,
        activePatients,
        inactivePatients,
        malePatients,
        femalePatients,
        otherGenderPatients
      };
    } catch (error) {
      this.handleError(error, 'Get patient stats');
    }
  }

  async getPatientInsurance(patientId: string): Promise<any> {
    try {
      // Check if patient exists
      const patient = await PatientModel.findOne({ patientId });

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Get insurance information (this would be from a separate insurance collection)
      // For now, return a placeholder
      return {
        patientId,
        insurance: [] // This would be populated from insurance collection
      };
    } catch (error) {
      this.handleError(error, 'Get patient insurance');
    }
  }

  async addPatientInsurance(patientId: string, insuranceData: any): Promise<any> {
    try {
      // Check if patient exists
      const patient = await PatientModel.findOne({ patientId });

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Add insurance information (this would be saved to a separate insurance collection)
      // For now, return a placeholder
      return {
        patientId,
        insurance: insuranceData
      };
    } catch (error) {
      this.handleError(error, 'Add patient insurance');
    }
  }
}

import { WardModel, BedModel, IPDAdmissionModel } from '../models';
import { CreateWardDto, UpdateWardDto, CreateBedDto, UpdateBedDto, CreateIPDAdmissionDto, UpdateIPDAdmissionDto, DischargePatientDto } from '../dto/CreateIPDDto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';

export class IPDService {
  // ==============================================
  // WARD MANAGEMENT
  // ==============================================

  async createWard(wardData: CreateWardDto): Promise<any> {
    try {
      const wardId = `WARD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const ward = new WardModel({
        wardId,
        ...wardData,
        currentOccupancy: 0
      });

      const savedWard = await ward.save();
      logger.info(`Ward created: ${wardId} - ${wardData.wardName}`);
      
      return savedWard;
    } catch (error) {
      logger.error('Error creating ward:', error);
      throw error;
    }
  }

  async getWards(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.wardType) query.wardType = filters.wardType;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const wards = await WardModel.find(query)
        .sort({ wardName: 1 })
        .skip(skip)
        .limit(limit);

      const total = await WardModel.countDocuments(query);

      return {
        wards,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching wards:', error);
      throw error;
    }
  }

  async getWardById(wardId: string): Promise<any> {
    try {
      const ward = await WardModel.findOne({ wardId });
      if (!ward) {
        throw new Error('Ward not found');
      }
      return ward;
    } catch (error) {
      logger.error('Error fetching ward:', error);
      throw error;
    }
  }

  async updateWard(wardId: string, updateData: UpdateWardDto): Promise<any> {
    try {
      const ward = await WardModel.findOneAndUpdate(
        { wardId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!ward) {
        throw new Error('Ward not found');
      }

      logger.info(`Ward updated: ${wardId}`);
      return ward;
    } catch (error) {
      logger.error('Error updating ward:', error);
      throw error;
    }
  }

  // ==============================================
  // BED MANAGEMENT
  // ==============================================

  async createBed(bedData: CreateBedDto): Promise<any> {
    try {
      // Check if ward exists
      const ward = await WardModel.findOne({ wardId: bedData.wardId });
      if (!ward) {
        throw new Error('Ward not found');
      }

      const bedId = `BED${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const bed = new BedModel({
        bedId,
        ...bedData,
        status: 'available'
      });

      const savedBed = await bed.save();
      logger.info(`Bed created: ${bedId} in ward: ${bedData.wardId}`);
      
      return savedBed;
    } catch (error) {
      logger.error('Error creating bed:', error);
      throw error;
    }
  }

  async getBeds(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.wardId) query.wardId = filters.wardId;
      if (filters.bedType) query.bedType = filters.bedType;
      if (filters.status) query.status = filters.status;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const beds = await BedModel.find(query)
        .populate('wardId', 'wardId wardName wardType')
        .sort({ wardId: 1, bedNumber: 1 })
        .skip(skip)
        .limit(limit);

      const total = await BedModel.countDocuments(query);

      return {
        beds,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching beds:', error);
      throw error;
    }
  }

  async getBedById(bedId: string): Promise<any> {
    try {
      const bed = await BedModel.findOne({ bedId })
        .populate('wardId', 'wardId wardName wardType');
      
      if (!bed) {
        throw new Error('Bed not found');
      }
      return bed;
    } catch (error) {
      logger.error('Error fetching bed:', error);
      throw error;
    }
  }

  async updateBed(bedId: string, updateData: UpdateBedDto): Promise<any> {
    try {
      const bed = await BedModel.findOneAndUpdate(
        { bedId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('wardId', 'wardId wardName wardType');

      if (!bed) {
        throw new Error('Bed not found');
      }

      logger.info(`Bed updated: ${bedId}`);
      return bed;
    } catch (error) {
      logger.error('Error updating bed:', error);
      throw error;
    }
  }

  async getAvailableBeds(wardId?: string, bedType?: string): Promise<any> {
    try {
      const query: any = {
        status: 'available',
        isActive: true
      };
      
      if (wardId) query.wardId = wardId;
      if (bedType) query.bedType = bedType;

      const beds = await BedModel.find(query)
        .populate('wardId', 'wardId wardName wardType')
        .sort({ wardId: 1, bedNumber: 1 });

      return beds;
    } catch (error) {
      logger.error('Error fetching available beds:', error);
      throw error;
    }
  }

  // ==============================================
  // IPD ADMISSION MANAGEMENT
  // ==============================================

  async createIPDAdmission(admissionData: CreateIPDAdmissionDto): Promise<any> {
    try {
      // Check if bed is available
      const bed = await BedModel.findOne({ bedId: admissionData.bedId });
      if (!bed) {
        throw new Error('Bed not found');
      }
      if (bed.status !== 'available') {
        throw new Error('Bed is not available');
      }

      const admissionId = `ADM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const admission = new IPDAdmissionModel({
        admissionId,
        ...admissionData,
        status: 'admitted'
      });

      const savedAdmission = await admission.save();

      // Update bed status to occupied
      await BedModel.findOneAndUpdate(
        { bedId: admissionData.bedId },
        { status: 'occupied' }
      );

      // Update ward occupancy
      await WardModel.findOneAndUpdate(
        { wardId: admissionData.wardId },
        { $inc: { currentOccupancy: 1 } }
      );

      logger.info(`IPD admission created: ${admissionId} for patient: ${admissionData.patientId}`);
      
      return savedAdmission;
    } catch (error) {
      logger.error('Error creating IPD admission:', error);
      throw error;
    }
  }

  async getIPDAdmissions(filters: any = {}, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.wardId) query.wardId = filters.wardId;
      if (filters.status) query.status = filters.status;
      if (filters.admissionType) query.admissionType = filters.admissionType;
      if (filters.admissionDate) {
        const date = new Date(filters.admissionDate);
        query.admissionDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }

      const admissions = await IPDAdmissionModel.find(query)
        .populate('patientId', 'patientId firstName lastName phone')
        .populate('staffId', 'staffId firstName lastName department')
        .populate('wardId', 'wardId wardName wardType')
        .populate('bedId', 'bedId bedNumber bedType dailyRate')
        .sort({ admissionDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await IPDAdmissionModel.countDocuments(query);

      return {
        admissions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Error fetching IPD admissions:', error);
      throw error;
    }
  }

  async getIPDAdmissionById(admissionId: string): Promise<any> {
    try {
      const admission = await IPDAdmissionModel.findOne({ admissionId })
        .populate('patientId', 'patientId firstName lastName phone email dateOfBirth gender')
        .populate('staffId', 'staffId firstName lastName department position')
        .populate('wardId', 'wardId wardName wardType')
        .populate('bedId', 'bedId bedNumber bedType dailyRate');

      if (!admission) {
        throw new Error('IPD admission not found');
      }

      return admission;
    } catch (error) {
      logger.error('Error fetching IPD admission:', error);
      throw error;
    }
  }

  async updateIPDAdmission(admissionId: string, updateData: UpdateIPDAdmissionDto): Promise<any> {
    try {
      const admission = await IPDAdmissionModel.findOneAndUpdate(
        { admissionId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('patientId', 'patientId firstName lastName')
       .populate('staffId', 'staffId firstName lastName department')
       .populate('wardId', 'wardId wardName wardType')
       .populate('bedId', 'bedId bedNumber bedType');

      if (!admission) {
        throw new Error('IPD admission not found');
      }

      logger.info(`IPD admission updated: ${admissionId}`);
      return admission;
    } catch (error) {
      logger.error('Error updating IPD admission:', error);
      throw error;
    }
  }

  async dischargePatient(admissionId: string, dischargeData: DischargePatientDto): Promise<any> {
    try {
      const admission = await IPDAdmissionModel.findOne({ admissionId });
      if (!admission) {
        throw new Error('IPD admission not found');
      }

      // Update admission
      const updatedAdmission = await IPDAdmissionModel.findOneAndUpdate(
        { admissionId },
        {
          status: 'discharged',
          dischargeDate: new Date(dischargeData.dischargeDate),
          dischargeTime: dischargeData.dischargeTime,
          notes: dischargeData.dischargeNotes,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('patientId', 'patientId firstName lastName')
       .populate('wardId', 'wardId wardName')
       .populate('bedId', 'bedId bedNumber');

      // Update bed status to available
      await BedModel.findOneAndUpdate(
        { bedId: admission.bedId },
        { status: 'available' }
      );

      // Update ward occupancy
      await WardModel.findOneAndUpdate(
        { wardId: admission.wardId },
        { $inc: { currentOccupancy: -1 } }
      );

      logger.info(`Patient discharged: ${admissionId}`);
      return updatedAdmission;
    } catch (error) {
      logger.error('Error discharging patient:', error);
      throw error;
    }
  }

  // ==============================================
  // DASHBOARD & ANALYTICS
  // ==============================================

  async getIPDDashboardStats(date?: string): Promise<any> {
    try {
      const query: any = {};
      if (date) {
        const targetDate = new Date(date);
        query.admissionDate = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      }

      const stats = await IPDAdmissionModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalAdmissions = await IPDAdmissionModel.countDocuments(query);
      const currentAdmissions = await IPDAdmissionModel.countDocuments({ ...query, status: 'admitted' });
      const totalWards = await WardModel.countDocuments({ isActive: true });
      const totalBeds = await BedModel.countDocuments({ isActive: true });
      const availableBeds = await BedModel.countDocuments({ status: 'available', isActive: true });

      return {
        totalAdmissions,
        currentAdmissions,
        totalWards,
        totalBeds,
        availableBeds,
        occupancyRate: totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0,
        statusBreakdown: stats
      };
    } catch (error) {
      logger.error('Error fetching IPD dashboard stats:', error);
      throw error;
    }
  }

  async getWardOccupancyStats(): Promise<any> {
    try {
      const wards = await WardModel.find({ isActive: true })
        .populate({
          path: 'beds',
          model: 'Bed',
          match: { isActive: true }
        });

      const wardStats = await Promise.all(wards.map(async (ward) => {
        const totalBeds = await BedModel.countDocuments({ wardId: ward.wardId, isActive: true });
        const occupiedBeds = await BedModel.countDocuments({ wardId: ward.wardId, status: 'occupied', isActive: true });
        
        return {
          wardId: ward.wardId,
          wardName: ward.wardName,
          wardType: ward.wardType,
          totalBeds,
          occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
        };
      }));

      return wardStats;
    } catch (error) {
      logger.error('Error fetching ward occupancy stats:', error);
      throw error;
    }
  }
}

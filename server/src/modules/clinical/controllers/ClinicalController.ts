import { Request, Response } from 'express';
import { ClinicalNoteModel, PrescriptionModel, DrugMasterModel } from '../../models';
import { runQuery, getRow, getAll } from '../../../database/legacy';
import { 
  generateClinicalNoteId, 
  generatePrescriptionId,
  formatDate, 
  formatTime 
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';
import { AuthRequest } from '../../../types';

export class ClinicalController {
  // @route   POST /api/clinical/notes
  // @desc    Create a new clinical note
  // @access  Private (Doctor, Nurse only)
  static async createClinicalNote(req: AuthRequest, res: Response) {
    try {
      const {
        patientId,
        staffId,
        appointmentId,
        noteType,
        chiefComplaint,
        historyOfPresentIllness,
        physicalExamination,
        assessment,
        plan
      } = req.body;

      // Validate required fields
      if (!patientId || !staffId || !noteType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Generate clinical note ID
      const noteId = generateClinicalNoteId();

      // Create clinical note
      const clinicalNote = new ClinicalNoteModel({
        noteId,
        patientId,
        staffId,
        appointmentId,
        noteType,
        chiefComplaint,
        historyOfPresentIllness,
        physicalExamination,
        assessment,
        plan,
        isSigned: false,
        createdAt: new Date().toISOString()
      });

      await clinicalNote.save();

      logger.info(`Clinical note ${noteId} created for patient ${patientId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Clinical note created successfully',
        data: {
          noteId,
          patientId,
          staffId,
          appointmentId,
          noteType,
          isSigned: false,
          createdAt: clinicalNote.createdAt
        }
      });

    } catch (error) {
      logger.error('Create clinical note error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating clinical note'
      });
    }
  }

  // @route   GET /api/clinical/notes
  // @desc    Get clinical notes with filters and pagination
  // @access  Private (Doctor, Nurse only)
  static async getClinicalNotes(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        staffId,
        noteType,
        isSigned,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (patientId) filter.patientId = patientId;
      if (staffId) filter.staffId = staffId;
      if (noteType) filter.noteType = noteType;
      if (isSigned !== undefined) filter.isSigned = isSigned === 'true';

      // Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      // Get clinical notes with pagination
      const notes = await ClinicalNoteModel.find(filter)
        .populate('patientId', 'firstName lastName')
        .populate('staffId', 'firstName lastName department position')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await ClinicalNoteModel.countDocuments(filter);

      res.json({
        success: true,
        data: notes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get clinical notes error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving clinical notes'
      });
    }
  }

  // @route   GET /api/clinical/notes/:noteId
  // @desc    Get a specific clinical note
  // @access  Private (Doctor, Nurse only)
  static async getClinicalNote(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;

      const note = await ClinicalNoteModel.findOne({ noteId })
        .populate('patientId', 'firstName lastName dateOfBirth gender')
        .populate('staffId', 'firstName lastName department position');

      if (!note) {
        return res.status(404).json({
          success: false,
          error: 'Clinical note not found'
        });
      }

      res.json({
        success: true,
        data: note
      });

    } catch (error) {
      logger.error('Get clinical note error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving clinical note'
      });
    }
  }

  // @route   PUT /api/clinical/notes/:noteId
  // @desc    Update a clinical note
  // @access  Private (Doctor, Nurse only)
  static async updateClinicalNote(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const updateData = req.body;

      // Check if note exists
      const existingNote = await ClinicalNoteModel.findOne({ noteId });

      if (!existingNote) {
        return res.status(404).json({
          success: false,
          error: 'Clinical note not found'
        });
      }

      // Update clinical note
      const updatedNote = await ClinicalNoteModel.findOneAndUpdate(
        { noteId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).populate('patientId', 'firstName lastName')
       .populate('staffId', 'firstName lastName department position');

      logger.info(`Clinical note ${noteId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Clinical note updated successfully',
        data: updatedNote
      });

    } catch (error) {
      logger.error('Update clinical note error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating clinical note'
      });
    }
  }

  // @route   PUT /api/clinical/notes/:noteId/sign
  // @desc    Sign a clinical note
  // @access  Private (Doctor only)
  static async signClinicalNote(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;

      const note = await ClinicalNoteModel.findOneAndUpdate(
        { noteId, isSigned: false },
        { 
          isSigned: true,
          signedBy: req.user?.staffId,
          signedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { new: true }
      ).populate('patientId', 'firstName lastName')
       .populate('staffId', 'firstName lastName department position');

      if (!note) {
        return res.status(404).json({
          success: false,
          error: 'Clinical note not found or already signed'
        });
      }

      logger.info(`Clinical note ${noteId} signed by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Clinical note signed successfully',
        data: note
      });

    } catch (error) {
      logger.error('Sign clinical note error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error signing clinical note'
      });
    }
  }

  // @route   POST /api/clinical/prescriptions
  // @desc    Create a new prescription
  // @access  Private (Doctor only)
  static async createPrescription(req: AuthRequest, res: Response) {
    try {
      const {
        patientId,
        staffId,
        drugId,
        dosage,
        frequency,
        duration,
        quantity,
        refillsAllowed,
        instructions
      } = req.body;

      // Validate required fields
      if (!patientId || !staffId || !drugId || !dosage || !frequency || !duration || !quantity) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if drug exists
      const drug = await DrugMasterModel.findOne({ drugId, isActive: true });

      if (!drug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found or inactive'
        });
      }

      // Generate prescription ID
      const prescriptionId = generatePrescriptionId();

      // Create prescription
      const prescription = new PrescriptionModel({
        prescriptionId,
        patientId,
        staffId,
        drugId,
        dosage,
        frequency,
        duration,
        quantity,
        refillsAllowed: refillsAllowed || 0,
        refillsUsed: 0,
        instructions,
        prescribedAt: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      });

      await prescription.save();

      logger.info(`Prescription ${prescriptionId} created for patient ${patientId} by user ${req.user?.staffId}`);

      res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        data: {
          prescriptionId,
          patientId,
          staffId,
          drugId,
          drugName: drug.drugName,
          dosage,
          frequency,
          duration,
          quantity,
          refillsAllowed: prescription.refillsAllowed,
          isActive: true
        }
      });

    } catch (error) {
      logger.error('Create prescription error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error creating prescription'
      });
    }
  }

  // @route   GET /api/clinical/prescriptions
  // @desc    Get prescriptions with filters and pagination
  // @access  Private (Doctor, Nurse only)
  static async getPrescriptions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;
      const {
        patientId,
        staffId,
        isActive,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (patientId) filter.patientId = patientId;
      if (staffId) filter.staffId = staffId;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      // Date range filter
      if (startDate || endDate) {
        filter.prescribedAt = {};
        if (startDate) filter.prescribedAt.$gte = startDate;
        if (endDate) filter.prescribedAt.$lte = endDate;
      }

      // Get prescriptions with pagination
      const prescriptions = await PrescriptionModel.find(filter)
        .populate('patientId', 'firstName lastName')
        .populate('staffId', 'firstName lastName department position')
        .populate('drugId', 'drugName genericName dosageForm strength')
        .sort({ prescribedAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await PrescriptionModel.countDocuments(filter);

      res.json({
        success: true,
        data: prescriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get prescriptions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving prescriptions'
      });
    }
  }

  // @route   GET /api/clinical/prescriptions/:prescriptionId
  // @desc    Get a specific prescription
  // @access  Private (Doctor, Nurse only)
  static async getPrescription(req: AuthRequest, res: Response) {
    try {
      const { prescriptionId } = req.params;

      const prescription = await PrescriptionModel.findOne({ prescriptionId })
        .populate('patientId', 'firstName lastName dateOfBirth gender')
        .populate('staffId', 'firstName lastName department position')
        .populate('drugId', 'drugName genericName dosageForm strength manufacturer');

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      res.json({
        success: true,
        data: prescription
      });

    } catch (error) {
      logger.error('Get prescription error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving prescription'
      });
    }
  }

  // @route   PUT /api/clinical/prescriptions/:prescriptionId
  // @desc    Update a prescription
  // @access  Private (Doctor only)
  static async updatePrescription(req: AuthRequest, res: Response) {
    try {
      const { prescriptionId } = req.params;
      const updateData = req.body;

      // Check if prescription exists
      const existingPrescription = await PrescriptionModel.findOne({ prescriptionId });

      if (!existingPrescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      // Update prescription
      const updatedPrescription = await PrescriptionModel.findOneAndUpdate(
        { prescriptionId },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).populate('patientId', 'firstName lastName')
       .populate('staffId', 'firstName lastName department position')
       .populate('drugId', 'drugName genericName dosageForm strength');

      logger.info(`Prescription ${prescriptionId} updated by user ${req.user?.staffId}`);

      res.json({
        success: true,
        message: 'Prescription updated successfully',
        data: updatedPrescription
      });

    } catch (error) {
      logger.error('Update prescription error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating prescription'
      });
    }
  }

  // @route   GET /api/clinical/drugs
  // @desc    Get drug master list
  // @access  Private (Doctor, Nurse only)
  static async getDrugs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 50;
      const offset = (page - 1) * limit;
      const { search, drugClass, isControlled } = req.query;

      // Build filter object
      const filter: any = { isActive: true };
      
      if (drugClass) filter.drugClass = drugClass;
      if (isControlled !== undefined) filter.isControlled = isControlled === 'true';

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [
          { drugName: searchRegex },
          { genericName: searchRegex },
          { drugClass: searchRegex }
        ];
      }

      // Get drugs with pagination
      const drugs = await DrugMasterModel.find(filter)
        .select('-__v')
        .sort({ drugName: 1 })
        .skip(offset)
        .limit(limit);

      const total = await DrugMasterModel.countDocuments(filter);

      res.json({
        success: true,
        data: drugs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get drugs error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving drugs'
      });
    }
  }

  // @route   GET /api/clinical/drugs/:drugId
  // @desc    Get a specific drug
  // @access  Private (Doctor, Nurse only)
  static async getDrug(req: AuthRequest, res: Response) {
    try {
      const { drugId } = req.params;

      const drug = await DrugMasterModel.findOne({ drugId, isActive: true });

      if (!drug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found or inactive'
        });
      }

      res.json({
        success: true,
        data: drug
      });

    } catch (error) {
      logger.error('Get drug error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving drug'
      });
    }
  }
}

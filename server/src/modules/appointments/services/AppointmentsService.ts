import { BaseService } from '../../base/Service';
import { AppointmentModel, PatientModel, StaffModel } from '../../../models';
import { 
  generateAppointmentId, 
  hasTimeConflict,
  calculateAppointmentDuration,
  isWithinBusinessHours,
  sanitizeString
} from '../../../utils/helpers';
import moment from 'moment';

export interface CreateAppointmentDto {
  patientId: string;
  staffId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  appointmentType: string;
  reasonForVisit?: string;
  notes?: string;
  roomNumber?: string;
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  appointmentType?: string;
  reasonForVisit?: string;
  notes?: string;
  roomNumber?: string;
  status?: string;
}

export interface AppointmentFiltersDto {
  patientId?: string;
  staffId?: string;
  appointmentDate?: string;
  appointmentType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  roomNumber?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export class AppointmentsService extends BaseService {
  constructor() {
    super('AppointmentsService');
  }

  private async checkAppointmentConflict(
    staffId: string, 
    appointmentDate: string, 
    appointmentTime: string, 
    duration: number, 
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const startTime = moment(appointmentTime, 'HH:mm');
    const endTime = moment(appointmentTime, 'HH:mm').add(duration, 'minutes');
    
    const query: any = {
      staffId,
      appointmentDate,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
    };
    
    if (excludeAppointmentId) {
      query.appointmentId = { $ne: excludeAppointmentId };
    }
    
    const existingAppointments = await AppointmentModel.find(query);
    
    return existingAppointments.some(appointment => {
      const existingStart = moment(appointment.appointmentTime, 'HH:mm');
      const existingEnd = moment(appointment.appointmentTime, 'HH:mm').add(appointment.duration, 'minutes');
      
      return hasTimeConflict(
        startTime.format('HH:mm'),
        endTime.format('HH:mm'),
        existingStart.format('HH:mm'),
        existingEnd.format('HH:mm')
      );
    });
  }

  async createAppointment(appointmentData: CreateAppointmentDto): Promise<any> {
    try {
      // Validate appointment date is not in the past
      const appointmentDateTime = new Date(`${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`);
      if (appointmentDateTime < new Date()) {
        throw new Error('Cannot schedule appointments in the past');
      }

      // Check if patient exists
      const patient = await PatientModel.findOne({ 
        patientId: appointmentData.patientId, 
        status: 'active' 
      });

      if (!patient) {
        throw new Error('Patient not found or inactive');
      }

      // Check if staff exists
      const staff = await StaffModel.findOne({ 
        staffId: appointmentData.staffId, 
        status: 'active' 
      });

      if (!staff) {
        throw new Error('Staff member not found or inactive');
      }

      // Check for time conflicts
      const hasConflict = await this.checkAppointmentConflict(
        appointmentData.staffId,
        appointmentData.appointmentDate,
        appointmentData.appointmentTime,
        appointmentData.duration || calculateAppointmentDuration(appointmentData.appointmentType)
      );

      if (hasConflict) {
        throw new Error('Time conflict detected with existing appointment');
      }

      // Check business hours
      if (!isWithinBusinessHours(appointmentData.appointmentTime)) {
        throw new Error('Appointment time is outside business hours');
      }

      // Generate appointment ID
      const appointmentId = generateAppointmentId();

      // Create appointment
      const appointment = new AppointmentModel({
        appointmentId,
        patientId: appointmentData.patientId,
        staffId: appointmentData.staffId,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        duration: appointmentData.duration || calculateAppointmentDuration(appointmentData.appointmentType),
        appointmentType: appointmentData.appointmentType,
        reasonForVisit: appointmentData.reasonForVisit ? sanitizeString(appointmentData.reasonForVisit) : undefined,
        notes: appointmentData.notes ? sanitizeString(appointmentData.notes) : undefined,
        roomNumber: appointmentData.roomNumber,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      });

      await appointment.save();

      this.log('info', `Appointment created: ${appointmentId}`);

      return {
        appointmentId,
        patientId: appointmentData.patientId,
        staffId: appointmentData.staffId,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        duration: appointment.duration,
        appointmentType: appointmentData.appointmentType,
        status: 'scheduled'
      };
    } catch (error) {
      this.handleError(error, 'Create appointment');
    }
  }

  async getAppointments(filters: AppointmentFiltersDto, pagination: PaginationDto): Promise<{ appointments: any[]; pagination: any }> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (filters.patientId) filter.patientId = filters.patientId;
      if (filters.staffId) filter.staffId = filters.staffId;
      if (filters.appointmentDate) filter.appointmentDate = filters.appointmentDate;
      if (filters.appointmentType) filter.appointmentType = filters.appointmentType;
      if (filters.status) filter.status = filters.status;
      if (filters.roomNumber) filter.roomNumber = filters.roomNumber;

      // Date range filter
      if (filters.startDate && filters.endDate) {
        filter.appointmentDate = {
          $gte: filters.startDate,
          $lte: filters.endDate
        };
      }

      const total = await AppointmentModel.countDocuments(filter);
      const appointments = await AppointmentModel.find(filter)
        .populate('patientId', 'firstName lastName phone')
        .populate('staffId', 'firstName lastName department')
        .select('-__v')
        .sort({ appointmentDate: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Get appointments');
    }
  }

  async getAppointment(appointmentId: string): Promise<any> {
    try {
      const appointment = await AppointmentModel.findOne({ appointmentId })
        .populate('patientId', 'firstName lastName phone email dateOfBirth gender')
        .populate('staffId', 'firstName lastName department position')
        .select('-__v')
        .lean();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      this.handleError(error, 'Get appointment');
    }
  }

  async updateAppointment(appointmentId: string, updateData: UpdateAppointmentDto): Promise<any> {
    try {
      // Check if appointment exists
      const existingAppointment = await AppointmentModel.findOne({ appointmentId });
      if (!existingAppointment) {
        throw new Error('Appointment not found');
      }

      // If updating time, check for conflicts
      if (updateData.appointmentTime || updateData.duration || updateData.appointmentDate) {
        const appointmentDate = updateData.appointmentDate || existingAppointment.appointmentDate;
        const appointmentTime = updateData.appointmentTime || existingAppointment.appointmentTime;
        const duration = updateData.duration || existingAppointment.duration;

        const hasConflict = await this.checkAppointmentConflict(
          existingAppointment.staffId,
          appointmentDate,
          appointmentTime,
          duration,
          appointmentId // Exclude current appointment from conflict check
        );

        if (hasConflict) {
          throw new Error('Time conflict detected with existing appointment');
        }
      }

      // Sanitize string fields
      const sanitizedData = { ...updateData };
      if (sanitizedData.reasonForVisit) {
        const sanitized = sanitizeString(sanitizedData.reasonForVisit);
        if (sanitized) sanitizedData.reasonForVisit = sanitized;
      }
      if (sanitizedData.notes) {
        const sanitized = sanitizeString(sanitizedData.notes);
        if (sanitized) sanitizedData.notes = sanitized;
      }

      const updatedAppointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId },
        { ...sanitizedData, updatedAt: new Date().toISOString() },
        { new: true }
      ).select('-__v');

      this.log('info', `Appointment updated: ${appointmentId}`);
      return updatedAppointment;
    } catch (error) {
      this.handleError(error, 'Update appointment');
    }
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      const updatedAppointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId, status: { $in: ['scheduled', 'confirmed'] } },
        { 
          status: 'cancelled',
          cancellationReason: reason ? sanitizeString(reason) : undefined,
          cancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );

      if (!updatedAppointment) {
        throw new Error('Appointment not found or cannot be cancelled');
      }

      this.log('info', `Appointment cancelled: ${appointmentId}`);
      return true;
    } catch (error) {
      this.handleError(error, 'Cancel appointment');
    }
  }

  async rescheduleAppointment(appointmentId: string, newDate: string, newAppointmentTime: string, newDuration?: number): Promise<any> {
    try {
      // Check if appointment exists
      const existingAppointment = await AppointmentModel.findOne({ appointmentId });
      if (!existingAppointment) {
        throw new Error('Appointment not found');
      }

      // Check for time conflicts with new time
      const duration = newDuration || existingAppointment.duration;
      const hasConflict = await this.checkAppointmentConflict(
        existingAppointment.staffId,
        newDate,
        newAppointmentTime,
        duration,
        appointmentId
      );

      if (hasConflict) {
        throw new Error('Time conflict detected with existing appointment');
      }

      // Check business hours
      if (!isWithinBusinessHours(newAppointmentTime)) {
        throw new Error('New appointment time is outside business hours');
      }

      const updatedAppointment = await AppointmentModel.findOneAndUpdate(
        { appointmentId },
        { 
          appointmentDate: newDate,
          appointmentTime: newAppointmentTime,
          duration: duration,
          status: 'scheduled',
          updatedAt: new Date().toISOString()
        },
        { new: true }
      ).select('-__v');

      this.log('info', `Appointment rescheduled: ${appointmentId}`);
      return updatedAppointment;
    } catch (error) {
      this.handleError(error, 'Reschedule appointment');
    }
  }

  async getAppointmentStats(filters: { startDate?: string; endDate?: string }): Promise<any> {
    try {
      const matchFilter: any = {};
      if (filters.startDate && filters.endDate) {
        matchFilter.appointmentDate = {
          $gte: filters.startDate,
          $lte: filters.endDate
        };
      }

      const stats = await AppointmentModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            scheduledAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
            },
            confirmedAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            completedAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            noShowAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalAppointments: 0,
        scheduledAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0
      };

      return result;
    } catch (error) {
      this.handleError(error, 'Get appointment stats');
    }
  }

  async getStaffSchedule(staffId: string, date: string): Promise<any[]> {
    try {
      const appointments = await AppointmentModel.find({
        staffId,
        appointmentDate: date,
        status: { $in: ['scheduled', 'confirmed'] }
      })
      .populate('patientId', 'firstName lastName phone')
      .select('appointmentId startTime endTime appointmentType reasonForVisit roomNumber status')
      .sort({ startTime: 1 })
      .lean();

      return appointments;
    } catch (error) {
      this.handleError(error, 'Get staff schedule');
    }
  }

  async getAvailableTimeSlots(staffId: string, date: string, duration: number = 30): Promise<string[]> {
    try {
      // Get existing appointments for the staff on the given date
      const existingAppointments = await AppointmentModel.find({
        staffId,
        appointmentDate: date,
        status: { $in: ['scheduled', 'confirmed'] }
      }).select('startTime endTime').sort({ startTime: 1 });

      // Business hours (8 AM to 6 PM)
      const businessHours = {
        start: '08:00',
        end: '18:00'
      };

      const availableSlots: string[] = [];
      const startTime = new Date(`${date} ${businessHours.start}`);
      const endTime = new Date(`${date} ${businessHours.end}`);

      // Generate time slots
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const slotStart = currentTime.toTimeString().slice(0, 5);
        const slotEnd = new Date(currentTime.getTime() + duration * 60000).toTimeString().slice(0, 5);

        // Check if this slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          return (slotStart < appointment.appointmentTime && slotEnd > appointment.appointmentTime);
        });

        if (!hasConflict) {
          availableSlots.push(slotStart);
        }

        currentTime = new Date(currentTime.getTime() + duration * 60000);
      }

      return availableSlots;
    } catch (error) {
      this.handleError(error, 'Get available time slots');
    }
  }
}

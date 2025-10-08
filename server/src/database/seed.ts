import { initializeDatabase, closeDatabase } from './connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Import all models
import {
  PatientModel,
  StaffModel,
  StaffAuthModel,
  AppointmentModel,
  ClinicalNoteModel,
  PrescriptionModel,
  DrugMasterModel
} from '../models';

async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Clear existing data (optional - remove in production)
    await PatientModel.deleteMany({});
    await StaffModel.deleteMany({});
    await StaffAuthModel.deleteMany({});
    await AppointmentModel.deleteMany({});
    await ClinicalNoteModel.deleteMany({});
    await PrescriptionModel.deleteMany({});
    await DrugMasterModel.deleteMany({});
    
    logger.info('Cleared existing data');
    
    // Seed drug master data
    const drugs = [
      {
        drugId: uuidv4(),
        drugName: 'Acetaminophen',
        genericName: 'Paracetamol',
        drugClass: 'Analgesic',
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'Generic Pharma',
        isControlled: false,
        isActive: true
      },
      {
        drugId: uuidv4(),
        drugName: 'Ibuprofen',
        genericName: 'Ibuprofen',
        drugClass: 'NSAID',
        dosageForm: 'Tablet',
        strength: '400mg',
        manufacturer: 'Generic Pharma',
        isControlled: false,
        isActive: true
      },
      {
        drugId: uuidv4(),
        drugName: 'Morphine',
        genericName: 'Morphine',
        drugClass: 'Opioid',
        dosageForm: 'Injection',
        strength: '10mg/ml',
        manufacturer: 'Controlled Pharma',
        isControlled: true,
        controlledSchedule: 'II',
        isActive: true
      }
    ];
    
    await DrugMasterModel.insertMany(drugs);
    logger.info(`Seeded ${drugs.length} drugs`);
    
    // Seed staff data
    const staff = [
      {
        staffId: uuidv4(),
        employeeId: 'EMP001',
        firstName: 'Dr. John',
        lastName: 'Smith',
        email: 'john.smith@hospital.com',
        phone: '+1234567890',
        department: 'Internal Medicine',
        position: 'Senior Physician',
        hireDate: new Date('2020-01-15'),
        employmentType: 'full_time',
        status: 'active'
      },
      {
        staffId: uuidv4(),
        employeeId: 'EMP002',
        firstName: 'Dr. Jane',
        lastName: 'Doe',
        email: 'jane.doe@hospital.com',
        phone: '+1234567891',
        department: 'Cardiology',
        position: 'Cardiologist',
        hireDate: new Date('2019-06-01'),
        employmentType: 'full_time',
        status: 'active'
      },
      {
        staffId: uuidv4(),
        employeeId: 'EMP003',
        firstName: 'Nurse',
        lastName: 'Johnson',
        email: 'nurse.johnson@hospital.com',
        phone: '+1234567892',
        department: 'Emergency',
        position: 'Registered Nurse',
        hireDate: new Date('2021-03-10'),
        employmentType: 'full_time',
        status: 'active'
      }
    ];
    
    const createdStaff = await StaffModel.insertMany(staff);
    logger.info(`Seeded ${createdStaff.length} staff members`);
    
    // Seed patient data
    const patients = [
      {
        patientId: uuidv4(),
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'female',
        phone: '+1987654321',
        email: 'alice.johnson@email.com',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        status: 'active'
      },
      {
        patientId: uuidv4(),
        firstName: 'Bob',
        lastName: 'Wilson',
        dateOfBirth: new Date('1978-12-03'),
        gender: 'male',
        phone: '+1987654322',
        email: 'bob.wilson@email.com',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        status: 'active'
      }
    ];
    
    const createdPatients = await PatientModel.insertMany(patients);
    logger.info(`Seeded ${createdPatients.length} patients`);
    
    // Seed appointments
    const appointments = [
      {
        appointmentId: uuidv4(),
        patientId: createdPatients[0].patientId,
        staffId: createdStaff[0].staffId,
        appointmentDate: new Date('2024-01-15'),
        appointmentTime: '10:00',
        appointmentType: 'consultation',
        status: 'scheduled',
        duration: 30,
        notes: 'Regular checkup'
      },
      {
        appointmentId: uuidv4(),
        patientId: createdPatients[1].patientId,
        staffId: createdStaff[1].staffId,
        appointmentDate: new Date('2024-01-16'),
        appointmentTime: '14:00',
        appointmentType: 'follow_up',
        status: 'scheduled',
        duration: 45,
        notes: 'Cardiology follow-up'
      }
    ];
    
    await AppointmentModel.insertMany(appointments);
    logger.info(`Seeded ${appointments.length} appointments`);
    
    logger.info('Database seeding completed successfully');
    
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };

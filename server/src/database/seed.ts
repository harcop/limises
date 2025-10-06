import bcrypt from 'bcryptjs';
import { initializeDatabase, runQuery, closeDatabase } from './connection';
import { generateId, generatePatientId, generateStaffId } from '../utils/helpers';
import { logger } from '../utils/logger';

async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Check if data already exists
    const existingUsers = await runQuery('SELECT COUNT(*) as count FROM users');
    if (existingUsers.changes > 0) {
      logger.info('Database already contains data. Skipping seed.');
      return;
    }

    // Start transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      // Create admin user
      const adminUserId = generateId('USER', 6);
      const adminStaffId = generateStaffId();
      const adminPasswordHash = await bcrypt.hash('admin123', 12);

      await runQuery(
        `INSERT INTO users (user_id, username, password_hash, email, is_active, created_at) 
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [adminUserId, 'admin', adminPasswordHash, 'admin@hospital.com']
      );

      await runQuery(
        `INSERT INTO staff (staff_id, user_id, first_name, last_name, email, department, position, hire_date, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active', CURRENT_TIMESTAMP)`,
        [adminStaffId, adminUserId, 'System', 'Administrator', 'admin@hospital.com', 'Administration', 'System Administrator']
      );

      await runQuery(
        'UPDATE users SET staff_id = ? WHERE user_id = ?',
        [adminStaffId, adminUserId]
      );

      await runQuery(
        'INSERT INTO user_roles (user_id, role_name, assigned_date) VALUES (?, ?, CURRENT_DATE)',
        [adminUserId, 'admin']
      );

      // Create sample doctors
      const doctors = [
        { firstName: 'John', lastName: 'Smith', email: 'john.smith@hospital.com', department: 'Cardiology', position: 'Cardiologist' },
        { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@hospital.com', department: 'Pediatrics', position: 'Pediatrician' },
        { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@hospital.com', department: 'Emergency Medicine', position: 'Emergency Physician' },
        { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@hospital.com', department: 'Internal Medicine', position: 'Internist' },
        { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@hospital.com', department: 'Surgery', position: 'Surgeon' }
      ];

      for (const doctor of doctors) {
        const userId = generateId('USER', 6);
        const staffId = generateStaffId();
        const passwordHash = await bcrypt.hash('doctor123', 12);

        await runQuery(
          `INSERT INTO users (user_id, username, password_hash, email, is_active, created_at) 
           VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [userId, doctor.email.split('@')[0], passwordHash, doctor.email]
        );

        await runQuery(
          `INSERT INTO staff (staff_id, user_id, first_name, last_name, email, department, position, hire_date, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active', CURRENT_TIMESTAMP)`,
          [staffId, userId, doctor.firstName, doctor.lastName, doctor.email, doctor.department, doctor.position]
        );

        await runQuery(
          'UPDATE users SET staff_id = ? WHERE user_id = ?',
          [staffId, userId]
        );

        await runQuery(
          'INSERT INTO user_roles (user_id, role_name, assigned_date) VALUES (?, ?, CURRENT_DATE)',
          [userId, 'doctor']
        );
      }

      // Create sample nurses
      const nurses = [
        { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@hospital.com', department: 'Cardiology', position: 'Registered Nurse' },
        { firstName: 'Robert', lastName: 'Taylor', email: 'robert.taylor@hospital.com', department: 'Pediatrics', position: 'Registered Nurse' },
        { firstName: 'Jennifer', lastName: 'Thomas', email: 'jennifer.thomas@hospital.com', department: 'Emergency Medicine', position: 'Registered Nurse' },
        { firstName: 'Christopher', lastName: 'Jackson', email: 'christopher.jackson@hospital.com', department: 'Internal Medicine', position: 'Registered Nurse' }
      ];

      for (const nurse of nurses) {
        const userId = generateId('USER', 6);
        const staffId = generateStaffId();
        const passwordHash = await bcrypt.hash('nurse123', 12);

        await runQuery(
          `INSERT INTO users (user_id, username, password_hash, email, is_active, created_at) 
           VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [userId, nurse.email.split('@')[0], passwordHash, nurse.email]
        );

        await runQuery(
          `INSERT INTO staff (staff_id, user_id, first_name, last_name, email, department, position, hire_date, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active', CURRENT_TIMESTAMP)`,
          [staffId, userId, nurse.firstName, nurse.lastName, nurse.email, nurse.department, nurse.position]
        );

        await runQuery(
          'UPDATE users SET staff_id = ? WHERE user_id = ?',
          [staffId, userId]
        );

        await runQuery(
          'INSERT INTO user_roles (user_id, role_name, assigned_date) VALUES (?, ?, CURRENT_DATE)',
          [userId, 'nurse']
        );
      }

      // Create sample receptionist
      const receptionistUserId = generateId('USER', 6);
      const receptionistStaffId = generateStaffId();
      const receptionistPasswordHash = await bcrypt.hash('receptionist123', 12);

      await runQuery(
        `INSERT INTO users (user_id, username, password_hash, email, is_active, created_at) 
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [receptionistUserId, 'receptionist', receptionistPasswordHash, 'receptionist@hospital.com']
      );

      await runQuery(
        `INSERT INTO staff (staff_id, user_id, first_name, last_name, email, department, position, hire_date, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active', CURRENT_TIMESTAMP)`,
        [receptionistStaffId, receptionistUserId, 'Mary', 'Receptionist', 'receptionist@hospital.com', 'Administration', 'Receptionist']
      );

      await runQuery(
        'UPDATE users SET staff_id = ? WHERE user_id = ?',
        [receptionistStaffId, receptionistUserId]
      );

      await runQuery(
        'INSERT INTO user_roles (user_id, role_name, assigned_date) VALUES (?, ?, CURRENT_DATE)',
        [receptionistUserId, 'receptionist']
      );

      // Create sample patients
      const patients = [
        {
          firstName: 'Alice', lastName: 'Johnson', dateOfBirth: '1985-03-15', gender: 'female',
          phone: '555-0101', email: 'alice.johnson@email.com', address: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '12345',
          emergencyContactName: 'Bob Johnson', emergencyContactPhone: '555-0102', emergencyContactRelationship: 'spouse'
        },
        {
          firstName: 'Charlie', lastName: 'Brown', dateOfBirth: '1992-07-22', gender: 'male',
          phone: '555-0201', email: 'charlie.brown@email.com', address: '456 Oak Ave', city: 'Anytown', state: 'CA', zipCode: '12346',
          emergencyContactName: 'Lucy Brown', emergencyContactPhone: '555-0202', emergencyContactRelationship: 'sister'
        },
        {
          firstName: 'Diana', lastName: 'Prince', dateOfBirth: '1978-11-08', gender: 'female',
          phone: '555-0301', email: 'diana.prince@email.com', address: '789 Pine St', city: 'Anytown', state: 'CA', zipCode: '12347',
          emergencyContactName: 'Steve Trevor', emergencyContactPhone: '555-0302', emergencyContactRelationship: 'friend'
        },
        {
          firstName: 'Edward', lastName: 'Norton', dateOfBirth: '1995-01-30', gender: 'male',
          phone: '555-0401', email: 'edward.norton@email.com', address: '321 Elm St', city: 'Anytown', state: 'CA', zipCode: '12348',
          emergencyContactName: 'Helen Norton', emergencyContactPhone: '555-0402', emergencyContactRelationship: 'mother'
        },
        {
          firstName: 'Fiona', lastName: 'Green', dateOfBirth: '1988-09-12', gender: 'female',
          phone: '555-0501', email: 'fiona.green@email.com', address: '654 Maple Ave', city: 'Anytown', state: 'CA', zipCode: '12349',
          emergencyContactName: 'James Green', emergencyContactPhone: '555-0502', emergencyContactRelationship: 'father'
        }
      ];

      for (const patient of patients) {
        const patientId = generatePatientId();
        const accountId = generateId('BILL', 6);
        const accountNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        await runQuery(
          `INSERT INTO patients (
            patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, city, state, zip_code,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
          [
            patientId, patient.firstName, patient.lastName, patient.dateOfBirth, patient.gender,
            patient.phone, patient.email, patient.address, patient.city, patient.state, patient.zipCode,
            patient.emergencyContactName, patient.emergencyContactPhone, patient.emergencyContactRelationship
          ]
        );

        await runQuery(
          `INSERT INTO billing_accounts (account_id, patient_id, account_number, status, created_at) 
           VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
          [accountId, patientId, accountNumber]
        );
      }

      // Create sample wards
      const wards = [
        { wardName: 'General Ward A', wardType: 'general', capacity: 20 },
        { wardName: 'General Ward B', wardType: 'general', capacity: 20 },
        { wardName: 'ICU Ward', wardType: 'icu', capacity: 10 },
        { wardName: 'Pediatric Ward', wardType: 'pediatric', capacity: 15 },
        { wardName: 'Maternity Ward', wardType: 'maternity', capacity: 12 },
        { wardName: 'Surgical Ward', wardType: 'surgical', capacity: 18 }
      ];

      for (const ward of wards) {
        const wardId = generateId('WARD', 6);
        await runQuery(
          `INSERT INTO wards (ward_id, ward_name, ward_type, capacity, current_occupancy, is_active, created_at) 
           VALUES (?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP)`,
          [wardId, ward.wardName, ward.wardType, ward.capacity]
        );

        // Create beds for each ward
        for (let i = 1; i <= ward.capacity; i++) {
          const bedId = generateId('BED', 6);
          const bedType = ward.wardType === 'icu' ? 'icu' : 'standard';
          const dailyRate = ward.wardType === 'icu' ? 500 : 200;

          await runQuery(
            `INSERT INTO beds (bed_id, ward_id, bed_number, bed_type, status, daily_rate, is_active, created_at) 
             VALUES (?, ?, ?, ?, 'available', ?, 1, CURRENT_TIMESTAMP)`,
            [bedId, wardId, `BED-${i}`, bedType, dailyRate]
          );
        }
      }

      // Create sample drug master data
      const drugs = [
        { drugName: 'Acetaminophen', genericName: 'Acetaminophen', drugClass: 'Analgesic', dosageForm: 'Tablet', strength: '500mg' },
        { drugName: 'Ibuprofen', genericName: 'Ibuprofen', drugClass: 'NSAID', dosageForm: 'Tablet', strength: '400mg' },
        { drugName: 'Amoxicillin', genericName: 'Amoxicillin', drugClass: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg' },
        { drugName: 'Lisinopril', genericName: 'Lisinopril', drugClass: 'ACE Inhibitor', dosageForm: 'Tablet', strength: '10mg' },
        { drugName: 'Metformin', genericName: 'Metformin', drugClass: 'Antidiabetic', dosageForm: 'Tablet', strength: '500mg' },
        { drugName: 'Atorvastatin', genericName: 'Atorvastatin', drugClass: 'Statin', dosageForm: 'Tablet', strength: '20mg' },
        { drugName: 'Omeprazole', genericName: 'Omeprazole', drugClass: 'PPI', dosageForm: 'Capsule', strength: '20mg' },
        { drugName: 'Lorazepam', genericName: 'Lorazepam', drugClass: 'Benzodiazepine', dosageForm: 'Tablet', strength: '1mg', isControlled: true, controlledSchedule: 'IV' }
      ];

      for (const drug of drugs) {
        const drugId = generateId('DRUG', 6);
        await runQuery(
          `INSERT INTO drug_master (
            drug_id, drug_name, generic_name, drug_class, dosage_form, strength, is_controlled, controlled_schedule, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [
            drugId, drug.drugName, drug.genericName, drug.drugClass, drug.dosageForm, drug.strength,
            drug.isControlled ? 1 : 0, drug.controlledSchedule || null
          ]
        );
      }

      // Create sample inventory items
      const inventoryItems = [
        { itemName: 'Surgical Gloves', itemCategory: 'Medical Supplies', itemType: 'Disposable', unitOfMeasure: 'Box' },
        { itemName: 'Syringes', itemCategory: 'Medical Supplies', itemType: 'Disposable', unitOfMeasure: 'Box' },
        { itemName: 'Bandages', itemCategory: 'Medical Supplies', itemType: 'Disposable', unitOfMeasure: 'Box' },
        { itemName: 'Thermometer', itemCategory: 'Medical Equipment', itemType: 'Digital', unitOfMeasure: 'Unit' },
        { itemName: 'Blood Pressure Cuff', itemCategory: 'Medical Equipment', itemType: 'Manual', unitOfMeasure: 'Unit' },
        { itemName: 'Stethoscope', itemCategory: 'Medical Equipment', itemType: 'Acoustic', unitOfMeasure: 'Unit' }
      ];

      for (const item of inventoryItems) {
        const itemId = generateId('ITEM', 6);
        await runQuery(
          `INSERT INTO inventory_items (item_id, item_name, item_category, item_type, unit_of_measure, is_active, created_at) 
           VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [itemId, item.itemName, item.itemCategory, item.itemType, item.unitOfMeasure]
        );
      }

      await runQuery('COMMIT');
      logger.info('Database seeding completed successfully');

    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Database seeding failed:', error);
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

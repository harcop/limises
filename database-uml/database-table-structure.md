# Hospital Management System - Database Table Structure

## Overview

This document provides detailed database table structures with column definitions, data types, constraints, and indexes for the Hospital Management System.

## Core Patient Management Tables

### PATIENT Table
```sql
CREATE TABLE patient (
    patient_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allergies TEXT,
    medical_history TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('Active', 'Inactive', 'Deceased') DEFAULT 'Active',
    
    INDEX idx_patient_name (last_name, first_name),
    INDEX idx_patient_phone (phone_number),
    INDEX idx_patient_email (email),
    INDEX idx_patient_dob (date_of_birth),
    INDEX idx_patient_status (status)
);
```

### PATIENT_INSURANCE Table
```sql
CREATE TABLE patient_insurance (
    insurance_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    insurance_provider VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    group_number VARCHAR(50),
    effective_date DATE NOT NULL,
    expiry_date DATE,
    coverage_type ENUM('Primary', 'Secondary', 'Tertiary') DEFAULT 'Primary',
    copay_amount DECIMAL(10,2),
    deductible_amount DECIMAL(10,2),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    INDEX idx_insurance_patient (patient_id),
    INDEX idx_insurance_provider (insurance_provider),
    INDEX idx_insurance_primary (is_primary)
);
```

## Staff and Provider Management Tables

### STAFF Table
```sql
CREATE TABLE staff (
    staff_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    specialization VARCHAR(100),
    hire_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Terminated') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_staff_name (last_name, first_name),
    INDEX idx_staff_department (department),
    INDEX idx_staff_position (position),
    INDEX idx_staff_status (status),
    INDEX idx_staff_email (email)
);
```

### DOCTOR Table
```sql
CREATE TABLE doctor (
    doctor_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    medical_license VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    sub_specialization VARCHAR(100),
    dea_number VARCHAR(20),
    npi_number VARCHAR(20) UNIQUE,
    board_certification VARCHAR(100),
    certification_date DATE,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_doctor_staff (staff_id),
    INDEX idx_doctor_specialization (specialization),
    INDEX idx_doctor_license (medical_license),
    INDEX idx_doctor_npi (npi_number)
);
```

### NURSE Table
```sql
CREATE TABLE nurse (
    nurse_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    nursing_license VARCHAR(50) UNIQUE NOT NULL,
    certification VARCHAR(100),
    unit_assignment VARCHAR(100),
    shift_preference ENUM('Day', 'Night', 'Rotating') DEFAULT 'Day',
    status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_nurse_staff (staff_id),
    INDEX idx_nurse_unit (unit_assignment),
    INDEX idx_nurse_license (nursing_license)
);
```

## Appointment and Scheduling Tables

### APPOINTMENT Table
```sql
CREATE TABLE appointment (
    appointment_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    appointment_date DATETIME NOT NULL,
    appointment_type ENUM('Consultation', 'Follow-up', 'Procedure', 'Telemedicine') DEFAULT 'Consultation',
    status ENUM('Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Scheduled',
    reason_for_visit TEXT,
    notes TEXT,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_doctor (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_status (status),
    INDEX idx_appointment_type (appointment_type)
);
```

### SCHEDULE Table
```sql
CREATE TABLE schedule (
    schedule_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type ENUM('Morning', 'Afternoon', 'Evening', 'Night') NOT NULL,
    status ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_schedule_staff (staff_id),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_schedule_shift (shift_type),
    UNIQUE KEY unique_staff_schedule (staff_id, schedule_date, start_time)
);
```

## Clinical Management Tables

### CLINICAL_NOTE Table
```sql
CREATE TABLE clinical_note (
    note_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    review_of_systems TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    digital_signature VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    INDEX idx_note_patient (patient_id),
    INDEX idx_note_doctor (doctor_id),
    INDEX idx_note_appointment (appointment_id),
    INDEX idx_note_created (created_at)
);
```

### PRESCRIPTION Table
```sql
CREATE TABLE prescription (
    prescription_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    drug_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    status ENUM('Active', 'Completed', 'Cancelled', 'Modified') DEFAULT 'Active',
    prescribed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    INDEX idx_prescription_patient (patient_id),
    INDEX idx_prescription_doctor (doctor_id),
    INDEX idx_prescription_drug (drug_name),
    INDEX idx_prescription_status (status),
    INDEX idx_prescription_date (prescribed_date)
);
```

### MEDICATION Table
```sql
CREATE TABLE medication (
    medication_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    prescription_id VARCHAR(20),
    drug_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('Active', 'Completed', 'Stopped', 'Modified') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id) ON DELETE SET NULL,
    INDEX idx_medication_patient (patient_id),
    INDEX idx_medication_prescription (prescription_id),
    INDEX idx_medication_drug (drug_name),
    INDEX idx_medication_status (status),
    INDEX idx_medication_dates (start_date, end_date)
);
```

## Laboratory Management Tables

### LAB_ORDER Table
```sql
CREATE TABLE lab_order (
    order_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    test_name VARCHAR(200) NOT NULL,
    test_code VARCHAR(50) NOT NULL,
    priority ENUM('Routine', 'Urgent', 'Stat', 'Critical') DEFAULT 'Routine',
    status ENUM('Ordered', 'Collected', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Ordered',
    clinical_notes TEXT,
    ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    INDEX idx_lab_order_patient (patient_id),
    INDEX idx_lab_order_doctor (doctor_id),
    INDEX idx_lab_order_test (test_name),
    INDEX idx_lab_order_status (status),
    INDEX idx_lab_order_priority (priority),
    INDEX idx_lab_order_date (ordered_date)
);
```

### LAB_SAMPLE Table
```sql
CREATE TABLE lab_sample (
    sample_id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    sample_type VARCHAR(100) NOT NULL,
    collection_date DATE NOT NULL,
    collection_time TIME NOT NULL,
    collector_id VARCHAR(20) NOT NULL,
    accession_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('Collected', 'Received', 'In Progress', 'Completed', 'Rejected') DEFAULT 'Collected',
    collection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES lab_order(order_id) ON DELETE CASCADE,
    FOREIGN KEY (collector_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_sample_order (order_id),
    INDEX idx_sample_collector (collector_id),
    INDEX idx_sample_accession (accession_number),
    INDEX idx_sample_status (status),
    INDEX idx_sample_date (collection_date)
);
```

### LAB_RESULT Table
```sql
CREATE TABLE lab_result (
    result_id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    sample_id VARCHAR(20),
    test_name VARCHAR(200) NOT NULL,
    result_value VARCHAR(500),
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    status ENUM('Pending', 'Preliminary', 'Final', 'Corrected', 'Cancelled') DEFAULT 'Pending',
    critical_flag ENUM('Normal', 'Abnormal', 'Critical', 'Panic') DEFAULT 'Normal',
    interpretation TEXT,
    verified_by VARCHAR(20),
    result_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES lab_order(order_id) ON DELETE CASCADE,
    FOREIGN KEY (sample_id) REFERENCES lab_sample(sample_id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_result_order (order_id),
    INDEX idx_result_sample (sample_id),
    INDEX idx_result_test (test_name),
    INDEX idx_result_status (status),
    INDEX idx_result_critical (critical_flag),
    INDEX idx_result_date (result_date)
);
```

## Pharmacy Management Tables

### DRUG_MASTER Table
```sql
CREATE TABLE drug_master (
    drug_id VARCHAR(20) PRIMARY KEY,
    drug_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    drug_class VARCHAR(100),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    manufacturer VARCHAR(200),
    ndc_number VARCHAR(50) UNIQUE,
    unit_price DECIMAL(10,2),
    prescription_required BOOLEAN DEFAULT TRUE,
    controlled_substance ENUM('Schedule I', 'Schedule II', 'Schedule III', 'Schedule IV', 'Schedule V', 'Non-controlled') DEFAULT 'Non-controlled',
    status ENUM('Active', 'Inactive', 'Discontinued') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_drug_name (drug_name),
    INDEX idx_drug_generic (generic_name),
    INDEX idx_drug_class (drug_class),
    INDEX idx_drug_ndc (ndc_number),
    INDEX idx_drug_controlled (controlled_substance),
    INDEX idx_drug_status (status)
);
```

### PHARMACY_INVENTORY Table
```sql
CREATE TABLE pharmacy_inventory (
    inventory_id VARCHAR(20) PRIMARY KEY,
    drug_id VARCHAR(20) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_on_hand DECIMAL(10,2) NOT NULL,
    reorder_level DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(200),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (drug_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE,
    INDEX idx_inventory_drug (drug_id),
    INDEX idx_inventory_batch (batch_number),
    INDEX idx_inventory_expiry (expiry_date),
    INDEX idx_inventory_location (location),
    INDEX idx_inventory_quantity (quantity_on_hand),
    UNIQUE KEY unique_drug_batch (drug_id, batch_number)
);
```

### PHARMACY_DISPENSE Table
```sql
CREATE TABLE pharmacy_dispense (
    dispense_id VARCHAR(20) PRIMARY KEY,
    prescription_id VARCHAR(20) NOT NULL,
    drug_id VARCHAR(20) NOT NULL,
    pharmacist_id VARCHAR(20) NOT NULL,
    quantity_dispensed DECIMAL(10,2) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    dispense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Dispensed', 'Returned', 'Modified') DEFAULT 'Dispensed',
    counseling_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacist_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_dispense_prescription (prescription_id),
    INDEX idx_dispense_drug (drug_id),
    INDEX idx_dispense_pharmacist (pharmacist_id),
    INDEX idx_dispense_date (dispense_date),
    INDEX idx_dispense_status (status)
);
```

## Billing and Finance Tables

### BILLING_ACCOUNT Table
```sql
CREATE TABLE billing_account (
    account_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    account_type ENUM('Self Pay', 'Insurance', 'Corporate', 'Government') DEFAULT 'Self Pay',
    balance DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('Active', 'Closed', 'Suspended') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    INDEX idx_billing_patient (patient_id),
    INDEX idx_billing_type (account_type),
    INDEX idx_billing_status (status),
    INDEX idx_billing_balance (balance)
);
```

### CHARGE Table
```sql
CREATE TABLE charge (
    charge_id VARCHAR(20) PRIMARY KEY,
    account_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    service_code VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    service_date DATE NOT NULL,
    status ENUM('Pending', 'Billed', 'Paid', 'Written Off', 'Disputed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES billing_account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    INDEX idx_charge_account (account_id),
    INDEX idx_charge_patient (patient_id),
    INDEX idx_charge_service (service_type),
    INDEX idx_charge_code (service_code),
    INDEX idx_charge_status (status),
    INDEX idx_charge_date (service_date),
    INDEX idx_charge_amount (amount)
);
```

### PAYMENT Table
```sql
CREATE TABLE payment (
    payment_id VARCHAR(20) PRIMARY KEY,
    account_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Insurance') NOT NULL,
    payment_type ENUM('Full Payment', 'Partial Payment', 'Copay', 'Deductible', 'Refund') DEFAULT 'Full Payment',
    transaction_id VARCHAR(100),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES billing_account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    INDEX idx_payment_account (account_id),
    INDEX idx_payment_patient (patient_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_payment_type (payment_type),
    INDEX idx_payment_status (status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_transaction (transaction_id)
);
```

### INSURANCE_CLAIM Table
```sql
CREATE TABLE insurance_claim (
    claim_id VARCHAR(20) PRIMARY KEY,
    account_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    insurance_id VARCHAR(20) NOT NULL,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status ENUM('Submitted', 'Under Review', 'Approved', 'Denied', 'Partially Approved', 'Appealed') DEFAULT 'Submitted',
    submitted_date DATE NOT NULL,
    processed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES billing_account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (insurance_id) REFERENCES patient_insurance(insurance_id) ON DELETE CASCADE,
    INDEX idx_claim_account (account_id),
    INDEX idx_claim_patient (patient_id),
    INDEX idx_claim_insurance (insurance_id),
    INDEX idx_claim_number (claim_number),
    INDEX idx_claim_status (status),
    INDEX idx_claim_submitted (submitted_date),
    INDEX idx_claim_processed (processed_date)
);
```

## Inventory Management Tables

### INVENTORY_ITEM Table
```sql
CREATE TABLE inventory_item (
    item_id VARCHAR(20) PRIMARY KEY,
    item_name VARCHAR(200) NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(200),
    status ENUM('Active', 'Inactive', 'Discontinued') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_item_name (item_name),
    INDEX idx_item_category (item_category),
    INDEX idx_item_type (item_type),
    INDEX idx_item_supplier (supplier),
    INDEX idx_item_status (status)
);
```

### INVENTORY_STOCK Table
```sql
CREATE TABLE inventory_stock (
    stock_id VARCHAR(20) PRIMARY KEY,
    item_id VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    quantity_on_hand DECIMAL(10,2) NOT NULL,
    reorder_level DECIMAL(10,2) NOT NULL,
    max_stock_level DECIMAL(10,2) NOT NULL,
    last_restocked DATE,
    status ENUM('In Stock', 'Low Stock', 'Out of Stock', 'Discontinued') DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES inventory_item(item_id) ON DELETE CASCADE,
    INDEX idx_stock_item (item_id),
    INDEX idx_stock_location (location),
    INDEX idx_stock_quantity (quantity_on_hand),
    INDEX idx_stock_status (status),
    INDEX idx_stock_restocked (last_restocked),
    UNIQUE KEY unique_item_location (item_id, location)
);
```

## Radiology and Imaging Tables

### RADIOLOGY_ORDER Table
```sql
CREATE TABLE radiology_order (
    radiology_order_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    study_type VARCHAR(100) NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    clinical_indication TEXT,
    priority ENUM('Routine', 'Urgent', 'Stat') DEFAULT 'Routine',
    status ENUM('Ordered', 'Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Ordered',
    ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    INDEX idx_rad_order_patient (patient_id),
    INDEX idx_rad_order_doctor (doctor_id),
    INDEX idx_rad_order_study (study_type),
    INDEX idx_rad_order_status (status),
    INDEX idx_rad_order_priority (priority),
    INDEX idx_rad_order_date (ordered_date)
);
```

### RADIOLOGY_STUDY Table
```sql
CREATE TABLE radiology_study (
    study_id VARCHAR(20) PRIMARY KEY,
    radiology_order_id VARCHAR(20) NOT NULL,
    study_type VARCHAR(100) NOT NULL,
    modality ENUM('X-Ray', 'CT', 'MRI', 'Ultrasound', 'Nuclear Medicine', 'PET', 'Mammography') NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    technique TEXT,
    contrast_used BOOLEAN DEFAULT FALSE,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    study_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (radiology_order_id) REFERENCES radiology_order(radiology_order_id) ON DELETE CASCADE,
    INDEX idx_study_order (radiology_order_id),
    INDEX idx_study_type (study_type),
    INDEX idx_study_modality (modality),
    INDEX idx_study_status (status),
    INDEX idx_study_date (study_date)
);
```

### RADIOLOGY_REPORT Table
```sql
CREATE TABLE radiology_report (
    report_id VARCHAR(20) PRIMARY KEY,
    study_id VARCHAR(20) NOT NULL,
    radiologist_id VARCHAR(20) NOT NULL,
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    report_status ENUM('Draft', 'Preliminary', 'Final', 'Amended') DEFAULT 'Draft',
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (study_id) REFERENCES radiology_study(study_id) ON DELETE CASCADE,
    FOREIGN KEY (radiologist_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    INDEX idx_report_study (study_id),
    INDEX idx_report_radiologist (radiologist_id),
    INDEX idx_report_status (report_status),
    INDEX idx_report_date (report_date)
);
```

## Operation Theatre Management Tables

### OT_SCHEDULE Table
```sql
CREATE TABLE ot_schedule (
    ot_schedule_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    surgeon_id VARCHAR(20) NOT NULL,
    anesthesiologist_id VARCHAR(20),
    ot_room VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    procedure_type VARCHAR(100) NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (surgeon_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (anesthesiologist_id) REFERENCES doctor(doctor_id) ON DELETE SET NULL,
    INDEX idx_ot_patient (patient_id),
    INDEX idx_ot_surgeon (surgeon_id),
    INDEX idx_ot_room (ot_room),
    INDEX idx_ot_date (scheduled_date),
    INDEX idx_ot_status (status),
    INDEX idx_ot_procedure (procedure_type)
);
```

### SURGICAL_PROCEDURE Table
```sql
CREATE TABLE surgical_procedure (
    procedure_id VARCHAR(20) PRIMARY KEY,
    ot_schedule_id VARCHAR(20) NOT NULL,
    procedure_name VARCHAR(200) NOT NULL,
    procedure_code VARCHAR(50) NOT NULL,
    procedure_notes TEXT,
    status ENUM('Planned', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ot_schedule_id) REFERENCES ot_schedule(ot_schedule_id) ON DELETE CASCADE,
    INDEX idx_procedure_ot (ot_schedule_id),
    INDEX idx_procedure_name (procedure_name),
    INDEX idx_procedure_code (procedure_code),
    INDEX idx_procedure_status (status)
);
```

## OPD Management Tables

### OPD_VISIT Table
```sql
CREATE TABLE opd_visit (
    opd_visit_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    token_number VARCHAR(20) UNIQUE NOT NULL,
    queue_position INT NOT NULL,
    vital_signs JSON,
    chief_complaint TEXT,
    status ENUM('Checked In', 'In Queue', 'In Consultation', 'Completed', 'Cancelled') DEFAULT 'Checked In',
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    consultation_start DATETIME,
    consultation_end DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    INDEX idx_opd_patient (patient_id),
    INDEX idx_opd_doctor (doctor_id),
    INDEX idx_opd_token (token_number),
    INDEX idx_opd_status (status),
    INDEX idx_opd_checkin (check_in_time)
);
```

### OPD_QUEUE Table
```sql
CREATE TABLE opd_queue (
    queue_id VARCHAR(20) PRIMARY KEY,
    opd_visit_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    queue_position INT NOT NULL,
    status ENUM('Waiting', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Waiting',
    estimated_wait_time INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (opd_visit_id) REFERENCES opd_visit(opd_visit_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    INDEX idx_queue_visit (opd_visit_id),
    INDEX idx_queue_doctor (doctor_id),
    INDEX idx_queue_position (queue_position),
    INDEX idx_queue_status (status)
);
```

### VITAL_SIGNS Table
```sql
CREATE TABLE vital_signs (
    vital_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    opd_visit_id VARCHAR(20),
    recorded_by VARCHAR(20) NOT NULL,
    temperature DECIMAL(4,1), -- in Celsius
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    respiratory_rate INT,
    oxygen_saturation DECIMAL(4,1),
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    notes TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (opd_visit_id) REFERENCES opd_visit(opd_visit_id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_vitals_patient (patient_id),
    INDEX idx_vitals_visit (opd_visit_id),
    INDEX idx_vitals_recorded_by (recorded_by),
    INDEX idx_vitals_recorded_at (recorded_at)
);
```

## IPD Management Tables

### WARD Table
```sql
CREATE TABLE ward (
    ward_id VARCHAR(20) PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    ward_type ENUM('General', 'ICU', 'CCU', 'NICU', 'PICU', 'Surgical', 'Medical', 'Pediatric', 'Maternity') NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    capacity INT NOT NULL,
    status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ward_name (ward_name),
    INDEX idx_ward_type (ward_type),
    INDEX idx_ward_department (department),
    INDEX idx_ward_status (status)
);
```

### BED Table
```sql
CREATE TABLE bed (
    bed_id VARCHAR(20) PRIMARY KEY,
    ward_id VARCHAR(20) NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    bed_type ENUM('Standard', 'ICU', 'CCU', 'Isolation', 'Private', 'Semi-Private') DEFAULT 'Standard',
    status ENUM('Available', 'Occupied', 'Maintenance', 'Reserved') DEFAULT 'Available',
    equipment JSON, -- Equipment available at bed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ward_id) REFERENCES ward(ward_id) ON DELETE CASCADE,
    INDEX idx_bed_ward (ward_id),
    INDEX idx_bed_number (bed_number),
    INDEX idx_bed_type (bed_type),
    INDEX idx_bed_status (status),
    UNIQUE KEY unique_ward_bed (ward_id, bed_number)
);
```

### IPD_ADMISSION Table
```sql
CREATE TABLE ipd_admission (
    admission_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    bed_id VARCHAR(20) NOT NULL,
    ward_id VARCHAR(20) NOT NULL,
    admission_type ENUM('Emergency', 'Planned', 'Transfer', 'Observation') NOT NULL,
    admission_reason TEXT NOT NULL,
    diagnosis TEXT,
    status ENUM('Admitted', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Admitted',
    admission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    discharge_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES bed(bed_id) ON DELETE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES ward(ward_id) ON DELETE CASCADE,
    INDEX idx_admission_patient (patient_id),
    INDEX idx_admission_doctor (doctor_id),
    INDEX idx_admission_bed (bed_id),
    INDEX idx_admission_ward (ward_id),
    INDEX idx_admission_status (status),
    INDEX idx_admission_date (admission_date),
    INDEX idx_admission_discharge (discharge_date)
);
```

### NURSING_CARE Table
```sql
CREATE TABLE nursing_care (
    care_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    admission_id VARCHAR(20) NOT NULL,
    nurse_id VARCHAR(20) NOT NULL,
    care_type ENUM('Assessment', 'Medication', 'Vital Signs', 'Wound Care', 'Hygiene', 'Mobility', 'Nutrition', 'Other') NOT NULL,
    care_notes TEXT,
    status ENUM('Planned', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Planned',
    care_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES ipd_admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (nurse_id) REFERENCES nurse(nurse_id) ON DELETE CASCADE,
    INDEX idx_care_patient (patient_id),
    INDEX idx_care_admission (admission_id),
    INDEX idx_care_nurse (nurse_id),
    INDEX idx_care_type (care_type),
    INDEX idx_care_status (status),
    INDEX idx_care_date (care_date)
);
```

### DOCTOR_ORDERS Table
```sql
CREATE TABLE doctor_orders (
    order_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    admission_id VARCHAR(20) NOT NULL,
    doctor_id VARCHAR(20) NOT NULL,
    order_type ENUM('Medication', 'Laboratory', 'Radiology', 'Diet', 'Activity', 'Nursing', 'Consultation', 'Procedure', 'Other') NOT NULL,
    order_details TEXT NOT NULL,
    priority ENUM('Routine', 'Urgent', 'Stat', 'ASAP') DEFAULT 'Routine',
    status ENUM('Active', 'Completed', 'Cancelled', 'Modified') DEFAULT 'Active',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES ipd_admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    INDEX idx_orders_patient (patient_id),
    INDEX idx_orders_admission (admission_id),
    INDEX idx_orders_doctor (doctor_id),
    INDEX idx_orders_type (order_type),
    INDEX idx_orders_priority (priority),
    INDEX idx_orders_status (status),
    INDEX idx_orders_date (order_date)
);
```

### PATIENT_TRANSFER Table
```sql
CREATE TABLE patient_transfer (
    transfer_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    from_ward_id VARCHAR(20) NOT NULL,
    to_ward_id VARCHAR(20) NOT NULL,
    from_bed_id VARCHAR(20),
    to_bed_id VARCHAR(20),
    transfer_reason TEXT NOT NULL,
    status ENUM('Requested', 'Approved', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Requested',
    transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (from_ward_id) REFERENCES ward(ward_id) ON DELETE CASCADE,
    FOREIGN KEY (to_ward_id) REFERENCES ward(ward_id) ON DELETE CASCADE,
    FOREIGN KEY (from_bed_id) REFERENCES bed(bed_id) ON DELETE SET NULL,
    FOREIGN KEY (to_bed_id) REFERENCES bed(bed_id) ON DELETE SET NULL,
    INDEX idx_transfer_patient (patient_id),
    INDEX idx_transfer_from_ward (from_ward_id),
    INDEX idx_transfer_to_ward (to_ward_id),
    INDEX idx_transfer_status (status),
    INDEX idx_transfer_date (transfer_date)
);
```

## Emergency Management Tables

### EMERGENCY_VISIT Table
```sql
CREATE TABLE emergency_visit (
    emergency_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    triage_level ENUM('Level 1 - Resuscitation', 'Level 2 - Emergent', 'Level 3 - Urgent', 'Level 4 - Less Urgent', 'Level 5 - Non-urgent') NOT NULL,
    chief_complaint TEXT NOT NULL,
    vital_signs JSON,
    status ENUM('Active', 'Discharged', 'Admitted', 'Transferred', 'Left AMA') DEFAULT 'Active',
    arrival_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    discharge_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
    INDEX idx_emergency_patient (patient_id),
    INDEX idx_emergency_triage (triage_level),
    INDEX idx_emergency_status (status),
    INDEX idx_emergency_arrival (arrival_time),
    INDEX idx_emergency_discharge (discharge_time)
);
```

## Database Indexes and Performance Optimization

### Composite Indexes
```sql
-- Patient search optimization
CREATE INDEX idx_patient_search ON patient(last_name, first_name, date_of_birth);

-- Appointment scheduling optimization
CREATE INDEX idx_appointment_schedule ON appointment(doctor_id, appointment_date, status);

-- Lab workflow optimization
CREATE INDEX idx_lab_workflow ON lab_order(patient_id, status, ordered_date);

-- Billing optimization
CREATE INDEX idx_billing_cycle ON charge(account_id, status, service_date);

-- Inventory optimization
CREATE INDEX idx_inventory_management ON inventory_stock(item_id, location, status);
```

### Full-Text Search Indexes
```sql
-- Clinical notes search
CREATE FULLTEXT INDEX idx_note_search ON clinical_note(chief_complaint, history_of_present_illness, assessment, plan);

-- Drug search
CREATE FULLTEXT INDEX idx_drug_search ON drug_master(drug_name, generic_name, drug_class);
```

## Database Constraints and Triggers

### Check Constraints
```sql
-- Ensure positive amounts
ALTER TABLE charge ADD CONSTRAINT chk_charge_amount CHECK (amount > 0);
ALTER TABLE payment ADD CONSTRAINT chk_payment_amount CHECK (amount > 0);

-- Ensure valid dates
ALTER TABLE appointment ADD CONSTRAINT chk_appointment_date CHECK (appointment_date > created_at);
ALTER TABLE lab_sample ADD CONSTRAINT chk_sample_date CHECK (collection_date <= CURDATE());

-- Ensure valid quantities
ALTER TABLE pharmacy_inventory ADD CONSTRAINT chk_inventory_quantity CHECK (quantity_on_hand >= 0);
ALTER TABLE inventory_stock ADD CONSTRAINT chk_stock_quantity CHECK (quantity_on_hand >= 0);
```

### Triggers for Audit Trail
```sql
-- Update timestamp trigger
DELIMITER $$
CREATE TRIGGER tr_patient_updated 
    BEFORE UPDATE ON patient 
    FOR EACH ROW 
BEGIN 
    SET NEW.updated_at = CURRENT_TIMESTAMP; 
END$$
DELIMITER ;

-- Similar triggers for other tables...
```

## Data Archival Strategy

### Partitioning Strategy
```sql
-- Partition clinical_notes by year
ALTER TABLE clinical_note 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Partition lab_results by month
ALTER TABLE lab_result 
PARTITION BY RANGE (YEAR(result_date) * 100 + MONTH(result_date)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    -- Continue for each month...
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

This comprehensive database structure provides a solid foundation for the Hospital Management System with proper indexing, constraints, and optimization strategies for high-performance healthcare operations.

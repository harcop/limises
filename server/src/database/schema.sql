-- Hospital Management System Database Schema - Unified
-- Staff-only authentication system (no patient portal)

-- ==============================================
-- CORE PATIENT MANAGEMENT TABLES
-- ==============================================

-- Patients table - Core patient information
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    blood_type VARCHAR(10),
    allergies TEXT,
    medical_conditions TEXT,
    photo_url VARCHAR(500),
    status ENUM('active', 'inactive', 'deceased') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patient insurance information
CREATE TABLE IF NOT EXISTS patient_insurance (
    insurance_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    insurance_provider VARCHAR(200) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    group_number VARCHAR(100),
    subscriber_name VARCHAR(200),
    subscriber_id VARCHAR(100),
    relationship_to_subscriber ENUM('self', 'spouse', 'child', 'other') DEFAULT 'self',
    effective_date DATE NOT NULL,
    expiry_date DATE,
    copay_amount DECIMAL(10,2),
    deductible_amount DECIMAL(10,2),
    coverage_percentage DECIMAL(5,2),
    is_primary BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Billing accounts for patients
CREATE TABLE IF NOT EXISTS billing_accounts (
    account_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.00,
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    payment_terms VARCHAR(100),
    status ENUM('active', 'suspended', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ==============================================
-- STAFF MANAGEMENT TABLES
-- ==============================================

-- Staff table - Core staff information
CREATE TABLE IF NOT EXISTS staff (
    staff_id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    salary DECIMAL(12,2),
    employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
    status ENUM('active', 'inactive', 'terminated', 'on_leave') DEFAULT 'active',
    photo_url VARCHAR(500),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff authentication - Separate from main staff table
CREATE TABLE IF NOT EXISTS staff_auth (
    auth_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Staff roles and permissions
CREATE TABLE IF NOT EXISTS staff_roles (
    role_id VARCHAR(20) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff role assignments
CREATE TABLE IF NOT EXISTS staff_role_assignments (
    assignment_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    role_id VARCHAR(20) NOT NULL,
    assigned_by VARCHAR(20),
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES staff_roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    permission_id VARCHAR(20) PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(20),
    permission_id VARCHAR(20),
    granted_by VARCHAR(20),
    granted_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES staff_roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Staff schedules
CREATE TABLE IF NOT EXISTS staff_schedules (
    schedule_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- APPOINTMENT MANAGEMENT TABLES
-- ==============================================

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type ENUM('consultation', 'follow_up', 'procedure', 'emergency', 'telemedicine') NOT NULL,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    reason_for_visit TEXT,
    notes TEXT,
    room_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- CLINICAL MANAGEMENT TABLES
-- ==============================================

-- Clinical notes
CREATE TABLE IF NOT EXISTS clinical_notes (
    note_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    note_type ENUM('consultation', 'progress', 'discharge', 'procedure', 'emergency') NOT NULL,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    vital_signs JSON,
    is_signed BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- Clinical note amendments
CREATE TABLE IF NOT EXISTS clinical_note_amendments (
    amendment_id VARCHAR(20) PRIMARY KEY,
    note_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    amendment_reason TEXT NOT NULL,
    amendment_text TEXT NOT NULL,
    is_signed BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES clinical_notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- PRESCRIPTION AND MEDICATION TABLES
-- ==============================================

-- Drug master table
CREATE TABLE IF NOT EXISTS drug_master (
    drug_id VARCHAR(20) PRIMARY KEY,
    drug_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    drug_class VARCHAR(100),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    manufacturer VARCHAR(200),
    ndc_number VARCHAR(50),
    is_controlled BOOLEAN DEFAULT FALSE,
    controlled_schedule VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    drug_id VARCHAR(20) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    refills_allowed INTEGER DEFAULT 0,
    refills_used INTEGER DEFAULT 0,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    prescribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (drug_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE
);

-- Patient medications (current medication list)
CREATE TABLE IF NOT EXISTS patient_medications (
    medication_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    drug_id VARCHAR(20) NOT NULL,
    prescription_id VARCHAR(20),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE SET NULL
);

-- ==============================================
-- OPD MANAGEMENT TABLES
-- ==============================================

-- OPD visits
CREATE TABLE IF NOT EXISTS opd_visits (
    visit_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    visit_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    chief_complaint TEXT,
    vital_signs JSON,
    status ENUM('checked_in', 'in_queue', 'with_doctor', 'completed', 'cancelled') DEFAULT 'checked_in',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- OPD queue management
CREATE TABLE IF NOT EXISTS opd_queue (
    queue_id VARCHAR(20) PRIMARY KEY,
    visit_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    queue_position INTEGER NOT NULL,
    estimated_wait_time INTEGER, -- in minutes
    status ENUM('waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'waiting',
    called_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES opd_visits(visit_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- IPD MANAGEMENT TABLES
-- ==============================================

-- Wards
CREATE TABLE IF NOT EXISTS wards (
    ward_id VARCHAR(20) PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    ward_type ENUM('general', 'icu', 'ccu', 'pediatric', 'maternity', 'surgical', 'medical') NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Beds
CREATE TABLE IF NOT EXISTS beds (
    bed_id VARCHAR(20) PRIMARY KEY,
    ward_id VARCHAR(20) NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    bed_type ENUM('standard', 'private', 'semi_private', 'icu', 'isolation') NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
    daily_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(ward_id) ON DELETE CASCADE
);

-- IPD admissions
CREATE TABLE IF NOT EXISTS ipd_admissions (
    admission_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    bed_id VARCHAR(20) NOT NULL,
    admission_date DATE NOT NULL,
    admission_time TIME NOT NULL,
    admission_type ENUM('emergency', 'elective', 'transfer') NOT NULL,
    admitting_physician VARCHAR(20) NOT NULL,
    diagnosis TEXT,
    admission_notes TEXT,
    discharge_date DATE,
    discharge_time TIME,
    discharge_status ENUM('recovered', 'improved', 'transferred', 'ama', 'deceased') DEFAULT NULL,
    discharge_notes TEXT,
    status ENUM('admitted', 'discharged', 'transferred') DEFAULT 'admitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE CASCADE,
    FOREIGN KEY (admitting_physician) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Nursing care plans
CREATE TABLE IF NOT EXISTS nursing_care (
    care_id VARCHAR(20) PRIMARY KEY,
    admission_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    care_date DATE NOT NULL,
    shift ENUM('morning', 'afternoon', 'night') NOT NULL,
    vital_signs JSON,
    care_activities TEXT,
    patient_condition TEXT,
    medications_given TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admission_id) REFERENCES ipd_admissions(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Doctor orders
CREATE TABLE IF NOT EXISTS doctor_orders (
    order_id VARCHAR(20) PRIMARY KEY,
    admission_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    order_type ENUM('medication', 'procedure', 'diet', 'activity', 'laboratory', 'radiology', 'other') NOT NULL,
    order_description TEXT NOT NULL,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    frequency VARCHAR(100),
    duration VARCHAR(100),
    status ENUM('active', 'completed', 'cancelled', 'modified') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admission_id) REFERENCES ipd_admissions(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- LABORATORY MANAGEMENT TABLES
-- ==============================================

-- Lab orders
CREATE TABLE IF NOT EXISTS lab_orders (
    order_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    appointment_id VARCHAR(20),
    admission_id VARCHAR(20),
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    test_description TEXT,
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    status ENUM('ordered', 'collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (admission_id) REFERENCES ipd_admissions(admission_id) ON DELETE SET NULL
);

-- Lab samples
CREATE TABLE IF NOT EXISTS lab_samples (
    sample_id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    sample_type VARCHAR(100) NOT NULL,
    collection_date DATE NOT NULL,
    collection_time TIME NOT NULL,
    collected_by VARCHAR(20) NOT NULL,
    sample_condition ENUM('good', 'hemolyzed', 'clotted', 'insufficient', 'contaminated') DEFAULT 'good',
    storage_location VARCHAR(100),
    status ENUM('collected', 'in_lab', 'processed', 'completed') DEFAULT 'collected',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (collected_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Lab results
CREATE TABLE IF NOT EXISTS lab_results (
    result_id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    sample_id VARCHAR(20),
    test_name VARCHAR(200) NOT NULL,
    result_value VARCHAR(200),
    normal_range VARCHAR(100),
    unit VARCHAR(50),
    status ENUM('normal', 'abnormal', 'critical') DEFAULT 'normal',
    verified_by VARCHAR(20),
    verified_at TIMESTAMP,
    result_date DATE NOT NULL,
    result_time TIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (sample_id) REFERENCES lab_samples(sample_id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- PHARMACY MANAGEMENT TABLES
-- ==============================================

-- Pharmacy inventory
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    inventory_id VARCHAR(20) PRIMARY KEY,
    drug_id VARCHAR(20) NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE NOT NULL,
    quantity_in_stock INTEGER NOT NULL,
    reorder_level INTEGER DEFAULT 10,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier VARCHAR(200),
    location VARCHAR(100),
    status ENUM('available', 'low_stock', 'out_of_stock', 'expired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE
);

-- Pharmacy dispensing
CREATE TABLE IF NOT EXISTS pharmacy_dispense (
    dispense_id VARCHAR(20) PRIMARY KEY,
    prescription_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    quantity_dispensed INTEGER NOT NULL,
    dispensed_by VARCHAR(20) NOT NULL,
    dispensed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    patient_instructions TEXT,
    notes TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES pharmacy_inventory(inventory_id) ON DELETE CASCADE,
    FOREIGN KEY (dispensed_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- BILLING AND FINANCE TABLES
-- ==============================================

-- Charges
CREATE TABLE IF NOT EXISTS charges (
    charge_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    account_id VARCHAR(20) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    service_description TEXT,
    service_date DATE NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'billed', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES billing_accounts(account_id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    account_id VARCHAR(20) NOT NULL,
    payment_date DATE NOT NULL,
    payment_time TIME NOT NULL,
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'check', 'insurance', 'bank_transfer') NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    processed_by VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES billing_accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Insurance claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    claim_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    insurance_id VARCHAR(20) NOT NULL,
    claim_date DATE NOT NULL,
    service_date_from DATE NOT NULL,
    service_date_to DATE NOT NULL,
    total_charges DECIMAL(10,2) NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    status ENUM('submitted', 'processing', 'approved', 'denied', 'paid', 'appealed') DEFAULT 'submitted',
    claim_number VARCHAR(100),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (insurance_id) REFERENCES patient_insurance(insurance_id) ON DELETE CASCADE
);

-- ==============================================
-- INVENTORY MANAGEMENT TABLES
-- ==============================================

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
    item_id VARCHAR(20) PRIMARY KEY,
    item_name VARCHAR(200) NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    item_type VARCHAR(100),
    unit_of_measure VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory stock
CREATE TABLE IF NOT EXISTS inventory_stock (
    stock_id VARCHAR(20) PRIMARY KEY,
    item_id VARCHAR(20) NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    quantity_in_stock INTEGER NOT NULL,
    reorder_level INTEGER DEFAULT 10,
    unit_cost DECIMAL(10,2),
    supplier VARCHAR(200),
    location VARCHAR(100),
    status ENUM('available', 'low_stock', 'out_of_stock', 'expired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE CASCADE
);

-- ==============================================
-- AUDIT AND LOGGING TABLES
-- ==============================================

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    log_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(20),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    patient_id VARCHAR(20),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Clinical note indexes
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_staff ON clinical_notes(staff_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_date ON clinical_notes(created_at);

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_staff ON prescriptions(staff_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_drug ON prescriptions(drug_id);

-- OPD visit indexes
CREATE INDEX IF NOT EXISTS idx_opd_visits_patient ON opd_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_opd_visits_date ON opd_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_opd_visits_status ON opd_visits(status);

-- IPD admission indexes
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_patient ON ipd_admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_bed ON ipd_admissions(bed_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_date ON ipd_admissions(admission_date);

-- Lab order indexes
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_date ON lab_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_charges_patient ON charges(patient_id);
CREATE INDEX IF NOT EXISTS idx_charges_account ON charges(account_id);
CREATE INDEX IF NOT EXISTS idx_charges_date ON charges(service_date);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ==============================================
-- EMERGENCY & AMBULANCE MANAGEMENT TABLES
-- ==============================================

-- Emergency visits
CREATE TABLE IF NOT EXISTS emergency_visits (
    visit_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arrival_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triage_level ENUM('1', '2', '3', '4', '5') NOT NULL,
    chief_complaint TEXT,
    vital_signs JSON,
    initial_assessment TEXT,
    treatment_plan TEXT,
    disposition ENUM('discharge', 'admit', 'transfer', 'observation') NOT NULL,
    discharge_time TIMESTAMP,
    status ENUM('active', 'completed', 'transferred') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Ambulance services
CREATE TABLE IF NOT EXISTS ambulance_services (
    service_id VARCHAR(20) PRIMARY KEY,
    ambulance_number VARCHAR(20) NOT NULL UNIQUE,
    driver_name VARCHAR(200) NOT NULL,
    driver_license VARCHAR(50),
    paramedic_name VARCHAR(200),
    paramedic_license VARCHAR(50),
    vehicle_type ENUM('basic', 'advanced', 'critical_care') NOT NULL,
    equipment_list JSON,
    status ENUM('available', 'on_call', 'maintenance', 'out_of_service') DEFAULT 'available',
    location VARCHAR(200),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Emergency calls
CREATE TABLE IF NOT EXISTS emergency_calls (
    call_id VARCHAR(20) PRIMARY KEY,
    caller_name VARCHAR(200),
    caller_phone VARCHAR(20) NOT NULL,
    patient_name VARCHAR(200),
    patient_age INT,
    patient_gender ENUM('male', 'female', 'other'),
    emergency_type ENUM('medical', 'trauma', 'psychiatric', 'obstetric', 'pediatric') NOT NULL,
    location VARCHAR(500) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    ambulance_id VARCHAR(20),
    dispatch_time TIMESTAMP,
    arrival_time TIMESTAMP,
    status ENUM('pending', 'dispatched', 'arrived', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulance_id) REFERENCES ambulance_services(service_id)
);

-- ==============================================
-- OPERATION THEATRE MANAGEMENT TABLES
-- ==============================================

-- Operation theatres
CREATE TABLE IF NOT EXISTS operation_theatres (
    theatre_id VARCHAR(20) PRIMARY KEY,
    theatre_name VARCHAR(100) NOT NULL,
    theatre_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT DEFAULT 1,
    equipment_list JSON,
    specializations JSON,
    status ENUM('available', 'occupied', 'maintenance', 'cleaning') DEFAULT 'available',
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Surgical procedures
CREATE TABLE IF NOT EXISTS surgical_procedures (
    procedure_id VARCHAR(20) PRIMARY KEY,
    procedure_name VARCHAR(200) NOT NULL,
    procedure_code VARCHAR(50),
    category ENUM('major', 'minor', 'emergency', 'elective') NOT NULL,
    estimated_duration INT, -- in minutes
    description TEXT,
    requirements JSON, -- equipment, consumables, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- OT schedules
CREATE TABLE IF NOT EXISTS ot_schedules (
    schedule_id VARCHAR(20) PRIMARY KEY,
    theatre_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    procedure_id VARCHAR(20) NOT NULL,
    surgeon_id VARCHAR(20) NOT NULL,
    anesthetist_id VARCHAR(20),
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'scheduled',
    notes TEXT,
    pre_op_notes TEXT,
    post_op_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (theatre_id) REFERENCES operation_theatres(theatre_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (procedure_id) REFERENCES surgical_procedures(procedure_id),
    FOREIGN KEY (surgeon_id) REFERENCES staff(staff_id),
    FOREIGN KEY (anesthetist_id) REFERENCES staff(staff_id)
);

-- OT team assignments
CREATE TABLE IF NOT EXISTS ot_team_assignments (
    assignment_id VARCHAR(20) PRIMARY KEY,
    schedule_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    role ENUM('surgeon', 'assistant', 'anesthetist', 'nurse', 'technician', 'observer') NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES ot_schedules(schedule_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- OT consumables tracking
CREATE TABLE IF NOT EXISTS ot_consumables (
    consumption_id VARCHAR(20) PRIMARY KEY,
    schedule_id VARCHAR(20) NOT NULL,
    item_id VARCHAR(20) NOT NULL,
    quantity_used INT NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    batch_number VARCHAR(50),
    expiry_date DATE,
    used_by VARCHAR(20) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES ot_schedules(schedule_id),
    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id),
    FOREIGN KEY (used_by) REFERENCES staff(staff_id)
);

-- ==============================================
-- RADIOLOGY & IMAGING TABLES
-- ==============================================

-- Radiology orders
CREATE TABLE IF NOT EXISTS radiology_orders (
    order_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    study_type ENUM('xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy') NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    clinical_indication TEXT,
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    contrast_required BOOLEAN DEFAULT FALSE,
    contrast_type VARCHAR(100),
    status ENUM('ordered', 'scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Radiology studies
CREATE TABLE IF NOT EXISTS radiology_studies (
    study_id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    study_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modality VARCHAR(50) NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    technique TEXT,
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    radiologist_id VARCHAR(20),
    technologist_id VARCHAR(20),
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES radiology_orders(order_id),
    FOREIGN KEY (radiologist_id) REFERENCES staff(staff_id),
    FOREIGN KEY (technologist_id) REFERENCES staff(staff_id)
);

-- Radiology equipment
CREATE TABLE IF NOT EXISTS radiology_equipment (
    equipment_id VARCHAR(20) PRIMARY KEY,
    equipment_name VARCHAR(200) NOT NULL,
    equipment_type ENUM('xray', 'ct', 'mri', 'ultrasound', 'mammography', 'nuclear', 'pet', 'fluoroscopy') NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    location VARCHAR(200),
    status ENUM('operational', 'maintenance', 'out_of_service') DEFAULT 'operational',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================
-- HUMAN RESOURCES MANAGEMENT TABLES
-- ==============================================

-- Employee records
CREATE TABLE IF NOT EXISTS employee_records (
    employee_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL UNIQUE,
    employee_number VARCHAR(50) UNIQUE,
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    manager_id VARCHAR(20),
    salary DECIMAL(12,2),
    benefits JSON,
    emergency_contact JSON,
    status ENUM('active', 'inactive', 'terminated', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (manager_id) REFERENCES staff(staff_id)
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    leave_type ENUM('sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by VARCHAR(20),
    approved_at TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id),
    FOREIGN KEY (approved_by) REFERENCES staff(staff_id)
);

-- Performance reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
    review_id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    reviewer_id VARCHAR(20) NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating ENUM('excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory') NOT NULL,
    goals_achieved TEXT,
    areas_for_improvement TEXT,
    development_plan TEXT,
    comments TEXT,
    status ENUM('draft', 'submitted', 'approved', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id),
    FOREIGN KEY (reviewer_id) REFERENCES staff(staff_id)
);

-- Training records
CREATE TABLE IF NOT EXISTS training_records (
    training_id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    training_name VARCHAR(200) NOT NULL,
    training_type ENUM('mandatory', 'optional', 'certification', 'continuing_education') NOT NULL,
    provider VARCHAR(200),
    start_date DATE,
    end_date DATE,
    completion_date DATE,
    status ENUM('scheduled', 'in_progress', 'completed', 'failed', 'cancelled') DEFAULT 'scheduled',
    score DECIMAL(5,2),
    certificate_number VARCHAR(100),
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_records(employee_id)
);

-- ==============================================
-- SYSTEM INTEGRATION & SECURITY TABLES
-- ==============================================

-- System integrations
CREATE TABLE IF NOT EXISTS system_integrations (
    integration_id VARCHAR(20) PRIMARY KEY,
    system_name VARCHAR(200) NOT NULL,
    system_type ENUM('internal', 'external', 'third_party') NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    authentication_type ENUM('api_key', 'oauth', 'basic', 'certificate') NOT NULL,
    status ENUM('active', 'inactive', 'error', 'maintenance') DEFAULT 'inactive',
    last_sync TIMESTAMP,
    sync_frequency VARCHAR(50),
    configuration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Security audit logs
CREATE TABLE IF NOT EXISTS security_audit (
    audit_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(200) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ADDITIONAL INDEXES FOR NEW TABLES
-- ==============================================

-- Emergency indexes
CREATE INDEX IF NOT EXISTS idx_emergency_visits_patient_id ON emergency_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_visits_staff_id ON emergency_visits(staff_id);
CREATE INDEX IF NOT EXISTS idx_emergency_visits_date ON emergency_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_emergency_visits_triage_level ON emergency_visits(triage_level);
CREATE INDEX IF NOT EXISTS idx_ambulance_services_status ON ambulance_services(status);
CREATE INDEX IF NOT EXISTS idx_emergency_calls_status ON emergency_calls(status);
CREATE INDEX IF NOT EXISTS idx_emergency_calls_priority ON emergency_calls(priority);

-- OT indexes
CREATE INDEX IF NOT EXISTS idx_operation_theatres_status ON operation_theatres(status);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_theatre_id ON ot_schedules(theatre_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_patient_id ON ot_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_surgeon_id ON ot_schedules(surgeon_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_date ON ot_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_ot_team_assignments_schedule_id ON ot_team_assignments(schedule_id);

-- Radiology indexes
CREATE INDEX IF NOT EXISTS idx_radiology_orders_patient_id ON radiology_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_radiology_orders_staff_id ON radiology_orders(staff_id);
CREATE INDEX IF NOT EXISTS idx_radiology_orders_date ON radiology_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_radiology_studies_order_id ON radiology_studies(order_id);
CREATE INDEX IF NOT EXISTS idx_radiology_equipment_type ON radiology_equipment(equipment_type);

-- HR indexes
CREATE INDEX IF NOT EXISTS idx_employee_records_staff_id ON employee_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_employee_records_department ON employee_records(department);
CREATE INDEX IF NOT EXISTS idx_employee_records_status ON employee_records(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_records_employee_id ON training_records(employee_id);

-- System integration indexes
CREATE INDEX IF NOT EXISTS idx_system_integrations_status ON system_integrations(status);
CREATE INDEX IF NOT EXISTS idx_system_integrations_type ON system_integrations(system_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON security_audit(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_success ON security_audit(success);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at);

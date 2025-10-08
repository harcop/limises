-- Enhanced Clinical Management Database Schema
-- This file contains additional tables and modifications for the Clinical Management Module

-- ==============================================
-- ENHANCED CLINICAL NOTES MANAGEMENT
-- ==============================================

-- Clinical note templates
CREATE TABLE IF NOT EXISTS clinical_note_templates (
    template_id VARCHAR(20) PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    template_type ENUM('consultation', 'progress', 'discharge', 'procedure', 'emergency') NOT NULL,
    specialty VARCHAR(100),
    template_content JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Clinical note signatures (digital signatures)
CREATE TABLE IF NOT EXISTS clinical_note_signatures (
    signature_id VARCHAR(20) PRIMARY KEY,
    note_id VARCHAR(20) NOT NULL,
    staff_id VARCHAR(20) NOT NULL,
    signature_type ENUM('primary', 'co_signature', 'supervisor') NOT NULL,
    digital_signature TEXT NOT NULL,
    certificate_hash VARCHAR(255) NOT NULL,
    signature_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES clinical_notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Clinical note attachments
CREATE TABLE IF NOT EXISTS clinical_note_attachments (
    attachment_id VARCHAR(20) PRIMARY KEY,
    note_id VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(20) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES clinical_notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- ENHANCED PRESCRIPTION MANAGEMENT
-- ==============================================

-- Prescription templates
CREATE TABLE IF NOT EXISTS prescription_templates (
    template_id VARCHAR(20) PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100),
    condition VARCHAR(200),
    template_content JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Drug interactions
CREATE TABLE IF NOT EXISTS drug_interactions (
    interaction_id VARCHAR(20) PRIMARY KEY,
    drug1_id VARCHAR(20) NOT NULL,
    drug2_id VARCHAR(20) NOT NULL,
    interaction_type ENUM('major', 'moderate', 'minor') NOT NULL,
    interaction_description TEXT NOT NULL,
    clinical_effect TEXT,
    management_recommendation TEXT,
    severity_level ENUM('contraindicated', 'major', 'moderate', 'minor') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (drug1_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE,
    FOREIGN KEY (drug2_id) REFERENCES drug_master(drug_id) ON DELETE CASCADE,
    UNIQUE KEY unique_interaction (drug1_id, drug2_id)
);

-- Prescription alerts
CREATE TABLE IF NOT EXISTS prescription_alerts (
    alert_id VARCHAR(20) PRIMARY KEY,
    prescription_id VARCHAR(20) NOT NULL,
    alert_type ENUM('drug_interaction', 'allergy', 'contraindication', 'dose_check', 'duplicate_therapy') NOT NULL,
    alert_severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    alert_message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(20),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- MEDICATION ADMINISTRATION TRACKING
-- ==============================================

-- Medication administration records
CREATE TABLE IF NOT EXISTS medication_administration (
    administration_id VARCHAR(20) PRIMARY KEY,
    prescription_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    route VARCHAR(50) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    actual_time TIMESTAMP,
    administered_by VARCHAR(20),
    administration_status ENUM('scheduled', 'given', 'refused', 'omitted', 'partial') DEFAULT 'scheduled',
    refusal_reason TEXT,
    notes TEXT,
    vital_signs JSON,
    adverse_reaction BOOLEAN DEFAULT FALSE,
    adverse_reaction_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (administered_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Medication reconciliation
CREATE TABLE IF NOT EXISTS medication_reconciliation (
    reconciliation_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    admission_id VARCHAR(20),
    reconciliation_type ENUM('admission', 'transfer', 'discharge') NOT NULL,
    home_medications JSON,
    hospital_medications JSON,
    reconciled_medications JSON,
    discrepancies JSON,
    reconciled_by VARCHAR(20) NOT NULL,
    reconciled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES ipd_admissions(admission_id) ON DELETE SET NULL,
    FOREIGN KEY (reconciled_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- CLINICAL DECISION SUPPORT
-- ==============================================

-- Clinical alerts
CREATE TABLE IF NOT EXISTS clinical_alerts (
    alert_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    alert_type ENUM('drug_interaction', 'allergy', 'critical_value', 'clinical_guideline', 'risk_assessment') NOT NULL,
    alert_severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    alert_title VARCHAR(200) NOT NULL,
    alert_message TEXT NOT NULL,
    alert_data JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(20),
    acknowledged_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Clinical guidelines
CREATE TABLE IF NOT EXISTS clinical_guidelines (
    guideline_id VARCHAR(20) PRIMARY KEY,
    guideline_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    condition VARCHAR(200) NOT NULL,
    guideline_version VARCHAR(20) NOT NULL,
    guideline_content JSON NOT NULL,
    evidence_level ENUM('A', 'B', 'C', 'D') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Risk assessment tools
CREATE TABLE IF NOT EXISTS risk_assessment_tools (
    tool_id VARCHAR(20) PRIMARY KEY,
    tool_name VARCHAR(200) NOT NULL,
    tool_type ENUM('calculator', 'score', 'algorithm') NOT NULL,
    specialty VARCHAR(100),
    condition VARCHAR(200),
    tool_configuration JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Risk assessment results
CREATE TABLE IF NOT EXISTS risk_assessment_results (
    result_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    tool_id VARCHAR(20) NOT NULL,
    assessment_data JSON NOT NULL,
    risk_score DECIMAL(5,2),
    risk_level ENUM('low', 'moderate', 'high', 'very_high') NOT NULL,
    recommendations TEXT,
    assessed_by VARCHAR(20) NOT NULL,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES risk_assessment_tools(tool_id) ON DELETE CASCADE,
    FOREIGN KEY (assessed_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- ENHANCED ALLERGY MANAGEMENT
-- ==============================================

-- Patient allergies (enhanced)
CREATE TABLE IF NOT EXISTS patient_allergies (
    allergy_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    allergen_type ENUM('drug', 'food', 'environmental', 'contact', 'other') NOT NULL,
    allergen_name VARCHAR(200) NOT NULL,
    allergen_code VARCHAR(50),
    reaction_type ENUM('anaphylaxis', 'rash', 'hives', 'swelling', 'respiratory', 'gastrointestinal', 'other') NOT NULL,
    severity ENUM('mild', 'moderate', 'severe', 'life_threatening') NOT NULL,
    onset_date DATE,
    last_occurrence DATE,
    status ENUM('active', 'inactive', 'resolved') DEFAULT 'active',
    verified_by VARCHAR(20),
    verified_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Allergy alerts
CREATE TABLE IF NOT EXISTS allergy_alerts (
    alert_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    allergy_id VARCHAR(20) NOT NULL,
    trigger_type ENUM('prescription', 'medication_order', 'procedure', 'food') NOT NULL,
    trigger_item VARCHAR(200) NOT NULL,
    alert_severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    alert_message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(20),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (allergy_id) REFERENCES patient_allergies(allergy_id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- CLINICAL QUALITY METRICS
-- ==============================================

-- Clinical quality indicators
CREATE TABLE IF NOT EXISTS clinical_quality_indicators (
    indicator_id VARCHAR(20) PRIMARY KEY,
    indicator_name VARCHAR(200) NOT NULL,
    indicator_type ENUM('process', 'outcome', 'structure') NOT NULL,
    specialty VARCHAR(100),
    measurement_unit VARCHAR(50),
    target_value DECIMAL(10,2),
    calculation_method TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clinical quality measurements
CREATE TABLE IF NOT EXISTS clinical_quality_measurements (
    measurement_id VARCHAR(20) PRIMARY KEY,
    indicator_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20),
    staff_id VARCHAR(20),
    measurement_value DECIMAL(10,2) NOT NULL,
    measurement_date DATE NOT NULL,
    measurement_period VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (indicator_id) REFERENCES clinical_quality_indicators(indicator_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- CLINICAL PATHWAYS
-- ==============================================

-- Clinical pathways
CREATE TABLE IF NOT EXISTS clinical_pathways (
    pathway_id VARCHAR(20) PRIMARY KEY,
    pathway_name VARCHAR(200) NOT NULL,
    condition VARCHAR(200) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    pathway_version VARCHAR(20) NOT NULL,
    pathway_steps JSON NOT NULL,
    expected_duration INTEGER, -- in days
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Patient pathway adherence
CREATE TABLE IF NOT EXISTS patient_pathway_adherence (
    adherence_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    pathway_id VARCHAR(20) NOT NULL,
    admission_id VARCHAR(20),
    adherence_percentage DECIMAL(5,2) NOT NULL,
    completed_steps JSON,
    missed_steps JSON,
    deviations JSON,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (pathway_id) REFERENCES clinical_pathways(pathway_id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES ipd_admissions(admission_id) ON DELETE SET NULL
);

-- ==============================================
-- ENHANCED AUDIT AND COMPLIANCE
-- ==============================================

-- Clinical audit log
CREATE TABLE IF NOT EXISTS clinical_audit_log (
    audit_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    patient_id VARCHAR(20),
    action_type ENUM('create', 'read', 'update', 'delete', 'sign', 'amend') NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(20) NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL
);

-- Clinical compliance tracking
CREATE TABLE IF NOT EXISTS clinical_compliance (
    compliance_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    compliance_type ENUM('documentation', 'medication', 'procedure', 'guideline') NOT NULL,
    requirement_description TEXT NOT NULL,
    is_compliant BOOLEAN NOT NULL,
    compliance_date DATE NOT NULL,
    notes TEXT,
    reviewed_by VARCHAR(20) NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Clinical notes indexes
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_date ON clinical_notes(patient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_staff_date ON clinical_notes(staff_id, created_at);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_type ON clinical_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_signed ON clinical_notes(is_signed);

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_date ON prescriptions(patient_id, prescribed_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_drug ON prescriptions(drug_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(is_active);

-- Medication administration indexes
CREATE INDEX IF NOT EXISTS idx_medication_admin_patient ON medication_administration(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_admin_scheduled ON medication_administration(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_medication_admin_status ON medication_administration(administration_status);

-- Clinical alerts indexes
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_patient ON clinical_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_type ON clinical_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_severity ON clinical_alerts(alert_severity);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_active ON clinical_alerts(is_active);

-- Allergy indexes
CREATE INDEX IF NOT EXISTS idx_patient_allergies_patient ON patient_allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_allergies_type ON patient_allergies(allergen_type);
CREATE INDEX IF NOT EXISTS idx_patient_allergies_status ON patient_allergies(status);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_clinical_audit_user ON clinical_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_patient ON clinical_audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_action ON clinical_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_date ON clinical_audit_log(created_at);

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Trigger to update clinical_notes updated_at
CREATE TRIGGER IF NOT EXISTS update_clinical_notes_timestamp 
    AFTER UPDATE ON clinical_notes
    FOR EACH ROW
    BEGIN
        UPDATE clinical_notes SET updated_at = CURRENT_TIMESTAMP WHERE note_id = NEW.note_id;
    END;

-- Trigger to log clinical note changes
CREATE TRIGGER IF NOT EXISTS log_clinical_note_changes
    AFTER UPDATE ON clinical_notes
    FOR EACH ROW
    BEGIN
        INSERT INTO clinical_audit_log (
            audit_id, user_id, patient_id, action_type, table_name, record_id,
            old_values, new_values, created_at
        ) VALUES (
            'AUDIT-' || strftime('%Y%m%d%H%M%S', 'now') || '-' || substr(hex(randomblob(4)), 1, 6),
            NEW.staff_id, NEW.patient_id, 'update', 'clinical_notes', NEW.note_id,
            json_object(
                'chief_complaint', OLD.chief_complaint,
                'assessment', OLD.assessment,
                'plan', OLD.plan,
                'is_signed', OLD.is_signed
            ),
            json_object(
                'chief_complaint', NEW.chief_complaint,
                'assessment', NEW.assessment,
                'plan', NEW.plan,
                'is_signed', NEW.is_signed
            ),
            CURRENT_TIMESTAMP
        );
    END;

-- ==============================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for active clinical alerts
CREATE VIEW IF NOT EXISTS active_clinical_alerts AS
SELECT 
    ca.alert_id,
    ca.patient_id,
    p.first_name || ' ' || p.last_name as patient_name,
    ca.alert_type,
    ca.alert_severity,
    ca.alert_title,
    ca.alert_message,
    ca.created_at
FROM clinical_alerts ca
JOIN patients p ON ca.patient_id = p.patient_id
WHERE ca.is_active = TRUE AND ca.is_acknowledged = FALSE;

-- View for patient medication summary
CREATE VIEW IF NOT EXISTS patient_medication_summary AS
SELECT 
    p.patient_id,
    p.first_name || ' ' || p.last_name as patient_name,
    COUNT(pr.prescription_id) as total_prescriptions,
    COUNT(CASE WHEN pr.is_active = 1 THEN 1 END) as active_prescriptions,
    COUNT(ma.administration_id) as total_administrations,
    COUNT(CASE WHEN ma.administration_status = 'given' THEN 1 END) as successful_administrations
FROM patients p
LEFT JOIN prescriptions pr ON p.patient_id = pr.patient_id
LEFT JOIN medication_administration ma ON pr.prescription_id = ma.prescription_id
GROUP BY p.patient_id, p.first_name, p.last_name;

-- View for clinical quality dashboard
CREATE VIEW IF NOT EXISTS clinical_quality_dashboard AS
SELECT 
    cqi.indicator_id,
    cqi.indicator_name,
    cqi.indicator_type,
    cqi.specialty,
    COUNT(cqm.measurement_id) as total_measurements,
    AVG(cqm.measurement_value) as average_value,
    cqi.target_value,
    CASE 
        WHEN AVG(cqm.measurement_value) >= cqi.target_value THEN 'Met'
        ELSE 'Not Met'
    END as target_status
FROM clinical_quality_indicators cqi
LEFT JOIN clinical_quality_measurements cqm ON cqi.indicator_id = cqm.indicator_id
WHERE cqi.is_active = TRUE
GROUP BY cqi.indicator_id, cqi.indicator_name, cqi.indicator_type, cqi.specialty, cqi.target_value;

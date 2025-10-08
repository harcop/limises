-- Enhanced Security & Audit Database Schema
-- This file contains additional tables and modifications for the Security & Audit Module

-- ==============================================
-- ENHANCED AUTHENTICATION & AUTHORIZATION
-- ==============================================

-- Multi-factor authentication settings
CREATE TABLE IF NOT EXISTS mfa_settings (
    mfa_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    mfa_type ENUM('sms', 'email', 'authenticator', 'biometric') NOT NULL,
    mfa_secret VARCHAR(255),
    mfa_backup_codes JSON,
    is_enabled BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- MFA challenges and verifications
CREATE TABLE IF NOT EXISTS mfa_challenges (
    challenge_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    challenge_type ENUM('sms', 'email', 'authenticator', 'biometric') NOT NULL,
    challenge_code VARCHAR(10),
    challenge_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Enhanced session management
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Password history and policies
CREATE TABLE IF NOT EXISTS password_history (
    password_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Account lockout tracking
CREATE TABLE IF NOT EXISTS account_lockouts (
    lockout_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    lockout_reason ENUM('failed_attempts', 'suspicious_activity', 'admin_lockout') NOT NULL,
    lockout_duration INTEGER NOT NULL, -- in minutes
    is_active BOOLEAN DEFAULT TRUE,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_at TIMESTAMP,
    unlocked_by VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (unlocked_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- ENHANCED ROLE-BASED ACCESS CONTROL
-- ==============================================

-- Enhanced permissions with resource and action granularity
CREATE TABLE IF NOT EXISTS enhanced_permissions (
    permission_id VARCHAR(20) PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    permission_description TEXT,
    resource_type ENUM('patient', 'clinical', 'billing', 'lab', 'pharmacy', 'inventory', 'system') NOT NULL,
    action_type ENUM('create', 'read', 'update', 'delete', 'export', 'print', 'sign') NOT NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    requires_justification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-permission assignments with conditions
CREATE TABLE IF NOT EXISTS role_permission_assignments (
    assignment_id VARCHAR(20) PRIMARY KEY,
    role_id VARCHAR(20) NOT NULL,
    permission_id VARCHAR(20) NOT NULL,
    conditions JSON, -- Additional conditions for permission
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES staff_roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES enhanced_permissions(permission_id) ON DELETE CASCADE
);

-- Temporary access grants
CREATE TABLE IF NOT EXISTS temporary_access_grants (
    grant_id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    permission_id VARCHAR(20) NOT NULL,
    granted_by VARCHAR(20) NOT NULL,
    grant_reason TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES enhanced_permissions(permission_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- ENHANCED AUDIT LOGGING
-- ==============================================

-- Enhanced audit log with more detailed information
CREATE TABLE IF NOT EXISTS enhanced_audit_log (
    audit_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    session_id VARCHAR(100),
    action_type ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'print', 'sign') NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(20),
    table_name VARCHAR(100),
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    location_data JSON,
    risk_score INTEGER DEFAULT 0, -- 0-100 risk score
    is_sensitive BOOLEAN DEFAULT FALSE,
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Audit log integrity tracking
CREATE TABLE IF NOT EXISTS audit_log_integrity (
    integrity_id VARCHAR(20) PRIMARY KEY,
    log_batch_id VARCHAR(20) NOT NULL,
    batch_start_time TIMESTAMP NOT NULL,
    batch_end_time TIMESTAMP NOT NULL,
    total_records INTEGER NOT NULL,
    hash_value VARCHAR(255) NOT NULL,
    digital_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security events and incidents
CREATE TABLE IF NOT EXISTS security_events (
    event_id VARCHAR(20) PRIMARY KEY,
    event_type ENUM('login_failure', 'privilege_escalation', 'data_breach', 'suspicious_activity', 'policy_violation') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    user_id VARCHAR(20),
    session_id VARCHAR(100),
    event_description TEXT NOT NULL,
    event_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(20),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- DATA ENCRYPTION & KEY MANAGEMENT
-- ==============================================

-- Encryption keys management
CREATE TABLE IF NOT EXISTS encryption_keys (
    key_id VARCHAR(20) PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    key_type ENUM('data_encryption', 'field_encryption', 'audit_encryption', 'backup_encryption') NOT NULL,
    key_version INTEGER NOT NULL,
    key_status ENUM('active', 'inactive', 'compromised', 'expired') DEFAULT 'active',
    key_data TEXT NOT NULL, -- Encrypted key data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    rotated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Data classification and sensitivity
CREATE TABLE IF NOT EXISTS data_classification (
    classification_id VARCHAR(20) PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    data_type ENUM('phi', 'pii', 'financial', 'clinical', 'administrative') NOT NULL,
    sensitivity_level ENUM('public', 'internal', 'confidential', 'restricted') NOT NULL,
    encryption_required BOOLEAN DEFAULT TRUE,
    masking_required BOOLEAN DEFAULT FALSE,
    retention_period INTEGER, -- in days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data access tracking
CREATE TABLE IF NOT EXISTS data_access_log (
    access_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(20),
    access_type ENUM('read', 'write', 'export', 'print') NOT NULL,
    data_classification VARCHAR(50),
    ip_address VARCHAR(45) NOT NULL,
    access_reason TEXT,
    is_authorized BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- ==============================================
-- COMPLIANCE & PRIVACY MANAGEMENT
-- ==============================================

-- Compliance policies
CREATE TABLE IF NOT EXISTS compliance_policies (
    policy_id VARCHAR(20) PRIMARY KEY,
    policy_name VARCHAR(200) NOT NULL,
    policy_type ENUM('hipaa', 'gdpr', 'soc2', 'iso27001', 'nist') NOT NULL,
    policy_version VARCHAR(20) NOT NULL,
    policy_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Compliance assessments
CREATE TABLE IF NOT EXISTS compliance_assessments (
    assessment_id VARCHAR(20) PRIMARY KEY,
    policy_id VARCHAR(20) NOT NULL,
    assessment_type ENUM('automated', 'manual', 'audit') NOT NULL,
    assessment_status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    compliance_score DECIMAL(5,2), -- 0-100
    assessment_data JSON,
    findings TEXT,
    recommendations TEXT,
    assessed_by VARCHAR(20) NOT NULL,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES compliance_policies(policy_id) ON DELETE CASCADE,
    FOREIGN KEY (assessed_by) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Privacy consent management
CREATE TABLE IF NOT EXISTS privacy_consent (
    consent_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    consent_type ENUM('data_processing', 'data_sharing', 'research', 'marketing') NOT NULL,
    consent_status ENUM('granted', 'denied', 'withdrawn', 'expired') NOT NULL,
    consent_details TEXT,
    granted_at TIMESTAMP,
    expires_at TIMESTAMP,
    withdrawn_at TIMESTAMP,
    withdrawn_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Data subject requests (GDPR)
CREATE TABLE IF NOT EXISTS data_subject_requests (
    request_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    request_type ENUM('access', 'rectification', 'erasure', 'portability', 'restriction') NOT NULL,
    request_status ENUM('pending', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
    request_description TEXT,
    requested_data JSON,
    response_data JSON,
    processed_by VARCHAR(20),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ==============================================
-- SECURITY MONITORING & ALERTING
-- ==============================================

-- Security alerts and notifications
CREATE TABLE IF NOT EXISTS security_alerts (
    alert_id VARCHAR(20) PRIMARY KEY,
    alert_type ENUM('authentication', 'authorization', 'data_access', 'system_integrity', 'compliance') NOT NULL,
    alert_severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    alert_title VARCHAR(200) NOT NULL,
    alert_description TEXT NOT NULL,
    alert_data JSON,
    user_id VARCHAR(20),
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(20),
    acknowledged_at TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(20),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (acknowledged_by) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Threat intelligence and indicators
CREATE TABLE IF NOT EXISTS threat_indicators (
    indicator_id VARCHAR(20) PRIMARY KEY,
    indicator_type ENUM('ip_address', 'domain', 'email', 'file_hash', 'url') NOT NULL,
    indicator_value VARCHAR(500) NOT NULL,
    threat_type ENUM('malware', 'phishing', 'botnet', 'spam', 'suspicious') NOT NULL,
    confidence_level ENUM('low', 'medium', 'high') NOT NULL,
    source VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security metrics and KPIs
CREATE TABLE IF NOT EXISTS security_metrics (
    metric_id VARCHAR(20) PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_type ENUM('authentication', 'authorization', 'data_access', 'compliance', 'incident') NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(50),
    measurement_date DATE NOT NULL,
    measurement_period VARCHAR(50), -- daily, weekly, monthly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_mfa_settings_staff ON mfa_settings(staff_id);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_staff ON mfa_challenges(staff_id);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_token ON mfa_challenges(challenge_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_staff ON user_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_password_history_staff ON password_history(staff_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_staff ON account_lockouts(staff_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_active ON account_lockouts(is_active);

-- Authorization indexes
CREATE INDEX IF NOT EXISTS idx_enhanced_permissions_resource ON enhanced_permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_enhanced_permissions_action ON enhanced_permissions(action_type);
CREATE INDEX IF NOT EXISTS idx_role_permission_assignments_role ON role_permission_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_temporary_access_grants_staff ON temporary_access_grants(staff_id);
CREATE INDEX IF NOT EXISTS idx_temporary_access_grants_active ON temporary_access_grants(is_active);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_enhanced_audit_log_user ON enhanced_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_audit_log_action ON enhanced_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_enhanced_audit_log_resource ON enhanced_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_enhanced_audit_log_date ON enhanced_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_enhanced_audit_log_sensitive ON enhanced_audit_log(is_sensitive);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(is_resolved);

-- Encryption indexes
CREATE INDEX IF NOT EXISTS idx_encryption_keys_type ON encryption_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_status ON encryption_keys(key_status);
CREATE INDEX IF NOT EXISTS idx_data_classification_table ON data_classification(table_name);
CREATE INDEX IF NOT EXISTS idx_data_access_log_user ON data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_log_date ON data_access_log(created_at);

-- Compliance indexes
CREATE INDEX IF NOT EXISTS idx_compliance_policies_type ON compliance_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_policy ON compliance_assessments(policy_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consent_patient ON privacy_consent(patient_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_patient ON data_subject_requests(patient_id);

-- Security monitoring indexes
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(alert_severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON security_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_type ON threat_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_active ON threat_indicators(is_active);
CREATE INDEX IF NOT EXISTS idx_security_metrics_type ON security_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_security_metrics_date ON security_metrics(measurement_date);

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Trigger to update session last activity
CREATE TRIGGER IF NOT EXISTS update_session_activity
    AFTER UPDATE ON user_sessions
    FOR EACH ROW
    WHEN NEW.last_activity != OLD.last_activity
    BEGIN
        UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = NEW.session_id;
    END;

-- Trigger to log security events
CREATE TRIGGER IF NOT EXISTS log_security_events
    AFTER INSERT ON enhanced_audit_log
    FOR EACH ROW
    WHEN NEW.risk_score > 70
    BEGIN
        INSERT INTO security_events (
            event_id, event_type, severity, user_id, session_id,
            event_description, event_data, ip_address, user_agent, created_at
        ) VALUES (
            'EVENT-' || strftime('%Y%m%d%H%M%S', 'now') || '-' || substr(hex(randomblob(4)), 1, 6),
            'suspicious_activity',
            CASE 
                WHEN NEW.risk_score > 90 THEN 'critical'
                WHEN NEW.risk_score > 80 THEN 'high'
                ELSE 'medium'
            END,
            NEW.user_id,
            NEW.session_id,
            'High-risk activity detected: ' || NEW.action_type || ' on ' || NEW.resource_type,
            json_object(
                'action_type', NEW.action_type,
                'resource_type', NEW.resource_type,
                'resource_id', NEW.resource_id,
                'risk_score', NEW.risk_score
            ),
            NEW.ip_address,
            NEW.user_agent,
            CURRENT_TIMESTAMP
        );
    END;

-- ==============================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for active security alerts
CREATE VIEW IF NOT EXISTS active_security_alerts AS
SELECT 
    sa.alert_id,
    sa.alert_type,
    sa.alert_severity,
    sa.alert_title,
    sa.alert_description,
    sa.user_id,
    s.first_name || ' ' || s.last_name as user_name,
    sa.created_at
FROM security_alerts sa
LEFT JOIN staff s ON sa.user_id = s.staff_id
WHERE sa.is_acknowledged = FALSE AND sa.is_resolved = FALSE;

-- View for user access summary
CREATE VIEW IF NOT EXISTS user_access_summary AS
SELECT 
    s.staff_id,
    s.first_name || ' ' || s.last_name as staff_name,
    s.department,
    s.position,
    COUNT(eal.audit_id) as total_actions,
    COUNT(CASE WHEN eal.is_sensitive = 1 THEN 1 END) as sensitive_actions,
    MAX(eal.created_at) as last_activity,
    COUNT(DISTINCT DATE(eal.created_at)) as active_days
FROM staff s
LEFT JOIN enhanced_audit_log eal ON s.staff_id = eal.user_id
WHERE eal.created_at >= DATE('now', '-30 days')
GROUP BY s.staff_id, s.first_name, s.last_name, s.department, s.position;

-- View for compliance dashboard
CREATE VIEW IF NOT EXISTS compliance_dashboard AS
SELECT 
    cp.policy_id,
    cp.policy_name,
    cp.policy_type,
    cp.policy_version,
    COUNT(ca.assessment_id) as total_assessments,
    AVG(ca.compliance_score) as average_score,
    MAX(ca.assessed_at) as last_assessment,
    CASE 
        WHEN AVG(ca.compliance_score) >= 90 THEN 'Compliant'
        WHEN AVG(ca.compliance_score) >= 70 THEN 'Partially Compliant'
        ELSE 'Non-Compliant'
    END as compliance_status
FROM compliance_policies cp
LEFT JOIN compliance_assessments ca ON cp.policy_id = ca.policy_id
WHERE cp.is_active = TRUE
GROUP BY cp.policy_id, cp.policy_name, cp.policy_type, cp.policy_version;

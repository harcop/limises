# Patient Management Module - End-to-End Sequence Diagram

## New Patient Registration Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant DB as Database
    participant INS as Insurance System
    participant PHOTO as Photo Capture
    participant VERIFY as Identity Verification
    participant NOT as Notification Service
    participant AUDIT as Audit System

    P->>R: Arrives at hospital
    R->>P: Requests personal information
    P->>R: Provides personal details
    R->>VERIFY: Verify patient identity
    VERIFY->>DB: Check for existing records
    DB-->>VERIFY: Return duplicate check result
    alt Duplicate Found
        VERIFY-->>R: Duplicate patient alert
        R->>P: Verify if existing patient
        P->>R: Confirms/denies existing record
    end
    VERIFY-->>R: Identity verification complete
    R->>PHOTO: Capture patient photo
    PHOTO->>DB: Store patient photo
    R->>HMS: Create new patient record
    HMS->>DB: Validate patient data
    DB-->>HMS: Data validation result
    HMS->>DB: Generate unique Patient ID
    DB-->>HMS: Patient ID generated
    HMS->>DB: Store patient demographics
    DB-->>HMS: Patient record created
    R->>P: Requests insurance information
    P->>R: Provides insurance details
    R->>HMS: Add insurance information
    HMS->>INS: Verify insurance eligibility
    INS-->>HMS: Insurance verification result
    alt Insurance Verification Failed
        HMS->>NOT: Send insurance issue alert
        NOT->>R: Insurance verification failed
        R->>P: Insurance verification issues
    else Insurance Verification Success
        HMS->>DB: Store insurance information
        HMS->>AUDIT: Log registration activity
        AUDIT->>DB: Save audit trail
        HMS->>NOT: Send welcome notification
        NOT->>P: Welcome SMS/Email
    end
    HMS-->>R: Patient registration complete
    R->>P: Issue patient card with ID
```

## Patient Check-in Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant DB as Database
    participant APP as Appointment System
    participant NOT as Notification Service

    P->>R: Arrives for appointment
    R->>HMS: Search patient by ID/name/phone
    HMS->>DB: Query patient database
    DB-->>HMS: Return patient record
    HMS-->>R: Display patient information
    R->>P: Verify identity
    P->>R: Confirms identity
    R->>HMS: Update demographics if needed
    HMS->>DB: Update patient record
    HMS->>APP: Check appointment status
    APP-->>HMS: Appointment details
    HMS->>DB: Generate visit token
    HMS->>NOT: Notify provider of patient arrival
    NOT->>APP: Update appointment status
    HMS-->>R: Check-in complete
    R->>P: Provide token and directions
```

## Medical Record Update Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant HMS as HMS System
    participant DB as Database
    participant CDSS as Clinical Decision Support
    participant P as Patient
    participant NOT as Notification Service

    DR->>HMS: Access patient record
    HMS->>DB: Retrieve patient data
    DB-->>HMS: Return patient information
    HMS-->>DR: Display patient record
    DR->>HMS: Enter clinical assessment
    HMS->>CDSS: Check for drug interactions
    CDSS-->>HMS: Interaction alerts
    HMS->>CDSS: Check allergy warnings
    CDSS-->>HMS: Allergy alerts
    HMS-->>DR: Display clinical alerts
    DR->>HMS: Review and acknowledge alerts
    DR->>HMS: Enter diagnosis and treatment plan
    HMS->>DB: Save clinical notes
    HMS->>DB: Update medical history
    HMS->>DB: Update current medications
    HMS->>DB: Record digital signature
    DB-->>HMS: Medical record updated
    HMS->>NOT: Send patient notification
    NOT->>P: Test results/instructions
    HMS-->>DR: Medical record saved
```

## Patient Search and Retrieval Flow

```mermaid
sequenceDiagram
    participant U as User (Staff)
    participant HMS as HMS System
    participant DB as Database
    participant SEARCH as Search Engine

    U->>HMS: Enter search criteria
    HMS->>SEARCH: Process search query
    SEARCH->>DB: Query patient database
    DB-->>SEARCH: Return search results
    SEARCH->>SEARCH: Apply fuzzy matching
    SEARCH->>SEARCH: Rank results by relevance
    SEARCH-->>HMS: Return ranked results
    HMS-->>U: Display patient list
    U->>HMS: Select patient
    HMS->>DB: Retrieve full patient record
    DB-->>HMS: Return complete patient data
    HMS-->>U: Display patient details
```

## Patient Transfer Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant HMS as HMS System
    participant DB as Database
    participant DEPT as Department System
    participant NOT as Notification Service
    participant REC as Receiving Staff

    DR->>HMS: Initiate patient transfer
    HMS->>DB: Retrieve patient information
    DB-->>HMS: Return patient data
    HMS-->>DR: Display patient details
    DR->>HMS: Select destination department
    HMS->>DEPT: Check destination availability
    DEPT-->>HMS: Availability status
    HMS->>DB: Create transfer record
    HMS->>NOT: Notify receiving department
    NOT->>REC: Transfer notification
    REC->>HMS: Acknowledge transfer
    HMS->>DB: Update patient location
    HMS->>DB: Create handover notes
    HMS->>NOT: Notify patient/family
    NOT->>DR: Transfer confirmation
    HMS-->>DR: Transfer completed
```

## Consent Management Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant DB as Database
    participant CONSENT as Consent System
    participant NOT as Notification Service

    P->>R: Arrives for treatment
    R->>HMS: Check consent requirements
    HMS->>CONSENT: Get required consents
    CONSENT-->>HMS: Return consent list
    HMS-->>R: Display consent forms
    R->>P: Present consent forms
    P->>R: Review consent forms
    P->>R: Sign consent forms
    R->>HMS: Submit signed consents
    HMS->>CONSENT: Process consent signatures
    CONSENT->>DB: Store consent records
    HMS->>NOT: Send consent confirmation
    NOT->>P: Consent confirmation
    HMS-->>R: Consent processing complete
    R->>P: Proceed with treatment
```

## Patient Communication Flow

```mermaid
sequenceDiagram
    participant HMS as HMS System
    participant NOT as Notification Service
    participant P as Patient
    participant SMS as SMS Service
    participant EMAIL as Email Service
    participant APP as Mobile App

    HMS->>NOT: Schedule appointment reminder
    NOT->>HMS: Check patient preferences
    HMS->>NOT: Get communication preferences
    NOT->>SMS: Send SMS reminder
    SMS->>P: SMS notification
    NOT->>EMAIL: Send email reminder
    EMAIL->>P: Email notification
    NOT->>APP: Send push notification
    APP->>P: Push notification
    P->>APP: Acknowledge notification
    APP->>NOT: Update notification status
    NOT->>HMS: Update communication log
    HMS->>NOT: Schedule follow-up reminder
    NOT->>P: Follow-up notification
```

## Patient Risk Stratification Flow

```mermaid
sequenceDiagram
    participant HMS as HMS System
    participant DB as Database
    participant RISK as Risk Assessment Engine
    participant CDSS as Clinical Decision Support
    participant DR as Doctor
    participant NOT as Notification Service

    HMS->>DB: Retrieve patient data
    DB-->>HMS: Return patient information
    HMS->>RISK: Analyze patient risk factors
    RISK->>CDSS: Get clinical guidelines
    CDSS-->>RISK: Return risk criteria
    RISK->>RISK: Calculate risk score
    RISK-->>HMS: Return risk assessment
    HMS->>DB: Store risk assessment
    HMS->>NOT: Check for high-risk alerts
    alt High Risk Patient
        NOT->>DR: High-risk patient alert
        DR->>HMS: Review risk factors
        HMS->>DR: Display risk mitigation options
        DR->>HMS: Implement care plan
        HMS->>DB: Update care plan
    end
    HMS-->>DR: Risk assessment complete
```


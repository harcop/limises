# OPD Management Module - End-to-End Sequence Diagram

## OPD Patient Check-in Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant OPD as OPD System
    participant DB as Database
    participant TOKEN as Token System
    participant QUEUE as Queue Management
    participant NOT as Notification Service

    P->>R: Arrives at OPD
    R->>HMS: Access patient record
    HMS->>DB: Retrieve patient information
    DB-->>HMS: Return patient data
    HMS-->>R: Display patient details
    R->>P: Verify patient identity
    P->>R: Confirms identity
    R->>OPD: Process OPD check-in
    OPD->>TOKEN: Generate token number
    TOKEN->>DB: Save token data
    TOKEN-->>OPD: Return token number
    OPD->>QUEUE: Add to queue
    QUEUE->>DB: Update queue status
    OPD->>NOT: Send check-in notification
    NOT->>P: Token number and queue position
    OPD-->>R: Check-in complete
    R->>P: Provide token and directions
```

## OPD Consultation Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant DR as Doctor
    participant HMS as HMS System
    participant OPD as OPD System
    participant DB as Database
    participant VITALS as Vital Signs
    participant PRESCRIPTION as Prescription System
    participant NOT as Notification Service

    P->>DR: Enters consultation room
    DR->>HMS: Access patient record
    HMS->>DB: Retrieve patient data
    DB-->>HMS: Return patient information
    HMS-->>DR: Display patient record
    DR->>P: Conducts consultation
    P->>DR: Provides symptoms and history
    DR->>VITALS: Record vital signs
    VITALS->>DB: Save vital signs data
    DR->>HMS: Enter clinical assessment
    HMS->>DB: Save clinical notes
    DR->>PRESCRIPTION: Create prescription
    PRESCRIPTION->>DB: Save prescription
    DR->>HMS: Complete consultation
    HMS->>DB: Update consultation status
    HMS->>NOT: Send consultation summary
    NOT->>P: Consultation summary
    HMS-->>DR: Consultation complete
```

## OPD Queue Management Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant R as Receptionist
    participant HMS as HMS System
    participant QUEUE as Queue Management
    participant DB as Database
    participant DISPLAY as Display Board
    participant NOT as Notification Service
    participant DR as Doctor

    P->>R: Checks queue status
    R->>HMS: Access queue information
    HMS->>QUEUE: Get queue status
    QUEUE->>DB: Query queue data
    DB-->>QUEUE: Return queue information
    QUEUE-->>HMS: Return queue status
    HMS-->>R: Display queue information
    R-->>P: Provide queue status
    QUEUE->>DISPLAY: Update display board
    DISPLAY->>P: Show current queue
    DR->>HMS: Call next patient
    HMS->>QUEUE: Update queue
    QUEUE->>DB: Update queue status
    QUEUE->>NOT: Send patient call
    NOT->>P: "Please proceed to room X"
    QUEUE->>DISPLAY: Update display
    DISPLAY->>P: Show updated queue
```

## OPD Prescription Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant P as Patient
    participant HMS as HMS System
    participant PRESCRIPTION as Prescription System
    participant DB as Database
    participant PHARMACY as Pharmacy System
    participant NOT as Notification Service

    DR->>HMS: Create prescription
    HMS->>PRESCRIPTION: Process prescription
    PRESCRIPTION->>DB: Save prescription data
    PRESCRIPTION->>PHARMACY: Send to pharmacy
    PHARMACY->>DB: Update prescription status
    PRESCRIPTION->>NOT: Send prescription notification
    NOT->>P: Prescription ready notification
    PRESCRIPTION-->>DR: Prescription created
    DR->>P: Provide prescription details
    P->>PHARMACY: Collect medication
    PHARMACY->>DB: Update prescription status
    PHARMACY->>NOT: Send collection notification
    NOT->>P: Medication ready
```

## OPD Follow-up Scheduling Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant P as Patient
    participant HMS as HMS System
    participant SCHEDULE as Scheduling System
    participant DB as Database
    participant APPOINTMENT as Appointment System
    participant NOT as Notification Service

    DR->>HMS: Schedule follow-up
    HMS->>SCHEDULE: Process follow-up request
    SCHEDULE->>APPOINTMENT: Check availability
    APPOINTMENT->>DB: Query available slots
    DB-->>APPOINTMENT: Return available times
    APPOINTMENT-->>SCHEDULE: Return availability
    SCHEDULE-->>HMS: Display available slots
    HMS-->>DR: Show scheduling options
    DR->>P: Discuss follow-up timing
    P->>DR: Confirms preferred time
    DR->>SCHEDULE: Confirm appointment
    SCHEDULE->>DB: Create follow-up appointment
    SCHEDULE->>NOT: Send appointment confirmation
    NOT->>P: Follow-up appointment confirmed
    SCHEDULE-->>DR: Follow-up scheduled
```

## OPD Medical Certificate Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant DR as Doctor
    participant HMS as HMS System
    participant CERTIFICATE as Certificate System
    participant DB as Database
    participant TEMPLATE as Template Engine
    participant PRINT as Print System
    participant NOT as Notification Service

    P->>DR: Requests medical certificate
    DR->>HMS: Access certificate system
    HMS->>CERTIFICATE: Create certificate
    CERTIFICATE->>TEMPLATE: Load certificate template
    TEMPLATE-->>CERTIFICATE: Return template
    CERTIFICATE->>DB: Get patient information
    DB-->>CERTIFICATE: Return patient data
    CERTIFICATE->>CERTIFICATE: Generate certificate
    CERTIFICATE->>DB: Save certificate
    CERTIFICATE->>PRINT: Print certificate
    PRINT->>PRINT: Generate printed certificate
    CERTIFICATE->>NOT: Send certificate notification
    NOT->>P: Certificate ready
    CERTIFICATE-->>DR: Certificate generated
    DR->>P: Provide medical certificate
```

## OPD Vital Signs Recording Flow

```mermaid
sequenceDiagram
    participant NURSE as Nurse
    participant P as Patient
    participant HMS as HMS System
    participant VITALS as Vital Signs System
    participant DB as Database
    participant DEVICE as Vital Signs Device
    participant NOT as Notification Service
    participant DR as Doctor

    NURSE->>P: Prepare for vital signs
    NURSE->>DEVICE: Connect vital signs device
    DEVICE->>DEVICE: Measure vital signs
    DEVICE-->>NURSE: Return vital signs data
    NURSE->>HMS: Record vital signs
    HMS->>VITALS: Process vital signs
    VITALS->>DB: Save vital signs data
    VITALS->>VITALS: Check for abnormal values
    alt Abnormal Values
        VITALS->>NOT: Send abnormal alert
        NOT->>DR: Abnormal vital signs alert
    end
    VITALS->>NOT: Send vital signs notification
    NOT->>DR: Vital signs recorded
    VITALS-->>NURSE: Vital signs recorded
    NURSE->>P: Vital signs complete
```

## OPD Discharge Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant P as Patient
    participant HMS as HMS System
    participant DISCHARGE as Discharge System
    participant DB as Database
    participant SUMMARY as Discharge Summary
    participant NOT as Notification Service
    participant PHARMACY as Pharmacy System

    DR->>HMS: Initiate discharge
    HMS->>DISCHARGE: Process discharge
    DISCHARGE->>SUMMARY: Generate discharge summary
    SUMMARY->>DB: Get patient data
    DB-->>SUMMARY: Return patient information
    SUMMARY->>SUMMARY: Create discharge summary
    SUMMARY->>DB: Save discharge summary
    DISCHARGE->>PHARMACY: Check prescription status
    PHARMACY->>DB: Query prescription data
    DB-->>PHARMACY: Return prescription status
    PHARMACY-->>DISCHARGE: Prescription status
    DISCHARGE->>DB: Update discharge status
    DISCHARGE->>NOT: Send discharge notification
    NOT->>P: Discharge summary ready
    DISCHARGE-->>DR: Discharge complete
    DR->>P: Provide discharge instructions
```

## OPD Analytics Flow

```mermaid
sequenceDiagram
    participant ADMIN as Administrator
    participant HMS as HMS System
    participant OPD as OPD System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>HMS: Request OPD analytics
    HMS->>OPD: Initiate OPD analytics
    OPD->>ANALYTICS: Process OPD data
    ANALYTICS->>DB: Query OPD metrics
    DB-->>ANALYTICS: Return OPD data
    ANALYTICS->>ANALYTICS: Calculate OPD metrics
    Note over ANALYTICS: - Patient volume<br/>- Wait times<br/>- Doctor utilization<br/>- Consultation duration
    ANALYTICS-->>OPD: Return analytics results
    OPD->>REPORT: Generate OPD report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>OPD: OPD report ready
    OPD->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>OPD: Dashboard updated
    OPD-->>HMS: Return analytics results
    HMS-->>ADMIN: Display OPD analytics
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze OPD trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: OPD trend analysis
    HMS-->>ADMIN: OPD insights and recommendations
```

## OPD Integration Flow

```mermaid
sequenceDiagram
    participant OPD as OPD System
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant RADIOLOGY as Radiology System
    participant PHARMACY as Pharmacy System
    participant BILLING as Billing System
    participant DB as Database
    participant NOT as Notification Service

    OPD->>HMS: Patient consultation complete
    HMS->>LAB: Order laboratory tests
    LAB->>DB: Save test orders
    HMS->>RADIOLOGY: Order imaging studies
    RADIOLOGY->>DB: Save imaging orders
    HMS->>PHARMACY: Send prescriptions
    PHARMACY->>DB: Save prescriptions
    HMS->>BILLING: Generate charges
    BILLING->>DB: Save billing data
    LAB->>NOT: Send test results
    NOT->>OPD: Test results available
    RADIOLOGY->>NOT: Send imaging results
    NOT->>OPD: Imaging results available
    PHARMACY->>NOT: Send prescription status
    NOT->>OPD: Prescription ready
    BILLING->>NOT: Send billing notification
    NOT->>OPD: Billing complete
    OPD->>DB: Update integration status
    OPD-->>HMS: OPD integration complete
```

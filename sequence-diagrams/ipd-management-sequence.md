# IPD Management Module - End-to-End Sequence Diagram

## Patient Admission Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant DR as Doctor
    participant NURSE as Nurse
    participant HMS as HMS System
    participant IPD as IPD System
    participant DB as Database
    participant BED as Bed Management
    participant NOT as Notification Service

    DR->>HMS: Initiate admission
    HMS->>IPD: Process admission
    IPD->>DB: Get patient information
    DB-->>IPD: Return patient data
    IPD->>BED: Check bed availability
    BED->>DB: Query bed status
    DB-->>BED: Return bed availability
    BED-->>IPD: Assign bed
    IPD->>DB: Create admission record
    IPD->>NOT: Send admission notification
    NOT->>NURSE: New patient admission
    NOT->>P: Admission confirmation
    IPD->>BED: Update bed status
    BED->>DB: Update bed assignment
    IPD-->>DR: Admission complete
    DR->>NURSE: Handover patient
    NURSE->>P: Welcome to ward
```

## Bed Management Flow

```mermaid
sequenceDiagram
    participant NURSE as Nurse
    participant HMS as HMS System
    participant BED as Bed Management
    participant DB as Database
    participant WARD as Ward System
    participant CLEANING as Cleaning System
    participant NOT as Notification Service

    NURSE->>HMS: Access bed management
    HMS->>BED: Get bed status
    BED->>DB: Query bed information
    DB-->>BED: Return bed data
    BED-->>HMS: Display bed status
    HMS-->>NURSE: Show bed availability
    NURSE->>BED: Request bed assignment
    BED->>WARD: Check ward capacity
    WARD->>DB: Query ward status
    DB-->>WARD: Return ward data
    WARD-->>BED: Ward availability
    BED->>DB: Assign bed
    BED->>CLEANING: Schedule bed cleaning
    CLEANING->>DB: Update cleaning status
    BED->>NOT: Send bed assignment
    NOT->>NURSE: Bed assigned
    BED-->>NURSE: Bed management complete
```

## Nursing Care Flow

```mermaid
sequenceDiagram
    participant NURSE as Nurse
    participant P as Patient
    participant HMS as HMS System
    participant NURSING as Nursing System
    participant DB as Database
    participant CARE as Care Plan
    participant VITALS as Vital Signs
    participant NOT as Notification Service
    participant DR as Doctor

    NURSE->>HMS: Access nursing care
    HMS->>NURSING: Get care plan
    NURSING->>CARE: Load patient care plan
    CARE->>DB: Query care plan
    DB-->>CARE: Return care plan
    CARE-->>NURSING: Return care plan
    NURSING-->>HMS: Display care plan
    HMS-->>NURSE: Show nursing tasks
    NURSE->>P: Provide nursing care
    NURSE->>VITALS: Record vital signs
    VITALS->>DB: Save vital signs
    NURSE->>NURSING: Update care progress
    NURSING->>DB: Save care updates
    NURSING->>NOT: Send care notification
    NOT->>DR: Nursing care update
    NURSING-->>NURSE: Care documentation complete
```

## Doctor Rounds Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant NURSE as Nurse
    participant HMS as HMS System
    participant ROUNDS as Rounds System
    participant DB as Database
    participant PATIENT as Patient List
    participant NOTES as Clinical Notes
    participant NOT as Notification Service

    DR->>HMS: Start doctor rounds
    HMS->>ROUNDS: Initiate rounds
    ROUNDS->>PATIENT: Get patient list
    PATIENT->>DB: Query patient data
    DB-->>PATIENT: Return patient list
    PATIENT-->>ROUNDS: Return patient list
    ROUNDS-->>HMS: Display patient list
    HMS-->>DR: Show rounds schedule
    DR->>NURSE: Request patient update
    NURSE->>DR: Provides patient status
    DR->>HMS: Conduct patient assessment
    HMS->>NOTES: Create clinical notes
    NOTES->>DB: Save clinical notes
    DR->>ROUNDS: Update patient status
    ROUNDS->>DB: Save rounds data
    ROUNDS->>NOT: Send rounds notification
    NOT->>NURSE: Doctor rounds update
    ROUNDS-->>DR: Rounds complete
```

## Medication Administration Flow

```mermaid
sequenceDiagram
    participant NURSE as Nurse
    participant P as Patient
    participant HMS as HMS System
    participant MEDICATION as Medication System
    participant DB as Database
    participant MAR as Medication Administration Record
    participant PHARMACY as Pharmacy System
    participant NOT as Notification Service

    NURSE->>HMS: Access medication schedule
    HMS->>MEDICATION: Get medication list
    MEDICATION->>DB: Query medication orders
    DB-->>MEDICATION: Return medication data
    MEDICATION-->>HMS: Display medication schedule
    HMS-->>NURSE: Show medications due
    NURSE->>P: Administer medication
    NURSE->>MAR: Record medication administration
    MAR->>DB: Save administration record
    MAR->>PHARMACY: Update medication status
    PHARMACY->>DB: Update pharmacy records
    MAR->>NOT: Send administration notification
    NOT->>HMS: Medication administered
    MAR-->>NURSE: Medication administration complete
```

## Patient Transfer Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant NURSE1 as Source Nurse
    participant NURSE2 as Destination Nurse
    participant HMS as HMS System
    participant TRANSFER as Transfer System
    participant DB as Database
    participant BED as Bed Management
    participant NOT as Notification Service

    DR->>HMS: Initiate patient transfer
    HMS->>TRANSFER: Process transfer
    TRANSFER->>DB: Get patient information
    DB-->>TRANSFER: Return patient data
    TRANSFER->>BED: Check destination bed
    BED->>DB: Query bed availability
    DB-->>BED: Return bed status
    BED-->>TRANSFER: Bed available
    TRANSFER->>NOT: Send transfer notification
    NOT->>NURSE1: Patient transfer request
    NOT->>NURSE2: Incoming patient notification
    NURSE1->>TRANSFER: Prepare patient for transfer
    TRANSFER->>DB: Update transfer status
    NURSE2->>TRANSFER: Acknowledge transfer
    TRANSFER->>BED: Update bed assignments
    BED->>DB: Update bed status
    TRANSFER->>DB: Complete transfer record
    TRANSFER->>NOT: Send transfer completion
    NOT->>NURSE1: Transfer complete
    NOT->>NURSE2: Patient received
    TRANSFER-->>DR: Patient transfer complete
```

## Discharge Planning Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant NURSE as Nurse
    participant P as Patient
    participant HMS as HMS System
    participant DISCHARGE as Discharge System
    participant DB as Database
    participant PHARMACY as Pharmacy System
    participant FOLLOWUP as Follow-up System
    participant NOT as Notification Service

    DR->>HMS: Initiate discharge planning
    HMS->>DISCHARGE: Process discharge
    DISCHARGE->>DB: Get patient data
    DB-->>DISCHARGE: Return patient information
    DISCHARGE->>PHARMACY: Check discharge medications
    PHARMACY->>DB: Query medication status
    DB-->>PHARMACY: Return medication data
    PHARMACY-->>DISCHARGE: Medication status
    DISCHARGE->>FOLLOWUP: Schedule follow-up
    FOLLOWUP->>DB: Create follow-up appointment
    DISCHARGE->>DB: Create discharge summary
    DISCHARGE->>NOT: Send discharge notification
    NOT->>NURSE: Discharge preparation
    NOT->>P: Discharge instructions
    NURSE->>P: Provide discharge care
    DISCHARGE->>DB: Complete discharge
    DISCHARGE-->>DR: Discharge planning complete
```

## IPD Billing Flow

```mermaid
sequenceDiagram
    participant BILLING as Billing Staff
    participant HMS as HMS System
    participant IPD as IPD System
    participant DB as Database
    participant CHARGES as Charge System
    participant INSURANCE as Insurance System
    participant PAYMENT as Payment System
    participant NOT as Notification Service

    BILLING->>HMS: Access IPD billing
    HMS->>IPD: Get IPD charges
    IPD->>CHARGES: Calculate room charges
    CHARGES->>DB: Query service charges
    DB-->>CHARGES: Return charge data
    CHARGES->>CHARGES: Calculate total charges
    CHARGES-->>IPD: Return billing summary
    IPD->>INSURANCE: Verify insurance coverage
    INSURANCE->>DB: Query insurance data
    DB-->>INSURANCE: Return insurance info
    INSURANCE-->>IPD: Insurance coverage
    IPD->>PAYMENT: Process payment
    PAYMENT->>DB: Record payment
    IPD->>NOT: Send billing notification
    NOT->>BILLING: Billing complete
    IPD-->>BILLING: IPD billing processed
```

## IPD Analytics Flow

```mermaid
sequenceDiagram
    participant ADMIN as Administrator
    participant HMS as HMS System
    participant IPD as IPD System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>HMS: Request IPD analytics
    HMS->>IPD: Initiate IPD analytics
    IPD->>ANALYTICS: Process IPD data
    ANALYTICS->>DB: Query IPD metrics
    DB-->>ANALYTICS: Return IPD data
    ANALYTICS->>ANALYTICS: Calculate IPD metrics
    Note over ANALYTICS: - Bed occupancy<br/>- Length of stay<br/>- Readmission rates<br/>- Patient outcomes
    ANALYTICS-->>IPD: Return analytics results
    IPD->>REPORT: Generate IPD report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>IPD: IPD report ready
    IPD->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>IPD: Dashboard updated
    IPD-->>HMS: Return analytics results
    HMS-->>ADMIN: Display IPD analytics
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze IPD trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: IPD trend analysis
    HMS-->>ADMIN: IPD insights and recommendations
```

## IPD Integration Flow

```mermaid
sequenceDiagram
    participant IPD as IPD System
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant RADIOLOGY as Radiology System
    participant PHARMACY as Pharmacy System
    participant OT as Operation Theatre
    participant BILLING as Billing System
    participant DB as Database
    participant NOT as Notification Service

    IPD->>HMS: Patient admitted
    HMS->>LAB: Order laboratory tests
    LAB->>DB: Save test orders
    HMS->>RADIOLOGY: Order imaging studies
    RADIOLOGY->>DB: Save imaging orders
    HMS->>PHARMACY: Send medication orders
    PHARMACY->>DB: Save medication orders
    HMS->>OT: Schedule surgery if needed
    OT->>DB: Save surgery schedule
    HMS->>BILLING: Generate charges
    BILLING->>DB: Save billing data
    LAB->>NOT: Send test results
    NOT->>IPD: Test results available
    RADIOLOGY->>NOT: Send imaging results
    NOT->>IPD: Imaging results available
    PHARMACY->>NOT: Send medication status
    NOT->>IPD: Medication ready
    OT->>NOT: Send surgery updates
    NOT->>IPD: Surgery status update
    BILLING->>NOT: Send billing notification
    NOT->>IPD: Billing complete
    IPD->>DB: Update integration status
    IPD-->>HMS: IPD integration complete
```

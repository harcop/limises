# Radiology & Imaging Module - End-to-End Sequence Diagram

## Imaging Order Management Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant HMS as HMS System
    participant RADIOLOGY as Radiology System
    participant DB as Database
    participant ORDER as Order Management
    participant SCHEDULE as Scheduling System
    participant NOT as Notification Service
    participant RADIOLOGIST as Radiologist

    DR->>HMS: Request imaging study
    HMS->>RADIOLOGY: Process imaging order
    RADIOLOGY->>ORDER: Create imaging order
    ORDER->>DB: Save order data
    ORDER->>SCHEDULE: Check appointment availability
    SCHEDULE->>DB: Query schedule
    DB-->>SCHEDULE: Return available slots
    SCHEDULE-->>ORDER: Return scheduling options
    ORDER-->>RADIOLOGY: Order created
    RADIOLOGY->>NOT: Send order notification
    NOT->>RADIOLOGIST: New imaging order
    RADIOLOGY->>SCHEDULE: Schedule appointment
    SCHEDULE->>DB: Save appointment
    RADIOLOGY-->>HMS: Imaging order complete
    HMS-->>DR: Order placed successfully
```

## PACS Integration and Image Storage Flow

```mermaid
sequenceDiagram
    participant TECH as Radiology Technician
    participant RADIOLOGY as Radiology System
    participant PACS as PACS System
    participant DB as Database
    participant STORAGE as Image Storage
    participant DICOM as DICOM Server
    participant NOT as Notification Service
    participant RADIOLOGIST as Radiologist

    TECH->>RADIOLOGY: Complete imaging study
    RADIOLOGY->>PACS: Send images to PACS
    PACS->>DICOM: Process DICOM images
    DICOM->>STORAGE: Store images
    STORAGE->>DB: Update image metadata
    PACS->>DB: Save image information
    PACS->>NOT: Send image notification
    NOT->>RADIOLOGIST: Images ready for review
    RADIOLOGIST->>PACS: Access images
    PACS->>STORAGE: Retrieve images
    STORAGE-->>PACS: Return image data
    PACS-->>RADIOLOGIST: Display images
    RADIOLOGIST->>PACS: Review images
    PACS->>DB: Update review status
    PACS-->>RADIOLOGY: Image review complete
    RADIOLOGY-->>TECH: Images processed
```

## Radiologist Reporting and Workflow Flow

```mermaid
sequenceDiagram
    participant RADIOLOGIST as Radiologist
    participant RADIOLOGY as Radiology System
    participant DB as Database
    participant REPORT as Report System
    participant TEMPLATE as Report Template
    participant NOT as Notification Service
    participant DR as Referring Doctor

    RADIOLOGIST->>RADIOLOGY: Access imaging study
    RADIOLOGY->>DB: Get study information
    DB-->>RADIOLOGY: Return study data
    RADIOLOGY-->>RADIOLOGIST: Display study details
    RADIOLOGIST->>REPORT: Start report creation
    REPORT->>TEMPLATE: Load report template
    TEMPLATE-->>REPORT: Return template
    RADIOLOGIST->>REPORT: Enter findings
    REPORT->>DB: Save report draft
    RADIOLOGIST->>REPORT: Complete report
    REPORT->>DB: Save final report
    REPORT->>NOT: Send report notification
    NOT->>DR: Radiology report available
    RADIOLOGIST->>REPORT: Sign report
    REPORT->>DB: Update report status
    REPORT-->>RADIOLOGY: Report complete
    RADIOLOGY-->>RADIOLOGIST: Report finalized
```

## Critical Results Management Flow

```mermaid
sequenceDiagram
    participant RADIOLOGIST as Radiologist
    participant RADIOLOGY as Radiology System
    participant CRITICAL as Critical Results System
    participant DB as Database
    participant NOT as Notification Service
    participant DR as Referring Doctor
    participant NURSE as Nurse
    participant ADMIN as Administrator

    RADIOLOGIST->>RADIOLOGY: Identify critical finding
    RADIOLOGY->>CRITICAL: Process critical result
    CRITICAL->>DB: Log critical finding
    CRITICAL->>NOT: Send critical alert
    NOT->>DR: Critical result call
    NOT->>NURSE: Critical result notification
    NOT->>ADMIN: Critical result alert
    DR->>CRITICAL: Acknowledge critical result
    CRITICAL->>DB: Record acknowledgment
    DR->>CRITICAL: Take clinical action
    CRITICAL->>DB: Record clinical response
    CRITICAL->>NOT: Send follow-up notification
    NOT->>RADIOLOGIST: Follow-up critical result
    RADIOLOGIST->>CRITICAL: Confirm critical result
    CRITICAL->>DB: Final critical result status
    CRITICAL-->>RADIOLOGY: Critical result managed
    RADIOLOGY-->>RADIOLOGIST: Critical result complete
```

## Contrast Media Management Flow

```mermaid
sequenceDiagram
    participant TECH as Radiology Technician
    participant RADIOLOGY as Radiology System
    participant CONTRAST as Contrast System
    participant DB as Database
    participant INVENTORY as Inventory System
    participant ALLERGY as Allergy System
    participant NOT as Notification Service
    participant PHARMACY as Pharmacy

    TECH->>RADIOLOGY: Prepare contrast study
    RADIOLOGY->>CONTRAST: Check contrast requirements
    CONTRAST->>ALLERGY: Check patient allergies
    ALLERGY->>DB: Query allergy data
    DB-->>ALLERGY: Return allergy information
    ALLERGY-->>CONTRAST: Allergy status
    alt Patient Has Allergy
        CONTRAST->>NOT: Send allergy alert
        NOT->>TECH: Contrast allergy warning
        CONTRAST-->>RADIOLOGY: Contrast contraindicated
    else No Allergy
        CONTRAST->>INVENTORY: Check contrast stock
        INVENTORY->>DB: Query inventory
        DB-->>INVENTORY: Return stock data
        INVENTORY-->>CONTRAST: Stock availability
        alt Low Stock
            INVENTORY->>NOT: Send reorder alert
            NOT->>PHARMACY: Contrast reorder
        end
        CONTRAST->>DB: Record contrast usage
        CONTRAST-->>RADIOLOGY: Contrast approved
    end
    RADIOLOGY-->>TECH: Contrast management complete
```

## Radiation Dose Tracking Flow

```mermaid
sequenceDiagram
    participant TECH as Radiology Technician
    participant RADIOLOGY as Radiology System
    participant DOSE as Dose Tracking System
    participant DB as Database
    participant MONITOR as Dose Monitoring
    participant ALERT as Alert System
    participant NOT as Notification Service
    participant PHYSICIST as Medical Physicist

    TECH->>RADIOLOGY: Perform imaging study
    RADIOLOGY->>DOSE: Record radiation dose
    DOSE->>DB: Save dose data
    DOSE->>MONITOR: Check dose limits
    MONITOR->>DB: Query dose history
    DB-->>MONITOR: Return dose data
    MONITOR->>MONITOR: Calculate cumulative dose
    alt Dose Limit Exceeded
        MONITOR->>ALERT: Send dose alert
        ALERT->>NOT: Send dose warning
        NOT->>PHYSICIST: Dose limit exceeded
        PHYSICIST->>DOSE: Review dose data
        DOSE->>DB: Update dose review
    end
    DOSE->>DB: Update dose tracking
    DOSE-->>RADIOLOGY: Dose tracking complete
    RADIOLOGY-->>TECH: Dose recorded
```

## Radiology Analytics and Reporting Flow

```mermaid
sequenceDiagram
    participant ADMIN as Radiology Administrator
    participant RADIOLOGY as Radiology System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>RADIOLOGY: Request radiology analytics
    RADIOLOGY->>ANALYTICS: Process radiology data
    ANALYTICS->>DB: Query radiology metrics
    DB-->>ANALYTICS: Return radiology data
    ANALYTICS->>ANALYTICS: Calculate radiology metrics
    Note over ANALYTICS: - Study volumes<br/>- Report turnaround times<br/>- Equipment utilization<br/>- Quality metrics
    ANALYTICS-->>RADIOLOGY: Return analytics results
    RADIOLOGY->>REPORT: Generate radiology report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>RADIOLOGY: Radiology report ready
    RADIOLOGY->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>RADIOLOGY: Dashboard updated
    RADIOLOGY-->>ADMIN: Display radiology analytics
    ADMIN->>RADIOLOGY: Request trend analysis
    RADIOLOGY->>ANALYTICS: Analyze radiology trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>RADIOLOGY: Radiology trend analysis
    RADIOLOGY-->>ADMIN: Radiology insights and recommendations
```

## Radiology Integration Flow

```mermaid
sequenceDiagram
    participant RADIOLOGY as Radiology System
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant PHARMACY as Pharmacy System
    participant BILLING as Billing System
    participant PACS as PACS System
    participant DB as Database
    participant NOT as Notification Service

    RADIOLOGY->>HMS: Imaging study ordered
    HMS->>LAB: Order related lab tests
    LAB->>DB: Save lab orders
    HMS->>PHARMACY: Request contrast media
    PHARMACY->>DB: Save pharmacy orders
    HMS->>BILLING: Generate imaging charges
    BILLING->>DB: Save billing data
    RADIOLOGY->>PACS: Store images
    PACS->>DB: Save image data
    LAB->>NOT: Send lab results
    NOT->>RADIOLOGY: Lab results available
    PHARMACY->>NOT: Send contrast status
    NOT->>RADIOLOGY: Contrast ready
    BILLING->>NOT: Send billing notification
    NOT->>RADIOLOGY: Billing complete
    RADIOLOGY->>DB: Update integration status
    RADIOLOGY-->>HMS: Radiology integration complete
```

## Radiology Quality Assurance Flow

```mermaid
sequenceDiagram
    participant QA as Quality Assurance
    participant RADIOLOGY as Radiology System
    participant DB as Database
    participant QUALITY as Quality System
    participant AUDIT as Audit System
    participant NOT as Notification Service
    participant ADMIN as Radiology Manager

    QA->>RADIOLOGY: Initiate quality audit
    RADIOLOGY->>QUALITY: Start quality assessment
    QUALITY->>DB: Query quality metrics
    DB-->>QUALITY: Return quality data
    QUALITY->>AUDIT: Perform quality audit
    AUDIT->>DB: Query audit criteria
    DB-->>AUDIT: Return audit data
    AUDIT->>AUDIT: Analyze quality compliance
    AUDIT-->>QUALITY: Return audit results
    QUALITY->>NOT: Send quality report
    NOT->>ADMIN: Quality audit results
    ADMIN->>QUALITY: Review audit findings
    QUALITY->>DB: Save quality improvements
    QUALITY->>AUDIT: Update audit criteria
    AUDIT->>DB: Save audit updates
    QUALITY-->>RADIOLOGY: Quality assurance complete
    RADIOLOGY-->>QA: Radiology quality assessment complete
```

## Radiology Equipment Management Flow

```mermaid
sequenceDiagram
    participant TECH as Equipment Technician
    participant RADIOLOGY as Radiology System
    participant EQUIPMENT as Equipment System
    participant DB as Database
    participant MAINTENANCE as Maintenance System
    participant CALIBRATION as Calibration System
    participant NOT as Notification Service
    participant VENDOR as Equipment Vendor

    TECH->>RADIOLOGY: Access equipment management
    RADIOLOGY->>EQUIPMENT: Get equipment status
    EQUIPMENT->>DB: Query equipment data
    DB-->>EQUIPMENT: Return equipment info
    EQUIPMENT-->>RADIOLOGY: Display equipment status
    RADIOLOGY-->>TECH: Show equipment management
    TECH->>EQUIPMENT: Schedule maintenance
    EQUIPMENT->>MAINTENANCE: Create maintenance task
    MAINTENANCE->>DB: Save maintenance schedule
    MAINTENANCE->>NOT: Send maintenance notification
    NOT->>TECH: Maintenance scheduled
    TECH->>EQUIPMENT: Perform maintenance
    EQUIPMENT->>CALIBRATION: Calibrate equipment
    CALIBRATION->>DB: Save calibration data
    EQUIPMENT->>DB: Update equipment status
    EQUIPMENT->>NOT: Send completion notification
    NOT->>TECH: Maintenance complete
    alt Equipment Issue
        EQUIPMENT->>NOT: Send issue alert
        NOT->>VENDOR: Equipment service request
        VENDOR->>EQUIPMENT: Service equipment
        EQUIPMENT->>DB: Update service record
    end
    EQUIPMENT-->>RADIOLOGY: Equipment management complete
    RADIOLOGY-->>TECH: Equipment status updated
```

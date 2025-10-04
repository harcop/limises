# Operation Theatre (OT) Management Module - End-to-End Sequence Diagram

## OT Scheduling and Resource Management Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant HMS as HMS System
    participant OT as OT System
    participant DB as Database
    participant SCHEDULE as Scheduling System
    participant RESOURCE as Resource Management
    participant NOT as Notification Service
    participant TEAM as Surgical Team

    DR->>HMS: Request OT booking
    HMS->>OT: Process OT request
    OT->>SCHEDULE: Check OT availability
    SCHEDULE->>DB: Query OT schedule
    DB-->>SCHEDULE: Return available slots
    SCHEDULE->>RESOURCE: Check resource availability
    RESOURCE->>DB: Query equipment and staff
    DB-->>RESOURCE: Return resource status
    RESOURCE-->>SCHEDULE: Resource availability
    SCHEDULE-->>OT: Return scheduling options
    OT-->>HMS: Display available options
    HMS-->>DR: Show OT availability
    DR->>HMS: Select OT slot
    HMS->>OT: Confirm OT booking
    OT->>DB: Save OT schedule
    OT->>NOT: Send booking confirmation
    NOT->>TEAM: OT booking notification
    OT->>RESOURCE: Reserve resources
    RESOURCE->>DB: Update resource status
    OT-->>HMS: OT booking complete
    HMS-->>DR: OT scheduled successfully
```

## Pre-Operative Assessment and Preparation Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant NURSE as Pre-op Nurse
    participant P as Patient
    participant HMS as HMS System
    participant PREOP as Pre-op System
    participant DB as Database
    participant ASSESSMENT as Assessment System
    participant NOT as Notification Service
    participant ANESTHESIA as Anesthesia Team

    DR->>HMS: Initiate pre-op assessment
    HMS->>PREOP: Process pre-op preparation
    PREOP->>DB: Get patient information
    DB-->>PREOP: Return patient data
    PREOP-->>HMS: Display patient details
    HMS-->>DR: Show patient information
    DR->>PREOP: Complete pre-op assessment
    PREOP->>ASSESSMENT: Process assessment
    ASSESSMENT->>DB: Save assessment data
    NURSE->>P: Prepare patient for surgery
    P->>NURSE: Patient preparation complete
    NURSE->>PREOP: Update preparation status
    PREOP->>NOT: Send preparation notification
    NOT->>ANESTHESIA: Pre-op assessment ready
    ANESTHESIA->>PREOP: Review assessment
    PREOP->>DB: Update pre-op status
    PREOP-->>HMS: Pre-op preparation complete
    HMS-->>DR: Patient ready for surgery
```

## Intra-Operative Documentation Flow

```mermaid
sequenceDiagram
    participant SURGEON as Surgeon
    participant NURSE as OT Nurse
    participant ANESTHESIA as Anesthesiologist
    participant HMS as HMS System
    participant INTRAOP as Intra-op System
    participant DB as Database
    participant MONITOR as Monitoring System
    participant NOT as Notification Service
    participant RECORD as Surgical Record

    SURGEON->>HMS: Start surgery
    HMS->>INTRAOP: Initiate intra-op documentation
    INTRAOP->>DB: Create surgical record
    INTRAOP->>MONITOR: Start patient monitoring
    MONITOR->>INTRAOP: Continuous vital signs
    NURSE->>INTRAOP: Document surgical steps
    INTRAOP->>DB: Save surgical documentation
    ANESTHESIA->>INTRAOP: Document anesthesia
    INTRAOP->>DB: Save anesthesia records
    SURGEON->>INTRAOP: Document surgical findings
    INTRAOP->>DB: Save surgical notes
    INTRAOP->>NOT: Send surgery updates
    NOT->>HMS: Surgery progress updates
    SURGEON->>INTRAOP: Complete surgery
    INTRAOP->>RECORD: Generate surgical report
    RECORD->>DB: Save complete surgical record
    INTRAOP-->>HMS: Intra-op documentation complete
    HMS-->>SURGEON: Surgery documentation complete
```

## Surgical Team Management Flow

```mermaid
sequenceDiagram
    participant ADMIN as OT Administrator
    participant HMS as HMS System
    participant TEAM as Team Management
    participant DB as Database
    participant SCHEDULE as Staff Scheduling
    participant NOT as Notification Service
    participant STAFF as Surgical Staff

    ADMIN->>HMS: Access team management
    HMS->>TEAM: Get team information
    TEAM->>DB: Query team data
    DB-->>TEAM: Return team information
    TEAM-->>HMS: Display team status
    HMS-->>ADMIN: Show team management
    ADMIN->>TEAM: Assign surgical team
    TEAM->>SCHEDULE: Check staff availability
    SCHEDULE->>DB: Query staff schedule
    DB-->>SCHEDULE: Return availability
    SCHEDULE-->>TEAM: Staff availability
    TEAM->>DB: Save team assignment
    TEAM->>NOT: Send team assignment
    NOT->>STAFF: Team assignment notification
    STAFF->>TEAM: Acknowledge assignment
    TEAM->>DB: Update team status
    TEAM-->>HMS: Team management complete
    HMS-->>ADMIN: Team assigned successfully
```

## Consumables and Implant Tracking Flow

```mermaid
sequenceDiagram
    participant NURSE as OT Nurse
    participant HMS as HMS System
    participant CONSUMABLE as Consumable System
    participant DB as Database
    participant INVENTORY as Inventory System
    participant IMPLANT as Implant Registry
    participant NOT as Notification Service
    participant SUPPLIER as Supplier

    NURSE->>HMS: Access consumable tracking
    HMS->>CONSUMABLE: Get consumable list
    CONSUMABLE->>INVENTORY: Check stock levels
    INVENTORY->>DB: Query inventory
    DB-->>INVENTORY: Return stock data
    INVENTORY-->>CONSUMABLE: Stock availability
    CONSUMABLE-->>HMS: Display consumables
    HMS-->>NURSE: Show available items
    NURSE->>CONSUMABLE: Use consumable
    CONSUMABLE->>DB: Record usage
    CONSUMABLE->>INVENTORY: Update stock
    INVENTORY->>DB: Update inventory
    alt Low Stock Alert
        INVENTORY->>NOT: Send reorder alert
        NOT->>SUPPLIER: Reorder notification
    end
    NURSE->>IMPLANT: Record implant usage
    IMPLANT->>DB: Save implant record
    IMPLANT->>NOT: Send implant notification
    NOT->>HMS: Implant tracking update
    CONSUMABLE-->>HMS: Consumable tracking complete
    HMS-->>NURSE: Items tracked successfully
```

## Post-Operative Care Coordination Flow

```mermaid
sequenceDiagram
    participant SURGEON as Surgeon
    participant NURSE as Post-op Nurse
    participant P as Patient
    participant HMS as HMS System
    participant POSTOP as Post-op System
    participant DB as Database
    participant RECOVERY as Recovery System
    participant NOT as Notification Service
    participant WARD as Ward System

    SURGEON->>HMS: Complete surgery
    HMS->>POSTOP: Initiate post-op care
    POSTOP->>DB: Get surgical record
    DB-->>POSTOP: Return surgery data
    POSTOP->>RECOVERY: Plan recovery care
    RECOVERY->>DB: Save recovery plan
    POSTOP->>NOT: Send post-op notification
    NOT->>NURSE: Post-op care assignment
    NURSE->>P: Provide post-op care
    P->>NURSE: Patient recovery status
    NURSE->>POSTOP: Update recovery status
    POSTOP->>DB: Save recovery updates
    POSTOP->>WARD: Coordinate ward transfer
    WARD->>DB: Prepare ward bed
    POSTOP->>NOT: Send transfer notification
    NOT->>WARD: Patient transfer notification
    POSTOP-->>HMS: Post-op care complete
    HMS-->>SURGEON: Post-op coordination complete
```

## OT Utilization and Performance Analytics Flow

```mermaid
sequenceDiagram
    participant ADMIN as OT Administrator
    participant HMS as HMS System
    participant OT as OT System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>HMS: Request OT analytics
    HMS->>OT: Initiate OT analytics
    OT->>ANALYTICS: Process OT data
    ANALYTICS->>DB: Query OT metrics
    DB-->>ANALYTICS: Return OT data
    ANALYTICS->>ANALYTICS: Calculate OT metrics
    Note over ANALYTICS: - OT utilization rates<br/>- Surgery duration<br/>- Team efficiency<br/>- Resource utilization
    ANALYTICS-->>OT: Return analytics results
    OT->>REPORT: Generate OT report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>OT: OT performance report
    OT->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>OT: Dashboard updated
    OT-->>HMS: Return analytics results
    HMS-->>ADMIN: Display OT analytics
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze OT trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: OT trend analysis
    HMS-->>ADMIN: OT insights and recommendations
```

## OT Integration Flow

```mermaid
sequenceDiagram
    participant OT as OT System
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant RADIOLOGY as Radiology System
    participant PHARMACY as Pharmacy System
    participant BLOOD as Blood Bank
    participant BILLING as Billing System
    participant DB as Database
    participant NOT as Notification Service

    OT->>HMS: Surgery scheduled
    HMS->>LAB: Order pre-op tests
    LAB->>DB: Save test orders
    HMS->>RADIOLOGY: Order pre-op imaging
    RADIOLOGY->>DB: Save imaging orders
    HMS->>PHARMACY: Request surgical medications
    PHARMACY->>DB: Save medication orders
    HMS->>BLOOD: Request blood products
    BLOOD->>DB: Save blood requests
    HMS->>BILLING: Generate surgical charges
    BILLING->>DB: Save billing data
    LAB->>NOT: Send pre-op test results
    NOT->>OT: Test results available
    RADIOLOGY->>NOT: Send imaging results
    NOT->>OT: Imaging results available
    PHARMACY->>NOT: Send medication status
    NOT->>OT: Medications ready
    BLOOD->>NOT: Send blood availability
    NOT->>OT: Blood products ready
    BILLING->>NOT: Send billing notification
    NOT->>OT: Billing complete
    OT->>DB: Update integration status
    OT-->>HMS: OT integration complete
```

## OT Quality Assurance and Safety Flow

```mermaid
sequenceDiagram
    participant QA as Quality Assurance
    participant HMS as HMS System
    participant OT as OT System
    participant DB as Database
    participant SAFETY as Safety System
    participant AUDIT as Audit System
    participant NOT as Notification Service
    participant ADMIN as OT Manager

    QA->>HMS: Initiate OT quality audit
    HMS->>OT: Start quality assessment
    OT->>SAFETY: Check safety protocols
    SAFETY->>DB: Query safety records
    DB-->>SAFETY: Return safety data
    SAFETY->>AUDIT: Perform safety audit
    AUDIT->>DB: Query audit criteria
    DB-->>AUDIT: Return audit data
    AUDIT->>AUDIT: Analyze safety compliance
    AUDIT-->>OT: Return audit results
    OT->>NOT: Send quality report
    NOT->>ADMIN: Quality audit results
    ADMIN->>OT: Review audit findings
    OT->>DB: Save quality improvements
    OT->>SAFETY: Update safety protocols
    SAFETY->>DB: Save protocol updates
    OT-->>HMS: Quality assurance complete
    HMS-->>QA: OT quality assessment complete
```

## OT Equipment Management and Maintenance Flow

```mermaid
sequenceDiagram
    participant TECH as Equipment Technician
    participant HMS as HMS System
    participant EQUIPMENT as Equipment System
    participant DB as Database
    participant MAINTENANCE as Maintenance System
    participant CALIBRATION as Calibration System
    participant NOT as Notification Service
    participant VENDOR as Equipment Vendor

    TECH->>HMS: Access equipment management
    HMS->>EQUIPMENT: Get equipment status
    EQUIPMENT->>DB: Query equipment data
    DB-->>EQUIPMENT: Return equipment info
    EQUIPMENT-->>HMS: Display equipment status
    HMS-->>TECH: Show equipment management
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
    EQUIPMENT-->>HMS: Equipment management complete
    HMS-->>TECH: Equipment status updated
```

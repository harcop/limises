# Laboratory Management Module - End-to-End Sequence Diagram

## Test Ordering Flow

```mermaid
sequenceDiagram
    participant DR as Doctor
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant DB as Database
    participant TEST as Test Catalog
    participant P as Patient
    participant NOT as Notification Service

    DR->>HMS: Access patient record
    HMS->>DB: Retrieve patient data
    DB-->>HMS: Return patient information
    HMS-->>DR: Display patient record
    DR->>HMS: Request test ordering
    HMS->>TEST: Get available tests
    TEST-->>HMS: Return test catalog
    HMS-->>DR: Display test options
    DR->>HMS: Select tests to order
    HMS->>LAB: Create test order
    LAB->>DB: Validate test order
    DB-->>LAB: Return validation result
    LAB->>DB: Save test order
    LAB->>NOT: Send order notification
    NOT->>P: Test order notification
    NOT->>LAB: Lab staff notification
    LAB-->>HMS: Order created
    HMS-->>DR: Test order confirmed
```

## Sample Collection Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant TECH as Lab Technician
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant DB as Database
    participant COLLECT as Collection System
    participant NOT as Notification Service

    P->>TECH: Arrives for sample collection
    TECH->>HMS: Access patient order
    HMS->>DB: Retrieve test orders
    DB-->>HMS: Return order details
    HMS-->>TECH: Display collection requirements
    TECH->>P: Verify patient identity
    P->>TECH: Confirms identity
    TECH->>COLLECT: Start sample collection
    COLLECT->>DB: Record collection start
    TECH->>P: Collect sample
    P->>TECH: Sample provided
    TECH->>COLLECT: Record sample details
    COLLECT->>DB: Save collection data
    COLLECT->>LAB: Update order status
    LAB->>DB: Mark sample collected
    LAB->>NOT: Send collection notification
    NOT->>HMS: Update order status
    HMS->>DB: Update patient record
    TECH-->>P: Collection complete
```

## Sample Reception and Accessioning Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant ACCESSION as Accession System
    participant QC as Quality Control
    participant NOT as Notification Service

    TECH->>LAB: Deliver collected samples
    LAB->>ACCESSION: Process sample reception
    ACCESSION->>DB: Verify sample against order
    DB-->>ACCESSION: Return order information
    ACCESSION->>QC: Check sample quality
    QC-->>ACCESSION: Return quality assessment
    alt Sample Quality OK
        ACCESSION->>DB: Assign accession number
        DB-->>ACCESSION: Return accession number
        ACCESSION->>DB: Update sample status
        ACCESSION->>NOT: Send accession notification
        NOT->>LAB: Sample ready for processing
        ACCESSION-->>LAB: Sample accessioned
    else Sample Quality Issues
        ACCESSION->>DB: Record quality issues
        ACCESSION->>NOT: Send rejection notification
        NOT->>TECH: Sample rejection notice
        ACCESSION-->>LAB: Sample rejected
    end
```

## Laboratory Processing Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant ANALYZER as Lab Analyzer
    participant WORKLIST as Work List System
    participant QC as Quality Control
    participant NOT as Notification Service

    TECH->>LAB: Access work list
    LAB->>WORKLIST: Generate work list
    WORKLIST->>DB: Query pending tests
    DB-->>WORKLIST: Return test queue
    WORKLIST-->>LAB: Return work list
    LAB-->>TECH: Display work list
    TECH->>LAB: Select tests for processing
    LAB->>ANALYZER: Send tests to analyzer
    ANALYZER->>QC: Run quality control
    QC-->>ANALYZER: QC results
    alt QC Pass
        ANALYZER->>ANALYZER: Process patient samples
        ANALYZER->>LAB: Return test results
        LAB->>DB: Save test results
        LAB->>NOT: Send results notification
        NOT->>LAB: Results ready
        LAB-->>TECH: Processing complete
    else QC Fail
        ANALYZER->>LAB: QC failure alert
        LAB->>TECH: QC failure notification
        TECH->>ANALYZER: Troubleshoot analyzer
        ANALYZER->>QC: Re-run quality control
        QC-->>ANALYZER: New QC results
    end
```

## Result Entry and Validation Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant VALIDATE as Validation System
    participant PATH as Pathologist
    participant NOT as Notification Service
    participant DR as Doctor

    TECH->>LAB: Enter test results
    LAB->>VALIDATE: Validate results
    VALIDATE->>DB: Check reference ranges
    DB-->>VALIDATE: Return normal ranges
    VALIDATE->>VALIDATE: Check for critical values
    alt Critical Values Found
        VALIDATE->>NOT: Send critical alert
        NOT->>DR: Critical result notification
        NOT->>PATH: Critical result alert
    end
    VALIDATE-->>LAB: Return validation results
    LAB-->>TECH: Display validation status
    TECH->>PATH: Request result review
    PATH->>LAB: Review test results
    LAB->>PATH: Display results for review
    PATH->>LAB: Approve results
    LAB->>DB: Save validated results
    LAB->>NOT: Send result notification
    NOT->>DR: Test results available
    LAB-->>TECH: Results validated
```

## Report Generation and Distribution Flow

```mermaid
sequenceDiagram
    participant LAB as Laboratory System
    participant DB as Database
    participant REPORT as Report Generator
    participant NOT as Notification Service
    participant DR as Doctor
    participant P as Patient
    participant PORTAL as Patient Portal

    LAB->>REPORT: Generate test report
    REPORT->>DB: Retrieve test results
    DB-->>REPORT: Return result data
    REPORT->>REPORT: Format report
    REPORT->>DB: Save formatted report
    REPORT-->>LAB: Report generated
    LAB->>NOT: Send report notification
    NOT->>DR: Test report available
    NOT->>P: Report ready notification
    P->>PORTAL: Access patient portal
    PORTAL->>DB: Retrieve patient reports
    DB-->>PORTAL: Return test reports
    PORTAL-->>P: Display test results
    DR->>LAB: Access test reports
    LAB->>DB: Retrieve doctor reports
    DB-->>LAB: Return test reports
    LAB-->>DR: Display test results
```

## Critical Result Communication Flow

```mermaid
sequenceDiagram
    participant ANALYZER as Lab Analyzer
    participant LAB as Laboratory System
    participant DB as Database
    participant CRITICAL as Critical Alert System
    participant NOT as Notification Service
    participant DR as Doctor
    participant NURSE as Nurse
    participant PATH as Pathologist
    participant ESCALATION as Escalation System
    participant AUDIT as Audit System
    participant SMS as SMS Service
    participant EMAIL as Email Service
    participant PHONE as Phone System

    ANALYZER->>LAB: Critical result detected
    LAB->>CRITICAL: Process critical alert
    CRITICAL->>DB: Log critical result
    CRITICAL->>AUDIT: Log critical alert
    AUDIT->>DB: Save audit trail
    CRITICAL->>NOT: Send critical alert
    NOT->>SMS: Send SMS alert
    SMS->>DR: SMS notification
    NOT->>EMAIL: Send email alert
    EMAIL->>DR: Email notification
    NOT->>PHONE: Make phone call
    PHONE->>DR: Phone call
    NOT->>NURSE: Critical result notification
    NOT->>PATH: Critical result alert
    CRITICAL->>ESCALATION: Start escalation timer
    ESCALATION->>ESCALATION: Wait for acknowledgment
    alt No Acknowledgment Within Time Limit
        ESCALATION->>NOT: Send escalation alert
        NOT->>DR: Escalation notification
        NOT->>PATH: Escalation alert
        ESCALATION->>DB: Log escalation
    end
    DR->>LAB: Acknowledge critical result
    LAB->>CRITICAL: Record acknowledgment
    CRITICAL->>DB: Update critical result status
    CRITICAL->>ESCALATION: Stop escalation timer
    DR->>LAB: Take clinical action
    LAB->>DB: Record clinical response
    CRITICAL->>NOT: Send follow-up notification
    NOT->>PATH: Follow-up critical result
    PATH->>LAB: Confirm critical result
    LAB->>DB: Final critical result status
    CRITICAL->>AUDIT: Log critical result completion
    AUDIT->>DB: Save completion audit
```

## Microbiology Culture Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant CULTURE as Culture System
    participant IDENTIFY as Identification System
    participant SENSITIVITY as Sensitivity Testing
    participant NOT as Notification Service
    participant DR as Doctor

    TECH->>LAB: Receive culture specimen
    LAB->>CULTURE: Process culture
    CULTURE->>DB: Record culture start
    CULTURE->>CULTURE: Inoculate media
    CULTURE->>DB: Update culture status
    CULTURE->>NOT: Send preliminary report
    NOT->>DR: Gram stain results
    CULTURE->>CULTURE: Incubate cultures
    CULTURE->>TECH: Check for growth
    TECH->>CULTURE: Report growth status
    alt Growth Detected
        CULTURE->>IDENTIFY: Identify organism
        IDENTIFY->>DB: Save identification
        IDENTIFY->>SENSITIVITY: Test sensitivity
        SENSITIVITY->>DB: Save sensitivity results
        SENSITIVITY->>NOT: Send final report
        NOT->>DR: Culture and sensitivity results
    else No Growth
        CULTURE->>NOT: Send no growth report
        NOT->>DR: No growth notification
    end
    CULTURE->>DB: Update final culture status
```

## Quality Control Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant QC as Quality Control System
    participant ANALYZER as Lab Analyzer
    participant WESTGARD as Westgard Rules
    participant NOT as Notification Service
    participant EQA as External QA System
    participant AUDIT as Audit System
    participant CORRECTIVE as Corrective Action

    TECH->>LAB: Start QC run
    LAB->>QC: Initiate quality control
    QC->>ANALYZER: Run control samples
    ANALYZER->>QC: Return QC results
    QC->>WESTGARD: Apply Westgard rules
    WESTGARD->>WESTGARD: Evaluate QC results
    Note over WESTGARD: Apply 1-2s, 1-3s, 2-2s,<br/>R-4s, 4-1s, 10x rules
    WESTGARD->>QC: Evaluate QC results
    alt QC In Control
        QC->>DB: Record QC results
        QC->>AUDIT: Log QC success
        AUDIT->>DB: Save QC audit
        QC->>LAB: QC passed
        LAB->>ANALYZER: Allow patient testing
        ANALYZER->>LAB: Process patient samples
        LAB-->>TECH: QC successful
    else QC Out of Control
        QC->>NOT: Send QC failure alert
        NOT->>TECH: QC failure notification
        QC->>LAB: Stop patient testing
        LAB->>TECH: Troubleshoot required
        TECH->>ANALYZER: Perform troubleshooting
        ANALYZER->>QC: Re-run QC
        QC->>WESTGARD: Re-evaluate QC
        WESTGARD-->>QC: New QC assessment
        alt QC Still Out of Control
            QC->>CORRECTIVE: Initiate corrective action
            CORRECTIVE->>DB: Record corrective measures
            CORRECTIVE->>EQA: Report to external QA
            EQA->>DB: Log external QA report
            CORRECTIVE->>NOT: Send corrective action alert
            NOT->>TECH: Corrective action required
        end
    end
    QC->>EQA: Submit QC data to external QA
    EQA->>DB: Store external QA data
    EQA->>EQA: Compare with peer laboratories
    EQA-->>QC: External QA results
    QC->>DB: Update QC performance metrics
```

## External Quality Assurance Flow

```mermaid
sequenceDiagram
    participant LAB as Laboratory System
    participant DB as Database
    participant EQA as External QA System
    participant PT as Proficiency Testing
    participant NOT as Notification Service
    participant ADMIN as Lab Administrator

    PT->>LAB: Send proficiency test samples
    LAB->>EQA: Process PT samples
    EQA->>DB: Record PT results
    EQA->>PT: Submit PT results
    PT->>EQA: Return PT evaluation
    EQA->>DB: Save PT results
    EQA->>NOT: Send PT notification
    NOT->>ADMIN: PT results available
    ADMIN->>EQA: Review PT performance
    EQA-->>ADMIN: Display PT results
    alt Satisfactory Performance
        EQA->>DB: Record satisfactory result
        EQA-->>ADMIN: PT performance acceptable
    else Unsatisfactory Performance
        EQA->>NOT: Send unsatisfactory alert
        NOT->>ADMIN: PT failure notification
        ADMIN->>EQA: Initiate investigation
        EQA->>DB: Record investigation
        EQA->>ADMIN: Investigation plan
        ADMIN->>EQA: Implement corrective actions
        EQA->>DB: Record corrective actions
    end
```

## Laboratory Equipment Maintenance Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant EQUIPMENT as Equipment System
    participant MAINTENANCE as Maintenance System
    participant SERVICE as Service Engineer
    participant NOT as Notification Service

    TECH->>LAB: Report equipment issue
    LAB->>EQUIPMENT: Log equipment problem
    EQUIPMENT->>DB: Record equipment issue
    EQUIPMENT->>MAINTENANCE: Schedule maintenance
    MAINTENANCE->>DB: Check maintenance schedule
    DB-->>MAINTENANCE: Return maintenance plan
    MAINTENANCE->>NOT: Send maintenance notification
    NOT->>SERVICE: Maintenance request
    SERVICE->>LAB: Perform maintenance
    LAB->>EQUIPMENT: Update equipment status
    EQUIPMENT->>DB: Record maintenance
    EQUIPMENT->>MAINTENANCE: Update maintenance log
    MAINTENANCE->>DB: Save maintenance record
    MAINTENANCE->>NOT: Send completion notification
    NOT->>TECH: Equipment ready
    EQUIPMENT-->>LAB: Maintenance complete
```

## Laboratory Inventory Management Flow

```mermaid
sequenceDiagram
    participant TECH as Lab Technician
    participant LAB as Laboratory System
    participant DB as Database
    participant INVENTORY as Inventory System
    participant REAGENT as Reagent Management
    participant SUPPLIER as Supplier System
    participant NOT as Notification Service

    TECH->>LAB: Check reagent levels
    LAB->>INVENTORY: Query inventory status
    INVENTORY->>DB: Check stock levels
    DB-->>INVENTORY: Return inventory data
    INVENTORY-->>LAB: Display stock levels
    alt Low Stock Alert
        INVENTORY->>NOT: Send low stock alert
        NOT->>TECH: Reorder required
        TECH->>REAGENT: Create reorder request
        REAGENT->>SUPPLIER: Place order
        SUPPLIER->>REAGENT: Confirm order
        REAGENT->>INVENTORY: Update expected stock
        INVENTORY->>DB: Record reorder
    end
    TECH->>LAB: Receive new reagents
    LAB->>INVENTORY: Update inventory
    INVENTORY->>DB: Record stock receipt
    INVENTORY->>REAGENT: Update reagent status
    REAGENT->>DB: Save reagent information
    INVENTORY-->>LAB: Inventory updated
```

## Laboratory Analytics and Reporting Flow

```mermaid
sequenceDiagram
    participant ADMIN as Lab Administrator
    participant LAB as Laboratory System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>LAB: Request lab analytics
    LAB->>ANALYTICS: Process lab data
    ANALYTICS->>DB: Query laboratory data
    DB-->>ANALYTICS: Return lab metrics
    ANALYTICS->>ANALYTICS: Calculate performance metrics
    Note over ANALYTICS: - Turnaround times<br/>- Test volumes<br/>- Quality metrics<br/>- Equipment utilization
    ANALYTICS-->>LAB: Return analytics results
    LAB->>REPORT: Generate lab report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>LAB: Lab performance report
    LAB->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>LAB: Dashboard updated
    LAB-->>ADMIN: Display lab analytics
    ADMIN->>LAB: Request trend analysis
    LAB->>ANALYTICS: Analyze historical trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>LAB: Trend analysis results
    LAB-->>ADMIN: Lab trends and recommendations
```

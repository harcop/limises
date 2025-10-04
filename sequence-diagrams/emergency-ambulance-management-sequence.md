# Emergency & Ambulance Management Module - End-to-End Sequence Diagram

## Emergency Patient Registration Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant EMT as EMT/Paramedic
    participant ER as Emergency Staff
    participant HMS as HMS System
    participant ER_SYS as Emergency System
    participant DB as Database
    participant TRIAGE as Triage System
    participant NOT as Notification Service

    P->>EMT: Emergency call/arrival
    EMT->>HMS: Access emergency registration
    HMS->>ER_SYS: Process emergency registration
    ER_SYS->>DB: Check existing patient record
    alt Existing Patient
        DB-->>ER_SYS: Return patient data
        ER_SYS-->>HMS: Display patient information
    else New Patient
        ER_SYS->>DB: Create emergency patient record
        DB-->>ER_SYS: Patient record created
    end
    ER_SYS->>TRIAGE: Initiate triage process
    TRIAGE->>ER_SYS: Return triage level
    ER_SYS->>DB: Save emergency registration
    ER_SYS->>NOT: Send emergency alert
    NOT->>ER: Emergency patient notification
    ER_SYS-->>HMS: Emergency registration complete
    HMS-->>EMT: Patient registered
```

## Advanced Triage System Flow (ESI 5-Level)

```mermaid
sequenceDiagram
    participant ER as Emergency Staff
    participant HMS as HMS System
    participant TRIAGE as Triage System
    participant DB as Database
    participant CDSS as Clinical Decision Support
    participant VITALS as Vital Signs
    participant NOT as Notification Service
    participant DR as Emergency Doctor

    ER->>HMS: Start triage assessment
    HMS->>TRIAGE: Initiate triage process
    TRIAGE->>ER: Request vital signs
    ER->>VITALS: Record vital signs
    VITALS->>TRIAGE: Return vital signs data
    TRIAGE->>ER: Request chief complaint
    ER->>TRIAGE: Provide complaint details
    TRIAGE->>CDSS: Analyze triage criteria
    CDSS->>TRIAGE: Return ESI level recommendation
    TRIAGE->>TRIAGE: Calculate ESI level (1-5)
    TRIAGE->>DB: Save triage assessment
    alt ESI Level 1-2 (Critical/Urgent)
        TRIAGE->>NOT: Send critical alert
        NOT->>DR: Immediate attention required
        TRIAGE->>DB: Assign to critical care area
    else ESI Level 3 (Urgent)
        TRIAGE->>NOT: Send urgent notification
        NOT->>DR: Urgent care required
        TRIAGE->>DB: Assign to urgent care area
    else ESI Level 4-5 (Less Urgent/Non-Urgent)
        TRIAGE->>DB: Assign to routine care area
        TRIAGE->>NOT: Send routine notification
        NOT->>ER: Routine care assignment
    end
    TRIAGE-->>HMS: Triage assessment complete
    HMS-->>ER: Triage level assigned
```

## Ambulance Dispatch and Tracking Flow

```mermaid
sequenceDiagram
    participant CALLER as Emergency Caller
    participant DISPATCH as Dispatch Center
    participant HMS as HMS System
    participant AMBULANCE as Ambulance System
    participant EMT as EMT/Paramedic
    participant GPS as GPS Tracking
    participant NOT as Notification Service
    participant ER as Emergency Department

    CALLER->>DISPATCH: Emergency call
    DISPATCH->>HMS: Log emergency call
    HMS->>AMBULANCE: Check available ambulances
    AMBULANCE->>GPS: Get ambulance locations
    GPS-->>AMBULANCE: Return location data
    AMBULANCE->>AMBULANCE: Select nearest ambulance
    AMBULANCE->>NOT: Dispatch ambulance
    NOT->>EMT: Emergency dispatch notification
    EMT->>AMBULANCE: Acknowledge dispatch
    AMBULANCE->>GPS: Start tracking
    GPS->>AMBULANCE: Continuous location updates
    AMBULANCE->>DISPATCH: Update dispatch status
    DISPATCH->>HMS: Log dispatch information
    EMT->>AMBULANCE: Arrive at scene
    AMBULANCE->>NOT: Send arrival notification
    NOT->>DISPATCH: Ambulance arrived
    EMT->>AMBULANCE: Patient assessment
    AMBULANCE->>HMS: Send patient data
    HMS->>ER: Notify emergency department
    EMT->>AMBULANCE: Transport to hospital
    AMBULANCE->>GPS: Track transport
    GPS->>AMBULANCE: Location updates
    AMBULANCE->>ER: ETA notification
    EMT->>AMBULANCE: Arrive at hospital
    AMBULANCE->>NOT: Send arrival notification
    NOT->>ER: Ambulance arrived with patient
```

## Pre-Hospital Care Documentation Flow

```mermaid
sequenceDiagram
    participant EMT as EMT/Paramedic
    participant AMBULANCE as Ambulance System
    participant HMS as HMS System
    participant DB as Database
    participant VITALS as Vital Signs Device
    participant MEDICATION as Medication System
    participant NOT as Notification Service
    participant ER as Emergency Doctor

    EMT->>AMBULANCE: Start patient care
    AMBULANCE->>HMS: Create pre-hospital record
    HMS->>DB: Initialize patient record
    EMT->>VITALS: Record initial vital signs
    VITALS->>AMBULANCE: Return vital signs data
    AMBULANCE->>HMS: Send vital signs
    HMS->>DB: Save pre-hospital data
    EMT->>AMBULANCE: Document interventions
    AMBULANCE->>MEDICATION: Record medications given
    MEDICATION->>AMBULANCE: Return medication data
    AMBULANCE->>HMS: Send intervention data
    HMS->>DB: Save intervention records
    EMT->>AMBULANCE: Update patient condition
    AMBULANCE->>HMS: Send condition update
    HMS->>NOT: Send pre-hospital summary
    NOT->>ER: Pre-hospital care summary
    HMS->>DB: Complete pre-hospital record
    AMBULANCE-->>EMT: Documentation complete
```

## Trauma Team Activation Flow

```mermaid
sequenceDiagram
    participant EMT as EMT/Paramedic
    participant AMBULANCE as Ambulance System
    participant HMS as HMS System
    participant TRAUMA as Trauma System
    participant DB as Database
    participant NOT as Notification Service
    participant TEAM as Trauma Team
    participant ER as Emergency Department

    EMT->>AMBULANCE: Assess trauma severity
    AMBULANCE->>TRAUMA: Evaluate trauma criteria
    TRAUMA->>TRAUMA: Check activation criteria
    alt Trauma Criteria Met
        TRAUMA->>NOT: Activate trauma team
        NOT->>TEAM: Trauma team activation
        NOT->>ER: Prepare trauma bay
        TRAUMA->>DB: Log trauma activation
        TRAUMA->>AMBULANCE: Confirm activation
        AMBULANCE->>HMS: Send trauma alert
        HMS->>ER: Trauma patient incoming
        TEAM->>TRAUMA: Acknowledge activation
        TRAUMA->>DB: Update team status
    else No Activation Needed
        TRAUMA->>AMBULANCE: Routine care
        AMBULANCE->>HMS: Standard emergency care
    end
    TRAUMA-->>HMS: Trauma assessment complete
    HMS-->>EMT: Trauma protocol activated
```

## Critical Care Pathway Flow

```mermaid
sequenceDiagram
    participant ER as Emergency Staff
    participant HMS as HMS System
    participant PATHWAY as Care Pathway System
    participant DB as Database
    participant CDSS as Clinical Decision Support
    participant PROTOCOL as Protocol Engine
    participant NOT as Notification Service
    participant SPECIALIST as Specialist

    ER->>HMS: Identify critical condition
    HMS->>PATHWAY: Initiate care pathway
    PATHWAY->>CDSS: Analyze patient condition
    CDSS->>PATHWAY: Return pathway recommendations
    PATHWAY->>PROTOCOL: Load appropriate protocol
    PROTOCOL->>PATHWAY: Return protocol steps
    PATHWAY->>DB: Save pathway activation
    PATHWAY->>NOT: Send pathway notification
    NOT->>ER: Care pathway activated
    ER->>PATHWAY: Execute protocol steps
    PATHWAY->>CDSS: Monitor protocol compliance
    CDSS->>PATHWAY: Return compliance status
    alt Protocol Deviation
        PATHWAY->>NOT: Send deviation alert
        NOT->>SPECIALIST: Protocol deviation notification
        SPECIALIST->>PATHWAY: Provide guidance
    end
    PATHWAY->>DB: Update pathway progress
    PATHWAY->>NOT: Send progress updates
    NOT->>ER: Pathway progress notification
    PATHWAY-->>HMS: Care pathway complete
    HMS-->>ER: Pathway execution complete
```

## Mass Casualty Incident Management Flow

```mermaid
sequenceDiagram
    participant INCIDENT as Incident Commander
    participant HMS as HMS System
    participant MCI as Mass Casualty System
    participant DB as Database
    participant TRIAGE as Triage System
    participant RESOURCE as Resource Management
    participant NOT as Notification Service
    participant STAFF as Hospital Staff

    INCIDENT->>HMS: Declare mass casualty incident
    HMS->>MCI: Activate MCI protocol
    MCI->>DB: Initialize MCI record
    MCI->>RESOURCE: Assess hospital capacity
    RESOURCE->>MCI: Return capacity data
    MCI->>TRIAGE: Set up mass triage
    TRIAGE->>MCI: Confirm triage setup
    MCI->>NOT: Send MCI activation
    NOT->>STAFF: Mass casualty activation
    INCIDENT->>MCI: Report incoming casualties
    MCI->>TRIAGE: Process mass triage
    TRIAGE->>MCI: Return triage results
    MCI->>RESOURCE: Allocate resources
    RESOURCE->>MCI: Confirm resource allocation
    MCI->>DB: Update MCI status
    MCI->>NOT: Send status updates
    NOT->>STAFF: MCI status updates
    INCIDENT->>MCI: Update incident status
    MCI->>DB: Save incident updates
    MCI->>NOT: Send incident updates
    NOT->>STAFF: Incident updates
    MCI-->>HMS: MCI management complete
    HMS-->>INCIDENT: MCI protocol complete
```

## Emergency Analytics and Reporting Flow

```mermaid
sequenceDiagram
    participant ADMIN as Administrator
    participant HMS as HMS System
    participant EMERGENCY as Emergency System
    participant DB as Database
    participant ANALYTICS as Analytics Engine
    participant REPORT as Report Generator
    participant DASHBOARD as Dashboard System

    ADMIN->>HMS: Request emergency analytics
    HMS->>EMERGENCY: Initiate emergency analytics
    EMERGENCY->>ANALYTICS: Process emergency data
    ANALYTICS->>DB: Query emergency metrics
    DB-->>ANALYTICS: Return emergency data
    ANALYTICS->>ANALYTICS: Calculate emergency metrics
    Note over ANALYTICS: - Response times<br/>- Patient outcomes<br/>- Resource utilization<br/>- Triage accuracy
    ANALYTICS-->>EMERGENCY: Return analytics results
    EMERGENCY->>REPORT: Generate emergency report
    REPORT->>DB: Compile report data
    DB-->>REPORT: Return report information
    REPORT-->>EMERGENCY: Emergency report ready
    EMERGENCY->>DASHBOARD: Update dashboard
    DASHBOARD->>DB: Save dashboard data
    DASHBOARD-->>EMERGENCY: Dashboard updated
    EMERGENCY-->>HMS: Return analytics results
    HMS-->>ADMIN: Display emergency analytics
    ADMIN->>HMS: Request trend analysis
    HMS->>ANALYTICS: Analyze emergency trends
    ANALYTICS->>DB: Query historical data
    DB-->>ANALYTICS: Return trend data
    ANALYTICS-->>HMS: Emergency trend analysis
    HMS-->>ADMIN: Emergency insights and recommendations
```

## Emergency Integration Flow

```mermaid
sequenceDiagram
    participant EMERGENCY as Emergency System
    participant HMS as HMS System
    participant LAB as Laboratory System
    participant RADIOLOGY as Radiology System
    participant PHARMACY as Pharmacy System
    participant BLOOD as Blood Bank
    participant OT as Operation Theatre
    participant BILLING as Billing System
    participant DB as Database
    participant NOT as Notification Service

    EMERGENCY->>HMS: Patient in emergency
    HMS->>LAB: Order emergency tests
    LAB->>DB: Save emergency test orders
    HMS->>RADIOLOGY: Order emergency imaging
    RADIOLOGY->>DB: Save imaging orders
    HMS->>PHARMACY: Request emergency medications
    PHARMACY->>DB: Save medication orders
    HMS->>BLOOD: Request blood products
    BLOOD->>DB: Save blood requests
    HMS->>OT: Prepare for emergency surgery
    OT->>DB: Save surgery preparation
    HMS->>BILLING: Generate emergency charges
    BILLING->>DB: Save billing data
    LAB->>NOT: Send emergency test results
    NOT->>EMERGENCY: Test results available
    RADIOLOGY->>NOT: Send emergency imaging
    NOT->>EMERGENCY: Imaging results available
    PHARMACY->>NOT: Send medication status
    NOT->>EMERGENCY: Medications ready
    BLOOD->>NOT: Send blood availability
    NOT->>EMERGENCY: Blood products ready
    OT->>NOT: Send surgery status
    NOT->>EMERGENCY: Surgery status update
    BILLING->>NOT: Send billing notification
    NOT->>EMERGENCY: Billing complete
    EMERGENCY->>DB: Update integration status
    EMERGENCY-->>HMS: Emergency integration complete
```
